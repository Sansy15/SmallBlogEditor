import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const setToken = useAuthStore((s) => s.setToken);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = mode === 'login'
        ? await api.auth.login(email, password)
        : await api.auth.signup(email, password);
      setToken(res.access_token);
      navigate('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl rounded-3xl bg-neutral-950/60 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl overflow-hidden grid grid-cols-1 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="relative hidden lg:flex flex-col justify-between px-10 py-10 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black">
          <div>
            <p className="text-xs font-semibold tracking-[0.3em] text-neutral-500 uppercase mb-4">
              Smart Blog Editor
            </p>
            <h1 className="text-3xl font-semibold text-neutral-50 leading-snug">
              Craft beautiful, AI‑assisted stories
            </h1>
            <p className="mt-4 text-sm text-neutral-400 max-w-md">
              A focused writing canvas with autosave, publishing, and integrated
              Gemini‑powered assistance — designed for serious creators.
            </p>
          </div>
          <div className="mt-10 space-y-3 text-xs text-neutral-500">
            <p>• Distraction‑free editor</p>
            <p>• Drafts and quick publishing</p>
            <p>• Instant grammar fixes and summaries</p>
          </div>
        </div>

        <div className="bg-neutral-950/70 px-6 py-8 sm:px-8 sm:py-10">
          <div className="mb-8">
            <p className="text-xs font-semibold tracking-[0.25em] text-neutral-500 uppercase mb-3">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </p>
            <h2 className="text-2xl sm:text-2.5xl font-semibold text-neutral-50">
              {mode === 'login' ? 'Sign in to continue' : 'Join Smart Blog Editor'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900/70 border border-neutral-800 text-neutral-50 text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900/70 border border-neutral-800 text-neutral-50 text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow"
                placeholder="••••••••"
              />
            </div>
            {error && (
              <p className="text-xs text-red-400 bg-red-950/40 border border-red-900/60 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="w-full py-2.75 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-sm font-medium text-white shadow-lg shadow-violet-500/25 hover:from-violet-400 hover:to-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-violet-400 focus-visible:ring-offset-neutral-950 transition-colors"
            >
              {mode === 'login' ? 'Continue' : 'Create account'}
            </button>
          </form>

          <div className="mt-5 text-xs text-neutral-400 text-center space-y-2">
            <p>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setError(null);
                }}
                className="text-neutral-100 font-medium hover:underline ml-1"
              >
                {mode === 'login' ? 'Sign up' : 'Log in'}
              </button>
            </p>
            <p className="text-[11px] text-neutral-500">
              <button
                onClick={() => {
                  setToken('demo');
                  navigate('/');
                }}
                className="underline underline-offset-4 hover:text-neutral-300"
              >
                Continue without account (demo)
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
