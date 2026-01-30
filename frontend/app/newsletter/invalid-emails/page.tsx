"use client";

import { useState, useEffect } from 'react';

interface InvalidEmail {
  id: number;
  email: string;
  user: string;
  type: string;
  date: string;
}

export default function InvalidEmailList() {
    const [invalidEmails, setInvalidEmails] = useState<InvalidEmail[]>([]);

    useEffect(() => {
        // Load invalid emails from localStorage if needed
        const loadInvalidEmails = () => {
            const stored = localStorage.getItem('invalidEmails');
            if (stored) {
                setInvalidEmails(JSON.parse(stored));
            }
        };
        loadInvalidEmails();
    }, []);

    return (
        <div className="bg-[#e5e7eb] p-0 sm:p-5 min-h-screen flex justify-center items-start font-['Segoe_UI',Tahoma,Geneva,Verdana,sans-serif]">
            <div className="bg-white w-full max-w-[1400px]">
                <div className="bg-white w-full px-4 sm:px-6 py-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h1 className="text-xl sm:text-2xl font-normal text-gray-700">
                            Invalid Email <strong>List</strong>
                        </h1>
                    </div>
                    <hr className="-mx-4 sm:-mx-6 border-t border-gray-300 mt-4 mb-0" />
                </div>

                <div className="w-full px-4 sm:px-6 py-6 pb-8">
                    <div className="mb-4">
                        <p className="text-sm text-red-600 font-semibold">
                            Note: After 7 Days Your List Record will be removed.
                        </p>
                    </div>

                    <div className="border border-gray-200 rounded overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-[#dee2e6] border-b border-gray-200">
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-[#6c757d] uppercase tracking-wider">
                                        SR NO.
                                    </th>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-[#6c757d] uppercase tracking-wider">
                                        EMAIL
                                    </th>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-[#6c757d] uppercase tracking-wider">
                                        USER
                                    </th>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-[#6c757d] uppercase tracking-wider">
                                        TYPE
                                    </th>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-[#6c757d] uppercase tracking-wider">
                                        DATE
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {invalidEmails.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center">
                                            <span className="text-red-500 text-base font-medium">No Record Found</span>
                                        </td>
                                    </tr>
                                ) : (
                                    invalidEmails.map((email, index) => (
                                        <tr key={email.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4 text-sm text-gray-700">{index + 1}</td>
                                            <td className="py-3 px-4 text-sm text-gray-700">{email.email}</td>
                                            <td className="py-3 px-4 text-sm text-gray-700">{email.user}</td>
                                            <td className="py-3 px-4 text-sm text-gray-700">{email.type}</td>
                                            <td className="py-3 px-4 text-sm text-gray-700">{email.date}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}