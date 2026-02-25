'use client';

import { useState, useEffect } from 'react';

const ONBOARDING_KEY = 'ai_reels_onboarding_done';
const SKILL_MODE_KEY = 'ai_reels_skill_mode';

export function useOnboarding() {
  // null = not yet read from localStorage (SSR / initial render)
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);
  const [skillMode, setSkillModeState] = useState<'beginner' | 'pro'>('pro');

  useEffect(() => {
    setOnboardingDone(localStorage.getItem(ONBOARDING_KEY) === '1');
    setSkillModeState((localStorage.getItem(SKILL_MODE_KEY) as 'beginner' | 'pro') || 'pro');
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    setOnboardingDone(true);
  };

  const setSkillMode = (m: 'beginner' | 'pro') => {
    localStorage.setItem(SKILL_MODE_KEY, m);
    setSkillModeState(m);
  };

  return { onboardingDone, completeOnboarding, skillMode, setSkillMode };
}
