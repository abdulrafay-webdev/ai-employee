"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchBriefing } from '../../lib/api';
import ReactMarkdown from 'react-markdown';

export default function DailyBriefingPage() {
    const [briefing, setBriefing] = useState("");
    const [loading, setLoading] = useState(false);

    const getBriefing = async () => {
        setLoading(true);
        try {
            const data = await fetchBriefing();
            setBriefing(data.briefing);
        } catch (e) {
            setBriefing("Report load nahi ho saki. Please check backend connection.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getBriefing();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-10">
            {/* Responsive Navbar */}
            <nav className="p-4 md:p-6 border-b flex justify-between items-center bg-white sticky top-0 z-50 shadow-sm">
                <Link href="/" className="text-xs md:text-sm font-black text-blue-600 uppercase tracking-widest flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>
                    Home
                </Link>
                <h1 className="text-sm md:text-base font-black uppercase tracking-tighter text-gray-400">Intelligence Report</h1>
                <div className="w-10 md:w-20"></div>
            </nav>

            <main className="max-w-4xl mx-auto px-4 py-8 md:p-10">
                <div className="bg-white rounded-[32px] md:rounded-[48px] p-6 md:p-12 shadow-2xl shadow-blue-100/50 relative overflow-hidden border border-gray-100">
                    {/* Header */}
                    <header className="mb-10 text-center md:text-left">
                        <div className="inline-block bg-blue-50 px-4 py-1.5 rounded-full mb-4">
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Saim AI Intelligence</p>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight">
                            Rafay's Daily <br className="hidden md:block"/> Briefing.
                        </h2>
                        <p className="text-gray-400 mt-4 font-bold text-xs uppercase tracking-widest">
                            {new Date().toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </header>

                    {/* Content Area */}
                    <div className="min-h-[300px] border-t border-gray-100 pt-10">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-6"></div>
                                <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em] animate-pulse">Analyzing logs & messages...</p>
                            </div>
                        ) : (
                            <article className="prose prose-sm md:prose-base max-w-none text-gray-700 leading-relaxed font-medium">
                                <div className="markdown-container">
                                    <ReactMarkdown 
                                        components={{
                                            h1: ({node, ...props}) => <h3 className="text-xl font-black text-blue-600 mt-8 mb-4 uppercase tracking-tight" {...props} />,
                                            h2: ({node, ...props}) => <h3 className="text-lg font-black text-gray-800 mt-6 mb-3 uppercase tracking-tight" {...props} />,
                                            ul: ({node, ...props}) => <ul className="list-disc ml-5 space-y-2 mb-6" {...props} />,
                                            p: ({node, ...props}) => <p className="mb-4" {...props} />,
                                            strong: ({node, ...props}) => <strong className="font-black text-gray-900" {...props} />,
                                        }}
                                    >
                                        {briefing || "No data available for today yet. Check your WhatsApp messages."}
                                    </ReactMarkdown>
                                </div>
                            </article>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <footer className="mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <button 
                            onClick={getBriefing} 
                            disabled={loading}
                            className="w-full md:w-auto bg-gray-900 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 shadow-xl"
                        >
                            Refresh Analysis
                        </button>
                        <div className="flex items-center space-x-2 grayscale opacity-50">
                            <span className="text-[10px] font-black text-gray-400 uppercase">Saim Assistant v2.4</span>
                        </div>
                    </footer>
                </div>
            </main>
        </div>
    );
}