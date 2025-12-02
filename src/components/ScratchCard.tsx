import React, { useEffect, useRef, useState } from "react";
import {
  PRIZE_CARDS,
  STORAGE_PRIZE_ID_KEY,
  STORAGE_SCRATCH_DONE_KEY,
  type PrizeCard,
} from "../data/prizeCards";
import { triggerHolidayConfetti } from "../utils/confetti";
import { motion } from "framer-motion";

const SCRATCH_RADIUS = 24;
const COMPLETE_THRESHOLD = 0.85;
const GOLD_COVER_SRC = "/prize/scratch-card-after-effets-label-gold.png";

const ENABLE_PERSISTENCE = true;

type ContactInfo = {
  email: string | null;
  firstName: string | null;
  lastName: string | null;
};

const ScratchCard: React.FC = () => {
  const [card, setCard] = useState<PrizeCard | null>(null);
  const [isScratched, setIsScratched] = useState(false);
  const [cardLoaded, setCardLoaded] = useState(false);
  const [contact, setContact] = useState<ContactInfo>({
    email: null,
    firstName: null,
    lastName: null,
  });

  const [showTerms, setShowTerms] = useState(false);
  const goldImageRef = useRef<HTMLImageElement | null>(null);
  const [goldReady, setGoldReady] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawingRef = useRef(false);
  const lastCheckRef = useRef(0);

  useEffect(() => {
    const img = new Image();
    img.src = GOLD_COVER_SRC;
    img.onload = () => {
      goldImageRef.current = img;
      setGoldReady(true);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);

    const email = params.get("email");
    const firstName = params.get("first_name");
    const lastName = params.get("last_name");

    setContact({ email, firstName, lastName });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!ENABLE_PERSISTENCE) {
      const random =
        PRIZE_CARDS[Math.floor(Math.random() * PRIZE_CARDS.length)];
      setCard(random);
      setIsScratched(false);
      return;
    }

    const storedId = window.localStorage.getItem(STORAGE_PRIZE_ID_KEY);
    if (storedId) {
      const found = PRIZE_CARDS.find((p) => p.id === storedId);
      if (found) {
        setCard(found);
      } else {
        const random =
          PRIZE_CARDS[Math.floor(Math.random() * PRIZE_CARDS.length)];
        setCard(random);
        window.localStorage.setItem(STORAGE_PRIZE_ID_KEY, random.id);
      }
    } else {
      const random =
        PRIZE_CARDS[Math.floor(Math.random() * PRIZE_CARDS.length)];
      setCard(random);
      window.localStorage.setItem(STORAGE_PRIZE_ID_KEY, random.id);
    }

    const done =
      window.localStorage.getItem(STORAGE_SCRATCH_DONE_KEY) === "true";
    setIsScratched(done);
  }, []);

  useEffect(() => {
    if (isScratched || !cardLoaded || !goldReady) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      const img = goldImageRef.current;
      if (!img) return;

      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.drawImage(img, 0, 0, rect.width, rect.height);
      ctxRef.current = ctx;
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [isScratched, cardLoaded, goldReady]);

  const scratchAt = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    const dpr = window.devicePixelRatio || 1;
    const radius = SCRATCH_RADIUS * dpr;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  };

  const sendRedemption = (promo?: string) => {
    if (!promo) return;

    const payload = {
      email: contact.email,
      first_name: contact.firstName,
      last_name: contact.lastName,
      promo,
    };

    fetch(
      "https://primary-production-f807.up.railway.app/webhook/04c337fd-96b7-48c8-ae7d-75fe7e2e45442",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    ).catch((err) => {
      console.error("Failed to send promo redemption", err);
    });
  };

  const maybeCheckCompletion = (force = false) => {
    const now = performance.now();
    if (!force && now - lastCheckRef.current < 300) return;
    lastCheckRef.current = now;

    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const { width, height } = canvas;
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;

    let transparentCount = 0;
    const total = pixels.length / 4;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparentCount++;
    }

    const ratio = transparentCount / total;

    if (ratio > COMPLETE_THRESHOLD) {
      setIsScratched(true);

      if (ENABLE_PERSISTENCE && typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_SCRATCH_DONE_KEY, "true");
      }

      sendRedemption(card?.promo);

      triggerHolidayConfetti();
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isScratched) return;
    e.preventDefault();
    isDrawingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    scratchAt(e.clientX, e.clientY);
    maybeCheckCompletion();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || isScratched) return;
    e.preventDefault();
    scratchAt(e.clientX, e.clientY);
    maybeCheckCompletion();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    isDrawingRef.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    maybeCheckCompletion(true);
  };

  const showCanvas = !isScratched;

  return (
    <>
      <div className="relative z-20 animate-fade-in-up flex justify-center px-4">
        <div className="relative w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto 4xl:max-w-3xl">
          {card && (
            <img
              src={card.image}
              alt={card.alt}
              className="w-full h-auto block"
              onLoad={() => setCardLoaded(true)}
            />
          )}

          <div
            className="absolute"
            style={{
              left: "50%",
              top: "68%",
              transform: "translate(-50%, -50%)",
              width: "45%",
              height: "32%",
              cursor: showCanvas
                ? 'url("/coin.png") 16 16, pointer'
                : "default",
            }}
          >
            {showCanvas && (
              <canvas
                ref={canvasRef}
                className="block w-full h-full touch-none rounded-md"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              />
            )}
          </div>
        </div>
      </div>

      <div
        className={`mt-6 px-4 transition-all duration-500 ease-out ${
          isScratched
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <div className="max-w-md sm:max-w-lg md:max-w-xl mx-auto bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 shadow-lg">
          <p className="text-sm sm:text-base text-whitesmoke/90 text-center mb-4">
            Enjoy a $2,500 credit toward your next event or celebration. This
            amount will be deducted from any package valued at $10,000 or more,
            including catering services, event rentals, entertainment, venue
            services, AV, staging, and lighting.
          </p>
          <div className="bg-white/5 rounded-md p-4 border border-white/10 mb-4">
            <p className="text-xs sm:text-sm text-whitesmoke/80 text-center">
              This offer is valid for new bookings taking place between January
              1, 2026 and April 1, 2026.
            </p>
          </div>
          <p className="text-base sm:text-lg font-semibold text-primary text-center">
            Let the celebration begin!
          </p>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setShowTerms(true)}
              className="text-[11px] sm:text-xs text-whitesmoke/80 underline underline-offset-2 hover:text-whitesmoke transition-colors"
            >
              Terms &amp; Conditions apply
            </button>
          </div>
          <motion.a
            href="https://www.48wallnyc.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative mt-8 inline-flex items-center justify-center gap-2 border border-primary/30 bg-primary/5 px-8 py-3 text-sm font-medium text-primary backdrop-blur-sm transition-all duration-300 hover:border-primary hover:bg-primary/10 sm:px-10 sm:py-4 sm:text-base"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            Visit the MME worldwide Website
            <svg
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 sm:h-5 sm:w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </motion.a>
        </div>
      </div>

      {showTerms && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/10 backdrop-blur-sm px-4 mt-8 animate-fade-in overflow-y-auto py-8">
          <div className="relative w-full max-w-2xl bg-white shadow-2xl p-8 border border-neutral-200/40 animate-scale-in my-8">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowTerms(false)}
              className="absolute right-4 top-4 p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-all cursor-pointer z-10"
              aria-label="Close terms and conditions"
            >
              ✕
            </button>

            <h2 className="text-center text-xl font-semibold tracking-wide text-neutral-800 mb-1">
              Contest Terms & Conditions
            </h2>

            <div className="mx-auto mb-6 h-1 w-16 rounded-full bg-primary" />

            <div className="space-y-5 text-sm text-neutral-700 leading-relaxed text-left max-h-[60vh] overflow-y-auto pr-2">
              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">
                  1. Eligibility
                </h3>
                <p>
                  This promotion is open to individuals 18 years or older.
                  Employees of MME Worldwide, its affiliates, partners, and
                  their immediate family members are not eligible to
                  participate. The contest is valid only in the state of New
                  York.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">
                  2. How to Enter
                </h3>
                <p>
                  Participants must access the contest webpage through the QR
                  code provided in the holiday card.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">
                  3. Contest Period
                </h3>
                <p>
                  The contest is valid until{" "}
                  <span className="font-medium">December 31st, 2025</span>.
                  Entries submitted outside the contest period will not be
                  honored.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">
                  4. Prizes
                </h3>
                <p className="mb-2 font-medium">Prizes are:</p>
                <ol className="list-decimal list-inside space-y-1 ml-4 mb-3">
                  <li>Valid for new bookings only.</li>
                  <li>
                    Redeemable for events taking place between January 1, 2026
                    and April 1, 2026.
                  </li>
                  <li>Not transferable and not redeemable for cash.</li>
                  <li>
                    Subject to date availability and standard venue booking
                    policies.
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">
                  5. Winner Verification & Redemption
                </h3>
                <p>
                  To redeem a prize, winners must mention the promotion when
                  booking their event services. MME Worldwide may request
                  verification of identity or eligibility before applying the
                  prize to a booking.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">
                  6. Limitations
                </h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>One (1) prize per person or organization.</li>
                  <li>
                    Prizes cannot be combined with any other discounts,
                    promotions, or offers unless explicitly stated.
                  </li>
                  <li>
                    MME Worldwide reserves the right to refuse prize redemption
                    for any booking that does not meet its standard
                    requirements.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">
                  7. Liability
                </h3>
                <p>
                  MME Worldwide and its affiliates are not responsible for
                  technical issues, lost entries, or interruptions that prevent
                  participation. By entering, participants agree to release the
                  venue from any claims related to the contest or prize use.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">
                  8. Privacy
                </h3>
                <p>
                  Any personal information collected through the contest will be
                  used solely for administration of the promotion and will not
                  be sold or shared.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">
                  9. Right to Modify or Cancel
                </h3>
                <p>
                  MME Worldwide reserves the right to amend, suspend, or cancel
                  the promotion if circumstances outside its control arise.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">
                  10. Acceptance of Terms
                </h3>
                <p>
                  Participation in the contest constitutes full acceptance of
                  these Terms & Conditions.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-neutral-200">
              <p className="text-xs text-neutral-500 text-center">
                By participating in this contest and redeeming any prize, you
                acknowledge that you have read, understood, and agree to be
                bound by these Terms & Conditions.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ScratchCard;
