import React from "react";
import Navbar from "./components/Navbar";
import ScratchCard from "./components/ScratchCard";
import HolidayHeader from "./components/HolidayHeader";

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
          </section>
        </main>
      </div>
    </>
  );
};

export default App;
