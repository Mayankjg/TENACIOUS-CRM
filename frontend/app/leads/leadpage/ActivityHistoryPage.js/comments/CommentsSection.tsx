// frontend/app/leads/ActivityHistoryPage.js/comments/CommentsSection.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "react-toastify";

// ============================================================
// TYPES
// ============================================================
interface Comment {
  _id: string;
  text: string;
  createdBy: {
    username: string;
  };
  role: string;
  createdAt: string;
}

interface CommentsSectionProps {
  leadId: string;
  currentComment?: string;
  onCommentUpdate?: (comment: string) => void;
}

interface ApiResponse {
  status: number;
  body: {
    data?: Comment[];
    message?: string;
  };
}

// ============================================================
// RAW FETCH HELPERS - bypasses any apiPost/apiGet wrapper issues
// ============================================================
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://two9-01-2026.onrender.com";

async function rawGet(path: string): Promise<ApiResponse> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  const json = await res.json();
  return { status: res.status, body: json };
}

async function rawPost(path: string, payload: any): Promise<ApiResponse> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  return { status: res.status, body: json };
}

async function rawDelete(path: string): Promise<ApiResponse> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  const json = await res.json();
  return { status: res.status, body: json };
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function CommentsSection({ leadId, currentComment, onCommentUpdate }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [inputComment, setInputComment] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const mountedRef = useRef<boolean>(true);

  // ---- mount/unmount tracking ----
  useEffect(() => {
    mountedRef.current = true;
    console.log("[CommentsSection] MOUNTED | leadId =", leadId);
    return () => {
      mountedRef.current = false;
      console.log("❌ [CommentsSection] UNMOUNTED");
    };
  }, []);

  // ---- initial fetch when leadId available ----
  useEffect(() => {
    if (!leadId) {
      console.warn("⚠️ [CommentsSection] leadId is falsy, skipping fetch");
      return;
    }
    console.log("🔄 [CommentsSection] useEffect → calling doFetch | leadId =", leadId);
    doFetch();
  }, [leadId]);

  // ============================================================
  // FETCH
  // ============================================================
  async function doFetch(): Promise<void> {
    console.log("📡 [FETCH] START | leadId =", leadId);
    setIsLoading(true);

    try {
      const { status, body } = await rawGet(`/api/comments/get-comments/${leadId}`);

      console.log("📡 [FETCH] status =", status);
      console.log("📡 [FETCH] body =", JSON.stringify(body));

      if (!mountedRef.current) {
        console.log("📡 [FETCH] component unmounted, skipping setState");
        return;
      }

      if (status !== 200) {
        console.error("📡 [FETCH] ERROR status:", status, "| message:", body?.message);
        toast.error(body?.message || "Failed to fetch comments");
        setComments([]);
        return;
      }

      const arr = Array.isArray(body?.data) ? body.data : [];
      console.log("📡 [FETCH] SUCCESS | count =", arr.length);
      setComments(arr);
    } catch (err: any) {
      console.error("📡 [FETCH] EXCEPTION:", err.message);
      if (mountedRef.current) {
        toast.error("Network error - failed to load comments");
        setComments([]);
      }
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }

  // ============================================================
  // ADD COMMENT
  // ============================================================
  async function handleAdd(): Promise<void> {
    const text = inputComment.trim();
    if (!text) {
      toast.error("Please enter a comment");
      return;
    }

    console.log("📝 [ADD] START | leadId =", leadId, "| text =", text);
    setIsLoading(true);

    try {
      const { status, body } = await rawPost("/api/comments/add-comment", {
        leadId,
        text,
      });

      console.log("📝 [ADD] status =", status);
      console.log("📝 [ADD] body =", JSON.stringify(body));

      if (!mountedRef.current) return;

      if (status !== 201) {
        console.error("📝 [ADD] FAILED | status:", status, "| message:", body?.message);
        toast.error(body?.message || "Failed to add comment");
        return;
      }

      // 1. Clear input immediately
      setInputComment("");

      // 2. Notify parent (updates lead comment field)
      onCommentUpdate?.(text);

      // 3. OPTIMISTIC UPDATE — add comment to top of list RIGHT NOW
      //    This makes it visible instantly without waiting for refetch
      if (body?.data) {
        console.log("📝 [ADD] Optimistic insert | _id =", (body.data as any)._id);
        setComments((prev) => [body.data as any, ...prev]);
      } else {
        // Fallback: backend didn't return data, create a local placeholder
        console.log("📝 [ADD] No data in response, creating local placeholder");
        const placeholder: Comment = {
          _id: "local_" + Date.now(),
          text: text,
          createdBy: { username: "You" },
          role: "admin",
          createdAt: new Date().toISOString(),
        };
        setComments((prev) => [placeholder, ...prev]);
      }

      // 4. Background refetch after 800ms to sync real data
      setTimeout(() => {
        if (mountedRef.current) {
          console.log("📝 [ADD] Background refetch after optimistic update");
          doFetch();
        }
      }, 800);

      toast.success("Comment added successfully!");
    } catch (err: any) {
      console.error("📝 [ADD] EXCEPTION:", err.message);
      if (mountedRef.current) {
        toast.error("Network error - failed to add comment");
      }
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }

  // ============================================================
  // DELETE COMMENT
  // ============================================================
  async function handleDelete(id: string): Promise<void> {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    console.log("🗑️ [DELETE] START | id =", id);
    setIsLoading(true);

    try {
      const { status, body } = await rawDelete(`/api/comments/delete-comment/${id}`);

      console.log("🗑️ [DELETE] status =", status);
      console.log("🗑️ [DELETE] body =", JSON.stringify(body));

      if (!mountedRef.current) return;

      if (status !== 200) {
        console.error("🗑️ [DELETE] FAILED | status:", status);
        toast.error(body?.message || "Failed to delete comment");
        return;
      }

      // Remove from state immediately
      setComments((prev) => {
        const updated = prev.filter((c) => c._id !== id);
        onCommentUpdate?.(updated.length > 0 ? updated[0].text : "");
        return updated;
      });

      // Background refetch
      setTimeout(() => {
        if (mountedRef.current) doFetch();
      }, 800);

      toast.success("Comment deleted successfully");
    } catch (err: any) {
      console.error("🗑️ [DELETE] EXCEPTION:", err.message);
      if (mountedRef.current) {
        toast.error("Network error - failed to delete comment");
      }
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }

  // ============================================================
  // UTILS
  // ============================================================
  function formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  }

  // ============================================================
  // RENDER
  // ============================================================
  const safeComments = Array.isArray(comments) ? comments : [];

  return (
    <div className="w-full bg-white">
      {/* TEXTAREA */}
      <textarea
        className="w-full border border-gray-300 rounded p-3 h-32 outline-none text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        placeholder="Write your comment here..."
        value={inputComment}
        onChange={(e) => setInputComment(e.target.value)}
        disabled={isLoading}
      />

      {/* BUTTONS */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={handleAdd}
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

      {/* ============= DESKTOP TABLE ============= */}
      <div className="overflow-x-auto hidden md:block">
        <table className="w-full text-sm border-collapse border border-gray-300">
          <thead>
            <tr className="bg-[#e8eef2]">
              <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase text-xs tracking-wider border border-gray-300">COMMENT</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase text-xs tracking-wider border border-gray-300">CREATED BY</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase text-xs tracking-wider border border-gray-300">DATE</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700 uppercase text-xs tracking-wider border border-gray-300">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && safeComments.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-500 border border-gray-300">
                  Loading comments...
                </td>
              </tr>
            ) : safeComments.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-red-500 font-medium border border-gray-300">
                  No comments yet
                </td>
              </tr>
            ) : (
              safeComments.map((c) => (
                <tr key={c._id} className="bg-white hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-gray-600 border border-gray-300">{c.text || "—"}</td>
                  <td className="px-4 py-4 text-gray-600 border border-gray-300">
                    <span className="font-medium">{c.createdBy?.username || "Unknown"}</span>
                    <span className="text-xs text-gray-500 ml-1">({c.role || "user"})</span>
                  </td>
                  <td className="px-4 py-4 text-[#00bcd4] font-medium border border-gray-300">{formatDate(c.createdAt)}</td>
                  <td className="px-4 py-4 border border-gray-300">
                    <button onClick={() => handleDelete(c._id)} className="text-gray-500 cursor-pointer text-center  hover:text-red-600 transition-colors" title="Delete">
                      <Trash2 className="w-5 h-5 text-center ml-[20px]" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ============= MOBILE CARDS ============= */}
      <div className="md:hidden space-y-3">
        {isLoading && safeComments.length === 0 ? (
          <div className="py-8 text-center text-gray-500 border border-gray-300 rounded">Loading comments...</div>
        ) : safeComments.length === 0 ? (
          <div className="py-8 text-center text-red-500 font-medium border border-gray-300 rounded">No comments yet</div>
        ) : (
          safeComments.map((c) => (
            <div key={c._id} className="border border-gray-300 bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="border-b border-gray-200 p-4 text-sm text-gray-600">{c.text || "—"}</div>
              <div className="border-b border-gray-200 p-4 text-sm">
                <span className="font-medium text-gray-700">{c.createdBy?.username || "Unknown"}</span>
                <span className="text-xs text-gray-500 ml-2">({c.role || "user"})</span>
              </div>
              <div className="border-b border-gray-200 p-4 text-sm font-semibold text-[#00bcd4]">{formatDate(c.createdAt)}</div>
              <div className="p-4">
                <button onClick={() => handleDelete(c._id)} className="text-gray-500 text-center  hover:text-red-600 transition-colors" title="Delete">
                  <Trash2 className="w-5 h-5 text-center " />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}