import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Sparkles,
  Clapperboard,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Film,
  Sliders,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { SAMPLE_SCRIPTS, SampleScript } from '../data/sampleScripts';
import { GeminiChatModel } from '../types';

interface ScriptEditorProps {
  script: string;
  onScriptChange: (newScript: string) => void;
  onBreakdown: (options: {
    shotCount: number;
    model: GeminiChatModel;
  }) => Promise<void>;
  isBreakingDown: boolean;
  breakdownProgressText: string;
  onSelectSample: (sample: SampleScript) => void;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({
  script,
  onScriptChange,
  onBreakdown,
  isBreakingDown,
  breakdownProgressText,
  onSelectSample,
}) => {
  const [shotCount, setShotCount] = useState<number>(6);
  const [breakdownModel, setBreakdownModel] = useState<GeminiChatModel>('gemini-3.8-flash');
  const [dragOver, setDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wordCount = script.trim() ? script.trim().split(/\s+/).length : 0;
  const lineCount = script.split('\n').length;

  const handleFileUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        onScriptChange(content);
        setErrorMsg(null);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read file. Please ensure it is a plain text or fountain script file.');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!script.trim()) {
      setErrorMsg('Please enter or upload a screenplay script first.');
      return;
    }
    setErrorMsg(null);
    try {
      await onBreakdown({ shotCount, model: breakdownModel });
    } catch (err: any) {
      setErrorMsg(err.message || 'Script breakdown failed. Please try again.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Hero Intro */}
      <div className="mb-8 text-center sm:text-left sm:flex sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center space-x-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI-Driven Screenplay Breakdown & Storyboard Framing</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-neutral-100 sm:text-4xl">
            Upload Script. Direct the Storyboard.
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-400">
            Paste your scene or upload a screenplay file (.fountain, .txt, .pdf text). Gemini extracts key dramatic
            beats, assigns camera angles and lighting schemes, and produces a complete sequence of high-definition storyboard frames.
          </p>
        </div>

        {/* Quick Sample Presets */}
        <div className="mt-4 sm:mt-0 flex flex-wrap gap-2 items-center">
          <span className="text-xs font-medium text-neutral-500 flex items-center space-x-1">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Try Sample:</span>
          </span>
          {SAMPLE_SCRIPTS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onSelectSample(sample)}
              className="rounded-lg border border-neutral-800 bg-neutral-900/90 px-3 py-1.5 text-xs font-medium text-neutral-300 transition-all hover:border-amber-500/40 hover:bg-neutral-850 hover:text-amber-300"
            >
              {sample.title}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 flex items-center space-x-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Script Editor + Breakdown Options */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Columns: Script Input & Drag Zone */}
        <div className="lg:col-span-2 space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`relative rounded-2xl border transition-all ${
              dragOver
                ? 'border-amber-500 bg-amber-500/5 ring-2 ring-amber-500/30'
                : 'border-neutral-800 bg-neutral-900/60'
            }`}
          >
            {/* Editor Toolbar */}
            <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-2.5">
              <div className="flex items-center space-x-3 text-xs text-neutral-400">
                <span className="flex items-center space-x-1.5 font-medium text-neutral-200">
                  <FileText className="h-4 w-4 text-amber-400" />
                  <span>Screenplay Draft</span>
                </span>
                <span>•</span>
                <span>{wordCount} words</span>
                <span>•</span>
                <span>{lineCount} lines</span>
              </div>

              <div className="flex items-center space-x-2">
                {/* File Upload Button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.fountain,.md,.rtf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-1 rounded-lg border border-neutral-700/80 bg-neutral-800 px-2.5 py-1 text-xs font-medium text-neutral-300 transition-colors hover:border-neutral-600 hover:text-neutral-100"
                >
                  <Upload className="h-3.5 w-3.5 text-neutral-400" />
                  <span>Upload File</span>
                </button>

                {script && (
                  <button
                    type="button"
                    onClick={() => onScriptChange('')}
                    className="flex items-center space-x-1 rounded-lg px-2 py-1 text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
                    title="Clear text"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>

            {/* Screenplay Monospace Textarea */}
            <div className="relative p-4">
              <textarea
                value={script}
                onChange={(e) => onScriptChange(e.target.value)}
                placeholder="EXT. ORBITAL STATION - NIGHT&#10;&#10;Paste or drag and drop your screenplay or dialogue scene here...&#10;&#10;Or click one of the sample screenplays in the top right to start immediately!"
                rows={16}
                className="w-full resize-y bg-transparent font-script text-sm leading-relaxed text-neutral-200 placeholder-neutral-600 focus:outline-none"
                style={{ tabSize: 4 }}
              />
            </div>

            {/* Drag & Drop Prompt Overlay if dragging */}
            {dragOver && (
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-neutral-950/90 text-amber-400">
                <Upload className="h-10 w-10 animate-bounce mb-2" />
                <p className="text-sm font-semibold">Drop your screenplay file here (.fountain, .txt, .md)</p>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Directorial Configuration & Action */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-5">
            <div className="flex items-center space-x-2 border-b border-neutral-800 pb-3">
              <Sliders className="h-4 w-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-neutral-200">Director Breakdown Parameters</h2>
            </div>

            {/* Target Shot Count */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-neutral-300 mb-2">
                <span>Sequence Shot Count</span>
                <span className="font-mono text-amber-400">{shotCount} Key Shots</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[3, 6, 8, 12].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setShotCount(count)}
                    className={`rounded-xl border py-2 text-xs font-semibold transition-all ${
                      shotCount === count
                        ? 'border-amber-500 bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40 shadow-sm'
                        : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                    }`}
                  >
                    {count} Shots
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[11px] text-neutral-500">
                {shotCount <= 4
                  ? 'Teaser / key beats'
                  : shotCount <= 8
                  ? 'Standard cinematic scene arc (recommended)'
                  : 'Extended detailed scene breakdown'}
              </p>
            </div>

            {/* Breakdown Analysis Model */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-2">
                Cinematic Analysis Model
              </label>
              <div className="space-y-2">
                {[
                  {
                    id: 'gemini-3.8-flash' as GeminiChatModel,
                    name: 'Gemini 3.8 Flash',
                    badge: 'General & Fast',
                    desc: 'Balanced cinematic shot selection and rapid response.',
                  },
                  {
                    id: 'gemini-4-argon' as GeminiChatModel,
                    name: 'Gemini 4 Argon',
                    badge: 'Deep Visual Reasoning',
                    desc: 'Advanced cinematography blocking, dramatic subtext, and rich visual prompts.',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setBreakdownModel(item.id)}
                    className={`w-full text-left rounded-xl border p-3 transition-all ${
                      breakdownModel === item.id
                        ? 'border-amber-500/70 bg-amber-500/10 ring-1 ring-amber-500/30'
                        : 'border-neutral-800 bg-neutral-900/80 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-200">{item.name}</span>
                      <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                        {item.badge}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-neutral-400 leading-normal">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Breakdown CTA Button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={isBreakingDown || !script.trim()}
                onClick={handleSubmit}
                className="relative group w-full overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 p-px font-semibold text-neutral-950 shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none"
              >
                <div className="flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-3.5 text-sm font-bold text-neutral-950 transition-all">
                  {isBreakingDown ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-950 border-t-transparent" />
                      <span>{breakdownProgressText || 'Directing Storyboard...'}</span>
                    </>
                  ) : (
                    <>
                      <Clapperboard className="h-4 w-4 fill-neutral-950" />
                      <span>Generate Storyboard Sequence</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Quick Info Feature Callouts */}
          <div className="rounded-2xl border border-neutral-800/80 bg-neutral-950/60 p-4 space-y-3">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Studio Capabilities
            </h3>
            <div className="space-y-2 text-xs text-neutral-400">
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>High-Resolution Generation:</strong> Powered by{' '}
                  <code className="text-amber-300 font-mono text-[11px]">gemini-3-pro-image-preview</code> in 1K, 2K, or 4K.
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>AI Director Room:</strong> Multi-turn consultation with DP, Director, and Script Doctor.
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Hollywood Presentation:</strong> Fullscreen live playback & exportable production sheets.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
