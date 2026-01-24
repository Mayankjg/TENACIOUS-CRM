// frontend/app/leads/leadpage/ActivityHistoryPage.js/comments/CommentsSection.tsx

"use client";
import { useState, useEffect, ChangeEvent } from "react";
import { Trash2 } from "lucide-react";
import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://tt-crm-pro.onrender.com";

interface Comment {
  _id: string;
  text: string;
  createdBy?: {
    username: string;
  };
  role?: string;
  createdAt: string;
}

interface CommentsSectionProps {
  leadId: string;
  currentComment?: string;
  onCommentUpdate?: (comment: string) => void;
}

interface CommentsResponse {
  success: boolean;
  data?: Comment[];
  message?: string;
}

export default function CommentsSection({
  leadId,
  currentComment,
  onCommentUpdate,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [inputComment, setInputComment] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (leadId) {
      fetchComments();
    }
  }, [leadId]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("ts-token");

      console.log("📡 Fetching comments for leadId:", leadId);

      const response = await axios.get<CommentsResponse>(
        `${API_URL}/api/comments/get-comments/${leadId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log(" Comments fetched:", response.data);

      if (response.data.success) {
        setComments(response.data.data || []);
      }
    } catch (error) {
      console.error("❌ Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addComment = async () => {
    if (!inputComment.trim()) {
      alert("Please enter a comment");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("ts-token");

      console.log("📝 Adding comment:", {
        leadId,
        text: inputComment.trim(),
      });

      const response = await axios.post<CommentsResponse>(
        `${API_URL}/api/comments/add-comment`,
        {
          leadId,
          text: inputComment.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Comment added:", response.data);

      if (response.data.success) {
        await fetchComments();
        onCommentUpdate?.(inputComment.trim());
        setInputComment("");
        alert("Comment added successfully!");
      }
    } catch (error: any) {
      console.error("❌ Error adding comment:", error);
      console.error("Response:", error.response?.data);
      alert(error.response?.data?.message || "Failed to add comment");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteComment = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

    try {
      const token = localStorage.getItem("ts-token");

      console.log("🗑️ Deleting comment:", id);

      const response = await axios.delete<CommentsResponse>(
        `${API_URL}/api/comments/delete-comment/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Comment deleted:", response.data);

      if (response.data.success) {
        await fetchComments();

        const remaining = comments.filter((c) => c._id !== id);
        onCommentUpdate?.(remaining[0]?.text || "");

        alert("Comment deleted successfully");
      }
    } catch (error: any) {
      console.error("❌ Error deleting comment:", error);
      alert(error.response?.data?.message || "Failed to delete comment");
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full bg-white">
      <div className="w-full">
        <div className="text-sm">
          <textarea
            className="w-full border border-gray-300 rounded p-3 h-32 outline-none text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Write your comment here..."
            value={inputComment}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setInputComment(e.target.value)
            }
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
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 text-center text-gray-500 border border-gray-300"
                    >
                      Loading comments...
                    </td>
                  </tr>
                ) : comments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 text-center text-red-500 font-medium border border-gray-300"
                    >
                      No comments yet
                    </td>
                  </tr>
                ) : (
                  comments.map((c) => (
                    <tr
                      key={c._id}
                      className="bg-white hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-4 text-gray-600 border border-gray-300">
                        {c.text}
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
            {isLoading ? (
              <div className="py-8 text-center text-gray-500 border border-gray-300 rounded">
                Loading comments...
              </div>
            ) : comments.length === 0 ? (
              <div className="py-8 text-center text-red-500 font-medium border border-gray-300 rounded">
                No comments yet
              </div>
            ) : (
              comments.map((c) => (
                <div
                  key={c._id}
                  className="border border-gray-300 bg-white rounded-lg overflow-hidden shadow-sm"
                >
                  <div className="border-b border-gray-200 p-4 text-sm text-gray-600">
                    {c.text}
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