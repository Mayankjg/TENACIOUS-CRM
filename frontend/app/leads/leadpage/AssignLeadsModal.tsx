// frontend/app/leads/AssignLeadsModal.tsx
// MULTI-TENANT AWARE - Shows only salespersons from current tenant

"use client";

import { useState, useEffect } from 'react';
import { apiGet } from "@/utils/api";

interface AssignLeadsModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedLeadsCount: number;
    onAssign: (salespersonId: string, salespersonName: string) => void;
}

interface Salesperson {
    id: string | number;
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    designation: string;
    contact: string;
    profileImage?: string;
}

export default function AssignLeadsModal({
    isOpen,
    onClose,
    selectedLeadsCount,
    onAssign
}: AssignLeadsModalProps) {
    const [selectedSalesperson, setSelectedSalesperson] = useState<string>("");
    const [salespeople, setSalespeople] = useState<Salesperson[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (isOpen) {
            fetchSalespeople();
        }
    }, [isOpen]);

    // Fetch salespeople using tenant-aware API (same as SalespersonCard)
    const fetchSalespeople = async () => {
        try {
            setLoading(true);
            console.log("🔄 Fetching salespersons for assign modal...");

            const result = await apiGet("/api/salespersons/get-salespersons");

            if (!result.success) {
                throw new Error(result.error || "Failed to fetch salespersons");
            }

            console.log("✅ Fetched salespersons for assignment:", result.data?.length || 0);

            setSalespeople(result.data || []);
        } catch (error: any) {
            console.error("❌ Error fetching salespeople:", error);
            alert(error.message || "Failed to load salespeople");
            setSalespeople([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = () => {
        if (!selectedSalesperson) {
            alert("Please select a salesperson!");
            return;
        }

        const salesperson = salespeople.find(sp => String(sp.id) === selectedSalesperson);
        const salespersonName = salesperson?.username || "";

        console.log("📌 Assigning leads to:", salespersonName, "(ID:", selectedSalesperson, ")");

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
                            <h2 className="text-xl font-normal text-gray-700">
                                Assign Leads
                                {selectedLeadsCount > 0 && (
                                    <span className="ml-2 text-sm font-semibold text-teal-600">
                                        ({selectedLeadsCount} selected)
                                    </span>
                                )}
                            </h2>
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
                                    Sales Person
                                </label>

                                <select
                                    value={selectedSalesperson}
                                    onChange={(e) => setSelectedSalesperson(e.target.value)}
                                    className="w-full bg-white border border-gray-300 rounded px-4 py-2.5 text-gray-700 focus:outline-none focus:border-black cursor-pointer"
                                    disabled={loading || salespeople.length === 0}
                                >
                                    <option value="">Select Salesperson</option>
                                    {salespeople.map((person) => (
                                        <option key={person.id} value={String(person.id)}>
                                            {person.username}
                                        </option>
                                    ))}
                                </select>

                                {salespeople.length === 0 && !loading && (
                                    <p className="mt-2 text-sm text-red-500">
                                        No salespersons available. Please add salespersons first.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-white border-t border-gray-200 rounded-b-lg">
                            <button
                                onClick={handleAssign}
                                disabled={!selectedSalesperson || loading}
                                className={`px-6 py-2 rounded transition-colors ${!selectedSalesperson || loading
                                        ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                                        : 'bg-teal-600 text-white hover:bg-teal-700 cursor-pointer'
                                    }`}
                            >
                                Assign
                            </button>
                            <button
                                onClick={handleClose}
                                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors cursor-pointer"
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