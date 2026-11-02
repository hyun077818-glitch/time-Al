import React, { useState } from 'react';
import {
  X,
  Sparkles,
  RefreshCw,
  Download,
  Camera,
  Sun,
  Volume2,
  Clock,
  Layers,
  Check,
  Maximize2,
} from 'lucide-react';
import { StoryboardShot, ImageResolution, AspectRatio } from '../types';

interface ShotInspectorModalProps {
  shot: StoryboardShot | null;
  isOpen: boolean;
  onClose: () => void;
  onGenerateImage: (shotId: string, customSize?: ImageResolution) => Promise<void>;
  onUpdateShot: (shotId: string, updates: Partial<StoryboardShot>) => void;
  onRefinePrompt: (shotId: string, instruction?: string) => Promise<void>;
}

export const ShotInspectorModal: React.FC<ShotInspectorModalProps> = ({
  shot,
  isOpen,
  onClose,
  onGenerateImage,
  onUpdateShot,
  onRefinePrompt,
}) => {
  if (!isOpen || !shot) return null;

  const [promptDraft, setPromptDraft] = useState(shot.visualPrompt);
  const [refinementIdea, setRefinementIdea] = useState('');
  const [selectedSize, setSelectedSize] = useState<ImageResolution>(shot.imageSize || '2K');
  const [isRefining, setIsRefining] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSavePrompt = () => {
    onUpdateShot(shot.id, {
      visualPrompt: promptDraft,
      imageSize: selectedSize,
    });
  };

  const handleRefine = async () => {
    setIsRefining(true);
    try {
      await onRefinePrompt(shot.id, refinementIdea);
      setRefinementIdea('');
    } finally {
      setIsRefining(false);
    }
  };

  const handleRender = async () => {
    setIsGenerating(true);
    try {
      await onGenerateImage(shot.id, selectedSize);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!shot.imageUrl) return;
    const a = document.createElement('a');
    a.href = shot.imageUrl;
    a.download = `Shot_${shot.shotNumber}_${selectedSize}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4 bg-neutral-950/50">
          <div className="flex items-center space-x-3">
            <span className="rounded-lg bg-amber-500/20 px-2.5 py-1 text-xs font-bold font-mono text-amber-300 border border-amber-500/30">
              SHOT #{shot.shotNumber}
            </span>
            <span className="text-sm font-semibold text-neutral-200">
              SCENE {shot.sceneNumber} • {shot.shotType}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {shot.imageUrl && (
              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center space-x-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-200 hover:bg-neutral-700 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download PNG</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: 2-Column Inspector */}
        <div className="grid flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-2">
          {/* Left: Big Image Canvas */}
          <div className="flex flex-col items-center justify-center border-b border-neutral-800 bg-neutral-950 p-6 lg:border-b-0 lg:border-r">
            <div className="relative w-full overflow-hidden rounded-xl bg-neutral-900 shadow-2xl">
              {shot.imageUrl ? (
                <img
                  src={shot.imageUrl}
                  alt={`Shot ${shot.shotNumber}`}
                  className="w-full object-contain max-h-[60vh] rounded-xl"
                />
              ) : (
                <div className="flex h-64 w-full flex-col items-center justify-center p-8 text-center text-neutral-500">
                  <Camera className="h-12 w-12 mb-3 text-neutral-600" />
                  <p className="text-sm font-semibold text-neutral-400">Frame Not Rendered Yet</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    Use the controls on the right to render in 1K, 2K, or 4K.
                  </p>
                </div>
              )}
            </div>

            {/* Version History Thumbnails (if available) */}
            {shot.versionHistory && shot.versionHistory.length > 0 && (
              <div className="mt-4 w-full">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-2">
                  Frame Version History ({shot.versionHistory.length})
                </span>
                <div className="flex space-x-2 overflow-x-auto pb-1">
                  {shot.versionHistory.map((v, i) => (
                    <button
                      key={i}
                      onClick={() => onUpdateShot(shot.id, { imageUrl: v.url, imageSize: v.imageSize })}
                      className="relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-neutral-800 hover:border-amber-400 transition-colors"
                    >
                      <img src={v.url} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Technical Controls & Visual Prompt Lab */}
          <div className="space-y-5 p-6 bg-neutral-900/40">
            {/* Directorial Camera Specs */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3">
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">Framing</span>
                <span className="font-semibold text-neutral-200 mt-1 block">{shot.shotType}</span>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3">
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">Camera Motion</span>
                <span className="font-semibold text-neutral-200 mt-1 block">{shot.cameraMovement}</span>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3">
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">Focal Lens</span>
                <span className="font-semibold text-neutral-200 mt-1 block">{shot.focalLength}</span>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3">
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">Screen Time</span>
                <span className="font-semibold text-neutral-200 mt-1 block">{shot.estimatedDuration || 3.5}s</span>
              </div>
            </div>

            {/* Resolution Selector: 1K, 2K, 4K */}
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                Output Resolution (gemini-3-pro-image-preview)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['1K', '2K', '4K'] as ImageResolution[]).map((res) => (
                  <button
                    key={res}
                    type="button"
                    onClick={() => setSelectedSize(res)}
                    className={`rounded-xl border py-2 text-xs font-bold transition-all ${
                      selectedSize === res
                        ? 'border-amber-500 bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                    }`}
                  >
                    {res} {res === '4K' ? 'Ultra' : res === '2K' ? 'Clear' : 'Standard'}
                  </button>
                ))}
              </div>
            </div>

            {/* Script Action & Dialogue */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-3 text-xs space-y-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">Action Beat</span>
                <p className="text-neutral-300 mt-0.5">{shot.scriptAction}</p>
              </div>
              {shot.dialogue && (
                <div className="border-t border-neutral-800 pt-2">
                  <span className="text-[10px] uppercase font-bold text-amber-400/80 block">Dialogue</span>
                  <p className="font-script text-neutral-300 italic">"{shot.dialogue}"</p>
                </div>
              )}
            </div>

            {/* Visual Prompt Editor */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-neutral-300 flex items-center space-x-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>Visual Image Prompt</span>
                </span>
              </div>
              <textarea
                value={promptDraft}
                onChange={(e) => setPromptDraft(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-xs text-neutral-200 focus:border-amber-500 focus:outline-none font-sans"
              />
            </div>

            {/* AI Refine Assistance */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1">
                <Sparkles className="h-3 w-3" />
                <span>Directorial Prompt Enhancement (Flash-Lite)</span>
              </span>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={refinementIdea}
                  onChange={(e) => setRefinementIdea(e.target.value)}
                  placeholder="e.g. Add heavy rain fog, push camera closer to eyes..."
                  className="flex-1 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-200 focus:border-amber-500 focus:outline-none"
                />
                <button
                  type="button"
                  disabled={isRefining}
                  onClick={handleRefine}
                  className="rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-colors disabled:opacity-50"
                >
                  {isRefining ? 'Refining...' : 'Refine'}
                </button>
              </div>
            </div>

            {/* Action Render Button */}
            <div className="pt-2 flex space-x-3">
              <button
                type="button"
                onClick={handleSavePrompt}
                className="flex-1 rounded-xl border border-neutral-700 bg-neutral-800 py-3 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 transition-colors"
              >
                Save Prompt Updates
              </button>
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleRender}
                className="flex-1 flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-xs font-bold text-neutral-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'Rendering Frame...' : `Render ${selectedSize} Frame`}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
