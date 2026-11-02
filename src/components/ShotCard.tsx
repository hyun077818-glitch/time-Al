import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  Maximize2,
  Download,
  Trash2,
  ArrowUp,
  ArrowDown,
  Volume2,
  Sun,
  Camera,
  Film,
  Copy,
  Edit3,
  Check,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { StoryboardShot, ImageResolution, AspectRatio } from '../types';

interface ShotCardProps {
  shot: StoryboardShot;
  index: number;
  totalShots: number;
  onGenerateImage: (shotId: string) => Promise<void>;
  onInspect: (shot: StoryboardShot) => void;
  onUpdateShot: (shotId: string, updates: Partial<StoryboardShot>) => void;
  onDeleteShot: (shotId: string) => void;
  onMoveShot: (index: number, direction: 'up' | 'down') => void;
  onRefinePrompt: (shotId: string, instruction?: string) => Promise<void>;
  globalImageSize: ImageResolution;
  globalAspectRatio: AspectRatio;
}

export const ShotCard: React.FC<ShotCardProps> = ({
  shot,
  index,
  totalShots,
  onGenerateImage,
  onInspect,
  onUpdateShot,
  onDeleteShot,
  onMoveShot,
  onRefinePrompt,
  globalImageSize,
  globalAspectRatio,
}) => {
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(shot.visualPrompt);
  const [isRefiningPrompt, setIsRefiningPrompt] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const effectiveSize = shot.imageSize || globalImageSize;
  const effectiveRatio = shot.aspectRatio || globalAspectRatio;

  const handleSavePrompt = () => {
    onUpdateShot(shot.id, { visualPrompt: editedPrompt });
    setIsEditingPrompt(false);
  };

  const handleRefine = async () => {
    setIsRefiningPrompt(true);
    try {
      await onRefinePrompt(shot.id);
      setIsEditingPrompt(false);
    } finally {
      setIsRefiningPrompt(false);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(shot.visualPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleDownloadImage = () => {
    if (!shot.imageUrl) return;
    const link = document.createElement('a');
    link.href = shot.imageUrl;
    link.download = `CineBoard_Scene${shot.sceneNumber}_Shot${shot.shotNumber}_${effectiveSize}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Determine aspect ratio class
  const getAspectRatioClass = (ratio: AspectRatio) => {
    switch (ratio) {
      case '16:9':
        return 'aspect-video';
      case '4:3':
        return 'aspect-[4/3]';
      case '1:1':
        return 'aspect-square';
      case '9:16':
        return 'aspect-[9/16] max-h-96';
      default:
        return 'aspect-video';
    }
  };

  return (
    <div className="group relative flex flex-col rounded-2xl border border-neutral-800 bg-neutral-900/80 shadow-xl transition-all hover:border-neutral-700/90 hover:shadow-2xl">
      {/* Clapperboard Header Bar */}
      <div className="flex items-center justify-between border-b border-neutral-800/80 px-4 py-2.5 bg-neutral-950/40 rounded-t-2xl">
        <div className="flex items-center space-x-2">
          <div className="flex h-6 items-center rounded-md bg-amber-500/10 px-2 border border-amber-500/20 text-xs font-bold text-amber-400 font-mono">
            SHOT #{shot.shotNumber}
          </div>
          <span className="text-xs text-neutral-400 font-medium">SCENE {shot.sceneNumber}</span>
          {shot.estimatedDuration && (
            <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-400">
              {shot.estimatedDuration}s
            </span>
          )}
        </div>

        {/* Quick Shot Reorder & Menu */}
        <div className="flex items-center space-x-1 opacity-70 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onMoveShot(index, 'up')}
            className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 disabled:opacity-20"
            title="Move Earlier in Sequence"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={index === totalShots - 1}
            onClick={() => onMoveShot(index, 'down')}
            className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 disabled:opacity-20"
            title="Move Later in Sequence"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDeleteShot(shot.id)}
            className="rounded p-1 text-neutral-500 hover:bg-rose-500/20 hover:text-rose-400 transition-colors ml-1"
            title="Delete Shot"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Cinematography Badges */}
      <div className="flex flex-wrap items-center gap-1.5 px-4 py-2 bg-neutral-950/20 border-b border-neutral-800/40 text-[11px]">
        <span className="rounded-md bg-neutral-800 px-2 py-0.5 font-semibold text-neutral-200 uppercase tracking-wide">
          {shot.shotType}
        </span>
        <span className="rounded-md bg-neutral-850 px-2 py-0.5 text-neutral-300 flex items-center space-x-1 border border-neutral-800">
          <Camera className="h-3 w-3 text-amber-400" />
          <span>{shot.cameraMovement}</span>
        </span>
        <span className="rounded-md bg-neutral-850 px-2 py-0.5 text-neutral-400 border border-neutral-800">
          {shot.focalLength}
        </span>
      </div>

      {/* Storyboard Image Canvas */}
      <div className={`relative w-full overflow-hidden bg-neutral-950 ${getAspectRatioClass(effectiveRatio)}`}>
        {shot.status === 'completed' && shot.imageUrl ? (
          <>
            <img
              src={shot.imageUrl}
              alt={`Storyboard Shot ${shot.shotNumber}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              loading="lazy"
            />

            {/* Resolution & Model watermark badge */}
            <div className="absolute bottom-2 left-2 flex items-center space-x-1.5 rounded-md bg-neutral-950/80 px-2 py-0.5 text-[10px] font-mono font-medium text-amber-300 backdrop-blur-sm border border-neutral-700/50">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{effectiveSize}</span>
              <span className="text-neutral-500">•</span>
              <span className="text-neutral-400 text-[9px]">{shot.modelUsed || 'gemini-3-pro-image-preview'}</span>
            </div>

            {/* Image Hover Action Bar */}
            <div className="absolute inset-0 flex items-center justify-center space-x-2 bg-neutral-950/60 opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => onInspect(shot)}
                className="flex items-center space-x-1.5 rounded-lg bg-neutral-900/90 px-3 py-1.5 text-xs font-semibold text-neutral-100 shadow-lg border border-neutral-700 hover:bg-neutral-800 transition-all hover:scale-105"
                title="Full-Screen High-Res Inspection"
              >
                <Maximize2 className="h-3.5 w-3.5 text-amber-400" />
                <span>Inspect</span>
              </button>
              <button
                type="button"
                onClick={() => onGenerateImage(shot.id)}
                className="flex items-center space-x-1.5 rounded-lg bg-neutral-900/90 px-3 py-1.5 text-xs font-semibold text-neutral-100 shadow-lg border border-neutral-700 hover:bg-neutral-800 transition-all hover:scale-105"
                title="Regenerate with Gemini 3 Pro Image"
              >
                <RefreshCw className="h-3.5 w-3.5 text-amber-400" />
                <span>Regenerate</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadImage}
                className="rounded-lg bg-neutral-900/90 p-2 text-neutral-200 shadow-lg border border-neutral-700 hover:bg-neutral-800 transition-all"
                title="Download High-Res PNG"
              >
                <Download className="h-3.5 w-3.5" />
              </button>
            </div>
          </>
        ) : shot.status === 'generating' ? (
          <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
            {/* Animated Camera Aperture Shutter */}
            <div className="relative mb-3 flex h-14 w-14 items-center justify-center">
              <div className="absolute h-full w-full rounded-full border-2 border-amber-500/20 animate-ping" />
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-400 border-t-transparent shadow-lg shadow-amber-500/20" />
              <Camera className="absolute h-4 w-4 text-amber-400" />
            </div>
            <p className="text-xs font-bold text-neutral-200 tracking-wide">
              Rendering {effectiveSize} Frame...
            </p>
            <p className="mt-1 text-[11px] text-amber-400/80 font-mono">
              gemini-3-pro-image-preview
            </p>
          </div>
        ) : shot.status === 'error' ? (
          <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center bg-rose-950/20">
            <AlertTriangle className="h-8 w-8 text-rose-400 mb-2" />
            <p className="text-xs font-semibold text-rose-300">Generation Error</p>
            <p className="mt-1 max-w-[200px] text-[11px] text-neutral-400 line-clamp-2">
              {shot.errorMessage || 'Failed to render frame'}
            </p>
            <button
              type="button"
              onClick={() => onGenerateImage(shot.id)}
              className="mt-3 flex items-center space-x-1.5 rounded-lg bg-rose-500/20 px-3 py-1.5 text-xs font-medium text-rose-200 border border-rose-500/30 hover:bg-rose-500/30 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry Render</span>
            </button>
          </div>
        ) : (
          /* Pending State */
          <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center bg-neutral-950/60 border-dashed border-neutral-800">
            <Film className="h-8 w-8 text-neutral-600 mb-2 group-hover:text-amber-500/70 transition-colors" />
            <p className="text-xs font-medium text-neutral-400">Ready to Render</p>
            <p className="text-[10px] text-neutral-500 font-mono mt-0.5">
              Target: {effectiveSize} • {effectiveRatio}
            </p>
            <button
              type="button"
              onClick={() => onGenerateImage(shot.id)}
              className="mt-3 flex items-center space-x-1.5 rounded-xl bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold text-amber-300 border border-amber-500/30 hover:bg-amber-500 hover:text-neutral-950 transition-all shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Generate Frame</span>
            </button>
          </div>
        )}
      </div>

      {/* Shot Details & Story Content */}
      <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
        {/* Script Action Beat */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            Action Beat
          </span>
          <p className="text-xs text-neutral-200 leading-relaxed font-sans mt-0.5">
            {shot.scriptAction}
          </p>
        </div>

        {/* Dialogue Quote (if present) */}
        {shot.dialogue && (
          <div className="rounded-lg bg-neutral-950/50 p-2.5 border-l-2 border-amber-500/70">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/80 block mb-0.5">
              Dialogue / Voiceover
            </span>
            <p className="font-script text-xs text-neutral-300 italic">
              "{shot.dialogue}"
            </p>
          </div>
        )}

        {/* Atmosphere: Lighting & Audio Cues */}
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="flex items-start space-x-1.5 text-neutral-400 bg-neutral-950/30 p-2 rounded-lg border border-neutral-800/40">
            <Sun className="h-3.5 w-3.5 text-amber-400/80 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">{shot.lightingMood}</span>
          </div>
          <div className="flex items-start space-x-1.5 text-neutral-400 bg-neutral-950/30 p-2 rounded-lg border border-neutral-800/40">
            <Volume2 className="h-3.5 w-3.5 text-cyan-400/80 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">{shot.audioEffect || 'Ambient room tone'}</span>
          </div>
        </div>

        {/* Visual Prompt Section with Refine Affordance */}
        <div className="pt-2 border-t border-neutral-800/60">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center space-x-1">
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span>Visual Prompt</span>
            </span>

            <div className="flex items-center space-x-1 text-xs">
              <button
                type="button"
                onClick={handleCopyPrompt}
                className="p-1 text-neutral-500 hover:text-neutral-300 transition-colors"
                title="Copy Prompt"
              >
                {copiedPrompt ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>

              <button
                type="button"
                disabled={isRefiningPrompt}
                onClick={handleRefine}
                className="flex items-center space-x-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors disabled:opacity-50"
                title="Refine prompt with Gemini Flash-Lite"
              >
                <Sparkles className="h-3 w-3" />
                <span>{isRefiningPrompt ? 'Refining...' : 'AI Refine'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isEditingPrompt) {
                    handleSavePrompt();
                  } else {
                    setEditedPrompt(shot.visualPrompt);
                    setIsEditingPrompt(true);
                  }
                }}
                className="p-1 text-neutral-400 hover:text-neutral-200 transition-colors"
                title={isEditingPrompt ? 'Save edit' : 'Edit prompt manually'}
              >
                {isEditingPrompt ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Edit3 className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {isEditingPrompt ? (
            <div className="space-y-1.5">
              <textarea
                value={editedPrompt}
                onChange={(e) => setEditedPrompt(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 p-2 text-xs text-neutral-200 focus:border-amber-500 focus:outline-none"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditingPrompt(false)}
                  className="rounded px-2 py-0.5 text-[10px] text-neutral-400 hover:text-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePrompt}
                  className="rounded bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-neutral-950"
                >
                  Save & Apply
                </button>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-neutral-400 line-clamp-3 hover:line-clamp-none transition-all cursor-pointer font-sans bg-neutral-950/40 p-2 rounded-lg border border-neutral-800/40"
               onClick={() => setIsEditingPrompt(true)}>
              {shot.visualPrompt}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
