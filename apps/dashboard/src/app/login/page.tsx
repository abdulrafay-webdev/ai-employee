"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Finalized Credentials
        const VALID_EMAIL = "rafaysheikhuk218@gmail.com";
        const VALID_PASS = "Rafay@2005";

        if (email === VALID_EMAIL && password === VALID_PASS) {
            localStorage.setItem("isLoggedIn", "true");
            router.push("/");
        } else {
            setError("Invalid Email or Password. Access Denied.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] font-sans">
            <div className="bg-white p-12 rounded-[48px] shadow-2xl border border-gray-100 w-full max-w-md transition-all">
                <header className="text-center mb-12">
                    <div className="bg-black w-20 h-20 rounded-[28px] mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-blue-100 rotate-3 hover:rotate-0 transition-transform">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                        </svg>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Operator Login</h1>
                    <p className="text-sm text-gray-400 font-bold mt-2 uppercase tracking-widest">Verify identity to continue</p>
                </header>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">Registered Email</label>
                        <input 
                            type="email" 
                            placeholder="your@email.com" 
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-black font-semibold text-gray-700 transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">Security Key</label>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-black font-black tracking-[0.3em] text-gray-700 transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    {error && (
                        <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                            <p className="text-red-600 text-[10px] font-black text-center uppercase tracking-wider">{error}</p>
                        </div>
                    )}

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            className="w-full bg-black text-white p-5 rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:bg-gray-800 transition-all active:scale-95"
                        >
                            Authorize & Sync
                        </button>
                    </div>
                </form>
                
                <footer className="mt-12 text-center">
                    <p className="text-[9px] text-gray-300 font-black uppercase tracking-[0.2em]">Secure AI Terminal v1.0.4</p>
                </footer>
            </div>
        </div>
    );
}