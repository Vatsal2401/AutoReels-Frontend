export interface VoiceOption {
    value: string;
    label: string;
    meta: string;
    description?: string;
}

// These are now handled dynamically by the backend
// Use aiApi.getVoices() instead
