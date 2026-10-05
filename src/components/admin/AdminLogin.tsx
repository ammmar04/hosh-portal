'use client';

import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';
import type { Dictionary } from '@/i18n';

export function AdminLogin({ t, showDevHint }: { t: Dictionary['admin']; showDevHint: boolean }) {
  const router = useRouter();
  const id = useId();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) return router.refresh();
      setError(res.status === 429 ? t.tooMany : t.wrongPassword);
    } catch {
      setError(t.wrongPassword);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card grid max-w-md gap-4 p-6 sm:p-8">
      <label htmlFor={id} className="font-semibold">
        {t.password}
      </label>
      <input
        id={id}
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="field"
        aria-invalid={error ? true : undefined}
        aria-describedby={`${id}-err`}
        required
      />
      <p id={`${id}-err`} role="alert" className={error ? 'font-semibold text-alarm-ink' : 'sr-only'}>
        {error}
      </p>
      <button type="submit" disabled={busy} className="btn btn-ink btn-lg">
        {busy ? t.signingIn : t.signIn}
      </button>
      {showDevHint && <p className="text-muted t-small">{t.devHint}</p>}
    </form>
  );
}
