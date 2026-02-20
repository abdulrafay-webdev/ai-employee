import React from 'react';

interface StatusCardProps {
    status: {
        whatsapp: { connected: boolean };
        gmail: { authenticated: boolean };
        // Worker field removed as we are in-memory now
    };
}

const StatusCard: React.FC<StatusCardProps> = ({ status }) => {
    const getStatusIndicator = (isActive: boolean) => (
        <span className={`h-2 w-2 rounded-full mr-2 ${isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`}></span>
    );

    // Provide safe defaults in case status is partially missing during load
    const whatsappActive = status?.whatsapp?.connected ?? false;
    const gmailActive = status?.gmail?.authenticated ?? false;

    return (
        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Live System Connectivity</h3>
            <div className="flex space-x-8">
                <div className="flex items-center group">
                    {getStatusIndicator(whatsappActive)}
                    <span className={`text-sm font-bold ${whatsappActive ? 'text-gray-700' : 'text-gray-400'}`}>WhatsApp Service</span>
                </div>
                <div className="flex items-center group">
                    {getStatusIndicator(gmailActive)}
                    <span className={`text-sm font-bold ${gmailActive ? 'text-gray-700' : 'text-gray-400'}`}>Gmail API</span>
                </div>
                <div className="flex items-center group">
                    <span className="h-2 w-2 rounded-full mr-2 bg-blue-500 shadow-[0_0_8px_calc(59,130,246,0.6)]"></span>
                    <span className="text-sm font-bold text-gray-700">AI Processor (In-Memory)</span>
                </div>
            </div>
        </div>
    );
};

export default StatusCard;