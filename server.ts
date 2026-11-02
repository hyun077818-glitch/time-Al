import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser with 50mb limit for script uploads & base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Shared server-side GoogleGenAI client with telemetry header as required by SDK skill
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

/**
 * Endpoint: POST /api/gemini/breakdown-script
 * Analyzes uploaded screenplay/script and breaks it into cinematic storyboard shots.
 */
app.post('/api/gemini/breakdown-script', async (req, res) => {
  try {
    const { script, shotCount = 6, stylePreference = 'cinematic', model = 'gemini-3.8-flash' } = req.body;

    if (!script || typeof script !== 'string' || script.trim().length === 0) {
      return res.status(400).json({ error: 'Script text is required.' });
    }

    const ai = getAiClient();

    // Use selected model, default gemini-3.8-flash (or gemini-4-argon for deep script analysis)
    const activeModel = model || 'gemini-3.8-flash';

    const systemInstruction = `You are a master Hollywood Cinematographer and Director of Photography (DP) collaborating with an award-winning Film Director.
Your mission is to read a screenplay/script, extract narrative beats and visual tension, and break it down into an exact sequence of compelling, professional storyboard shots (target around ${shotCount} key shots, spanning the key narrative arc).

For each shot, provide:
1. sceneNumber: integer
2. shotNumber: integer (1-indexed sequential)
3. shotType: standard cinematographic framing (e.g., "EXTREME WIDE ESTABLISHING", "WIDE SHOT", "MEDIUM SHOT", "OVER THE SHOULDER", "CLOSE-UP", "EXTREME CLOSE-UP / MACRO", "DUTCH ANGLE", "LOW ANGLE HERO", "HIGH ANGLE / BIRD'S EYE")
4. cameraMovement: camera motion (e.g., "Static Locked-off", "Slow Dolly Push-in", "Lateral Dolly Track", "Handheld Organic Sway", "Crane Boom Down", "Whip Pan")
5. focalLength: lens choice (e.g., "24mm Anamorphic Ultra-Wide", "35mm Cine Prime", "50mm Standard Prime", "85mm Telephoto Portrait", "100mm Macro")
6. visualPrompt: A vivid, highly detailed, evocative prompt tailored for high-end AI image generation. Describe character appearance/expression, physical blocking, spatial depth, background details, volumetric lighting, color palette, atmosphere, texture, and 35mm film or artistic style (${stylePreference}). Do not include technical camera meta-tags in the prompt itself, focus on the visual scene composition and mood.
7. scriptAction: The specific action or narrative beat happening in this shot.
8. dialogue: Relevant spoken dialogue or voiceover (if any, or empty string).
9. lightingMood: Lighting aesthetic (e.g., "Chiaroscuro high-contrast shadows with neon amber rim light", "Warm morning golden hour haze through Venetian blinds", "Cool industrial fluorescent top-light").
10. audioEffect: Sound design or Foley cue (e.g., "Distant sirens, heavy rain patter on glass", "Heartbeat hum, muffled clock tick").
11. estimatedDuration: estimated screen time in seconds (e.g., 3.5).`;

    const userPrompt = `Here is the script to break down into ${shotCount} storyboard shots:

---
${script.slice(0, 15000)}
---

Generate an array of storyboard shots formatted strictly according to the schema.`;

    const response = await ai.models.generateContent({
      model: activeModel,
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Title or working name for this storyboard sequence' },
            genre: { type: Type.STRING, description: 'Genre detected (e.g., Cyberpunk Sci-Fi, Film Noir, Period Drama)' },
            logline: { type: Type.STRING, description: 'One-sentence cinematic logline of the scene' },
            shots: {
              type: Type.ARRAY,
              description: 'Sequential storyboard shots',
              items: {
                type: Type.OBJECT,
                properties: {
                  sceneNumber: { type: Type.INTEGER },
                  shotNumber: { type: Type.INTEGER },
                  shotType: { type: Type.STRING },
                  cameraMovement: { type: Type.STRING },
                  focalLength: { type: Type.STRING },
                  visualPrompt: { type: Type.STRING },
                  scriptAction: { type: Type.STRING },
                  dialogue: { type: Type.STRING },
                  lightingMood: { type: Type.STRING },
                  audioEffect: { type: Type.STRING },
                  estimatedDuration: { type: Type.NUMBER },
                },
                required: [
                  'sceneNumber',
                  'shotNumber',
                  'shotType',
                  'cameraMovement',
                  'focalLength',
                  'visualPrompt',
                  'scriptAction',
                  'lightingMood',
                ],
              },
            },
          },
          required: ['title', 'genre', 'logline', 'shots'],
        },
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);

    // Ensure all shots have a unique client-side id
    if (Array.isArray(parsed.shots)) {
      parsed.shots = parsed.shots.map((shot: any, index: number) => ({
        ...shot,
        id: `shot-${Date.now()}-${index + 1}`,
        status: 'pending', // pending | generating | completed | error
        imageUrl: null,
      }));
    }

    return res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error('Error in /api/gemini/breakdown-script:', err);
    return res.status(500).json({
      error: err.message || 'Failed to breakdown script into storyboard shots.',
    });
  }
});

/**
 * Endpoint: POST /api/gemini/generate-storyboard-image
 * Generates high-quality storyboard images using gemini-3-pro-image-preview with 1K, 2K, 4K size support.
 */
app.post('/api/gemini/generate-storyboard-image', async (req, res) => {
  try {
    const {
      prompt,
      imageSize = '1K', // "1K", "2K", "4K"
      aspectRatio = '16:9', // "16:9", "4:3", "1:1", "9:16", "21:9"
      stylePreset = 'Cinematic Film Still',
      referenceImage = null, // base64 string if continuity editing
    } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required for image generation.' });
    }

    const ai = getAiClient();

    // Map aspect ratios if custom
    const validAspectRatios = ['1:1', '3:4', '4:3', '9:16', '16:9', '1:4', '1:8', '4:1', '8:1'];
    let chosenAspectRatio = aspectRatio;
    if (!validAspectRatios.includes(chosenAspectRatio)) {
      chosenAspectRatio = '16:9';
    }

    const validImageSizes = ['1K', '2K', '4K'];
    let chosenSize = validImageSizes.includes(imageSize) ? imageSize : '1K';

    // Enhance prompt with style preset cues for cohesive storyboard aesthetics
    const styledPrompt = `${prompt}. Style: ${stylePreset}, professional cinematic film lighting, high fidelity visual storytelling, storyboard production still, masterpiece composition.`;

    // Attempt primary model: gemini-3-pro-image-preview as required
    const candidateModels = [
      'gemini-3-pro-image-preview',
      'gemini-3-pro-image',
      'gemini-nano-banana-2.1',
      'gemini-3.1-flash-lite-image',
    ];

    let lastError: any = null;
    let imageUrl: string | null = null;
    let modelUsed = '';

    for (const modelCandidate of candidateModels) {
      try {
        const contentsParts: any[] = [];
        if (referenceImage && typeof referenceImage === 'string') {
          // Clean base64 header if present
          const match = referenceImage.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
          const mimeType = match ? match[1] : 'image/png';
          const base64Data = match ? match[2] : referenceImage;
          contentsParts.push({
            inlineData: {
              data: base64Data,
              mimeType,
            },
          });
        }
        contentsParts.push({ text: styledPrompt });

        const isNanoOrPro = modelCandidate.includes('nano') || modelCandidate.includes('pro');
        const config: any = {};

        // imageConfig applies to models supporting it
        if (isNanoOrPro) {
          config.imageConfig = {
            aspectRatio: chosenAspectRatio,
            imageSize: chosenSize,
          };
        } else {
          config.imageConfig = {
            aspectRatio: ['1:1', '3:4', '4:3', '9:16', '16:9'].includes(chosenAspectRatio)
              ? chosenAspectRatio
              : '16:9',
          };
        }

        const response = await ai.models.generateContent({
          model: modelCandidate,
          contents: { parts: contentsParts },
          config,
        });

        // Search for image inline data
        const parts = response.candidates?.[0]?.content?.parts ?? [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            const mime = part.inlineData.mimeType || 'image/png';
            imageUrl = `data:${mime};base64,${part.inlineData.data}`;
            modelUsed = modelCandidate;
            break;
          }
        }

        if (imageUrl) {
          break; // successfully generated
        }
      } catch (err: any) {
        console.warn(`Model ${modelCandidate} failed:`, err.message);
        lastError = err;
        // Continue to fallback candidate
      }
    }

    if (!imageUrl) {
      throw lastError || new Error('No image was returned by the generative model.');
    }

    return res.json({
      success: true,
      imageUrl,
      modelUsed,
      imageSize: chosenSize,
      aspectRatio: chosenAspectRatio,
    });
  } catch (err: any) {
    console.error('Error in /api/gemini/generate-storyboard-image:', err);
    return res.status(500).json({
      error: err.message || 'Failed to generate storyboard image.',
    });
  }
});

/**
 * Endpoint: POST /api/gemini/chat
 * Multi-turn Gemini chatbot with role system instructions and model routing.
 * Models: gemini-4-argon (complex tasks), gemini-3.8-flash (general tasks), gemini-3.1-flash-lite (fast tasks).
 */
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const {
      messages = [],
      role = 'director', // 'director' | 'script_doctor' | 'cinematographer' | 'concept_artist' | 'speed_assistant'
      model = 'gemini-3.8-flash',
      scriptContext = '',
      storyboardContext = [],
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const ai = getAiClient();

    // Map role to custom system instructions
    const roleInstructions: Record<string, string> = {
      director: `You are an elite, visionary Feature Film Director (like Denis Villeneuve, Christopher Nolan, or David Fincher).
You advise on scene pacing, dramatic weight, blocking, visual metaphor, tension building, and narrative emotional payoffs.
Keep advice concrete, cinematic, and actionable for storyboarding. You can recommend specific camera setups, lens choices, or shot re-ordering.`,

      cinematographer: `You are an Oscar-winning Director of Photography / Cinematographer (DP).
You specialize in camera optics, lens focal lengths (anamorphic vs spherical), camera movement (dolly, techno-crane, handheld, Steadicam), lighting design (chiaroscuro, Rembrandt, high-key, volumetric haze), and color science.
Provide technical yet evocative advice to elevate the visual framing and aesthetic punch of each storyboard shot.`,

      script_doctor: `You are a renowned Hollywood Script Doctor and Story Editor.
You evaluate script rhythm, punch up dialogue, eliminate exposition bloat, sharpen character subtext, and suggest narrative beats that translate powerfully into striking visual moments.`,

      concept_artist: `You are a Lead Production Concept Artist & Storyboard Illustrator.
You specialize in visual prompt engineering, color theory, keyframe silhouette clarity, environmental scale, mood boarding, and visual continuity across consecutive storyboard frames.`,

      speed_assistant: `You are a snappy, high-efficiency Assistant Director.
Give immediate, bullet-pointed, concise ideas, rapid shot revisions, and instant camera framing suggestions with maximum brevity.`,
    };

    let baseInstruction = roleInstructions[role] || roleInstructions.director;

    if (scriptContext) {
      baseInstruction += `\n\nCURRENT SCRIPT REFERENCE:\n"""\n${scriptContext.slice(0, 4000)}\n"""`;
    }

    if (Array.isArray(storyboardContext) && storyboardContext.length > 0) {
      const shotsSummary = storyboardContext
        .slice(0, 10)
        .map(
          (s: any, idx: number) =>
            `Shot #${idx + 1} (${s.shotType || 'Standard'}): ${s.scriptAction || s.visualPrompt || ''}`
        )
        .join('\n');
      baseInstruction += `\n\nCURRENT STORYBOARD SHOTS:\n${shotsSummary}`;
    }

    baseInstruction += `\n\nGuidelines:
- Maintain conversation history thoughtfully.
- When asked to improve or create a shot, you may provide a clear [SUGGESTED_SHOT] block with parameters (shotType, cameraMovement, focalLength, visualPrompt, lightingMood) so the user can easily incorporate it.
- Be encouraging, highly creative, and steeped in film craft vernacular.`;

    // Format messages for @google/genai
    const formattedContents = messages.map((m: any) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content || '' }],
    }));

    // Select target model
    let targetModel = model;
    if (!['gemini-4-argon', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'].includes(targetModel)) {
      targetModel = 'gemini-3.8-flash';
    }

    const response = await ai.models.generateContent({
      model: targetModel,
      contents: formattedContents,
      config: {
        systemInstruction: baseInstruction,
      },
    });

    const replyText = response.text || "I'm reviewing the scene. Could you specify which shot you'd like to refine?";

    return res.json({
      success: true,
      message: {
        role: 'model',
        content: replyText,
        modelUsed: targetModel,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error('Error in /api/gemini/chat:', err);
    return res.status(500).json({
      error: err.message || 'Chatbot encountered an error.',
    });
  }
});

/**
 * Endpoint: POST /api/gemini/refine-prompt
 * Quickly sharpens or rewrites a shot's visual prompt using gemini-3.1-flash-lite for ultra-fast latency.
 */
app.post('/api/gemini/refine-prompt', async (req, res) => {
  try {
    const { currentPrompt, refinementIdea, stylePreset = 'Cinematic Film Still' } = req.body;
    if (!currentPrompt) {
      return res.status(400).json({ error: 'currentPrompt is required.' });
    }

    const ai = getAiClient();
    const prompt = `Rewrite and enhance this storyboard shot prompt based on the director's request.
Current Prompt: "${currentPrompt}"
Director's Direction: "${refinementIdea || 'Make it more dramatic, dynamic, and cinematic'}"
Visual Style: "${stylePreset}"

Return ONLY the new enhanced prompt text. Keep it descriptive, focused on visual elements, framing, lighting, and composition. No explanations.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
    });

    return res.json({
      success: true,
      refinedPrompt: (response.text || currentPrompt).trim().replace(/^"|"$/g, ''),
    });
  } catch (err: any) {
    console.error('Error in /api/gemini/refine-prompt:', err);
    return res.status(500).json({ error: err.message || 'Refinement failed.' });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎬 CineBoard AI Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
