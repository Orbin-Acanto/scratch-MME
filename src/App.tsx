import React from "react";
import Navbar from "./components/Navbar";
import ScratchCard from "./components/ScratchCard";
import HolidayHeader from "./components/HolidayHeader";
import { motion } from "framer-motion";

const App: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="relative mt-[87px] min-h-[calc(100vh-87px)] overflow-hidden text-neutral-900">
        <div className="absolute inset-0 -z-10">
          <img
            src="/BACKGROUND.png"
            alt="Holiday background"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <img
            src="/SNOW FLAKES.png"
            alt="Snow flakes"
            className="absolute left-0 top-0 w-full h-auto"
          />
        </div>

        <main className="relative flex items-center justify-center px-4 py-6">
          <section className="w-full text-center">
            <HolidayHeader />
            <ScratchCard />

            <p className="mt-4 text-sm sm:text-base text-whitesmoke/80">
              Prize is valid from January 2026 through March 2026.
            </p>
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
          </section>
        </main>
      </div>
    </>
  );
};

export default App;
