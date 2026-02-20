"use client";

import React, { useState, useEffect, useCallback } from 'react';
import StatusCard from '../components/status-card';
import { getSystemStatus, loadDrafts } from '../lib/actions'; 
import { Message } from '@personal-ai/shared';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { fetchBusyReason, updateBusyReason, fetchQR } from '../lib/api';

export default function DashboardPage() {
    const [status, setStatus] = useState({ whatsapp: { connected: false }, gmail: { authenticated: false } });
    const [qrData, setQrData] = useState<{qr: string, connected: boolean} | null>(null);
    const [counts, setCounts] = useState({ whatsapp: 0, gmail: 0 });
    const [reason, setReason] = useState("");
    const [isSaving, setIsAuthorized] = useState(false);

    const refreshData = useCallback(async () => {
        try {
            const [newStatus, drafts, qrRes, configRes] = await Promise.all([
                getSystemStatus(),
                loadDrafts(),
                fetchQR(),
                fetchBusyReason()
            ]);
            setStatus(newStatus);
            setQrData(qrRes);
            setReason(configRes.reason);
            setCounts({
                whatsapp: drafts.filter(d => d.source === 'whatsapp').length,
                gmail: drafts.filter(d => d.source === 'gmail').length
            });
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => {
        refreshData();
        const interval = setInterval(refreshData, 15000);
        return () => clearInterval(interval);
    }, [refreshData]);

    const saveReason = async () => {
        setIsAuthorized(true);
        try {
            await updateBusyReason(reason);
            alert("Updated!");
        } catch (e) { alert("Failed"); }
        finally { setIsAuthorized(false); }
    };

    return (
        <div className="container mx-auto px-4 py-6 md:p-10 max-w-5xl min-h-screen bg-gray-50 font-sans">
            <header className="mb-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-center md:text-left">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight uppercase">AI EMPLOYEE</h1>
                    <p className="text-sm text-gray-500 font-medium italic">Operator: Abdul Rafay</p>
                </div>
                <Link href="/briefing" className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all text-center">
                    Daily Briefing
                </Link>
            </header>

            <StatusCard status={status} />

            <div className="mt-8 bg-white p-6 md:p-8 rounded-[24px] md:rounded-[32px] shadow-sm border border-gray-100">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Live AI Context</h3>
                <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
                    <input 
                        type="text" 
                        placeholder="What are you doing now?"
                        className="flex-1 p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700 shadow-inner text-sm"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                    <button 
                        onClick={saveReason}
                        disabled={isSaving}
                        className="bg-black text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 w-full md:w-auto"
                    >
                        {isSaving ? "Updating..." : "Set Status"}
                    </button>
                </div>
            </div>
            
            {!status.whatsapp.connected && qrData?.qr && (
                <div className="mt-8 bg-white p-6 md:p-8 rounded-[24px] border-4 border-dashed border-orange-200 flex flex-col items-center text-center shadow-xl">
                    <h2 className="text-lg font-black text-orange-600 mb-4 uppercase">WhatsApp Required</h2>
                    <div className="bg-white p-2 rounded-2xl shadow-inner border border-gray-50">
                        <QRCodeSVG value={qrData.qr} size={200} />
                    </div>
                    <p className="mt-4 text-[9px] font-bold text-gray-300 uppercase tracking-widest leading-relaxed">Scan with linked devices to authorize Saim</p>
                </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 mt-8">
                <Link href="/whatsapp">
                    <div className="bg-white p-6 md:p-8 rounded-[24px] md:rounded-[32px] shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
                        <div className="flex justify-between items-start mb-4 md:mb-6">
                            <div className="p-3 md:p-4 bg-green-50 rounded-2xl text-green-600">
                                <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.964 9.964 0 001.333 4.993L2 22l5.233-1.237a9.945 9.964 0 004.779 1.217h.004c5.505 0 9.988-4.478 9.989-9.984 0-2.669-1.037-5.176-2.922-7.062A9.925 9.925 0 0012.012 2z"/></svg>
                            </div>
                            <span className="text-4xl md:text-5xl font-black text-gray-100 group-hover:text-green-50">{counts.whatsapp}</span>
                        </div>
                        <h3 className="text-lg md:text-2xl font-bold text-gray-800 tracking-tight">WhatsApp</h3>
                        <p className="text-gray-400 font-medium mt-1 text-xs md:text-sm">Approvals</p>
                    </div>
                </Link>

                <Link href="/email">
                    <div className="bg-white p-6 md:p-8 rounded-[24px] md:rounded-[32px] shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
                        <div className="flex justify-between items-start mb-4 md:mb-6">
                            <div className="p-3 md:p-4 bg-blue-50 rounded-2xl text-blue-600">
                                <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                            </div>
                            <span className="text-4xl md:text-5xl font-black text-gray-100 group-hover:text-blue-50">{counts.gmail}</span>
                        </div>
                        <h3 className="text-lg md:text-2xl font-bold text-gray-800 tracking-tight">Emails</h3>
                        <p className="text-gray-400 font-medium mt-1 text-xs md:text-sm">Job Inquiries</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}