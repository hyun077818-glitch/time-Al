import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Clapperboard,
  Camera,
  FileText,
  Palette,
  Zap,
  RotateCcw,
  Check,
  Copy,
  ChevronDown,
  Cpu,
  Layers,
} from 'lucide-react';
import { ChatMessage, DirectorRoleId, GeminiChatModel, StoryboardShot } from '../types';
import { DIRECTOR_ROLES } from '../data/directorRoles';

interface DirectorChatProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (content: string, role: DirectorRoleId, model: GeminiChatModel) => Promise<void>;
  isSending: boolean;
  onClearHistory: () => void;
  onApplySuggestedShot?: (suggestedShot: Partial<StoryboardShot>) => void;
  activeShotsCount: number;
}

export const DirectorChat: React.FC<DirectorChatProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  isSending,
  onClearHistory,
  onApplySuggestedShot,
  activeShotsCount,
}) => {
  const [selectedRole, setSelectedRole] = useState<DirectorRoleId>('director');
  const [selectedModel, setSelectedModel] = useState<GeminiChatModel>('gemini-3.8-flash');
  const [inputMessage, setInputMessage] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeRoleData = DIRECTOR_ROLES.find((r) => r.id === selectedRole) || DIRECTOR_ROLES[0];

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isSending]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleRoleChange = (newRole: DirectorRoleId) => {
    setSelectedRole(newRole);
    const roleData = DIRECTOR_ROLES.find((r) => r.id === newRole);
    if (roleData) {
      setSelectedModel(roleData.recommendedModel);
    }
  };

  const handleSend = async () => {
    if (!inputMessage.trim() || isSending) return;
    const msg = inputMessage;
    setInputMessage('');
    await onSendMessage(msg, selectedRole, selectedModel);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getRoleIcon = (roleId: DirectorRoleId) => {
    switch (roleId) {
      case 'director':
        return <Clapperboard className="h-4 w-4" />;
      case 'cinematographer':
        return <Camera className="h-4 w-4" />;
      case 'script_doctor':
        return <FileText className="h-4 w-4" />;
      case 'concept_artist':
        return <Palette className="h-4 w-4" />;
      case 'speed_assistant':
        return <Zap className="h-4 w-4" />;
      default:
        return <Bot className="h-4 w-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-neutral-800 bg-neutral-950/95 shadow-2xl backdrop-blur-xl sm:w-[480px]">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3.5 bg-neutral-900/60">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            {getRoleIcon(selectedRole)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-display text-sm font-bold tracking-wider text-neutral-100">
                THE DIRECTOR'S ROOM
              </h3>
              <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-medium text-emerald-400">
                Live
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">Multi-Turn AI Storyboard & Cinematography Consultant</p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={onClearHistory}
            className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300 transition-colors"
            title="Reset Chat History"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Role & Model Selector Bar */}
      <div className="border-b border-neutral-800/80 bg-neutral-900/30 p-3 space-y-2">
        {/* Role Pills */}
        <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          {DIRECTOR_ROLES.map((role) => (
            <button
              key={role.id}
              onClick={() => handleRoleChange(role.id)}
              className={`flex items-center space-x-1.5 whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                selectedRole === role.id
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                  : 'bg-neutral-850 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 border border-neutral-800'
              }`}
            >
              <span>{role.label}</span>
            </button>
          ))}
        </div>

        {/* Model Selector & Role Description */}
        <div className="flex items-center justify-between text-[11px] text-neutral-400">
          <div className="flex items-center space-x-1.5">
            <Cpu className="h-3.5 w-3.5 text-amber-400" />
            <span>Engine:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as GeminiChatModel)}
              className="rounded border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-neutral-200 font-mono text-[10px] focus:outline-none focus:border-amber-500"
            >
              <option value="gemini-4-argon">gemini-4-argon (Deep Reasoning)</option>
              <option value="gemini-3.8-flash">gemini-3.8-flash (General Tasks)</option>
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast Tasks)</option>
            </select>
          </div>

          <div className="flex items-center space-x-1 text-neutral-500">
            <Layers className="h-3 w-3" />
            <span>{activeShotsCount} shots in context</span>
          </div>
        </div>

        {/* Role Subtext */}
        <p className="text-[11px] text-neutral-400 leading-snug italic">
          "{activeRoleData.description}"
        </p>
      </div>

      {/* Message Thread (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-display text-sm font-bold text-neutral-200">
                Consult with the {activeRoleData.title}
              </h4>
              <p className="mt-1 text-xs text-neutral-400 max-w-xs">
                Ask for advice on camera framing, shot progression, lighting moods, or dialogue polish.
              </p>
            </div>

            {/* Role-specific Preset Prompts */}
            <div className="w-full space-y-1.5 pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block text-left">
                Suggested Prompts
              </span>
              {activeRoleData.presetQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSendMessage(q, selectedRole, selectedModel)}
                  className="w-full text-left rounded-xl border border-neutral-800/80 bg-neutral-900/60 p-2.5 text-xs text-neutral-300 hover:border-amber-500/40 hover:bg-neutral-850 hover:text-amber-200 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isUser = message.role === 'user';
            return (
              <div
                key={message.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}
              >
                {/* Bubble Header */}
                <div className="flex items-center space-x-1.5 text-[10px] text-neutral-500 mb-1 px-1">
                  {isUser ? (
                    <>
                      <span>You (Screenwriter / DP)</span>
                      <User className="h-3 w-3 text-neutral-400" />
                    </>
                  ) : (
                    <>
                      <Bot className="h-3 w-3 text-amber-400" />
                      <span className="font-semibold text-amber-400">{activeRoleData.label}</span>
                      {message.modelUsed && (
                        <span className="rounded bg-neutral-900 px-1 py-0.2 font-mono text-[9px] text-neutral-400 border border-neutral-800">
                          {message.modelUsed}
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* Bubble Body */}
                <div
                  className={`relative max-w-[90%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-amber-500 text-neutral-950 font-medium rounded-tr-sm shadow-md'
                      : 'bg-neutral-900 text-neutral-200 border border-neutral-800 rounded-tl-sm shadow-md'
                  }`}
                >
                  <p className="whitespace-pre-wrap font-sans">{message.content}</p>

                  {/* Copy message button */}
                  <button
                    type="button"
                    onClick={() => handleCopyMessage(message.id, message.content)}
                    className="absolute -bottom-2.5 right-2 rounded-md bg-neutral-800/90 p-1 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity border border-neutral-700 hover:text-neutral-200"
                    title="Copy response"
                  >
                    {copiedId === message.id ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}

        {isSending && (
          <div className="flex items-start space-x-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="rounded-2xl rounded-tl-sm border border-neutral-800 bg-neutral-900 px-4 py-3">
              <div className="flex items-center space-x-1.5">
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-400" />
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-400 [animation-delay:0.2s]" />
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-400 [animation-delay:0.4s]" />
                <span className="text-[11px] text-neutral-400 ml-2 font-mono">
                  {activeRoleData.label} is reviewing ({selectedModel})...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Area */}
      <div className="border-t border-neutral-800 bg-neutral-900/60 p-3 space-y-2">
        {/* Preset Prompt Suggestion Pills */}
        <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
          {activeRoleData.presetQuestions.slice(0, 3).map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSendMessage(prompt, selectedRole, selectedModel)}
              className="whitespace-nowrap rounded-lg border border-neutral-800 bg-neutral-850 px-2.5 py-1 text-neutral-400 hover:border-amber-500/40 hover:text-amber-300 transition-colors"
            >
              {prompt.length > 32 ? prompt.slice(0, 32) + '...' : prompt}
            </button>
          ))}
        </div>

        <div className="flex items-end space-x-2">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask the ${activeRoleData.label}... (Shift+Enter for new line)`}
            rows={2}
            className="flex-1 resize-none rounded-xl border border-neutral-800 bg-neutral-950 p-2.5 text-xs text-neutral-200 placeholder-neutral-500 focus:border-amber-500 focus:outline-none"
          />
          <button
            type="button"
            disabled={!inputMessage.trim() || isSending}
            onClick={handleSend}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-neutral-950 font-bold transition-all hover:bg-amber-400 disabled:opacity-40"
            title="Send Message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
