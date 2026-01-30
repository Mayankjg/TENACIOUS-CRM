// frontend/app/newsletter/from-email-list/page.tsx
"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { Trash2 } from "lucide-react";

interface EmailItem {
    id: string;
    email: string;
}

interface EmailRowProps {
    item: EmailItem;
    index: number;
}

export default function FromEmailList() {
    const [search, setSearch] = useState<string>("");
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [selectAll, setSelectAll] = useState<boolean>(false);
    const [emails, setEmails] = useState<EmailItem[]>([]);
    const [filteredEmails, setFilteredEmails] = useState<EmailItem[]>([]);

    useEffect(() => {
        loadEmails();
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'fromEmails') loadEmails();
        };
        window.addEventListener('storage', handleStorageChange);
        const interval = setInterval(loadEmails, 1000);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        setFilteredEmails(search.trim() === '' ? emails :
            emails.filter(email => email.email.toLowerCase().includes(search.toLowerCase())));
    }, [search, emails]);

    const loadEmails = (): void => {
        const stored = localStorage.getItem("fromEmails");
        setEmails(stored ? JSON.parse(stored) : []);
    };

    const saveEmails = (updatedEmails: EmailItem[]): void => {
        setEmails(updatedEmails);
        localStorage.setItem("fromEmails", JSON.stringify(updatedEmails));
    };

    const toggleSelectAll = (): void => {
        setSelectedRows(selectAll ? [] : filteredEmails.map(item => item.id));
        setSelectAll(!selectAll);
    };

    const toggleSelectRow = (id: string): void => {
        setSelectedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
        setSelectAll(false);
    };

    const deleteEmail = (id: string): void => {
        if (confirm('Are you sure you want to delete this email?')) {
            saveEmails(emails.filter(email => email.id !== id));
            setSelectedRows(prev => prev.filter(rowId => rowId !== id));
        }
    };

    const deleteSelected = (): void => {
        if (selectedRows.length === 0) return alert('Please select at least one email to delete');
        if (confirm(`Delete ${selectedRows.length} email(s)?`)) {
            saveEmails(emails.filter(email => !selectedRows.includes(email.id)));
            setSelectedRows([]);
            setSelectAll(false);
        }
    };

    const EmailRow = ({ item, index }: EmailRowProps) => (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="py-3 px-4 border-r border-b border-gray-300">
                <input type="checkbox" className="w-4 h-4 cursor-pointer"
                    checked={selectedRows.includes(item.id)} onChange={() => toggleSelectRow(item.id)} />
            </td>
            <td className="py-3 px-4 text-sm text-gray-700 border-r border-b border-gray-300">{index + 1}</td>
            <td className="py-3 px-4 text-sm text-gray-700 border-r border-b border-gray-300">{item.email}</td>
            <td className="py-3 px-4 text-right border-b border-gray-300">
                <button className="text-gray-700 hover:text-red-600 transition-colors"
                    onClick={() => deleteEmail(item.id)} title="Delete email">
                    <Trash2 size={18} />
                </button>
            </td>
        </tr>
    );

    const MobileCard = ({ item, index }: EmailRowProps) => (
        <div className="bg-white border border-gray-300 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 cursor-pointer mt-1"
                        checked={selectedRows.includes(item.id)} onChange={() => toggleSelectRow(item.id)} />
                    <div>
                        <div className="text-xs text-gray-500 uppercase font-semibold">SR NO:</div>
                        <div className="text-sm text-gray-700 font-medium">{index + 1}</div>
                    </div>
                </label>
                <button className="text-gray-700 hover:text-red-600 p-2 transition-colors"
                    onClick={() => deleteEmail(item.id)} title="Delete email">
                    <Trash2 size={20} />
                </button>
            </div>
            <div className="pl-8">
                <div className="text-xs text-gray-500 uppercase font-semibold">Email:</div>
                <div className="text-sm text-gray-700 break-all">{item.email}</div>
            </div>
        </div>
    );

    return (
        <div className="bg-[#e5e7eb] p-0 sm:p-5 min-h-screen flex justify-center items-start font-['Segoe_UI',Tahoma,Geneva,Verdana,sans-serif]">
            <div className="bg-white w-full max-w-[1400px]">
                <div className="bg-white w-full px-4 sm:px-6 py-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h1 className="text-xl sm:text-2xl font-normal text-gray-700">
                            From Email <strong>List</strong>
                        </h1>
                    </div>
                    <hr className="-mx-4 sm:-mx-6 border-t border-gray-300 mt-4 mb-0" />
                </div>

                <div className="w-full px-4 sm:px-6 py-6 pb-8">
                    <div className="flex flex-col sm:flex-row justify-end gap-3 mb-6">
                        <input type="text" placeholder="Display Name/Email"
                            className="border border-gray-300 rounded px-4 py-2 w-full sm:w-50 text-sm text-gray-700 focus:outline-none focus:border-gray-400"
                            value={search} onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} />
                        <button onClick={() => console.log('Searching:', search)}
                            className="bg-[#0ea5e9] text-white px-4 py-2 rounded text-sm hover:bg-[#0284c7] w-full sm:w-auto transition-colors">
                            Search
                        </button>
                    </div>

                    <div className="hidden md:block border border-gray-200 overflow-x-auto rounded">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-[#dee2e6]">
                                    <th className="py-3 px-4 text-left w-12 border-r border-b border-gray-300">
                                        <input type="checkbox" className="w-4 h-4 cursor-pointer"
                                            checked={selectAll && filteredEmails.length > 0} onChange={toggleSelectAll} />
                                    </th>
                                    {['SR. NO.', 'EMAIL', 'DELETE'].map((h, i) => (
                                        <th key={h} className={`py-3 px-4 text-${i === 2 ? 'right' : 'left'} text-xs font-semibold text-[#6c757d] uppercase tracking-wider ${i < 2 ? 'border-r' : ''} border-b border-gray-300 ${i === 0 ? 'w-24' : ''}`}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {filteredEmails.length === 0 ? (
                                    <tr><td colSpan={4} className="py-8 px-4 text-center text-gray-500 border-b border-gray-300">
                                        {search ? 'No emails found matching your search' : 'No emails added yet'}
                                    </td></tr>
                                ) : filteredEmails.map((item, index) => <EmailRow key={item.id} item={item} index={index} />)}
                            </tbody>
                        </table>
                    </div>

                    <div className="md:hidden space-y-4">
                        <div className="bg-[#dee2e6] border border-gray-300 rounded-lg p-4">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" className="w-5 h-5 cursor-pointer"
                                    checked={selectAll && filteredEmails.length > 0} onChange={toggleSelectAll} />
                                <span className="text-sm font-semibold text-[#6c757d] uppercase tracking-wider">SELECT ALL</span>
                            </label>
                        </div>
                        {filteredEmails.length === 0 ? (
                            <div className="bg-white border border-gray-300 rounded-lg p-8 text-center">
                                <p className="text-gray-500">{search ? 'No emails found matching your search' : 'No emails added yet'}</p>
                            </div>
                        ) : filteredEmails.map((item, index) => <MobileCard key={item.id} item={item} index={index} />)}
                    </div>

                    <div className="mt-6">
                        <button className="bg-red-500 text-white px-6 py-2 rounded text-sm hover:bg-red-600 w-full sm:w-auto transition-colors cursor-pointer"
                            onClick={deleteSelected} disabled={selectedRows.length === 0}>
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}