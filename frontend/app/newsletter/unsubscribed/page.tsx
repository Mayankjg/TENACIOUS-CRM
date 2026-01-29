// frontend/app/newsletter/unsubscribe-user-list/page.tsx
"use client";

import { useState, useEffect } from "react";

interface UnsubscribedUser {
  id: string;
  email: string;
  // unsubscribedAt: string;
}

export default function UnsubscribeUserList() {
  const [unsubscribedUsers, setUnsubscribedUsers] = useState<UnsubscribedUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadUnsubscribedUsers = (): void => {
      try {
        const saved = localStorage.getItem('unsubscribedUsers');
        if (saved) {
          setUnsubscribedUsers(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error loading unsubscribed users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUnsubscribedUsers();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#e5e7eb] py-6 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

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
                    <th className="py-3 px-4 text-left text-sm font-semibold text-[#6c757d] uppercase tracking-wider w-[120px]">
                      SR. NO.
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-[#6c757d] uppercase tracking-wider">
                      EMAIL
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {unsubscribedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="py-5 text-center">
                        <span className="text-red-500 text-base">No Record Found.</span>
                      </td>
                    </tr>
                  ) : (
                    unsubscribedUsers.map((user, index) => (
                      <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-left text-sm text-gray-700">{index + 1}</td>
                        <td className="py-3 px-4 text-left text-sm text-gray-700">{user.email}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}