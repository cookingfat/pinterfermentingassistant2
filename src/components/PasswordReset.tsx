
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { KeyIcon } from './icons';

interface PasswordResetProps {
  onPasswordUpdated: () => void;
}

const PasswordReset: React.FC<PasswordResetProps> = ({ onPasswordUpdated }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        throw updateError;
      }
      setMessage('Your password has been reset successfully! You will be redirected to the sign-in page shortly.');
      
      setTimeout(() => {
        onPasswordUpdated();
      }, 3000);

    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
      console.error("Password reset error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <KeyIcon className="w-16 h-16 text-cyan-400 mb-4" />
          <h1 className="text-4xl font-extrabold text-cyan-400 tracking-tight">
            Set New Password
          </h1>
          <p className="text-slate-400 mt-2 text-lg text-center">
            Enter and confirm your new password below.
          </p>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-8 border border-slate-700">
          <form onSubmit={handleReset}>
            <div className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-lg font-medium text-slate-300 mb-2">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full text-xl bg-slate-700/50 border-slate-600 rounded-lg p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-lg font-medium text-slate-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full text-xl bg-slate-700/50 border-slate-600 rounded-lg p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                />
              </div>
            </div>

            {error && (
              <p className="mt-4 text-center text-red-400 bg-red-500/10 py-2 px-3 rounded-lg">
                {error}
              </p>
            )}
            {message && (
              <p className="mt-4 text-center text-green-400 bg-green-500/10 py-2 px-3 rounded-lg">
                {message}
              </p>
            )}

            <div className="mt-8">
              <button
                type="submit"
                disabled={loading || !!message}
                className="w-full bg-cyan-500 text-slate-900 text-lg font-bold py-3.5 px-4 rounded-lg hover:bg-cyan-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;
