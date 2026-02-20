"use client";

import React, { useState, useEffect, useCallback } from 'react';
import StatusCard from '../components/status-card';
import { getSystemStatus, loadDrafts } from '../lib/actions'; 
import { Message } from '@personal-ai/shared';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';

export default function DashboardPage() {
    const [status, setStatus] = useState({ whatsapp: { connected: false }, gmail: { authenticated: false } });
    const [qrData, setQrData] = useState<{qr: string, connected: boolean} | null>(null);
    const [counts, setCounts] = useState({ whatsapp: 0, gmail: 0 });

    const refreshData = useCallback(async () => {
        try {
            const [newStatus, drafts, qrRes] = await Promise.all([
                getSystemStatus(),
                loadDrafts(),
                fetch('http://localhost:3001/api/auth/qr').then(r => r.json())
            ]);
            setStatus(newStatus);
            setQrData(qrRes);
            setCounts({
                whatsapp: drafts.filter(d => d.source === 'whatsapp').length,
                gmail: drafts.filter(d => d.source === 'gmail').length
            });
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => {
        refreshData();
        const interval = setInterval(refreshData, 10000);
        return () => clearInterval(interval);
    }, [refreshData]);

    return (
        <div className="container mx-auto p-10 max-w-5xl min-h-screen bg-gray-50 font-sans">
            <header className="mb-12 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight uppercase">AI Employee Console</h1>
                    <p className="text-gray-500 font-medium">System Operator: Abdul Rafay</p>
                </div>
                <Link href="/briefing" className="bg-blue-600 text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all">
                    Daily Briefing
                </Link>
            </header>
            
            {/* WhatsApp Connection Guard */}
            {!status.whatsapp.connected && qrData?.qr && (
                <div className="bg-white p-8 rounded-[32px] border-4 border-dashed border-orange-200 mb-12 flex flex-col items-center text-center shadow-2xl shadow-orange-50">
                    <h2 className="text-xl font-black text-orange-600 mb-2 uppercase italic">WhatsApp Disconnected</h2>
                    <p className="text-gray-500 mb-6 text-sm font-medium">Scan this QR with your phone to start the AI Assistant</p>
                    <div className="bg-white p-4 rounded-3xl shadow-inner border border-gray-100">
                        <QRCodeSVG value={qrData.qr} size={250} />
                    </div>
                    <p className="mt-6 text-[10px] font-bold text-gray-300 uppercase tracking-widest">Waiting for session initialization...</p>
                </div>
            )}

            <StatusCard status={status} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                <Link href="/whatsapp">
                    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 hover:shadow-2xl transition-all group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 bg-green-50 rounded-2xl text-green-600">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.964 9.964 0 001.333 4.993L2 22l5.233-1.237a9.945 9.964 0 004.779 1.217h.004c5.505 0 9.988-4.478 9.989-9.984 0-2.669-1.037-5.176-2.922-7.062A9.925 9.925 0 0012.012 2z"/></svg>
                            </div>
                            <span className="text-5xl font-black text-gray-100 group-hover:text-green-50">{counts.whatsapp}</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800">WhatsApp</h3>
                        <p className="text-gray-400 font-medium mt-1">Pending Client Approvals</p>
                    </div>
                </Link>

                <Link href="/email">
                    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 hover:shadow-2xl transition-all group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 bg-blue-50 rounded-2xl text-blue-600">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                            </div>
                            <span className="text-5xl font-black text-gray-100 group-hover:text-blue-50">{counts.gmail}</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800">Gmail</h3>
                        <p className="text-gray-400 font-medium mt-1">New Job Inquiries</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}