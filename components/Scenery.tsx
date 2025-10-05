
import React from 'react';

interface SceneryProps {
  speed: number;
  targetNumber: number;
}

const Station: React.FC<{ number: number }> = ({ number }) => (
  <div className="absolute bottom-[8rem] sm:bottom-[14rem] left-[25%] -translate-x-1/2 z-20 w-max flex flex-col items-center">
    {/* Sign */}
    <div className="bg-white/80 backdrop-blur-sm px-4 py-1 sm:px-6 sm:py-2 rounded-lg shadow-md text-center mb-1 sm:mb-2">
        <div className="text-lg sm:text-xl font-bold text-gray-700">СТАНЦИЯ</div>
        <div className="text-5xl sm:text-6xl font-black text-[#263238] leading-none">
            {number}
        </div>
    </div>
    {/* Roof */}
    <div className="w-[16rem] sm:w-[22rem] h-6 sm:h-8 bg-[#EF5350] rounded-t-lg shadow-lg relative z-10 border-b-2 sm:border-b-4 border-red-600"></div>
     {/* Platform & Supports */}
    <div className="w-[18rem] sm:w-[26rem] h-8 sm:h-12 bg-gray-400 border-t-2 sm:border-t-4 border-gray-500 shadow-inner flex justify-between px-4 sm:px-8">
        <div className="w-3 sm:w-4 h-12 sm:h-16 bg-gray-500 -mt-3 sm:-mt-4 shadow-md"></div>
        <div className="w-3 sm:w-4 h-12 sm:h-16 bg-gray-500 -mt-3 sm:-mt-4 shadow-md"></div>
    </div>
  </div>
);

const SceneryLayer: React.FC<{ children: React.ReactNode; duration: number; className?: string }> = ({ children, duration, className = '' }) => (
  <div
    className={`w-[200%] h-full absolute bottom-0 left-0 flex animate-scroll ${className}`}
    style={{ 
        animationDuration: `${duration}s`,
        transition: 'animation-duration 1s ease-in-out' 
    }}
  >
    <div className="w-1/2 h-full relative flex-shrink-0">{children}</div>
    <div className="w-1/2 h-full relative flex-shrink-0">{children}</div>
  </div>
);

export const Scenery: React.FC<SceneryProps> = ({ speed, targetNumber }) => {
  const baseDuration = 60 / speed;

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#E3F2FD]">
      {/* Static Sun */}
      <div className="absolute top-1/4 left-1/4 w-16 h-16 sm:w-24 sm:h-24 bg-[#FFD54F] rounded-full filter blur-sm"></div>
      
      {/* Scrolling Clouds */}
      <SceneryLayer duration={baseDuration * 3} className="z-0 opacity-80">
        <div className="absolute top-[15%] left-[10%] w-32 h-12 sm:w-48 sm:h-16 bg-white rounded-full filter blur-sm"></div>
        <div className="absolute top-[25%] left-[70%] w-48 h-16 sm:w-64 sm:h-20 bg-white rounded-full filter blur-md"></div>
      </SceneryLayer>
      <SceneryLayer duration={baseDuration * 4} className="z-0 opacity-70">
        <div className="absolute top-[35%] left-[30%] w-28 h-10 sm:w-40 sm:h-12 bg-white rounded-full filter blur-sm"></div>
        <div className="absolute top-[20%] left-[90%] w-40 h-12 sm:w-56 sm:h-16 bg-white rounded-full filter blur-lg"></div>
      </SceneryLayer>

      {/* Parallax Hills */}
      <SceneryLayer duration={baseDuration * 1.5} className="z-10">
        <div className="absolute bg-green-200 w-[120vw] h-[120vw] rounded-full bottom-[-80vw] left-[5vw]"></div>
      </SceneryLayer>
      <SceneryLayer duration={baseDuration * 1.2} className="z-20">
        <div className="absolute bg-green-300 w-[100vw] h-[100vw] rounded-full bottom-[-60vw] right-[-30vw]"></div>
      </SceneryLayer>
      
      {/* Foreground hill with Station */}
      <SceneryLayer duration={baseDuration} className="z-30">
        <div className="absolute bg-[#A5D6A7] w-[80vw] h-[80vw] rounded-full bottom-[-40vw] left-[-20vw]"></div>
        <Station number={targetNumber} />
      </SceneryLayer>

      {/* Tracks Layer (fastest) */}
      <div
        className="absolute bottom-0 left-0 w-[200%] h-28 z-40 animate-scroll"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3e%3cg%3e%3crect fill='%23A0522D' width='10' height='100' x='15'/%3e%3crect fill='%23A0522D' width='10' height='100' x='75'/%3e%3crect fill='%236B4F41' width='100' height='4' y='45'/%3e%3crect fill='%236B4F41' width='100' height='4' y='55'/%3e%3c/g%3e%3c/svg%3e")`,
          backgroundSize: 'auto 48px',
          backgroundRepeat: 'repeat-x',
          transition: 'animation-duration 1s ease-in-out',
          animationDuration: `${baseDuration}s`,
        }}
      ></div>
    </div>
  );
};

// Add keyframes to the document to be used by Tailwind's `animate-scroll`
const style = document.createElement('style');
if (!document.getElementById('scenery-styles')) {
    style.id = 'scenery-styles';
    style.innerHTML = `
    @keyframes scroll {
        from { transform: translateX(0); }
        to { transform: translateX(-50%); }
    }
    .animate-scroll {
        animation-name: scroll;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
    }
    `;
    document.head.appendChild(style);
}