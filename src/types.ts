export type ImageResolution = '1K' | '2K' | '4K';
export type AspectRatio = '16:9' | '4:3' | '1:1' | '9:16' | '4:1';

export type GeminiChatModel = 'gemini-4-argon' | 'gemini-3.8-flash' | 'gemini-3.1-flash-lite';
export type DirectorRoleId = 'director' | 'cinematographer' | 'script_doctor' | 'concept_artist' | 'speed_assistant';

export interface StoryboardShot {
  id: string;
  sceneNumber: number;
  shotNumber: number;
  shotType: string;
  cameraMovement: string;
  focalLength: string;
  visualPrompt: string;
  scriptAction: string;
  dialogue?: string;
  lightingMood: string;
  audioEffect?: string;
  estimatedDuration?: number;
  imageUrl?: string | null;
  status: 'pending' | 'generating' | 'completed' | 'error';
  errorMessage?: string;
  modelUsed?: string;
  imageSize?: ImageResolution;
  aspectRatio?: AspectRatio;
  versionHistory?: Array<{
    url: string;
    timestamp: number;
    prompt: string;
    imageSize?: ImageResolution;
  }>;
}

export interface StoryboardProject {
  title: string;
  genre: string;
  logline: string;
  rawScript: string;
  stylePreset: string;
  imageSize: ImageResolution;
  aspectRatio: AspectRatio;
  shots: StoryboardShot[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
  suggestedShotUpdate?: Partial<StoryboardShot>;
}

export interface DirectorRole {
  id: DirectorRoleId;
  label: string;
  title: string;
  description: string;
  avatarIcon: string;
  badgeColor: string;
  recommendedModel: GeminiChatModel;
  presetQuestions: string[];
}
