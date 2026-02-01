import apiClient from "./client";

export interface VoiceOption {
    value: string;
    label: string;
    meta: string;
    description?: string;
}

export const aiApi = {
    getVoices: async (): Promise<VoiceOption[]> => {
        const response = await apiClient.get("/voices");
        return response.data;
    },

    getTTSPreview: async (voiceId: string, language: string): Promise<Blob> => {
        const response = await apiClient.post(
            "/tts/preview",
            { voiceId, language },
            { responseType: "blob" }
        );
        return response.data;
    },
};
