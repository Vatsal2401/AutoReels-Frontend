import React from 'react';
import { MediaSettingsProps } from './types';
import { cn } from '@/lib/utils';
import { Sparkles, Zap, Image as ImageIcon, Box } from 'lucide-react';

const PROVIDERS = [
  { id: 'gemini', label: 'Gemini Imagen 3', icon: Sparkles, description: 'Google\'s high-fidelity creative model', badge: 'Default' },
  { id: 'replicate', label: 'Flux Schnell', icon: Zap, description: 'Exceptional speed, photorealistic', badge: 'Fastest' },
  { id: 'dalle', label: 'DALL-E 3', icon: ImageIcon, description: 'Creative and detailed compositions', badge: null },
  { id: 'mock', label: 'Mock Engine', icon: Box, description: 'Placeholder for testing (No Credits)', badge: 'Free' },
] as const;

export const ImageProviderSelector: React.FC<MediaSettingsProps> = ({ settings, onUpdate }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">AI Imaging Engine</h3>
      <div className="grid grid-cols-1 gap-3">
        {PROVIDERS.map((provider) => (
          <button
            key={provider.id}
            type="button"
            onClick={() => onUpdate({ imageProvider: provider.id as any })}
            className={cn(
              "relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left group",
              settings.imageProvider === provider.id
                ? "border-primary bg-primary/5 shadow-glow"
                : "border-white/5 hover:border-white/20 bg-white/5"
            )}
          >
            <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                settings.imageProvider === provider.id ? "bg-primary text-black" : "bg-white/10 text-white/50 group-hover:bg-white/20"
            )}>
              <provider.icon size={20} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{provider.label}</span>
                {provider.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter bg-white/10 text-white/70">
                        {provider.badge}
                    </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">{provider.description}</p>
            </div>

            {settings.imageProvider === provider.id && (
                <div className="absolute top-2 right-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-glow" />
                </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
