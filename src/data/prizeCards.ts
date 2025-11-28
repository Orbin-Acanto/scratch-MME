export type PrizeCard = {
  id: string;
  image: string;
  promo: string;
  alt: string;
};

export const PRIZE_CARDS: PrizeCard[] = [
  {
    id: "P1",
    image: "/prize/MME GOLDEN TICKET.png",
    promo: "2500 usd gift",
    alt: "2500 usd gift",
  },
];

export const STORAGE_PRIZE_ID_KEY = "mme_scratch_prize_id";
export const STORAGE_SCRATCH_DONE_KEY = "mme_scratch_done";
