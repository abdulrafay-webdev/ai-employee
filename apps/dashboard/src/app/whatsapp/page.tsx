"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Message } from '@personal-ai/shared';
import { fetchChats, fetchDrafts, markAsRead, sendDraft } from '../../lib/api';

export default function WhatsAppChatPage() {
    const [chats, setChats] = useState<{ [sender: string]: any[] }>({});
    const [selectedSender, setSelectedSender] = useState<string | null>(null);
    const [drafts, setDrafts] = useState<any[]>([]);
    const [replyText, setReplyText] = useState("");

    const fetchData = useCallback(async () => {
        try {
            const [chatsRes, draftsRes] = await Promise.all([
                fetchChats(),
                fetchDrafts()
            ]);
            setChats(chatsRes);
            setDrafts(draftsRes);
        } catch (e) {
            console.error("Fetch failed", e);
        }
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

        // MARK AS READ: Inform backend to remove from drafts
        try {
            await markAsRead(sender);
            fetchData(); // Instant refresh to hide badge
        } catch (e) {
            console.error("Mark read failed", e);
        }
    };

    const handleSend = async () => {
        if (!selectedSender || !replyText) return;
        
        try {
            const draft = drafts.find(d => d.sender.replace(/[^a-zA-Z0-9]/g, '_') === selectedSender);
            const draftId = draft?.id || "manual";

            await sendDraft(draftId, replyText);
            setReplyText("");
            setSelectedSender(null);
            fetchData();
        } catch (e) {
            alert("Send failed");
        }
    };

    const activeSenders = Object.keys(chats);

    return (
        <div className="flex h-screen bg-[#f0f2f5] overflow-hidden font-sans text-[#111b21]">
            {/* Sidebar */}
            <div className="w-1/3 bg-white border-r flex flex-col">
                <header className="p-4 bg-[#f0f2f5] border-b flex justify-between items-center">
                    <h1 className="font-bold text-xl text-[#41525d]">Chats</h1>
                </header>
                <div className="overflow-y-auto flex-1">
                    {activeSenders.map(sender => {
                        const isPending = drafts.some(d => d.sender.replace(/[^a-zA-Z0-9]/g, '_') === sender);
                        const lastMsg = chats[sender][chats[sender].length - 1];
                        return (
                            <div 
                                key={sender} 
                                onClick={() => selectChat(sender)}
                                className={`p-4 flex items-center cursor-pointer border-b hover:bg-[#f5f6f6] ${selectedSender === sender ? 'bg-[#f0f2f5]' : ''}`}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mr-3 ${isPending ? 'bg-orange-500 ring-4 ring-orange-100' : 'bg-gray-300'}`}>
                                    {sender.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex justify-between items-center">
                                        <span className={`text-sm ${isPending ? 'font-black text-orange-600' : 'font-semibold'}`}>{sender}</span>
                                        <span className="text-[10px] text-[#667781]">{new Date(lastMsg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                    </div>
                                    <p className="text-xs text-[#667781] truncate mt-1">
                                        {isPending ? "⚠️ ACTION REQUIRED" : lastMsg.content}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Chat Window */}
            <div className="flex-1 flex flex-col bg-[#efeae2]">
                {selectedSender ? (
                    <>
                        <header className="p-3 bg-[#f0f2f5] flex items-center border-b z-10 shadow-sm">
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold mr-3 text-xs">
                                {selectedSender.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="font-bold text-[#41525d] text-sm">{selectedSender}</span>
                        </header>

                        <div className="flex-1 p-6 overflow-y-auto space-y-4">
                            {chats[selectedSender].map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`p-3 rounded-xl shadow-sm max-w-md text-sm ${msg.role === 'user' ? 'bg-white rounded-tl-none' : 'bg-[#dcf8c6] rounded-tr-none'}`}>
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

                        <footer className="p-4 bg-[#f0f2f5] border-t flex flex-col space-y-3">
                            <textarea 
                                placeholder="Type a message..."
                                className="w-full p-3 rounded-xl border-none focus:ring-0 outline-none text-sm h-20 resize-none shadow-inner"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                            />
                            <div className="flex justify-end">
                                <button onClick={handleSend} className="bg-[#00a884] text-white px-8 py-2 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all">
                                    SEND
                                </button>
                            </div>
                        </footer>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-[#667781] opacity-40">
                        <svg className="w-20 h-20 mb-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.168L2.05 22l4.997-1.313C8.414 21.54 10.14 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.63 0-3.156-.444-4.46-1.214l-.32-.188-3.104.816.83-2.99-.207-.33C4.01 14.82 3.5 13.453 3.5 12c0-4.687 3.813-8.5 8.5-8.5s8.5 3.813 8.5 8.5-3.813 8.5-8.5 8.5z"/></svg>
                        <h3 className="text-xl font-medium uppercase tracking-widest">Select a Chat</h3>
                    </div>
                )}
            </div>
        </div>
    );
}
