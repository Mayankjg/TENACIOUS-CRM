// frontend/app/manage-items/lead-source/LeadSourceModal.tsx

"use client";
import React from "react";

interface LeadSourceModalProps {
  showModal: boolean;
  newLeadName: string;
  setNewLeadName: (value: string) => void;
  handleAddLeadSource: () => void;
  setShowModal: (value: boolean) => void;
}

export default function LeadSourceModal({
  showModal,
  newLeadName,
  setNewLeadName,
  handleAddLeadSource,
  setShowModal,
}: LeadSourceModalProps) {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-3 sm:p-5">
      <style>
        {`
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-25px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>

      <div
        className="
          bg-white rounded-lg shadow-lg 
          w-full max-w-[90%] 
          
          sm:max-w-[450px] 
          md:max-w-[500px] 
          lg:max-w-[550px] 
          xl:max-w-[600px] 
          2xl:max-w-[650px] 
          
          animate-[slideDown_0.4s_ease-out]
        "
      >
        {/* Header */}
        <div className="border-b px-4 sm:px-5 py-3">
          <h3 className="text-center text-gray-800 font-semibold text-base sm:text-lg">
            Add Lead Source
          </h3>
        </div>

        {/* Input */}
        <div className="p-4 sm:p-5 bg-[#f0f2f5]">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lead Source
          </label>
          <input
            type="text"
            placeholder="Lead Source"
            value={newLeadName}
            onChange={(e) => setNewLeadName(e.target.value)}
            className="
              w-full border border-gray-300 rounded-md 
              px-3 py-2 
              text-sm sm:text-base 
              focus:outline-none focus:ring-1 focus:ring-sky-500 
              text-black
            "
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 px-4 sm:px-5 pb-4 mt-3">
          <button
            onClick={handleAddLeadSource}
            className="
              bg-sky-600 cursor-pointer hover:bg-sky-700 
              text-white text-sm sm:text-base 
              font-medium px-4 sm:px-5 py-2 rounded-md
            "
          >
            Save
          </button>
          <button
            onClick={() => setShowModal(false)}
            className="
              border cursor-pointer border-gray-300 hover:bg-gray-100 
              text-gray-700 text-sm sm:text-base 
              font-medium px-4 sm:px-5 py-2 rounded-md
            "
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}