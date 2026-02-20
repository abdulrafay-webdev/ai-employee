"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Message } from '@personal-ai/shared';
import { fetchChats, fetchDrafts, markAsRead } from '../../lib/api';
import Link from 'next/link';

export default function WhatsAppChatPage() {
    const [chats, setChats] = useState<{ [sender: string]: any[] }>({});
    const [selectedSender, setSelectedSender] = useState<string | null>(null);
    const [drafts, setDrafts] = useState<any[]>([]);
    const [replyText, setReplyText] = useState("");
    const [loading, setLoading] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const [chatsRes, draftsRes] = await Promise.all([
                fetchChats(),
                fetchDrafts()
            ]);
            setChats(chatsRes);
            setDrafts(draftsRes);
        } catch (e) { console.error("Fetch failed", e); }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const selectChat = async (sender: string) => {
        setSelectedSender(sender);
        const draft = drafts.find(d => d.sender.replace(/[^a-zA-Z0-9]/g, '_') === sender);
        setReplyText(draft?.suggestedReply || "");
        setIsMobileView(true);

        try {
            await markAsRead(sender);
            fetchData(); 
        } catch (e) { console.error(e); }
    };

    const handleSend = async () => {
        if (!selectedSender || !replyText) {
            alert("Sender or message content missing!");
            return;
        }
        
        setLoading(true);
        try {
            // Using the robust manual-send endpoint
            const response = await fetch('http://localhost:3001/api/drafts/manual-send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    sender: selectedSender, 
                    content: replyText 
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || "Failed to send");
            }

            setReplyText("");
            setSelectedSender(null);
            setIsMobileView(false);
            fetchData();
        } catch (e: any) {
            alert(`Send Error: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    const activeSenders = Object.keys(chats);

    return (
        <div className="flex h-screen bg-[#f0f2f5] overflow-hidden font-sans text-[#111b21]">
            {/* Sidebar */}
            <div className={`w-full md:w-1/3 bg-white border-r flex flex-col ${isMobileView ? 'hidden md:flex' : 'flex'}`}>
                <header className="p-4 bg-[#f0f2f5] border-b flex justify-between items-center h-16">
                    <Link href="/" className="text-[#008069] font-bold">← Home</Link>
                    <h1 className="font-bold text-lg text-[#41525d]">Chats</h1>
                    <button onClick={fetchData} className="text-[#008069] text-xs font-bold uppercase">Sync</button>
                </header>
                <div className="overflow-y-auto flex-1 bg-white">
                    {activeSenders.length === 0 ? (
                        <p className="p-10 text-center text-gray-400 italic">No active chats</p>
                    ) : (
                        activeSenders.map(sender => {
                            const isPending = drafts.some(d => d.sender.replace(/[^a-zA-Z0-9]/g, '_') === sender);
                            const lastMsg = chats[sender][chats[sender].length - 1];
                            return (
                                <div 
                                    key={sender} 
                                    onClick={() => selectChat(sender)}
                                    className={`p-4 flex items-center cursor-pointer border-b hover:bg-[#f5f6f6] ${selectedSender === sender ? 'bg-[#f0f2f5]' : ''}`}
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mr-3 flex-shrink-0 ${isPending ? 'bg-orange-500 ring-4 ring-orange-100' : 'bg-gray-300'}`}>
                                        {sender.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex-1 overflow-hidden text-ellipsis">
                                        <div className="flex justify-between items-center">
                                            <span className={`text-sm truncate ${isPending ? 'font-black text-orange-600' : 'font-semibold'}`}>{sender}</span>
                                            <span className="text-[10px] text-[#667781] flex-shrink-0">{new Date(lastMsg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                        </div>
                                        <p className="text-xs text-[#667781] truncate mt-1">
                                            {isPending ? "⚠️ ACTION REQUIRED" : lastMsg.content}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <div className={`flex-1 flex flex-col bg-[#efeae2] ${!isMobileView ? 'hidden md:flex' : 'flex'}`}>
                {selectedSender ? (
                    <>
                        <header className="p-3 bg-[#f0f2f5] flex items-center border-b z-10 shadow-sm h-16">
                            <button onClick={() => setIsMobileView(false)} className="md:hidden mr-3 text-[#008069] font-bold p-2">
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path></svg>
                            </button>
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold mr-3 text-xs flex-shrink-0">
                                {selectedSender.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="font-bold text-[#41525d] text-sm truncate">{selectedSender}</span>
                        </header>

                        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
                            {chats[selectedSender].map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`p-3 rounded-xl shadow-sm max-w-[85%] md:max-w-md text-sm ${msg.role === 'user' ? 'bg-white rounded-tl-none text-[#111b21]' : 'bg-[#dcf8c6] rounded-tr-none text-[#111b21]'}`}>
                                        {msg.content}
                                        <div className="text-[9px] text-gray-400 text-right mt-1 uppercase font-bold">
                                            {new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} 
                                            {msg.type === 'auto' && ' • AI'}
                                            {msg.type === 'draft' && ' • SUGGESTED'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <footer className="p-3 md:p-4 bg-[#f0f2f5] border-t flex flex-col space-y-3">
                            <textarea 
                                placeholder="Type a message..."
                                className="w-full p-3 rounded-xl border-none focus:ring-0 outline-none text-sm h-20 md:h-24 resize-none shadow-inner"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                            />
                            <div className="flex justify-end">
                                <button 
                                    onClick={handleSend} 
                                    disabled={loading}
                                    className="bg-[#00a884] text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {loading ? "SENDING..." : "SEND"}
                                </button>
                            </div>
                        </footer>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-[#667781] opacity-40">
                        <svg className="w-20 h-20 mb-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.168L2.05 22l4.997-1.313C8.414 21.54 10.14 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.63 0-3.156-.444-4.46-1.214l-.32-.188-3.104.816.83-2.99-.207-.33C4.01 14.82 3.5 13.453 3.5 12c0-4.687 3.813-8.5 8.5-8.5s8.5 3.813 8.5 8.5-3.813 8.5-8.5 8.5z"/></svg>
                        <h3 className="text-xl font-medium uppercase tracking-widest text-center px-4">Select a Chat</h3>
                    </div>
                )}
            </div>
        </div>
    );
}
