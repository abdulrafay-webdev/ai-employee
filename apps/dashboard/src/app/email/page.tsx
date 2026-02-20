"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { loadDrafts } from '../../lib/actions'; 
import { Message } from '@personal-ai/shared';
import { sendDraft } from '../../lib/api';

export default function EmailDraftsPage() {
    const [emails, setEmails] = useState<Message[]>([]);
    const [selectedEmail, setSelectedEmail] = useState<Message | null>(null);
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [loading, setLoading] = useState(false);

    const refreshData = useCallback(async () => {
        const drafts = await loadDrafts();
        // STRICT FILTER: Only Gmail messages
        setEmails(drafts.filter(d => d.source === 'gmail'));
    }, []);

    useEffect(() => {
        refreshData();
        const interval = setInterval(refreshData, 10000);
        return () => clearInterval(interval);
    }, [refreshData]);

    const handleSelect = (email: Message) => {
        setSelectedEmail(email);
        setSubject(`Re: ${email.content.substring(0, 30)}...`);
        setBody("");
    };

    const handleSend = async () => {
        if (!selectedEmail || !body) return;
        setLoading(true);
        try {
            const fullReply = `Subject: ${subject}\n\n${body}`;
            await sendDraft(selectedEmail.id, fullReply);
            setBody("");
            setSelectedEmail(null);
            refreshData();
        } catch (e) {
            alert("Failed to send email");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
            {/* Left: Email List Sidebar */}
            <div className="w-1/3 border-r flex flex-col bg-white shadow-xl z-10">
                <header className="p-6 border-b flex justify-between items-center bg-white">
                    <h1 className="text-2xl font-black text-gray-800 tracking-tighter uppercase">Gmail Inbox</h1>
                    <button onClick={refreshData} className="text-blue-600 font-bold text-xs uppercase hover:underline">Refresh</button>
                </header>
                <div className="overflow-y-auto flex-1">
                    {emails.length === 0 ? (
                        <div className="p-16 text-center text-gray-300">
                            <p className="text-sm font-medium italic">No pending emails to review</p>
                        </div>
                    ) : (
                        emails.map(email => (
                            <div 
                                key={email.id} 
                                onClick={() => handleSelect(email)}
                                className={`p-6 border-b cursor-pointer transition-all ${selectedEmail?.id === email.id ? 'bg-blue-600 text-white shadow-lg scale-[1.02]' : 'hover:bg-gray-50 text-gray-800'}`}
                            >
                                <div className="flex justify-between mb-2">
                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${selectedEmail?.id === email.id ? 'bg-blue-400 text-white' : 'bg-gray-100 text-gray-500'}`}>New Email</span>
                                    <span className={`text-[9px] font-bold ${selectedEmail?.id === email.id ? 'text-blue-200' : 'text-gray-400'}`}>
                                        {new Date(email.timestamp).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="font-bold truncate text-sm">{email.sender}</p>
                                <p className={`text-xs mt-1 truncate opacity-80 ${selectedEmail?.id === email.id ? 'text-blue-100' : 'text-gray-500'}`}>
                                    {email.content.substring(0, 60)}...
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right: Email Content & Composer */}
            <div className="flex-1 flex flex-col bg-white relative">
                {selectedEmail ? (
                    <>
                        <div className="p-10 flex-1 overflow-y-auto max-w-4xl mx-auto w-full">
                            <div className="mb-10 border-b pb-8">
                                <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">{selectedEmail.sender}</h2>
                                <div className="flex items-center text-xs text-gray-400 font-bold space-x-2">
                                    <span>TO: Abdul Rafay</span>
                                    <span>•</span>
                                    <span>RECEIVED: {new Date(selectedEmail.timestamp).toLocaleString()}</span>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 p-8 rounded-3xl mb-12 text-gray-700 leading-relaxed border border-gray-100 shadow-inner italic">
                                "{selectedEmail.content}"
                            </div>

                            {/* Reply Form */}
                            <div className="space-y-6 bg-gray-50 p-8 rounded-3xl border border-gray-200 shadow-2xl">
                                <div className="flex items-center space-x-4 border-b border-gray-200 pb-2">
                                    <span className="text-[10px] font-black text-gray-400 uppercase w-16">Subject:</span>
                                    <input 
                                        type="text"
                                        className="flex-1 bg-transparent py-1 outline-none text-sm font-bold text-gray-800"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                    />
                                </div>
                                <div className="flex space-x-4">
                                    <span className="text-[10px] font-black text-gray-400 uppercase w-16 mt-2">Message:</span>
                                    <textarea 
                                        placeholder="Type your professional email reply here..."
                                        className="flex-1 p-0 bg-transparent border-none outline-none focus:ring-0 h-64 text-sm text-gray-700 leading-relaxed resize-none"
                                        value={body}
                                        onChange={(e) => setBody(e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-end pt-4 border-t border-gray-200">
                                    <button 
                                        onClick={handleSend}
                                        disabled={loading}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-full font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {loading ? "Transmitting..." : "Send Official Email"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-200">
                        <svg className="w-24 h-24 mb-6 opacity-10" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                        <h3 className="text-xl font-black uppercase tracking-[0.2em]">Select Correspondence</h3>
                        <p className="text-sm mt-2 italic font-medium opacity-50">Review and respond to your Gmail business inquiries.</p>
                    </div>
                )}
            </div>
        </div>
    );
}