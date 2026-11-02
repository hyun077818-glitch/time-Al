import React from 'react';
import { X, Printer, Download, Film, Layers } from 'lucide-react';
import { StoryboardProject } from '../types';

interface PrintStoryboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: StoryboardProject;
}

export const PrintStoryboardModal: React.FC<PrintStoryboardModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md print:p-0 print:bg-white">
      <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl print:border-none print:shadow-none print:max-h-none print:bg-white print:text-black">
        {/* Header - Hidden on Print */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4 bg-neutral-950/50 print:hidden">
          <div className="flex items-center space-x-3">
            <Printer className="h-5 w-5 text-amber-400" />
            <div>
              <h3 className="font-display text-sm font-bold tracking-wider text-neutral-100">
                PRODUCTION STORYBOARD SHEET
              </h3>
              <p className="text-[11px] text-neutral-400">Ready for PDF export or physical print</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center space-x-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-neutral-950 hover:bg-amber-400 transition-colors shadow-md"
            >
              <Printer className="h-4 w-4" />
              <span>Print / Save to PDF</span>
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

        {/* Printable Storyboard Content */}
        <div className="flex-1 overflow-y-auto p-8 print:p-0 print:overflow-visible bg-neutral-950 print:bg-white text-neutral-100 print:text-black">
          {/* Production Slate Header */}
          <div className="border-b-2 border-amber-500 pb-4 mb-6 print:border-black">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-amber-400 print:text-neutral-600 font-bold">
                  PRODUCTION STORYBOARD DECK
                </span>
                <h1 className="font-display text-2xl font-black tracking-tight text-white print:text-black">
                  {project.title || 'UNTITLED SEQUENCE'}
                </h1>
                <p className="text-xs text-neutral-400 print:text-neutral-700 mt-1">
                  Genre: {project.genre || 'Cinematic'} • Total Shots: {project.shots.length} • Est. Runtime: {Math.round(project.shots.reduce((acc, s) => acc + (s.estimatedDuration || 3.5), 0))}s
                </p>
              </div>
              <div className="text-right font-mono text-xs text-neutral-500 print:text-neutral-600">
                <p>AI Engine: gemini-3-pro-image</p>
                <p>Format: {project.aspectRatio} • {project.imageSize}</p>
                <p>{new Date().toLocaleDateString()}</p>
              </div>
            </div>
            {project.logline && (
              <p className="mt-3 text-xs italic text-neutral-300 print:text-neutral-800 border-l-2 border-amber-400/50 pl-3">
                "{project.logline}"
              </p>
            )}
          </div>

          {/* 2-Column Storyboard Panels (Standard Production Sheet) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">
            {project.shots.map((shot) => (
              <div
                key={shot.id}
                className="rounded-xl border border-neutral-800 print:border-neutral-300 bg-neutral-900/50 print:bg-white overflow-hidden page-break-inside-avoid shadow-sm"
              >
                {/* Panel Image */}
                <div className="relative aspect-video w-full bg-neutral-950 print:bg-neutral-100 overflow-hidden border-b border-neutral-800 print:border-neutral-300">
                  {shot.imageUrl ? (
                    <img
                      src={shot.imageUrl}
                      alt={`Shot ${shot.shotNumber}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-neutral-600 font-mono">
                      [Shot #{shot.shotNumber} Pending Render]
                    </div>
                  )}
                  <div className="absolute top-2 left-2 rounded bg-black/80 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300 print:bg-white print:text-black print:border">
                    SC {shot.sceneNumber} • SH {shot.shotNumber}
                  </div>
                </div>

                {/* Panel Information */}
                <div className="p-3 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-mono text-[11px] text-neutral-400 print:text-neutral-600">
                    <span className="font-bold text-amber-400 print:text-black uppercase">
                      {shot.shotType}
                    </span>
                    <span>{shot.cameraMovement} • {shot.focalLength}</span>
                  </div>

                  <p className="text-neutral-200 print:text-neutral-900 leading-snug">
                    <strong className="text-neutral-400 print:text-neutral-600">Action:</strong> {shot.scriptAction}
                  </p>

                  {shot.dialogue && (
                    <p className="font-script text-amber-300/90 print:text-neutral-800 italic bg-neutral-950/50 print:bg-neutral-50 p-1.5 rounded">
                      "{shot.dialogue}"
                    </p>
                  )}

                  <div className="text-[10px] text-neutral-500 print:text-neutral-600 flex justify-between pt-1 border-t border-neutral-800/40 print:border-neutral-200 font-mono">
                    <span>Mood: {shot.lightingMood}</span>
                    <span>Dur: {shot.estimatedDuration || 3.5}s</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
