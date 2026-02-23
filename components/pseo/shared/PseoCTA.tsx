import Link from 'next/link';

interface PseoCTAProps {
  headline?: string;
  subtext?: string;
}

export default function PseoCTA({
  headline = 'Generate Your First Reel Free',
  subtext = 'No camera. No editing. Just AI-powered faceless reels in 60 seconds.',
}: PseoCTAProps) {
  return (
    <section className="mt-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-10 text-center">
      <h2 className="text-2xl md:text-3xl font-bold mb-3">{headline}</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">{subtext}</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/signup"
          className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-8 py-3 font-semibold hover:bg-primary/90 transition-colors"
        >
          Start for Free
        </Link>
        <Link
          href="/features"
          className="inline-flex items-center justify-center rounded-lg border px-8 py-3 font-semibold hover:bg-muted/50 transition-colors"
        >
          See Features
        </Link>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">10 free credits on signup. No credit card required.</p>
    </section>
  );
}
