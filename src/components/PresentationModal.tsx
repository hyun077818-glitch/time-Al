import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Volume2,
  Camera,
  Film,
} from 'lucide-react';
import { StoryboardShot } from '../types';

interface PresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  shots: StoryboardShot[];
  projectTitle: string;
}

export const PresentationModal: React.FC<PresentationModalProps> = ({
  isOpen,
  onClose,
  shots,
  projectTitle,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMetadata, setShowMetadata] = useState(true);

  const currentShot = shots[currentIndex] || shots[0];

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < shots.length - 1 ? prev + 1 : 0));
  }, [shots.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : shots.length - 1));
  }, [shots.length]);

  // Slideshow auto-advance timer
  useEffect(() => {
    if (!isPlaying || !isOpen) return;
    const duration = (currentShot?.estimatedDuration || 4) * 1000;
    const timer = setTimeout(() => {
      handleNext();
    }, Math.max(duration, 3000));
    return () => clearTimeout(timer);
  }, [isPlaying, isOpen, currentIndex, currentShot, handleNext]);

  // Keyboard controls
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'p' || e.key === 'P') {
        setIsPlaying((prev) => !prev);
      } else if (e.key === 'm' || e.key === 'M') {
        setShowMetadata((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  if (!isOpen || shots.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-neutral-100 select-none">
      {/* Top Screening Bar */}
      <div className="flex h-14 items-center justify-between px-6 bg-gradient-to-b from-black/80 to-transparent z-20">
        <div className="flex items-center space-x-3">
          <Film className="h-5 w-5 text-amber-400" />
          <span className="font-display text-sm font-bold tracking-wider text-neutral-200">
            {projectTitle || 'DIRECTOR SCREENING ROOM'}
          </span>
          <span className="rounded-full bg-neutral-800 px-2.5 py-0.5 text-xs text-neutral-400 font-mono">
            Shot {currentIndex + 1} of {shots.length}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setShowMetadata((prev) => !prev)}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
              showMetadata
                ? 'bg-neutral-800 text-amber-400'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Subtitles (M)
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-neutral-950 px-4">
        {currentShot.imageUrl ? (
          <img
            src={currentShot.imageUrl}
            alt={`Shot ${currentShot.shotNumber}`}
            className="max-h-[82vh] max-w-[90vw] object-contain shadow-2xl rounded-lg"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Film className="h-16 w-16 text-neutral-700 mb-4" />
            <p className="text-lg font-semibold text-neutral-400">Frame Not Rendered Yet</p>
            <p className="mt-1 text-sm text-neutral-600 font-mono">
              Shot #{currentShot.shotNumber}: {currentShot.shotType}
            </p>
          </div>
        )}

        {/* Framing Metadata Overlay (Top Left of image) */}
        {showMetadata && (
          <div className="absolute top-6 left-8 flex flex-wrap gap-2 text-xs">
            <span className="rounded-md bg-black/80 px-2.5 py-1 font-bold text-amber-400 backdrop-blur-md border border-amber-500/30">
              SHOT #{currentShot.shotNumber} • {currentShot.shotType}
            </span>
            <span className="flex items-center space-x-1 rounded-md bg-black/80 px-2.5 py-1 text-neutral-300 backdrop-blur-md border border-neutral-800">
              <Camera className="h-3 w-3 text-amber-400" />
              <span>{currentShot.cameraMovement}</span>
            </span>
            <span className="rounded-md bg-black/80 px-2.5 py-1 text-neutral-400 backdrop-blur-md border border-neutral-800">
              {currentShot.focalLength}
            </span>
          </div>
        )}

        {/* Bottom Subtitle / Script Action Overlay */}
        {showMetadata && (
          <div className="absolute bottom-6 inset-x-0 mx-auto max-w-3xl px-4 text-center z-20">
            <div className="inline-block rounded-2xl bg-black/85 px-6 py-4 backdrop-blur-md border border-neutral-800/80 shadow-2xl text-left">
              <p className="text-sm font-medium text-neutral-200 leading-relaxed font-sans">
                {currentShot.scriptAction}
              </p>
              {currentShot.dialogue && (
                <p className="mt-2 text-sm text-amber-300 font-script italic">
                  "{currentShot.dialogue}"
                </p>
              )}
              {currentShot.audioEffect && (
                <p className="mt-1 flex items-center space-x-1.5 text-xs text-cyan-400/90 font-mono">
                  <Volume2 className="h-3 w-3" />
                  <span>{currentShot.audioEffect}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Left / Right Nav Arrows */}
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-3 text-neutral-300 hover:bg-black/90 hover:text-white transition-all backdrop-blur-sm"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-3 text-neutral-300 hover:bg-black/90 hover:text-white transition-all backdrop-blur-sm"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Bottom Filmstrip Timeline */}
      <div className="flex h-20 items-center justify-between border-t border-neutral-900 bg-neutral-950 px-6 z-20">
        {/* Playback Controls */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setIsPlaying((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-neutral-950 font-bold hover:bg-amber-400 transition-all"
            title={isPlaying ? 'Pause Slideshow (Space)' : 'Play Slideshow (Space)'}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-neutral-950" />}
          </button>
          <div className="text-xs text-neutral-400">
            <span className="font-semibold text-neutral-200">
              {isPlaying ? 'Auto-Advancing' : 'Paused'}
            </span>
            <p className="text-[10px] text-neutral-500">Space to play/pause • Arrows to step</p>
          </div>
        </div>

        {/* Thumbnail Strip */}
        <div className="flex space-x-2 overflow-x-auto py-1">
          {shots.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentIndex(idx)}
              className={`relative h-12 w-20 flex-shrink-0 overflow-hidden rounded-lg border transition-all ${
                currentIndex === idx
                  ? 'border-amber-400 ring-2 ring-amber-400/40 scale-105'
                  : 'border-neutral-800 opacity-60 hover:opacity-100'
              }`}
            >
              {s.imageUrl ? (
                <img src={s.imageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-neutral-900 text-[10px] font-mono text-neutral-500">
                  #{s.shotNumber}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
