// frontend/app/leads/ActivityHistoryPage.js/comments/CommentsSection.js
// FINAL PRODUCTION — Attractive UI, no placeholder comments

"use client";

import { useState, useEffect, useRef } from "react";
import { Trash2, MessageCircle, Send, Clock, User } from "lucide-react";
import { toast } from "react-toastify";

// ============================================================
// RAW FETCH HELPERS
// ============================================================
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://two9-01-2026.onrender.com";

async function rawGet(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  const json = await res.json();
  return { status: res.status, body: json };
}

async function rawPost(path, payload) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  return { status: res.status, body: json };
}

async function rawDelete(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  const json = await res.json();
  return { status: res.status, body: json };
}

// ============================================================
// HELPERS
// ============================================================
function timeAgo(dateString) {
  try {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function fullDate(dateString) {
  try {
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  const first = parts[0]?.[0] || "";
  const last = parts[parts.length - 1]?.[0] || "";
  return (first + (parts.length > 1 ? last : "")).toUpperCase();
}

function getRoleStyle(role) {
  if (role === "admin")
    return { bg: "bg-purple-100", text: "text-purple-700" };
  if (role === "salesperson")
    return { bg: "bg-emerald-100", text: "text-emerald-700" };
  return { bg: "bg-gray-100", text: "text-gray-600" };
}

function getAvatarGradient(username) {
  const gradients = [
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-pink-500",
    "from-emerald-500 to-teal-500",
    "from-orange-500 to-amber-500",
    "from-rose-500 to-red-500",
    "from-indigo-500 to-blue-500",
  ];
  let hash = 0;
  const str = username || "user";
  for (let i = 0; i < str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return gradients[Math.abs(hash) % gradients.length];
}

// ============================================================
// COMPONENT
// ============================================================
export default function CommentsSection({
  leadId,
  currentComment,
  onCommentUpdate,
}) {
  const [comments, setComments] = useState([]);
  const [inputComment, setInputComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!leadId) return;
    doFetch();
  }, [leadId]);

  // ----------------------------------------------------------
  // FETCH
  // ----------------------------------------------------------
  async function doFetch() {
    setIsFetching(true);
    try {
      const { status, body } = await rawGet(
        `/api/comments/get-comments/${leadId}`
      );
      if (!mountedRef.current) return;
      if (status !== 200) {
        toast.error(body?.message || "Failed to fetch comments");
        setComments([]);
        return;
      }
      setComments(Array.isArray(body?.data) ? body.data : []);
    } catch {
      if (mountedRef.current) {
        toast.error("Network error");
        setComments([]);
      }
    } finally {
      if (mountedRef.current) setIsFetching(false);
    }
  }

  // ----------------------------------------------------------
  // ADD
  // ----------------------------------------------------------
  async function handleAdd() {
    const text = inputComment.trim();
    if (!text) return;

    setIsLoading(true);
    try {
      const { status, body } = await rawPost("/api/comments/add-comment", {
        leadId,
        text,
      });
      if (!mountedRef.current) return;

      if (status !== 201) {
        toast.error(body?.message || "Failed to add comment");
        return;
      }

      setInputComment("");
      onCommentUpdate?.(text);

      // Only real backend data — no external / placeholder
      if (body?.data) {
        setComments((prev) => [body.data, ...prev]);
      }

      setTimeout(() => {
        if (mountedRef.current) doFetch();
      }, 600);

      toast.success("Comment added!");
    } catch {
      if (mountedRef.current) toast.error("Network error");
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }

  // ----------------------------------------------------------
  // DELETE
  // ----------------------------------------------------------
  async function handleDelete(id) {
    if (!window.confirm("Delete this comment?")) return;

    setIsLoading(true);
    try {
      const { status, body } = await rawDelete(
        `/api/comments/delete-comment/${id}`
      );
      if (!mountedRef.current) return;

      if (status !== 200) {
        toast.error(body?.message || "Failed to delete");
        return;
      }

      setComments((prev) => {
        const updated = prev.filter((c) => c._id !== id);
        onCommentUpdate?.(updated.length > 0 ? updated[0].text : "");
        return updated;
      });

      setTimeout(() => {
        if (mountedRef.current) doFetch();
      }, 600);

      toast.success("Comment deleted");
    } catch {
      if (mountedRef.current) toast.error("Network error");
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }

  // ----------------------------------------------------------
  // KEYBOARD SHORTCUT
  // ----------------------------------------------------------
  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (inputComment.trim() && !isLoading) handleAdd();
    }
  }

  // ----------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------
  const safeComments = Array.isArray(comments) ? comments : [];

  return (
    <div className="w-full">
      {/* ============================================================
          INPUT CARD
          ============================================================ */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Gradient top accent */}
        <div className="h-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />

        <div className="p-4">
          <div className="flex gap-3">
            {/* Current user icon */}
            <div className="flex-shrink-0 w-9 h-9 mt-0.5 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-sm">
              <User className="w-4 h-4 text-white" />
            </div>

            {/* Textarea + actions */}
            <div className="flex-1 min-w-0">
              <textarea
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 
                           placeholder-gray-400 bg-gray-50 
                           focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 focus:outline-none focus:bg-white
                           hover:border-gray-300 resize-none transition-all duration-200"
                style={{ minHeight: "96px" }}
                placeholder="Write your comment... (Ctrl+Enter to send)"
                value={inputComment}
                onChange={(e) => setInputComment(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
              />

              {/* Bottom row */}
              <div className="flex items-center justify-between mt-2.5">
                <span className="text-xs text-gray-400 select-none">
                  {inputComment.length > 0
                    ? `${inputComment.length} character${inputComment.length !== 1 ? "s" : ""}`
                    : ""}
                </span>

                <div className="flex items-center gap-2">
                  {inputComment.trim() && (
                    <button
                      onClick={() => setInputComment("")}
                      className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 
                                 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    onClick={handleAdd}
                    disabled={isLoading || !inputComment.trim()}
                    className="flex items-center gap-1.5 px-5 py-1.5 
                               bg-gradient-to-r from-cyan-500 to-blue-500 text-white 
                               text-sm font-medium rounded-lg shadow-sm
                               hover:from-cyan-600 hover:to-blue-600 hover:shadow-md
                               disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
                               transition-all duration-200"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isLoading ? "Sending..." : "Add"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          ACTIVITY HEADER
          ============================================================ */}
      <div className="flex items-center gap-2 mt-6 mb-3 px-0.5">
        <MessageCircle className="w-4 h-4 text-gray-400" />
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
          Activity
        </span>
        {safeComments.length > 0 && (
          <span className="text-xs bg-cyan-100 text-cyan-700 font-bold px-2 py-0.5 rounded-full">
            {safeComments.length}
          </span>
        )}
      </div>

      {/* ============================================================
          LOADING
          ============================================================ */}
      {isFetching && safeComments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <div className="w-7 h-7 border-2 border-gray-200 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      )}

      {/* ============================================================
          EMPTY STATE
          ============================================================ */}
      {!isFetching && safeComments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 px-4 bg-gradient-to-b from-gray-50 to-white rounded-xl border border-dashed border-gray-200">
          <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center mb-2.5">
            <MessageCircle className="w-5 h-5 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-500">No comments yet</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Be the first to add a comment above
          </p>
        </div>
      )}

      {/* ============================================================
          COMMENTS LIST
          ============================================================ */}
      {safeComments.length > 0 && (
        <div className="space-y-3">
          {safeComments.map((c, idx) => {
            const username = c.createdBy?.username || "Unknown";
            const roleStyle = getRoleStyle(c.role);
            const gradient = getAvatarGradient(username);
            const initials = getInitials(username);

            return (
              <div
                key={c._id}
                className="group flex gap-3"
                style={{
                  animation: "commentFadeIn 0.25s ease-out both",
                  animationDelay: `${idx * 40}ms`,
                }}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div
                    className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold shadow-sm`}
                  >
                    {initials}
                  </div>
                </div>

                {/* Card */}
                <div className="flex-1 min-w-0 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200">
                  {/* Header row */}
                  <div className="flex items-center justify-between px-4 pt-3 pb-1 flex-wrap gap-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-800">
                        {username}
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleStyle.bg} ${roleStyle.text}`}
                      >
                        {c.role || "user"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className="flex items-center gap-1 text-xs text-gray-400"
                        title={fullDate(c.createdAt)}
                      >
                        <Clock className="w-3 h-3" />
                        {timeAgo(c.createdAt)}
                      </span>

                      {/* Delete — visible only on hover */}
                      <button
                        onClick={() => handleDelete(c._id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 
                                   transition-all duration-200 p-1 rounded-lg hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Comment text */}
                  <p className="px-4 pb-3 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap break-words">
                    {c.text || "—"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================
          ANIMATION KEYFRAMES
          ============================================================ */}
      <style>{`
        @keyframes commentFadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}