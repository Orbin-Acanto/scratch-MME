import React from "react";

const HolidayHeader: React.FC = () => {
  return (
    <header className="mb-10 mt-8 sm:mt-14 md:mt-18 lg:mt-30 xl:mt-30 2xl:mt-52 4xl:mt-62 animate-fade-in-up">
      <p
        className="
          font-primary text-center text-whitesmoke 
          text-2xl sm:text-2xl md:text-3xl lg:text-4xl 
          font-light tracking-wide uppercase
          drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]
        "
      >
        Scratch Now And Reveal Your Prize
      </p>
    </header>
  );
};

export default HolidayHeader;
