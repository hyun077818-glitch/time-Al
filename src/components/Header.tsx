import React from 'react';
import {
  Clapperboard,
  Sparkles,
  MessageSquare,
  Play,
  Printer,
  Download,
  Settings2,
  Layers,
  Ratio,
  Maximize2,
  FileCode,
} from 'lucide-react';
import { ImageResolution, AspectRatio } from '../types';
import { STYLE_PRESETS } from '../data/stylePresets';

interface HeaderProps {
  imageSize: ImageResolution;
  onImageSizeChange: (size: ImageResolution) => void;
  aspectRatio: AspectRatio;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  selectedStyle: string;
  onStyleChange: (styleId: string) => void;
  onOpenChat: () => void;
  chatOpen: boolean;
  onOpenPresentation: () => void;
  onOpenPrint: () => void;
  onExportJson: () => void;
  shotCount: number;
  completedShotCount: number;
  activeTab: 'script' | 'storyboard';
  setActiveTab: (tab: 'script' | 'storyboard') => void;
}

export const Header: React.FC<HeaderProps> = ({
  imageSize,
  onImageSizeChange,
  aspectRatio,
  onAspectRatioChange,
  selectedStyle,
  onStyleChange,
  onOpenChat,
  chatOpen,
  onOpenPresentation,
  onOpenPrint,
  onExportJson,
  shotCount,
  completedShotCount,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md">
      {/* Top Main Navbar */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand & Title */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/40">
            <Clapperboard className="h-5 w-5 text-neutral-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-display text-lg font-bold tracking-wider text-neutral-100">
                CINEBOARD <span className="text-amber-400">AI</span>
              </span>
              <span className="hidden rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300 sm:inline-block">
                gemini-3-pro-image-preview
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">Script-to-Storyboard Studio & Director Suite</p>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center rounded-xl bg-neutral-900 p-1 border border-neutral-800">
          <button
            onClick={() => setActiveTab('script')}
            className={`flex items-center space-x-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'script'
                ? 'bg-neutral-800 text-amber-400 shadow-sm border border-neutral-700/60'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileCode className="h-3.5 w-3.5" />
            <span>1. Screenplay</span>
          </button>
          <button
            onClick={() => setActiveTab('storyboard')}
            className={`flex items-center space-x-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'storyboard'
                ? 'bg-neutral-800 text-amber-400 shadow-sm border border-neutral-700/60'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>2. Storyboard Sequence</span>
            {shotCount > 0 && (
              <span className="ml-1 rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[10px] font-semibold text-amber-300">
                {completedShotCount}/{shotCount}
              </span>
            )}
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Slideshow Presentation */}
          <button
            onClick={onOpenPresentation}
            disabled={shotCount === 0}
            title="Launch Fullscreen Presentation Mode"
            className="hidden items-center space-x-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-200 transition-colors hover:border-neutral-700 hover:bg-neutral-800 disabled:opacity-40 sm:flex"
          >
            <Play className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            <span>Screening</span>
          </button>

          {/* Print/Export Storyboard */}
          <button
            onClick={onOpenPrint}
            disabled={shotCount === 0}
            title="Export or Print Storyboard Sheet"
            className="flex items-center space-x-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-200 transition-colors hover:border-neutral-700 hover:bg-neutral-800 disabled:opacity-40"
          >
            <Printer className="h-3.5 w-3.5 text-neutral-400" />
            <span className="hidden md:inline">Print Sheet</span>
          </button>

          {/* Export JSON */}
          <button
            onClick={onExportJson}
            disabled={shotCount === 0}
            title="Export Storyboard JSON Data"
            className="hidden items-center rounded-lg border border-neutral-800 bg-neutral-900 p-2 text-neutral-400 transition-colors hover:border-neutral-700 hover:text-neutral-200 disabled:opacity-40 lg:flex"
          >
            <Download className="h-3.5 w-3.5" />
          </button>

          {/* Director AI Chat Toggle */}
          <button
            onClick={onOpenChat}
            className={`relative flex items-center space-x-2 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all ${
              chatOpen
                ? 'bg-amber-500 text-neutral-950 font-semibold shadow-lg shadow-amber-500/25 ring-2 ring-amber-400/50'
                : 'border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Director AI</span>
            {!chatOpen && (
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Secondary Controls Bar: Image Generation Affordances (Resolution, Ratio, Style) */}
      <div className="border-t border-neutral-900 bg-neutral-950/70 px-4 py-2 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-xs">
          {/* Left: Resolution & Aspect Ratio Selectors */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Image Resolution Selector: 1K, 2K, 4K */}
            <div className="flex items-center space-x-2">
              <span className="flex items-center space-x-1 text-neutral-400 font-medium">
                <Maximize2 className="h-3.5 w-3.5 text-amber-400" />
                <span>Image Size:</span>
              </span>
              <div className="flex items-center rounded-lg bg-neutral-900 p-0.5 border border-neutral-800">
                {(['1K', '2K', '4K'] as ImageResolution[]).map((res) => (
                  <button
                    key={res}
                    onClick={() => onImageSizeChange(res)}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                      imageSize === res
                        ? 'bg-amber-500 text-neutral-950 shadow-sm'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                    title={
                      res === '1K'
                        ? '1K (1024x576) - High Quality Standard'
                        : res === '2K'
                        ? '2K (2048x1152) - Ultra Clear Presentation'
                        : '4K (3840x2160) - Master Cinema Resolution'
                    }
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div className="flex items-center space-x-2">
              <span className="flex items-center space-x-1 text-neutral-400 font-medium">
                <Ratio className="h-3.5 w-3.5 text-neutral-400" />
                <span>Ratio:</span>
              </span>
              <div className="flex items-center rounded-lg bg-neutral-900 p-0.5 border border-neutral-800">
                {[
                  { id: '16:9', label: '16:9 Cinema' },
                  { id: '4:3', label: '4:3 Academy' },
                  { id: '1:1', label: '1:1 Square' },
                  { id: '9:16', label: '9:16 Reel' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onAspectRatioChange(item.id as AspectRatio)}
                    className={`rounded-md px-2 py-1 text-[11px] font-medium transition-all ${
                      aspectRatio === item.id
                        ? 'bg-neutral-800 text-amber-400 border border-neutral-700/70 shadow-sm'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Style Presets */}
          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1 text-neutral-400 font-medium">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Aesthetic Style:</span>
            </span>
            <select
              value={selectedStyle}
              onChange={(e) => onStyleChange(e.target.value)}
              className="rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-xs text-neutral-200 focus:border-amber-500 focus:outline-none"
            >
              {STYLE_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
