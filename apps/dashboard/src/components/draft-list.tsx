import React from 'react';
import { Message } from '@personal-ai/shared'; // Assuming Message type is shared

interface DraftsListProps {
    drafts: Message[];
    onEdit: (draft: Message) => void;
    onSend: (draftId: string) => void;
}

const DraftsList: React.FC<DraftsListProps> = ({ drafts, onEdit, onSend }) => {
    return (
        <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Pending Drafts</h3>
            {drafts.length === 0 ? (
                <p className="text-gray-500">No drafts pending review.</p>
            ) : (
                <ul className="space-y-2">
                    {drafts.map((draft) => (
                        <li key={draft.id} className="border-b pb-2 last:border-b-0 last:pb-0">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium">From: {draft.sender}</p>
                                    <p className="text-sm text-gray-600 truncate max-w-xs">{draft.content.substring(0, 100)}...</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button 
                                        onClick={() => onEdit(draft)} 
                                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => onSend(draft.id)} 
                                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm">
                                        Send
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default DraftsList;
