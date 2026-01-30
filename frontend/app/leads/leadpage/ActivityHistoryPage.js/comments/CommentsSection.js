// frontend/app/leads/ActivityHistoryPage.js/comments/CommentsSection.js - MULTI-TENANT FIXED

"use client";

import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "react-toastify";

//  Import tenant-aware utilities
import { apiGet, apiPost, apiDelete, validateSession, getUser } from "@/utils/api";

export default function CommentsSection({ leadId, currentComment, onCommentUpdate }) {
  // Ensure comments is always initialized as an array
  const [comments, setComments] = useState([]);
  const [inputComment, setInputComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  //  Validate session and get user
  useEffect(() => {
    if (!validateSession()) {
      console.error("❌ Invalid session in CommentsSection");
      return;
    }

    if (leadId) {
      fetchComments();
    }
  }, [leadId]);

  //  Fetch comments with tenant filtering (done by backend)
  const fetchComments = async () => {
    if (!validateSession()) {
      console.error("❌ Cannot fetch comments - invalid session");
      return;
    }

    try {
      setIsLoading(true);

      console.log("📡 Fetching comments for leadId:", leadId);

      const result = await apiGet(`/api/comments/get-comments/${leadId}`);

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch comments");
      }

      console.log("✅ Comments fetched:", result.data?.length || 0);

      // Ensure we always set an array, even if result.data is null/undefined
      const commentsData = Array.isArray(result.data) ? result.data : [];
      setComments(commentsData);
    } catch (error) {
      console.error("❌ Error fetching comments:", error);
      toast.error(error.message || "Failed to load comments");
      // Set empty array on error to prevent map error
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  };

  //  Add comment with automatic tenant isolation
  const addComment = async () => {
    if (!inputComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    if (!validateSession()) {
      console.error("❌ Cannot add comment - invalid session");
      toast.error("Session expired. Please login again.");
      return;
    }

    setIsLoading(true);

    try {
      console.log("📝 Adding comment:", {
        leadId,
        text: inputComment.trim(),
      });

      const result = await apiPost("/api/comments/add-comment", {
        leadId,
        text: inputComment.trim(),
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to add comment");
      }

      console.log("✅ Comment added successfully");

      await fetchComments();
      onCommentUpdate?.(inputComment.trim());
      setInputComment("");
      toast.success("Comment added successfully!");
    } catch (error) {
      console.error("❌ Error adding comment:", error);
      toast.error(error.message || "Failed to add comment");
    } finally {
      setIsLoading(false);
    }
  };

  //  Delete comment with tenant validation
  const deleteComment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    if (!validateSession()) {
      console.error("❌ Cannot delete comment - invalid session");
      toast.error("Session expired. Please login again.");
      return;
    }

    try {
      console.log("🗑️ Deleting comment:", id);

      const result = await apiDelete(`/api/comments/delete-comment/${id}`);

      if (!result.success) {
        throw new Error(result.error || "Failed to delete comment");
      }

      console.log("✅ Comment deleted successfully");

      await fetchComments();

      // Ensure comments is array before filtering
      const commentsArray = Array.isArray(comments) ? comments : [];
      const remaining = commentsArray.filter((c) => c._id !== id);
      onCommentUpdate?.(remaining[0]?.text || "");

      toast.success("Comment deleted successfully");
    } catch (error) {
      console.error("❌ Error deleting comment:", error);
      toast.error(error.message || "Failed to delete comment");
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Ensure comments is always an array before rendering
  const safeComments = Array.isArray(comments) ? comments : [];

  return (
    <div className="w-full bg-white">
      <div className="w-full">
        <div className="text-sm">
          <textarea
            className="w-full border border-gray-300 rounded p-3 h-32 outline-none text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Write your comment here..."
            value={inputComment}
            onChange={(e) => setInputComment(e.target.value)}
            disabled={isLoading}
          ></textarea>

          <div className="flex gap-3 mt-4">
            <button
              onClick={addComment}
              disabled={isLoading || !inputComment.trim()}
              className="bg-[#00bcd4] hover:bg-[#00acc1] text-white px-8 py-2.5 rounded font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Adding..." : "Add"}
            </button>

            <button
              onClick={() => setInputComment("")}
              disabled={isLoading}
              className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-8 py-2.5 rounded font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          </div>

          <div className="border-t border-dashed border-gray-300 my-6"></div>

          {/* DESKTOP TABLE */}
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full text-sm border-collapse border border-gray-300">
              <thead>
                <tr className="bg-[#e8eef2]">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase text-xs tracking-wider border border-gray-300">
                    COMMENT
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase text-xs tracking-wider border border-gray-300">
                    CREATED BY
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase text-xs tracking-wider border border-gray-300">
                    DATE
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase text-xs tracking-wider border border-gray-300">
                    ACTION
                  </th>
                </tr>
              </thead>

              <tbody>
                {isLoading && safeComments.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-500 border border-gray-300">
                      Loading comments...
                    </td>
                  </tr>
                ) : safeComments.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-red-500 font-medium border border-gray-300">
                      No comments yet
                    </td>
                  </tr>
                ) : (
                  safeComments.map((c) => (
                    <tr key={c._id} className="bg-white hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 text-gray-600 border border-gray-300">
                        {c.text || "No comment text"}
                      </td>
                      <td className="px-4 py-4 text-gray-600 border border-gray-300">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {c.createdBy?.username || "Unknown"}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({c.role || "user"})
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[#00bcd4] font-medium border border-gray-300">
                        {formatDate(c.createdAt)}
                      </td>
                      <td className="px-4 py-4 border border-gray-300">
                        <button
                          onClick={() => deleteComment(c._id)}
                          className="text-gray-500 hover:text-red-600 transition-colors"
                          title="Delete comment"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="md:hidden space-y-3">
            {isLoading && safeComments.length === 0 ? (
              <div className="py-8 text-center text-gray-500 border border-gray-300 rounded">
                Loading comments...
              </div>
            ) : safeComments.length === 0 ? (
              <div className="py-8 text-center text-red-500 font-medium border border-gray-300 rounded">
                No comments yet
              </div>
            ) : (
              safeComments.map((c) => (
                <div key={c._id} className="border border-gray-300 bg-white rounded-lg overflow-hidden shadow-sm">
                  <div className="border-b border-gray-200 p-4 text-sm text-gray-600">
                    {c.text || "No comment text"}
                  </div>
                  <div className="border-b border-gray-200 p-4 text-sm">
                    <span className="font-medium text-gray-700">
                      {c.createdBy?.username || "Unknown"}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({c.role || "user"})
                    </span>
                  </div>
                  <div className="border-b border-gray-200 p-4 text-sm font-semibold text-[#00bcd4]">
                    {formatDate(c.createdAt)}
                  </div>
                  <div className="p-4 flex justify-start">
                    <button
                      className="text-gray-500 hover:text-red-600 transition-colors"
                      onClick={() => deleteComment(c._id)}
                      title="Delete comment"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}