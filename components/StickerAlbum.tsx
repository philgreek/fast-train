import React from 'react';
import { GameScreen, StickerId } from '../types';
import { Sticker } from './stickers';

interface StickerAlbumProps {
  onBack: () => void;
  stickers: StickerId[];
}

export const StickerAlbum: React.FC<StickerAlbumProps> = ({ onBack, stickers }) => {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center p-8 bg-amber-100" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.5), rgba(255,255,255,0.5)), url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d2b48c' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`}}>
      <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-4xl">
        <h1 className="text-5xl font-black mb-8 text-center text-yellow-900">Мои наклейки</h1>
        {stickers.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {stickers.map((stickerId, index) => (
              <Sticker key={index} id={stickerId} />
            ))}
          </div>
        ) : (
          <p className="text-xl text-center text-yellow-800 my-8">
              У вас пока нет наклеек. Начните поездку, чтобы заработать их!
          </p>
        )}
        <div className="flex justify-center mt-10">
            <button
                onClick={onBack}
                className="px-10 py-4 text-2xl font-bold text-white bg-blue-500 rounded-xl shadow-lg hover:bg-blue-600 transition-colors"
            >
                Назад
            </button>
        </div>
      </div>
    </div>
  );
};
