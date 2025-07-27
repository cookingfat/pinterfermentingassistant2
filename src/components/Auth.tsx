
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { BarrelIcon } from './icons';

const Auth = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);
        try {
            let error;
            if (isSignUp) {
                const { error: signUpError } = await supabase.auth.signUp({ email, password });
                error = signUpError;
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
                error = signInError;
            }

            if (error) {
                console.error("Supabase Auth Error:", error);
                setMessage(error.message);
            } else if (isSignUp) {
                setMessage('Check your email for the confirmation link!');
                setIsSignUp(false); // Switch to sign-in view after successful sign-up
            }
        } catch (error) {
            console.error("Authentication Error:", error);
            setMessage(error instanceof Error ? error.message : 'An unexpected error occurred. Check the console for details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-sm">
                <div className="flex flex-col items-center mb-8">
                    <BarrelIcon className="w-16 h-16 text-cyan-400 mb-4" />
                    <h1 className="text-4xl font-extrabold text-cyan-400 tracking-tight">
                        My Pinter Assistant
                    </h1>
                    <p className="text-slate-400 mt-2 text-lg">
                        {isSignUp ? 'Create an account to get started' : 'Sign in to access your brews'}
                    </p>
                </div>

                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-8 border border-slate-700">
                    <form onSubmit={handleLogin}>
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
                                {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setMessage('');
                            }}
                            className="text-slate-400 hover:text-cyan-400 font-semibold transition-colors"
                        >
                            {isSignUp
                                ? 'Already have an account? Sign In'
                                : "Don't have an account? Sign Up"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
