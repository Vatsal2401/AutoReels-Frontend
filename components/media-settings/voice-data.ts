export interface VoiceOption {
    value: string;
    name: string;
    accent: string;
    gender: "Male" | "Female" | "Neutral";
    style?: string;
    description?: string;
}

export const VOICES: VoiceOption[] = [
    {
        value: '21m00Tcm4TlvDq8ikWAM',
        name: 'Rachel',
        accent: 'US',
        gender: 'Female',
        style: 'Calm',
        description: 'American female voice with a calm, professional tone'
    },
    {
        value: 'AZunzKpBUPvirHg8GNEC',
        name: 'Dominic',
        accent: 'UK',
        gender: 'Male',
        style: 'Strong',
        description: 'British male voice with a strong, authoritative tone'
    },
    {
        value: 'EXAVITQu4vr4xnSDxMaL',
        name: 'Bella',
        accent: 'US',
        gender: 'Female',
        style: 'Soft',
        description: 'American female voice with a soft, gentle tone'
    },
    {
        value: 'ErXwobaYiN019PkySvjV',
        name: 'Antoni',
        accent: 'US',
        gender: 'Male',
        style: 'Well-rounded',
        description: 'American male voice with a versatile, well-rounded tone'
    },
];

export const formatVoiceLabel = (voice: VoiceOption): string => {
    return `${voice.name} – ${voice.accent} ${voice.gender}`;
};

export const formatVoiceMetadata = (voice: VoiceOption): string => {
    return voice.style ? `${voice.accent} ${voice.gender} • ${voice.style}` : `${voice.accent} ${voice.gender}`;
};
