export interface StylePreset {
  id: string;
  name: string;
  description: string;
  promptSuffix: string;
  badge: string;
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'cinematic-35mm',
    name: 'Cinematic 35mm Film',
    description: 'Panavision anamorphic lens, organic film grain, photorealistic cinema lighting and atmospheric depth.',
    promptSuffix: 'shot on 35mm Kodak Vision3 film, Panavision anamorphic prime lens, subtle film grain, natural skin tones, cinematic lighting, shallow depth of field, blockbuster movie still',
    badge: '35mm Film',
  },
  {
    id: 'cyberpunk-noir',
    name: 'Neo-Noir & Cyberpunk',
    description: 'Moody chiaroscuro shadows, rain-slicked neon reflections, cyan and magenta atmospheric fog.',
    promptSuffix: 'neo-noir cyberpunk aesthetic, high contrast chiaroscuro shadows, glowing neon reflections on wet asphalt, volumetric haze, cinematic Blade Runner mood, intense dynamic range',
    badge: 'Neo-Noir',
  },
  {
    id: 'concept-matte',
    name: 'Matte Painting Concept Art',
    description: 'Epic production concept art, painterly digital matte brushwork, grand scale and environmental depth.',
    promptSuffix: 'high-end movie concept art, digital matte painting, ArtStation trending keyframe, dramatic lighting, sweeping scale, evocative atmospheric perspective, cinematic illustration',
    badge: 'Concept Art',
  },
  {
    id: 'graphic-novel',
    name: 'Graphic Novel Storyboard',
    description: 'Bold expressive ink lines, dramatic comic framing, deep shadows and striking focal emphasis.',
    promptSuffix: 'graphic novel storyboard panel, bold ink linework, stylized comic shading, cinematic dynamic composition, gritty Frank Miller and Sean Murphy graphic art style',
    badge: 'Graphic Novel',
  },
  {
    id: 'anime-cinematic',
    name: 'Anime Keyframe',
    description: 'Makoto Shinkai inspired lush cinematic anime lighting, detailed skyboxes, vibrant color grading.',
    promptSuffix: 'cinematic anime production keyframe, Studio Ghibli and Makoto Shinkai aesthetic, gorgeous luminous lighting, hand-drawn anime aesthetic, rich emotional color palette',
    badge: 'Anime Keyframe',
  },
  {
    id: 'pencil-sketch',
    name: 'Charcoal Production Sketch',
    description: 'Authentic Hollywood production storyboard sketch, pencil shading, rapid dynamic gestures.',
    promptSuffix: 'authentic film studio storyboard sketch, graphite pencil and charcoal wash on paper, quick expressive lines, master director thumbnail illustration, chiaroscuro shading',
    badge: 'Production Sketch',
  },
];
