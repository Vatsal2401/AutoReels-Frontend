import apiClient from '@/lib/api/client';

export const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';
const WALKTHROUGH_KEY = 'ai_reels_onboarding_done'; // suppresses old spotlight

export function isOnboardingCompleted(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(ONBOARDING_COMPLETED_KEY) === 'true';
}

// Called when user finishes or skips the wizard.
// Sets localStorage immediately (sync, so UI updates instantly)
// + fires API call in background (no await — don't block redirect).
export function markOnboardingCompleted(): void {
  localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
  localStorage.setItem(WALKTHROUGH_KEY, '1'); // suppress old OnboardingWalkthrough
  // Fire-and-forget — don't block the redirect on network
  apiClient.post('/user-settings/complete-onboarding').catch(() => {});
}
