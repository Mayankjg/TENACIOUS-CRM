import React, { useState, useEffect } from 'react';

interface AssignLeadsModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedLeadsCount: number;
    onAssign: (salespersonId: string, salespersonName: string) => void;
}

interface Salesperson {
    _id: string;
    name: string;
    email?: string;
}

export default function AssignLeadsModal({
    isOpen,
    onClose,
    selectedLeadsCount,
    onAssign
}: AssignLeadsModalProps) {
    const [selectedSalesperson, setSelectedSalesperson] = useState<string>("");
    const [salespeople, setSalespeople] = useState<Salesperson[]>([]);

    const API_BASE = "https://tt-crm-pro.onrender.com/api";                              

    useEffect(() => {
        if (isOpen) {
            fetchSalespeople();
        }
    }, [isOpen]);

    const fetchSalespeople = async () => {
        try {
            const response = await fetch(`${API_BASE}/salespersons/get-salespersons`);
            if (response.ok) {
                const data = await response.json();
                const mappedData = data.map((sp: any) => ({
                    _id: sp.id,
                    name: sp.username,
                    email: sp.email
                }));
                setSalespeople(mappedData || []);
            } else {
                console.error("Failed to fetch salespeople");
                setSalespeople([]);
            }
        } catch (error) {
            console.error("Error fetching salespeople:", error);
            setSalespeople([]);
        }
    };

    const handleAssign = () => {
        if (!selectedSalesperson) {
            alert("Please select a salesperson!");
            return;
        }

        const salesperson = salespeople.find(sp => sp._id === selectedSalesperson);
        const salespersonName = salesperson?.name || "";

        onAssign(selectedSalesperson, salespersonName);
        setSelectedSalesperson("");
        onClose();
    };

    const handleClose = () => {
        setSelectedSalesperson("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-50"
                onClick={handleClose}
            />

            {/* Modal Container */}
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-full items-start justify-center p-4 pt-10">
                    <div
                        className="bg-white rounded-lg shadow-xl w-200 max-w-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-normal text-gray-700">Assign Leads.</h2>
                            <button
                                onClick={handleClose}
                                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                                title="Close"
                            >
                                ×
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-8 bg-gray-100">
                            <div className="mb-6">
                                <label className="block text-sm text-gray-600 mb-2">
                                    Sales person
                                </label>

                                <select
                                    value={selectedSalesperson}
                                    onChange={(e) => setSelectedSalesperson(e.target.value)}
                                    className="w-80 bg-white border border-gray-300 rounded px-4 py-2.5 text-gray-700 focus:outline-none focus:border-black cursor-pointer"
                                >
                                    <option value="">Select Salesperson</option>
                                    {salespeople.map((person) => (
                                        <option key={person._id} value={person._id}>
                                            {person.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-white border-t border-gray-200 rounded-b-lg">
                            <button
                                onClick={handleAssign}
                                disabled={!selectedSalesperson}
                                className="px-6 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
                            >
                                Assign
                            </button>
                            <button
                                onClick={handleClose}
                                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}