import React from 'react';
import { StickerId } from '../types';

interface StickerProps {
  className?: string;
}

const StickerWrapper: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={`relative w-32 h-32 flex items-center justify-center transform transition-transform hover:scale-110 duration-300 ${className}`}>
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-md">
            <path
                d="M95,50 A45,45 0 1,1 5,50 A45,45 0 1,1 95,50 Z"
                fill="white"
                stroke="#ccc"
                strokeWidth="1"
            />
        </svg>
        <div className="relative z-10 w-24 h-24 flex items-center justify-center">
            {children}
        </div>
    </div>
);


export const LocomotiveSticker: React.FC<StickerProps> = ({ className }) => (
    <StickerWrapper className={className}>
        <div className="w-16 h-12 bg-[#EF5350] rounded-t-md relative" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 20% 100%, 0 80%)' }}>
            <div className="absolute bottom-[-4px] left-2 w-4 h-4 bg-gray-700 rounded-full"></div>
            <div className="absolute bottom-[-4px] left-10 w-4 h-4 bg-gray-700 rounded-full"></div>
        </div>
    </StickerWrapper>
);

export const SunSticker: React.FC<StickerProps> = ({ className }) => (
    <StickerWrapper className={className}>
         <div className="w-16 h-16 bg-[#FFD54F] rounded-full"></div>
    </StickerWrapper>
);

export const TreeSticker: React.FC<StickerProps> = ({ className }) => (
    <StickerWrapper className={className}>
        <div className="flex flex-col items-center">
            <div className="w-0 h-0 border-l-[2rem] border-l-transparent border-b-[4rem] border-b-green-400 border-r-[2rem] border-r-transparent"></div>
            <div className="w-4 h-6 bg-yellow-900"></div>
        </div>
    </StickerWrapper>
);

export const CloudSticker: React.FC<StickerProps> = ({ className }) => (
    <StickerWrapper className={className}>
        <div className="w-16 h-10 bg-blue-200 rounded-full relative filter blur-sm">
             <div className="absolute w-10 h-8 bg-blue-200 rounded-full -bottom-2 -left-4"></div>
             <div className="absolute w-12 h-10 bg-blue-200 rounded-full -bottom-2 -right-4"></div>
        </div>
    </StickerWrapper>
);

export const StationSticker: React.FC<StickerProps> = ({ className }) => (
    <StickerWrapper className={className}>
        <div className="flex flex-col items-center">
            <div className="w-20 h-5 bg-[#EF5350] rounded-t-sm"></div>
            <div className="w-24 h-6 bg-gray-400"></div>
        </div>
    </StickerWrapper>
);


const stickerMap: { [key in StickerId]: React.FC<StickerProps> } = {
    locomotive: LocomotiveSticker,
    sun: SunSticker,
    tree: TreeSticker,
    cloud: CloudSticker,
    station: StationSticker,
};

export const Sticker: React.FC<{id: StickerId, className?: string}> = ({ id, className }) => {
    const StickerComponent = stickerMap[id];
    if (!StickerComponent) return null;
    return <StickerComponent className={className} />;
};
