'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Check, X, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { OAuthButtons } from './OAuthButtons';
import { COUNTRIES } from '@/lib/constants/countries';
import { SearchableSelect } from '@/components/ui/searchable-select';
import Image from 'next/image';

const DIAL_CODES = [
  { code: '+91', flag: '🇮🇳', label: 'IN' },
  { code: '+1', flag: '🇺🇸', label: 'US' },
  { code: '+44', flag: '🇬🇧', label: 'GB' },
  { code: '+61', flag: '🇦🇺', label: 'AU' },
  { code: '+49', flag: '🇩🇪', label: 'DE' },
  { code: '+33', flag: '🇫🇷', label: 'FR' },
  { code: '+65', flag: '🇸🇬', label: 'SG' },
  { code: '+971', flag: '🇦🇪', label: 'AE' },
  { code: '+81', flag: '🇯🇵', label: 'JP' },
  { code: '+55', flag: '🇧🇷', label: 'BR' },
];

export function SignupForm() {
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    country: '',
    phoneNumber: '',
    dialCode: '+91',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.country) {
      newErrors.country = 'Please select your country';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phoneNumber.trim()) {
      const digitsOnly = formData.phoneNumber.replace(/[\s\-()]/g, '');
      if (!/^\d{7,15}$/.test(digitsOnly)) {
        newErrors.phoneNumber = 'Please enter a valid phone number (7–15 digits)';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const phoneNumber = formData.phoneNumber.trim()
      ? `${formData.dialCode}${formData.phoneNumber.replace(/[\s\-()]/g, '')}`
      : undefined;

    setIsLoading(true);
    setErrors({});
    try {
      await signup(formData.email, formData.password, formData.name, formData.country, phoneNumber);
    } catch (error: any) {
      if (error.response?.status === 409) {
        setErrors({ email: 'This email is already registered. Please sign in instead.' });
      } else {
        setErrors({ general: 'An error occurred. Please try again later.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const passwordRules = [
    { label: 'One uppercase character', valid: /[A-Z]/.test(formData.password) },
    { label: 'One number', valid: /[0-9]/.test(formData.password) },
    { label: 'One lowercase character', valid: /[a-z]/.test(formData.password) },
    { label: '8 characters minimum', valid: formData.password.length >= 8 },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center lg:text-left">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Start Free Trial</h2>
        <div className="text-muted-foreground text-center lg:text-left space-y-1">
          <p>
            Start your journey with no credit card required.{' '}
            <span className="text-emerald-600 font-medium whitespace-nowrap">
              Get 3 free credits.
            </span>
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {errors.general && (
          <div className="rounded-lg bg-destructive/10 p-3 flex items-start gap-2 text-destructive border border-destructive/20">
            <X className="h-4 w-4 mt-0.5" />
            <p className="text-sm font-medium">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium text-slate-700">
                Full Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                required
                className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all rounded-lg"
                disabled={isLoading}
                aria-invalid={errors.name ? 'true' : 'false'}
              />
              {errors.name && <p className="text-xs text-destructive font-medium">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="country" className="text-sm font-medium text-slate-700">
                Country <span className="text-destructive">*</span>
              </label>
              <SearchableSelect
                value={formData.country}
                onChange={(value) => setFormData((prev) => ({ ...prev, country: value }))}
                options={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))}
                placeholder="Select country"
                searchPlaceholder="Search country..."
                disabled={isLoading}
              />
              {errors.country && (
                <p className="text-xs text-destructive font-medium">{errors.country}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Work Email <span className="text-destructive">*</span>
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@company.com"
                required
                className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all rounded-lg"
                disabled={isLoading}
                aria-invalid={errors.email ? 'true' : 'false'}
              />
              {errors.email && (
                <p className="text-xs text-destructive font-medium">{errors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="phoneNumber" className="text-sm font-medium text-slate-700">
                Phone number
              </label>
              <div
                className={`flex h-11 items-center rounded-lg border bg-slate-50 transition-all focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/10 ${
                  errors.phoneNumber
                    ? 'border-destructive focus-within:border-destructive focus-within:ring-destructive/10'
                    : 'border-slate-200 focus-within:border-primary'
                }`}
              >
                <select
                  value={formData.dialCode}
                  onChange={(e) => setFormData({ ...formData, dialCode: e.target.value })}
                  disabled={isLoading}
                  aria-label="Country dial code"
                  className="h-full shrink-0 appearance-none bg-transparent pl-3 pr-6 text-sm font-medium text-slate-700 focus:outline-none disabled:opacity-50 cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center' }}
                >
                  {DIAL_CODES.map((d) => (
                    <option key={d.code + d.label} value={d.code}>
                      {d.flag} {d.code}
                    </option>
                  ))}
                </select>
                <div className="h-5 w-px shrink-0 bg-slate-200" aria-hidden="true" />
                <input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="98765 43210"
                  disabled={isLoading}
                  aria-invalid={errors.phoneNumber ? 'true' : 'false'}
                  className="h-full flex-1 min-w-0 bg-transparent px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-xs text-destructive font-medium">{errors.phoneNumber}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-slate-700">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                placeholder="Create a password"
                required
                className="h-11 pr-10 bg-slate-50 border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all rounded-lg"
                disabled={isLoading}
                aria-invalid={errors.password ? 'true' : 'false'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {/* Password strength indicator - shows when focused or typing */}
            {(passwordFocused || formData.password.length > 0) && (
              <div className="grid grid-cols-2 gap-2 mt-3 animate-in fade-in-0 zoom-in-95 duration-200">
                {passwordRules.map((rule, index) => (
                  <div key={index} className="flex items-center gap-2 text-[11px]">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                        rule.valid
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-slate-100 text-slate-300'
                      }`}
                    >
                      <Check className="w-2.5 h-2.5" strokeWidth={3} />
                    </div>
                    <span className={rule.valid ? 'text-slate-700 font-medium' : 'text-slate-500'}>
                      {rule.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {errors.password && (
              <p className="text-xs text-destructive font-medium">{errors.password}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-sm font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all rounded-lg bg-primary hover:bg-primary/90 mt-4 group"
            isLoading={isLoading}
            disabled={isLoading}
          >
            {!isLoading && (
              <span className="flex items-center gap-2">
                Start Free Trial{' '}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
            )}
            {isLoading && 'Creating Account...'}
          </Button>

          <div className="text-xs text-slate-500 leading-relaxed text-center">
            By clicking start, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-slate-900 text-slate-600">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline hover:text-slate-900 text-slate-600">
              Privacy Policy
            </Link>
            .
          </div>
        </form>

        <OAuthButtons mode="signup" />

        <div className="text-center text-sm pt-2">
          <span className="text-slate-600">Already have an account? </span>
          <Link
            href="/login"
            className="font-bold text-primary hover:text-primary/80 hover:underline"
          >
            Log in
          </Link>
        </div>

        {/* Social Proof */}
        <div className="pt-6 border-t border-slate-100">
          <div className="flex items-center justify-center gap-3">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="relative w-8 h-8">
                  <Image
                    src={`/avatars/avatar_${i}.png`}
                    alt={`User avatar ${i}`}
                    fill
                    className="rounded-full border-2 border-white ring-1 ring-slate-100 object-cover shadow-sm"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Trusted by 10,000+ creators
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
