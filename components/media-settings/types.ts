export type AspectRatio = '9:16' | '1:1' | '16:9';
export type Duration = 'Short' | 'Medium' | 'Long';

export interface AdvancedOptions {
    styleStrength: 'low' | 'medium' | 'high';
    lighting: 'natural' | 'studio' | 'dramatic' | 'neon' | 'soft' | 'none';
    colorTone: 'warm' | 'neutral' | 'cool' | 'bw' | 'sepia' | 'none';
    cameraFraming: 'wide' | 'medium' | 'close-up' | 'birds-eye' | 'macro' | 'none';
}

export interface MediaSettings {
    visualStyleId: string;
    aspectRatio: AspectRatio;
    voiceId: string;
    voiceLabel?: string;
    language: string;
    duration: Duration;
    imageProvider: 'gemini' | 'replicate' | 'dalle' | 'mock';
    advancedOptions: AdvancedOptions;
}

export interface MediaSettingsProps {
    settings: MediaSettings;
    onUpdate: (updates: Partial<MediaSettings>) => void;
}
