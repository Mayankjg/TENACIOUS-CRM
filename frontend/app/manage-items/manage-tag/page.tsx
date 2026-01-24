"use client";

import { useState, useEffect, useRef, FormEvent, ChangeEvent } from "react";
import axios, { AxiosError } from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEdit, FaTrash, FaPlus, FaTimes, FaTags } from "react-icons/fa";

interface Tag {
  _id: string;
  name: string;
  color: string;
  description?: string;
  createdAt: string;
}

interface FormData {
  name: string;
  color: string;
  description: string;
}

interface DeleteResponse {
  details?: {
    tagName: string;
    totalLeadsUpdated: number;
  };
}

export default function ManageTagsPage() {
  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://tt-crm-pro.onrender.com";

  const [tags, setTags] = useState<Tag[]>([]);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    color: "#3B82F6",
    description: "",
  });
  const [loading, setLoading] = useState<boolean>(false);

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async (): Promise<void> => {
    try {
      setLoading(true);
      const res = await axios.get<Tag[]>(
        `${API_BASE}/api/manage-items/tags/get-tags`
      );
      setTags(res.data || []);
    } catch (error) {
      toast.error("Failed to fetch tags");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Tag name is required");
      return;
    }

    try {
      setLoading(true);

      if (editingTag) {
        await axios.put(
          `${API_BASE}/api/manage-items/tags/update-tag/${editingTag._id}`,
          formData
        );
        toast.success("Tag updated successfully");
      } else {
        await axios.post(
          `${API_BASE}/api/manage-items/tags/create-tag`,
          formData
        );
        toast.success("Tag created successfully");
      }

      setFormData({ name: "", color: "#3B82F6", description: "" });
      setEditingTag(null);
      fetchTags();
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(
        axiosError.response?.data?.message || "Failed to save tag"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tag: Tag): void => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      color: tag.color || "#3B82F6",
      description: tag.description || "",
    });

    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const handleDelete = async (id: string): Promise<void> => {
    const tag = tags.find((t) => t._id === id);

    if (
      !confirm(
        `Are you sure you want to delete tag "${tag?.name}"?\n\n` +
          `⚠️ This will also remove this tag from all existing leads.`
      )
    )
      return;

    try {
      setLoading(true);
      const res = await axios.delete<DeleteResponse>(
        `${API_BASE}/api/manage-items/tags/delete-tag/${id}`
      );

      const details = res.data?.details;
      if (details && details.totalLeadsUpdated > 0) {
        toast.success(
          `Tag "${details.tagName}" removed from ${details.totalLeadsUpdated} lead(s)`
        );
      } else {
        toast.success("Tag deleted successfully");
      }

      fetchTags();
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(
        axiosError.response?.data?.message || "Failed to delete tag"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (): void => {
    setEditingTag(null);
    setFormData({ name: "", color: "#3B82F6", description: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-3 sm:p-6 lg:p-8">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
        <div className="bg-blue-600 text-white p-2 sm:p-3 rounded-xl shadow-lg">
          <FaTags size={18} className="sm:hidden" />
          <FaTags size={22} className="hidden sm:block" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Manage <span className="text-blue-600">Tags</span>
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm">
            Create, edit and manage lead tags
          </p>
        </div>
      </div>

      {/* Create / Edit Form */}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-10 text-black"
      >
        <h2 className="text-base sm:text-lg font-semibold mb-4 sm:mb-5 flex items-center gap-2">
          {editingTag ? <FaEdit /> : <FaPlus />}
          {editingTag ? "Edit Tag" : "Create New Tag"}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-5 sm:mb-6">
          {/* Tag Name */}
          <input
            type="text"
            placeholder="Tag name *"
            value={formData.name}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="border rounded-xl px-4 py-2.5 sm:py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full"
            required
          />

          {/* Color Picker */}
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={formData.color}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, color: e.target.value })
              }
              className="w-14 sm:w-16 h-10 sm:h-12 rounded-lg border cursor-pointer"
            />
            <span className="text-xs sm:text-sm text-gray-600">
              {formData.color}
            </span>
          </div>

          {/* Description */}
          <input
            type="text"
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="border rounded-xl px-4 py-2.5 sm:py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full sm:col-span-2 lg:col-span-1"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white px-5 sm:px-6 py-2.5 sm:py-2 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
          >
            {editingTag ? <FaEdit /> : <FaPlus />}
            {editingTag ? "Update Tag" : "Create Tag"}
          </button>

          {editingTag && (
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-300 cursor-pointer hover:bg-gray-400 text-gray-700 px-5 sm:px-6 py-2.5 sm:py-2 rounded-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <FaTimes /> Cancel
            </button>
          )}
        </div>
      </form>

      {/* Tags Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800">
            All Tags <span className="text-gray-400">({tags.length})</span>
          </h2>
        </div>

        {tags.length > 0 ? (
          <>
            {/* Mobile Card View */}
            <div className="block sm:hidden">
              {tags.map((tag) => (
                <div
                  key={tag._id}
                  className="border-b border-gray-200 p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <span
                        className="w-8 h-8 rounded-full inline-block border border-gray-300 flex-shrink-0"
                        style={{ backgroundColor: tag.color }}
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-gray-800 text-sm truncate">
                          {tag.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(tag.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {tag.description && (
                    <p className="text-xs text-gray-600 mb-3">
                      {tag.description}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(tag)}
                      className="flex-1 cursor-pointer bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg transition text-sm flex items-center justify-center gap-1"
                    >
                      <FaEdit size={12} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(tag._id)}
                      className="flex-1 cursor-pointer  bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition text-sm flex items-center justify-center gap-1"
                    >
                      <FaTrash size={12} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full text-sm text-black">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs border-b border-gray-200">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left">Color</th>
                    <th className="px-4 lg:px-6 py-3 text-left">Tag Name</th>
                    <th className="px-4 lg:px-6 py-3 text-left hidden md:table-cell">Description</th>
                    <th className="px-4 lg:px-6 py-3 text-left hidden lg:table-cell">Created</th>
                    <th className="px-4 lg:px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {tags.map((tag) => (
                    <tr
                      key={tag._id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-4 lg:px-6 py-4">
                        <span
                          className="w-6 h-6 rounded-full inline-block border border-gray-300"
                          style={{ backgroundColor: tag.color }}
                        />
                      </td>

                      <td className="px-4 lg:px-6 py-4 font-medium text-gray-800">
                        {tag.name}
                      </td>

                      <td className="px-4 lg:px-6 py-4 text-gray-600 hidden md:table-cell">
                        {tag.description || (
                          <span className="italic text-gray-400">—</span>
                        )}
                      </td>

                      <td className="px-4 lg:px-6 py-4 text-gray-500 hidden lg:table-cell">
                        {new Date(tag.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-4 lg:px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(tag)}
                            className="bg-yellow-500 cursor-pointer hover:bg-yellow-600 text-white p-2 rounded-lg transition"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(tag._id)}
                            className="bg-red-500 cursor-pointer hover:bg-red-600 text-white p-2 rounded-lg transition"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="text-center py-10 text-gray-500 text-sm">
            No tags found
          </div>
        )}
      </div>
    </div>
  );
}