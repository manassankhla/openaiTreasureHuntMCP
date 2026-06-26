"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import {
  useWidgetProps,
  useMaxHeight,
  useDisplayMode,
  useRequestDisplayMode,
  useIsChatGptApp,
  useSendMessage,
} from "./hooks";

type Location = "forest" | "cave" | "castle";
type GameEvent = "none" | "dragon" | "attack" | "treasure" | "victory";

export default function Home() {
  const toolOutput = useWidgetProps<{
    result?: { 
      structuredContent?: { 
        location?: Location;
        event?: GameEvent;
        message?: string;
        options?: string[];
      } 
    };
  }>();
  
  const maxHeight = useMaxHeight() ?? undefined;
  const displayMode = useDisplayMode();
  const requestDisplayMode = useRequestDisplayMode();
  const isChatGptApp = useIsChatGptApp();

  const location = toolOutput?.result?.structuredContent?.location || "forest";
  const event = toolOutput?.result?.structuredContent?.event || "none";
  const message = toolOutput?.result?.structuredContent?.message || "Welcome to the Treasure Hunt! You stand at the edge of a dark forest. What will you do?";
  const options = toolOutput?.result?.structuredContent?.options || ["Go to Cave", "Go to Castle"];

  const sendMessage = useSendMessage();

  const handleOptionClick = (option: string) => {
    sendMessage(option);
  };

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    let src = "";
    const cdn = "https://cdn.jsdelivr.net/gh/manassankhla/openaiTreasureHuntMCP@main/public";
    if (event === "victory") src = `${cdn}/victory.mp3`;
    else if (event === "treasure") src = `${cdn}/treasure.mp3`;
    else if (event === "attack") src = `${cdn}/attack.mp3`;
    else if (event === "dragon") src = `${cdn}/dragon.mp3`;
    else if (location === "forest") src = `${cdn}/forest.mp3`;
    
    if (src) {
      const audio = new Audio(src);
      audio.play().catch(e => console.error("Audio play failed:", e));
      audioRef.current = audio;
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [location, event]);

  const cdn = "https://cdn.jsdelivr.net/gh/manassankhla/openaiTreasureHuntMCP@main/public";
  const bgImage = location === "cave" ? `${cdn}/cave.png` : location === "castle" ? `${cdn}/castle.png` : `${cdn}/forest.png`;

  return (
    <div
      className="relative w-full overflow-hidden font-sans flex flex-col items-center justify-center bg-black text-white"
      style={{
        maxHeight,
        height: displayMode === "fullscreen" ? maxHeight : "100vh",
      }}
    >
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url('${bgImage}')` }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {displayMode !== "fullscreen" && (
        <button
          aria-label="Enter fullscreen"
          className="fixed top-4 right-4 z-50 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur shadow-lg ring-1 ring-white/30 p-2.5 transition-colors cursor-pointer"
          onClick={() => requestDisplayMode("fullscreen")}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
          </svg>
        </button>
      )}

      <main className="z-10 flex flex-col items-center justify-center w-full h-full p-6">


        <div className="flex-1 flex items-center justify-center w-full min-h-[200px]">
          {event === "dragon" && (
            <div className="animate-bounce">
              <img src={`${cdn}/dragon.png`} alt="Dragon" width={300} height={300} className="drop-shadow-[0_0_15px_rgba(255,0,0,0.8)]" />
            </div>
          )}
          {event === "attack" && (
            <div className="animate-ping">
              <img src={`${cdn}/dragon.png`} alt="Dragon Attacking" width={300} height={300} className="drop-shadow-[0_0_25px_rgba(255,50,0,1)] scale-110" />
            </div>
          )}
          {event === "treasure" && (
            <div className="animate-pulse">
              <img src={`${cdn}/treasure.png`} alt="Treasure" width={250} height={250} className="drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]" />
            </div>
          )}
          {event === "victory" && (
            <div className="animate-bounce">
              <img src={`${cdn}/treasure.png`} alt="Victory" width={350} height={350} className="drop-shadow-[0_0_30px_rgba(255,255,0,1)]" />
            </div>
          )}
        </div>

        <div className="w-full max-w-3xl bg-black/70 border-2 border-amber-700/50 rounded-xl p-6 backdrop-blur shadow-[0_0_20px_rgba(0,0,0,0.8)] mt-auto mb-4 flex flex-col gap-6">
          <p className="text-xl md:text-2xl font-serif leading-relaxed text-amber-50 whitespace-pre-wrap text-center">
            {message}
          </p>
          
          {options && options.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4">
              {options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionClick(option)}
                  className="bg-amber-900/80 hover:bg-amber-800 text-amber-100 font-bold py-3 px-6 rounded-lg border border-amber-500/50 shadow-[0_0_10px_rgba(217,119,6,0.3)] transition-all transform hover:scale-105 active:scale-95"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
