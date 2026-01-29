// TagModal.tsx
"use client";

import React, { ChangeEvent } from "react";

interface NewTag {
  name: string;
  color: string;
  description: string;
}

interface TagModalProps {
  showModal: boolean;
  setShowModal: (value: boolean) => void;
  newTag: NewTag;
  setNewTag: (tag: NewTag) => void;
  handleAddTag: () => void;
}

const TagModal: React.FC<TagModalProps> = ({
  showModal,
  setShowModal,
  newTag,
  setNewTag,
  handleAddTag,
}) => {
  if (!showModal) return null;

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setNewTag({ ...newTag, name: e.target.value });
  };

  const handleColorChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setNewTag({ ...newTag, color: e.target.value });
  };

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setNewTag({ ...newTag, description: e.target.value });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 text-black">
      {/* Modal Card */}
      <div className="bg-white rounded-2xl shadow-2xl w-[420px] max-w-[92%] p-6 animate-fadeIn">
        {/* Header */}
        <div className="mb-5">
          <h3 className="text-xl font-semibold text-gray-800">Add New Tag</h3>
          <p className="text-sm text-gray-500 mt-1">
            Create a tag to organize leads efficiently
          </p>
        </div>

        {/* Tag Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tag Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={newTag.name}
            onChange={handleNameChange}
            placeholder="e.g. Outbound Marketing"
            className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       focus:border-blue-500 transition"
            required
          />
        </div>

        {/* Color Picker */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tag Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={newTag.color}
              onChange={handleColorChange}
              className="h-10 w-14 rounded cursor-pointer border"
            />
            <span className="text-xs text-gray-500">
              Choose a color for visual identification
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={newTag.description}
            onChange={handleDescriptionChange}
            placeholder="Optional short description about this tag"
            className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       focus:border-blue-500 transition resize-none"
            rows={3}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShowModal(false)}
            className="px-4 cursor-pointer py-2 rounded-lg text-sm font-medium
                       bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleAddTag}
            className="px-5 cursor-pointer py-2 rounded-lg text-sm font-semibold text-white
                       bg-blue-600 hover:bg-blue-700 shadow-md
                       transition active:scale-95"
          >
            Add Tag
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagModal;