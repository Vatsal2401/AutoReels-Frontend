import React from 'react';
import { MediaSettingsProps } from './types';
import Image from 'next/image';
import { cn } from '@/lib/utils/format';
import { STYLE_CATEGORIES } from './styles';
import { ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const FEATURED_STYLE_IDS = [
  'cinematic',
  'anime',
  'minimalist',
  'vibrant',
  'film_noir',
  'cyberpunk',
  'lofi',
];

export const VisualStyleSelector: React.FC<MediaSettingsProps> = ({ settings, onUpdate }) => {
  const [isLibraryOpen, setIsLibraryOpen] = React.useState(false);
  const featuredStyles = STYLE_CATEGORIES.flatMap((c) => c.styles).filter((s) =>
    FEATURED_STYLE_IDS.includes(s.id),
  );
  const currentStyleId = settings.visualStyleId;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
          Visual Aesthetic
        </label>

        <Dialog open={isLibraryOpen} onOpenChange={setIsLibraryOpen}>
          <DialogTrigger asChild>
            <button className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 group">
              EXPLORE LIBRARY{' '}
              <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
            </button>
          </DialogTrigger>
          <DialogContent
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              position: 'fixed',
              maxHeight: '85vh',
              margin: 0,
            }}
            className="w-full max-w-2xl overflow-y-auto scrollbar-saas bg-background/95 backdrop-blur-xl border border-border shadow-2xl duration-200 z-[100] p-5 rounded-xl !translate-x-[-50%] !translate-y-[-50%] !top-[50%] !left-[50%] gap-0"
          >
            <DialogHeader className="pb-4">
              <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
                Visual Style Library
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Choose a visual aesthetic for your video generation.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-2">
              {STYLE_CATEGORIES.map((category) => (
                <div key={category.id} className="space-y-2">
                  <h3 className="text-[10px] font-bold text-foreground uppercase tracking-wider pl-1">
                    {category.label}
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {category.styles.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => {
                          onUpdate({ visualStyleId: style.id });
                          setIsLibraryOpen(false);
                        }}
                        className={cn(
                          'group relative aspect-video w-full rounded-md overflow-hidden border border-border transition-all text-left bg-muted',
                          currentStyleId === style.id
                            ? 'ring-2 ring-primary ring-offset-1 ring-offset-background'
                            : 'hover:scale-[1.02]',
                        )}
                      >
                        <StyleImageWithFallback
                          src={style.thumbnail}
                          alt={style.label}
                          isActive={currentStyleId === style.id}
                          styleId={style.id}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                        <div className="absolute bottom-2 left-2 right-2">
                          <span
                            className={cn(
                              'text-xs font-bold text-white block',
                              currentStyleId === style.id && 'text-white',
                            )}
                          >
                            {style.label}
                          </span>
                        </div>
                        {currentStyleId === style.id && (
                          <div className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-[10px] text-primary-foreground font-bold">✓</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Horizontal Scroll Container */}
      <div
        className="flex items-center gap-4 overflow-x-auto pb-4 pt-2 px-1 snap-x mandatory scrollbar-hide no-scrollbar -mx-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {featuredStyles.map((style) => (
          <LargeStyleCard
            key={style.id}
            style={style}
            isActive={currentStyleId === style.id}
            onClick={() => onUpdate({ visualStyleId: style.id })}
          />
        ))}
      </div>
    </div>
  );
};

interface LargeStyleCardProps {
  style: any;
  isActive: boolean;
  onClick: () => void;
}

const LargeStyleCard: React.FC<LargeStyleCardProps> = ({ style, isActive, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative shrink-0 w-36 h-24 rounded-2xl overflow-hidden transition-all duration-300 group snap-start border',
        isActive
          ? 'border-primary ring-4 ring-primary/10 shadow-xl scale-[1.05] z-10'
          : 'border-border opacity-60 hover:opacity-100 hover:scale-[1.02] grayscale-[0.2] hover:grayscale-0',
      )}
    >
      <div className="absolute inset-0 bg-muted" />

      <Image
        src={style.thumbnail}
        alt={style.label}
        fill
        className={cn(
          'object-cover transition-transform duration-700',
          isActive ? 'scale-110' : 'group-hover:scale-110',
        )}
        sizes="200px"
      />

      {/* Cinematic Vignette */}
      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-300',
          isActive
            ? 'bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-100'
            : 'bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80',
        )}
      />

      <div className="absolute bottom-3 left-3 right-3 text-left">
        <span
          className={cn(
            'text-[10px] sm:text-xs font-black uppercase tracking-widest text-white drop-shadow-md transition-all',
            isActive ? 'text-white scale-105' : 'text-white/80',
          )}
        >
          {style.label}
        </span>
      </div>

      {isActive && (
        <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-lg border border-white/20 animate-in zoom-in-50 duration-300">
          <span className="text-[10px] text-primary-foreground font-black">✓</span>
        </div>
      )}
    </button>
  );
};

function StyleImageWithFallback({
  src,
  alt,
  isActive,
  styleId,
}: {
  src: string;
  alt: string;
  isActive: boolean;
  styleId: string;
}) {
  const [error, setError] = React.useState(false);

  // Deterministic gradient based on styleId
  const getGradient = (id: string) => {
    const gradients = [
      'from-pink-500 via-red-500 to-yellow-500',
      'from-blue-400 via-indigo-500 to-purple-500',
      'from-green-400 via-teal-500 to-blue-500',
      'from-yellow-400 via-orange-500 to-red-500',
      'from-indigo-400 via-purple-500 to-pink-500',
      'from-teal-400 via-emerald-500 to-green-500',
    ];
    // Simple hash
    const index =
      id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length;
    return gradients[index];
  };

  if (error) {
    return (
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br w-full h-full transition-transform duration-500',
          getGradient(styleId),
          isActive ? 'scale-110' : 'group-hover:scale-110',
        )}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      onError={() => setError(true)}
      className={cn(
        'object-cover transition-transform duration-500',
        isActive ? 'scale-110' : 'group-hover:scale-110',
      )}
      sizes="(max-width: 768px) 50vw, 20vw"
    />
  );
}
