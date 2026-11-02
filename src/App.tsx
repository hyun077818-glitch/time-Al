import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ScriptEditor } from './components/ScriptEditor';
import { StoryboardView } from './components/StoryboardView';
import { DirectorChat } from './components/DirectorChat';
import { PresentationModal } from './components/PresentationModal';
import { ShotInspectorModal } from './components/ShotInspectorModal';
import { PrintStoryboardModal } from './components/PrintStoryboardModal';
import { SAMPLE_SCRIPTS, SampleScript } from './data/sampleScripts';
import { STYLE_PRESETS } from './data/stylePresets';
import {
  StoryboardProject,
  StoryboardShot,
  ImageResolution,
  AspectRatio,
  ChatMessage,
  DirectorRoleId,
  GeminiChatModel,
} from './types';

export default function App() {
  // Pre-load default sample script so user has rich immediate screenplay content
  const defaultSample = SAMPLE_SCRIPTS[0];

  const [project, setProject] = useState<StoryboardProject>({
    title: defaultSample.title,
    genre: defaultSample.genre,
    logline: defaultSample.logline,
    rawScript: defaultSample.text,
    stylePreset: STYLE_PRESETS[0].id,
    imageSize: '1K', // Default 1K, user can choose 1K, 2K, 4K
    aspectRatio: '16:9',
    shots: [],
  });

  const [activeTab, setActiveTab] = useState<'script' | 'storyboard'>('script');
  const [chatOpen, setChatOpen] = useState(false);
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const [breakdownProgressText, setBreakdownProgressText] = useState('');
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [inspectingShot, setInspectingShot] = useState<StoryboardShot | null>(null);
  const [presentationOpen, setPresentationOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Chatbot conversation history
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isSendingChat, setIsSendingChat] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const handleScriptChange = (newScript: string) => {
    setProject((prev) => ({ ...prev, rawScript: newScript }));
  };

  const handleSelectSample = (sample: SampleScript) => {
    setProject((prev) => ({
      ...prev,
      title: sample.title,
      genre: sample.genre,
      logline: sample.logline,
      rawScript: sample.text,
      shots: [], // reset shots for new script
    }));
    showToast(`Loaded sample screenplay "${sample.title}"`);
  };

  // 1. Script Breakdown using Gemini
  const handleBreakdown = async (options: {
    shotCount: number;
    model: GeminiChatModel;
  }) => {
    setIsBreakingDown(true);
    setBreakdownProgressText('Reading screenplay & identifying narrative beats...');

    try {
      const selectedStyleObj = STYLE_PRESETS.find((s) => s.id === project.stylePreset);
      const stylePreference = selectedStyleObj ? selectedStyleObj.name : 'cinematic film';

      const response = await fetch('/api/gemini/breakdown-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: project.rawScript,
          shotCount: options.shotCount,
          stylePreference,
          model: options.model,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to breakdown script.');
      }

      const { title, genre, logline, shots } = result.data;

      // Update project with parsed shots
      setProject((prev) => ({
        ...prev,
        title: title || prev.title,
        genre: genre || prev.genre,
        logline: logline || prev.logline,
        shots: shots || [],
      }));

      // Switch to storyboard view automatically
      setActiveTab('storyboard');
      showToast(`🎬 Generated ${shots.length} storyboard shots! Ready to render frames.`);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error breaking down script.');
      throw err;
    } finally {
      setIsBreakingDown(false);
      setBreakdownProgressText('');
    }
  };

  // 2. Generate Single Shot Image with gemini-3-pro-image-preview
  const handleGenerateImage = async (shotId: string, customSize?: ImageResolution) => {
    const shot = project.shots.find((s) => s.id === shotId);
    if (!shot) return;

    const targetSize = customSize || shot.imageSize || project.imageSize;
    const targetRatio = shot.aspectRatio || project.aspectRatio;
    const selectedStyleObj = STYLE_PRESETS.find((s) => s.id === project.stylePreset);
    const styleSuffix = selectedStyleObj ? selectedStyleObj.promptSuffix : 'cinematic 35mm film';

    // Set shot to generating state
    setProject((prev) => ({
      ...prev,
      shots: prev.shots.map((s) =>
        s.id === shotId ? { ...s, status: 'generating', errorMessage: undefined } : s
      ),
    }));

    try {
      const response = await fetch('/api/gemini/generate-storyboard-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: shot.visualPrompt,
          imageSize: targetSize, // "1K", "2K", "4K"
          aspectRatio: targetRatio,
          stylePreset: styleSuffix,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Image generation failed');
      }

      // Update shot with generated image URL and metadata
      setProject((prev) => ({
        ...prev,
        shots: prev.shots.map((s) => {
          if (s.id !== shotId) return s;
          const newHistory = s.versionHistory ? [...s.versionHistory] : [];
          newHistory.push({
            url: result.imageUrl,
            timestamp: Date.now(),
            prompt: s.visualPrompt,
            imageSize: targetSize,
          });
          return {
            ...s,
            status: 'completed',
            imageUrl: result.imageUrl,
            modelUsed: result.modelUsed || 'gemini-3-pro-image-preview',
            imageSize: targetSize,
            aspectRatio: targetRatio,
            versionHistory: newHistory,
          };
        }),
      }));

      // Update currently inspecting shot if open
      if (inspectingShot && inspectingShot.id === shotId) {
        setInspectingShot((prev) =>
          prev
            ? {
                ...prev,
                status: 'completed',
                imageUrl: result.imageUrl,
                modelUsed: result.modelUsed,
                imageSize: targetSize,
              }
            : null
        );
      }

      showToast(`✨ Shot #${shot.shotNumber} rendered in ${targetSize}!`);
    } catch (err: any) {
      console.error(err);
      setProject((prev) => ({
        ...prev,
        shots: prev.shots.map((s) =>
          s.id === shotId
            ? { ...s, status: 'error', errorMessage: err.message || 'Generation failed' }
            : s
        ),
      }));
      showToast(`Error rendering Shot #${shot.shotNumber}: ${err.message}`);
    }
  };

  // 3. Batch Generate All Images
  const handleGenerateAllImages = async () => {
    setIsGeneratingAll(true);
    const pendingShots = project.shots.filter(
      (s) => s.status === 'pending' || s.status === 'error' || !s.imageUrl
    );

    showToast(`Starting sequence generation for ${pendingShots.length} shots...`);

    for (const shot of pendingShots) {
      try {
        await handleGenerateImage(shot.id);
      } catch (err) {
        console.warn('Batch generation shot failed, continuing next:', err);
      }
    }

    setIsGeneratingAll(false);
    showToast('Sequence render batch completed!');
  };

  // 4. Multi-Turn Gemini Chatbot
  const handleSendMessage = async (
    content: string,
    role: DirectorRoleId,
    model: GeminiChatModel
  ) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    setIsSendingChat(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          role,
          model,
          scriptContext: project.rawScript,
          storyboardContext: project.shots,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Chatbot request failed');
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: result.message.content,
        timestamp: result.message.timestamp,
        modelUsed: result.message.modelUsed,
      };

      setChatMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: `Error: ${err.message || 'Unable to connect to Gemini consultant.'}`,
        timestamp: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsSendingChat(false);
    }
  };

  // 5. Refine Shot Prompt with Gemini Flash-Lite
  const handleRefinePrompt = async (shotId: string, instruction?: string) => {
    const shot = project.shots.find((s) => s.id === shotId);
    if (!shot) return;

    try {
      const selectedStyleObj = STYLE_PRESETS.find((s) => s.id === project.stylePreset);
      const response = await fetch('/api/gemini/refine-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPrompt: shot.visualPrompt,
          refinementIdea: instruction,
          stylePreset: selectedStyleObj?.name || 'Cinematic Film',
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Refinement failed');
      }

      setProject((prev) => ({
        ...prev,
        shots: prev.shots.map((s) =>
          s.id === shotId ? { ...s, visualPrompt: result.refinedPrompt } : s
        ),
      }));

      if (inspectingShot && inspectingShot.id === shotId) {
        setInspectingShot((prev) =>
          prev ? { ...prev, visualPrompt: result.refinedPrompt } : null
        );
      }

      showToast(`Prompt for Shot #${shot.shotNumber} refined with Flash-Lite!`);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Could not refine prompt');
    }
  };

  // Shot CRUD Operations
  const handleUpdateShot = (shotId: string, updates: Partial<StoryboardShot>) => {
    setProject((prev) => ({
      ...prev,
      shots: prev.shots.map((s) => (s.id === shotId ? { ...s, ...updates } : s)),
    }));
    if (inspectingShot && inspectingShot.id === shotId) {
      setInspectingShot((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const handleDeleteShot = (shotId: string) => {
    setProject((prev) => {
      const remaining = prev.shots.filter((s) => s.id !== shotId);
      // Re-index shot numbers
      return {
        ...prev,
        shots: remaining.map((s, idx) => ({ ...s, shotNumber: idx + 1 })),
      };
    });
    showToast('Shot removed from sequence.');
  };

  const handleMoveShot = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= project.shots.length) return;

    setProject((prev) => {
      const updated = [...prev.shots];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return {
        ...prev,
        shots: updated.map((s, idx) => ({ ...s, shotNumber: idx + 1 })),
      };
    });
  };

  const handleAddShot = () => {
    const newNumber = project.shots.length + 1;
    const newShot: StoryboardShot = {
      id: `shot-custom-${Date.now()}`,
      sceneNumber: 1,
      shotNumber: newNumber,
      shotType: 'MEDIUM SHOT',
      cameraMovement: 'Static',
      focalLength: '50mm Prime',
      visualPrompt: 'Cinematic composition, medium framing of the protagonist, dramatic lighting',
      scriptAction: 'A new narrative beat in the scene.',
      dialogue: '',
      lightingMood: 'Cinematic rim lighting with soft ambient shadows',
      audioEffect: 'Subtle atmospheric room tone',
      estimatedDuration: 3.5,
      status: 'pending',
      imageUrl: null,
    };

    setProject((prev) => ({
      ...prev,
      shots: [...prev.shots, newShot],
    }));
    showToast(`Added Shot #${newNumber}`);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${project.title.toLowerCase().replace(/\s+/g, '_')}_storyboard.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Storyboard JSON exported!');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col film-grain">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center space-x-2 rounded-xl bg-neutral-900/95 px-4 py-2.5 text-xs font-medium text-amber-300 shadow-2xl border border-amber-500/40 backdrop-blur-md animate-fade-in">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Header */}
      <Header
        imageSize={project.imageSize}
        onImageSizeChange={(size) => setProject((prev) => ({ ...prev, imageSize: size }))}
        aspectRatio={project.aspectRatio}
        onAspectRatioChange={(ratio) => setProject((prev) => ({ ...prev, aspectRatio: ratio }))}
        selectedStyle={project.stylePreset}
        onStyleChange={(styleId) => setProject((prev) => ({ ...prev, stylePreset: styleId }))}
        onOpenChat={() => setChatOpen(true)}
        chatOpen={chatOpen}
        onOpenPresentation={() => setPresentationOpen(true)}
        onOpenPrint={() => setPrintOpen(true)}
        onExportJson={handleExportJson}
        shotCount={project.shots.length}
        completedShotCount={project.shots.filter((s) => s.status === 'completed' && s.imageUrl).length}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 pb-16">
        {activeTab === 'script' ? (
          <ScriptEditor
            script={project.rawScript}
            onScriptChange={handleScriptChange}
            onBreakdown={handleBreakdown}
            isBreakingDown={isBreakingDown}
            breakdownProgressText={breakdownProgressText}
            onSelectSample={handleSelectSample}
          />
        ) : (
          <StoryboardView
            project={project}
            onGenerateImage={handleGenerateImage}
            onGenerateAllImages={handleGenerateAllImages}
            isGeneratingAll={isGeneratingAll}
            onInspectShot={(shot) => setInspectingShot(shot)}
            onUpdateShot={handleUpdateShot}
            onDeleteShot={handleDeleteShot}
            onMoveShot={handleMoveShot}
            onAddShot={handleAddShot}
            onRefinePrompt={handleRefinePrompt}
            onOpenPresentation={() => setPresentationOpen(true)}
            onNavigateToScript={() => setActiveTab('script')}
          />
        )}
      </main>

      {/* Director Multi-Turn Chatbot Drawer */}
      <DirectorChat
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        isSending={isSendingChat}
        onClearHistory={() => setChatMessages([])}
        activeShotsCount={project.shots.length}
      />

      {/* Fullscreen Screening / Presentation Modal */}
      <PresentationModal
        isOpen={presentationOpen}
        onClose={() => setPresentationOpen(false)}
        shots={project.shots}
        projectTitle={project.title}
      />

      {/* Deep Shot Inspection & Prompt Lab Modal */}
      <ShotInspectorModal
        shot={inspectingShot}
        isOpen={!!inspectingShot}
        onClose={() => setInspectingShot(null)}
        onGenerateImage={handleGenerateImage}
        onUpdateShot={handleUpdateShot}
        onRefinePrompt={handleRefinePrompt}
      />

      {/* Printable Hollywood Storyboard Sheet Modal */}
      <PrintStoryboardModal
        isOpen={printOpen}
        onClose={() => setPrintOpen(false)}
        project={project}
      />
    </div>
  );
}
