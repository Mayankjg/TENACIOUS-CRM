// frontend/app/leadpage/ActivityHistoryPage/ActivityHistory.tsx

"use client";

import { useState } from "react";
import CommentsSection from "./comments/CommentsSection";
import EmailSection from "./email/EmailSection";

type TabType = "comments" | "email";

interface ActivityHistoryProps {
  leadId: string;
  leadEmail?: string;
  currentComment?: string;
  onCommentUpdate?: (comment: string) => void;
}

export default function ActivityHistory({
  leadId,
  leadEmail,
  currentComment,
  onCommentUpdate,
}: ActivityHistoryProps) {
  const [activeTab, setActiveTab] = useState<TabType>("comments");

  return (
    <div className="bg-white w-full text-black p-4 sm:p-6 md:p-8 lg:p-10 xl:p-6">
      <h2 className="text-[18px] md:text-[20px] font-semibold mb-3">
        Activity <span className="text-gray-500">history</span>
      </h2>

      <div className="border-[1px] border-gray-600 bg-white">
        <div className="flex bg-[#d7dee3] border-b border-t border-gray-300 flex-wrap h-11">
          <button
            onClick={() => setActiveTab("comments")}
            className={`px-4 py-2 text-sm border-r border-gray-300
              w-1/2 sm:w-auto text-center transition-colors
              ${
                activeTab === "comments"
                  ? "bg-white font-medium text-gray-900"
                  : "bg-[#d7dee3] text-gray-600 hover:bg-gray-200"
              }
            `}
          >
            Comments
          </button>

          <button
            onClick={() => setActiveTab("email")}
            className={`px-4 py-2 text-sm border-r border-gray-300
              w-1/2 sm:w-auto text-center transition-colors
              ${
                activeTab === "email"
                  ? "bg-white font-medium text-gray-900"
                  : "bg-[#d7dee3] text-gray-600 hover:bg-gray-200"
              }
            `}
          >
            Send email
          </button>
        </div>

        <div className="p-4 sm:p-5 max-h-[600px] overflow-y-auto">
          {activeTab === "comments" ? (
            <CommentsSection
              leadId={leadId}
              currentComment={currentComment}
              onCommentUpdate={onCommentUpdate}
            />
          ) : (
            <EmailSection leadId={leadId} leadEmail={leadEmail} />
          )}
        </div>
      </div>
    </div>
  );
}