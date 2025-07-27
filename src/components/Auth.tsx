
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { BarrelIcon } from './icons';

type View = 'signIn' | 'signUp' | 'forgotPassword';

const Auth = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [view, setView] = useState<View>('signIn');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);
        try {
            let error;
            if (view === 'signUp') {
                const { error: signUpError } = await supabase.auth.signUp({ email, password });
                error = signUpError;
                if (!error) setMessage('Check your email for the confirmation link!');
            } else if (view === 'signIn') {
                const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
                error = signInError;
            } else if (view === 'forgotPassword') {
                const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: window.location.origin, // Redirects to the app's root URL
                });
                error = resetError;
                if (!error) setMessage('If an account exists, a password reset link has been sent to your email.');
            }

            if (error) {
                console.error("Supabase Auth Error:", error);
                setMessage(error.message);
            }
        } catch (error) {
            console.error("Authentication Error:", error);
            setMessage(error instanceof Error ? error.message : 'An unexpected error occurred. Check the console for details.');
        } finally {
            setLoading(false);
        }
    };
    
    const switchView = (newView: View) => {
        setView(newView);
        setMessage('');
        setPassword('');
    };

    const pageInfo = {
        signIn: { title: 'Sign in to access your brews', button: 'Sign In' },
        signUp: { title: 'Create an account to get started', button: 'Sign Up' },
        forgotPassword: { title: 'Reset your password', button: 'Send Reset Link' },
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-sm">
                <div className="flex flex-col items-center mb-8">
                    <BarrelIcon className="w-16 h-16 text-cyan-400 mb-4" />
                    <h1 className="text-4xl font-extrabold text-cyan-400 tracking-tight">
                        My Pinter Assistant
                    </h1>
                    <p className="text-slate-400 mt-2 text-lg text-center">
                        {pageInfo[view].title}
                    </p>
                </div>

                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-8 border border-slate-700">
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-lg font-medium text-slate-300 mb-2">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="your@email.com"
                                    className="w-full text-xl bg-slate-700/50 border-slate-600 rounded-lg p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                                />
                            </div>
                            {view !== 'forgotPassword' && (
                                <div>
                                    <label htmlFor="password" className="block text-lg font-medium text-slate-300 mb-2">
                                        Password
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
                            )}
                        </div>

                        {message && (
                            <p className="mt-4 text-center text-yellow-400 bg-yellow-500/10 py-2 px-3 rounded-lg">
                                {message}
                            </p>
                        )}

                        <div className="mt-8">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-cyan-500 text-slate-900 text-lg font-bold py-3.5 px-4 rounded-lg hover:bg-cyan-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Processing...' : pageInfo[view].button}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center space-y-2 flex flex-col items-center">
                        {view === 'signIn' && (
                            <button
                                onClick={() => switchView('forgotPassword')}
                                className="text-slate-400 hover:text-cyan-400 font-semibold transition-colors text-sm"
                            >
                                Forgot your password?
                            </button>
                        )}
                         <button
                            onClick={() => switchView(view === 'signUp' || view === 'forgotPassword' ? 'signIn' : 'signUp')}
                            className="text-slate-400 hover:text-cyan-400 font-semibold transition-colors"
                        >
                            {view === 'signIn' && "Don't have an account? Sign Up"}
                            {view === 'signUp' && 'Already have an account? Sign In'}
                            {view === 'forgotPassword' && 'Back to Sign In'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
