
export interface VisualStyle {
    id: string;
    label: string;
    thumbnail: string;
    prompt: string;
}

export interface StyleCategory {
    id: string;
    label: string;
    styles: VisualStyle[];
}

export const STYLE_CATEGORIES: StyleCategory[] = [
    {
        id: 'film_realism',
        label: 'Film & Realism',
        styles: [
            { id: 'cinematic', label: 'Cinematic', thumbnail: '/images/styles/cinematic.png', prompt: 'Cinematic film still, high dynamic range, detailed textures, 8k resolution' },
            { id: 'film_noir', label: 'Film Noir', thumbnail: '/images/styles/noir.png', prompt: 'Film noir style, high contrast black and white, dramatic shadows, moody atmosphere' },
            { id: 'gopro', label: 'GoPro Action', thumbnail: '/images/styles/gopro.png', prompt: 'Action camera POV, GoPro style, wide angle lens, fish-eye effect, high motion blur' },
            { id: 'documentary', label: 'Documentary', thumbnail: '/images/styles/documentary.png', prompt: 'Documentary photography style, natural lighting, raw, candid, realistic' },
            { id: 'vintage_35mm', label: 'Vintage 35mm', thumbnail: '/images/styles/vintage.png', prompt: 'Vintage 35mm film, grainy texture, muted colors, nostalgic, Kodak Portra 400 look' },
        ],
    },
    {
        id: 'illustration',
        label: 'Illustration',
        styles: [
            { id: 'watercolor', label: 'Watercolor', thumbnail: '/images/styles/watercolor.png', prompt: 'Watercolor painting, soft edges, fluid colors, artistic paper texture' },
            { id: 'charcoal', label: 'Charcoal Sketch', thumbnail: '/images/styles/charcoal.png', prompt: 'Charcoal drawing, rough textures, expressive strokes, black and white' },
            { id: 'vector_art', label: 'Vector Art', thumbnail: '/images/styles/vector.png', prompt: 'Flat vector illustration, clean lines, bold colors, minimalist, modern' },
            { id: 'oil_painting', label: 'Oil Painting', thumbnail: '/images/styles/oil.png', prompt: 'Classic oil painting, visible brushstrokes, rich colors, canvas texture' },
            { id: 'pop_art', label: 'Pop Art', thumbnail: '/images/styles/pop.png', prompt: 'Pop art style, Roy Lichtenstein inspired, halftone dots, bold outlines, vibrant' },
        ],
    },
    {
        id: 'animation',
        label: 'Animation',
        styles: [
            { id: 'anime', label: 'Anime', thumbnail: '/images/styles/anime.png', prompt: 'High quality anime style, Studio Ghibli inspired, detailed backgrounds, vibrant colors' },
            { id: 'pixar_style', label: '3D Render', thumbnail: '/images/styles/pixar.png', prompt: '3D animation style, Pixar inspired, soft lighting, cute character proportions, Octane render' },
            { id: 'claymation', label: 'Claymation', thumbnail: '/images/styles/clay.png', prompt: 'Claymation style, stop motion texture, handmade feel, plasticine details' },
            { id: 'pixel_art', label: 'Pixel Art', thumbnail: '/images/styles/pixel.png', prompt: 'Retro pixel art, 16-bit aesthetic, limited color palette, nostalgic gaming look' },
        ],
    },
    {
        id: 'futuristic',
        label: 'Futuristic',
        styles: [
            { id: 'cyberpunk', label: 'Cyberpunk', thumbnail: '/images/styles/cyberpunk.png', prompt: 'Cyberpunk aesthetic, neon lights, rainy night, futuristic city, glowing accents' },
            { id: 'synthwave', label: 'Synthwave', thumbnail: '/images/styles/synth.png', prompt: 'Synthwave style, 80s retro-futurism, purple and pink palette, grid sun, retro' },
            { id: 'sci_fi', label: 'Sci-Fi Studio', thumbnail: '/images/styles/scifi.png', prompt: 'Clean sci-fi aesthetic, high-tech lab, white and blue lighting, futuristic surfaces' },
            { id: 'glitch', label: 'Glitch Art', thumbnail: '/images/styles/glitch.png', prompt: 'Digital glitch art, distorted pixels, chromatic aberration, technological error aesthetic' },
        ],
    },
    {
        id: 'social',
        label: 'Social Media',
        styles: [
            { id: 'vlog', label: 'Vlog Style', thumbnail: '/images/styles/vlog.png', prompt: 'Selfie vlog style, handheld camera movement, lifestyle aesthetic, bright and clear' },
            { id: 'minimalist', label: 'Minimalist', thumbnail: '/images/styles/minimal.png', prompt: 'Minimalist aesthetic, clean composition, lots of negative space, neutral tones' },
            { id: 'vibrant', label: 'Bold & Vibrant', thumbnail: '/images/styles/vibrant.png', prompt: 'High energy, bold colors, dynamic composition, eye-catching social media look' },
        ],
    },
];

export const ADVANCED_PROMPTS = {
    lighting: {
        natural: 'natural lighting, sunlight',
        studio: 'professional studio lighting, softbox',
        dramatic: 'dramatic lighting, high contrast, rim light',
        neon: 'vibrant neon lighting, colorful glow',
        soft: 'soft diffused lighting, hazy',
        none: '',
    },
    colorTone: {
        warm: 'warm color temperature, golden hues',
        neutral: 'neutral color balance, natural colors',
        cool: 'cool color temperature, blue tones',
        bw: 'monochrome, black and white',
        sepia: 'vintage sepia tone',
        none: '',
    },
    cameraFraming: {
        wide: 'wide angle shot, establishing shot, panoramic',
        medium: 'medium shot, waist-up, standard framing',
        'close-up': 'close-up shot, detailed focus, shallow depth of field',
        'birds-eye': 'birds-eye view, top-down perspective, aerial shot',
        macro: 'macro photography, extreme detail, microscopic focus',
        none: '',
    },
};

export function getFullPrompt(styleId: string, advanced: any): string {
    const style = STYLE_CATEGORIES.flatMap(c => c.styles).find(s => s.id === styleId);
    const basePrompt = style?.prompt || '';

    const lighting = ADVANCED_PROMPTS.lighting[advanced.lighting as keyof typeof ADVANCED_PROMPTS.lighting] || '';
    const color = ADVANCED_PROMPTS.colorTone[advanced.colorTone as keyof typeof ADVANCED_PROMPTS.colorTone] || '';
    const camera = ADVANCED_PROMPTS.cameraFraming[advanced.cameraFraming as keyof typeof ADVANCED_PROMPTS.cameraFraming] || '';

    return [basePrompt, lighting, color, camera].filter(p => p !== '').join(', ');
}
