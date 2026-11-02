import React from 'react';
import {
  Sparkles,
  Plus,
  Play,
  RotateCw,
  Film,
  Layers,
  Clock,
  Compass,
  FileText,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { StoryboardProject, StoryboardShot, ImageResolution, AspectRatio } from '../types';
import { ShotCard } from './ShotCard';

interface StoryboardViewProps {
  project: StoryboardProject;
  onGenerateImage: (shotId: string) => Promise<void>;
  onGenerateAllImages: () => Promise<void>;
  isGeneratingAll: boolean;
  onInspectShot: (shot: StoryboardShot) => void;
  onUpdateShot: (shotId: string, updates: Partial<StoryboardShot>) => void;
  onDeleteShot: (shotId: string) => void;
  onMoveShot: (index: number, direction: 'up' | 'down') => void;
  onAddShot: () => void;
  onRefinePrompt: (shotId: string, instruction?: string) => Promise<void>;
  onOpenPresentation: () => void;
  onNavigateToScript: () => void;
}

export const StoryboardView: React.FC<StoryboardViewProps> = ({
  project,
  onGenerateImage,
  onGenerateAllImages,
  isGeneratingAll,
  onInspectShot,
  onUpdateShot,
  onDeleteShot,
  onMoveShot,
  onAddShot,
  onRefinePrompt,
  onOpenPresentation,
  onNavigateToScript,
}) => {
  const { shots, title, genre, logline, imageSize, aspectRatio } = project;

  const completedCount = shots.filter((s) => s.status === 'completed' && s.imageUrl).length;
  const generatingCount = shots.filter((s) => s.status === 'generating').length;
  const pendingCount = shots.filter((s) => s.status === 'pending').length;
  const totalDuration = shots.reduce((acc, s) => acc + (s.estimatedDuration || 3.5), 0);

  if (shots.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900 shadow-xl">
          <Film className="h-8 w-8 text-amber-400" />
        </div>
        <h2 className="font-display text-2xl font-bold text-neutral-100">No Storyboard Shots Yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-neutral-400">
          Upload or write your screenplay in the Screenplay tab to automatically generate a sequence of cinematic storyboard frames.
        </p>
        <div className="mt-6 flex justify-center space-x-3">
          <button
            type="button"
            onClick={onNavigateToScript}
            className="flex items-center space-x-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-neutral-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all"
          >
            <FileText className="h-4 w-4" />
            <span>Go to Screenplay Tab</span>
          </button>
          <button
            type="button"
            onClick={onAddShot}
            className="flex items-center space-x-2 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-neutral-300 hover:bg-neutral-850 hover:text-neutral-100 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Manual Shot</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Project Overview Banner */}
      <div className="mb-6 rounded-2xl border border-neutral-800 bg-gradient-to-r from-neutral-900/90 via-neutral-900/50 to-neutral-950 p-5 shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-300 border border-amber-500/20">
                {genre || 'Cinematic Sequence'}
              </span>
              <span className="flex items-center space-x-1 text-xs text-neutral-400 font-mono">
                <Clock className="h-3.5 w-3.5 text-neutral-500" />
                <span>Est. {Math.round(totalDuration)}s Screenplay Runtime</span>
              </span>
              <span className="flex items-center space-x-1 text-xs text-neutral-400 font-mono">
                <Layers className="h-3.5 w-3.5 text-neutral-500" />
                <span>{shots.length} Key Shots</span>
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-neutral-100 sm:text-3xl">
              {title || 'Untitled Sequence'}
            </h1>
            <p className="max-w-3xl text-xs text-neutral-300 leading-relaxed font-sans">
              {logline || 'A cinematic storyboard breakdown generated with Gemini.'}
            </p>
          </div>

          {/* Batch Generation & Presentation Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Generate All Button */}
            <button
              type="button"
              disabled={isGeneratingAll || pendingCount === 0}
              onClick={onGenerateAllImages}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-bold text-neutral-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 transition-all"
            >
              <Sparkles className="h-4 w-4" />
              <span>
                {isGeneratingAll
                  ? `Rendering Frames (${completedCount}/${shots.length})...`
                  : `Generate All ${imageSize} Images (${pendingCount})`}
              </span>
            </button>

            {/* Presentation Mode */}
            <button
              type="button"
              onClick={onOpenPresentation}
              className="flex items-center space-x-2 rounded-xl border border-neutral-700 bg-neutral-800 px-3.5 py-2.5 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 hover:text-white transition-all"
            >
              <Play className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>Screening</span>
            </button>

            {/* Add Shot */}
            <button
              type="button"
              onClick={onAddShot}
              className="flex items-center space-x-1.5 rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-xs font-semibold text-neutral-300 hover:bg-neutral-850 hover:text-neutral-100 transition-all"
              title="Add a new storyboard shot"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Shot</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 pt-4 border-t border-neutral-800/60">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1.5">
            <span>
              Sequence Production Status: <strong>{completedCount} of {shots.length}</strong> shots rendered
            </span>
            <span className="font-mono text-amber-400">
              {Math.round((completedCount / (shots.length || 1)) * 100)}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${(completedCount / (shots.length || 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Storyboard Shots Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {shots.map((shot, index) => (
          <ShotCard
            key={shot.id}
            shot={shot}
            index={index}
            totalShots={shots.length}
            onGenerateImage={onGenerateImage}
            onInspect={onInspectShot}
            onUpdateShot={onUpdateShot}
            onDeleteShot={onDeleteShot}
            onMoveShot={onMoveShot}
            onRefinePrompt={onRefinePrompt}
            globalImageSize={imageSize}
            globalAspectRatio={aspectRatio}
          />
        ))}
      </div>
    </div>
  );
};
