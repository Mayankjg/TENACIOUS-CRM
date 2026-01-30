"use client";

export default function UnsubscribeUserList() {
    return (
        <div className="w-full min-h-screen bg-[#e5e7eb] py-6">
            <div className="max-w-[1480px] mx-auto px-4">
                <div className="bg-white shadow-md">
                    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
                        <h1 className="text-xl font-normal text-gray-500">
                            Unsubscribe <strong>List</strong>
                        </h1>
                    </div>
                    <div className="bg-white px-6 pb-6">
                        <div className="border border-gray-200 overflow-hidden rounded mt-6">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-[#dee2e6] border-b border-gray-200">
                                        <th className="py-3 px-4 text-left text-sm font-semibold text-[#6c757d] uppercase tracking-wider w-30">
                                            SR. NO.
                                        </th>
                                        <th className="py-3 px-4 text-left text-sm font-semibold text-[#6c757d] uppercase tracking-wider">
                                            EMAIL
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colSpan="2" className="py-5 text-center">
                                            <span className="text-red-500 text-base">No Record Found.</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}