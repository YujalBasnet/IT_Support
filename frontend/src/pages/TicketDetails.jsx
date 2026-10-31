import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Send,
  Lock,
  MessageSquare,
  Paperclip,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  History,
  Tag,
  Calendar,
  User,
  ShieldAlert,
} from "lucide-react";
import api from "../services/api";

// Module-level caches to make navigating into and back from ticket details instantaneous
const ticketCache = new Map();
const commentsCache = new Map();
const attachmentsCache = new Map();
const historyCache = new Map();

export default function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Current logged in user
  let currentUser = null;
  try {
    currentUser = JSON.parse(localStorage.getItem("user"));
  } catch {
    currentUser = null;
  }
  const currentRoleId = Number(currentUser?.role_id);
  const currentUserId = Number(currentUser?.id);

  // Determine back navigation dashboard path
  const dashboardPaths = {
    1: "/employee",
    2: "/agent",
    3: "/admin",
  };
  const backPath = dashboardPaths[currentRoleId] || "/login";

  // Ticket Data States initialized from cache
  const [ticket, setTicket] = useState(() => ticketCache.get(id) || null);
  const [loading, setLoading] = useState(() => !ticketCache.has(id));
  const [error, setError] = useState("");

  // Status Update State
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  // Comments State
  const [comments, setComments] = useState(() => commentsCache.get(id) || []);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Attachments State
  const [attachments, setAttachments] = useState(() => attachmentsCache.get(id) || []);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [attachmentError, setAttachmentError] = useState("");

  // History State
  const [history, setHistory] = useState(() => historyCache.get(id) || []);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Active Tab: comments | attachments | history
  const [activeTab, setActiveTab] = useState("comments");

  // Fetch Ticket Details
  const fetchTicket = async () => {
    try {
      const { data } = await api.get(`/tickets/${id}`);
      const t = data.ticket ?? data.data ?? data;
      ticketCache.set(id, t);
      setTicket(t);
    } catch (err) {
      console.error("Failed to load ticket:", err);
      setError(
        err.response?.data?.message || "Failed to load ticket details."
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch Comments
  const fetchComments = async () => {
    setCommentsLoading(true);
    try {
      const { data } = await api.get(`/tickets/${id}/comments`);
      const list = Array.isArray(data.comments) ? data.comments : [];
      commentsCache.set(id, list);
      setComments(list);
    } catch (err) {
      console.error("Failed to load comments:", err);
    } finally {
      setCommentsLoading(false);
    }
  };

  // Fetch Attachments
  const fetchAttachments = async () => {
    setAttachmentsLoading(true);
    try {
      const { data } = await api.get(`/attachments/tickets/${id}/attachments`);
      const list = Array.isArray(data.attachments) ? data.attachments : [];
      attachmentsCache.set(id, list);
      setAttachments(list);
    } catch (err) {
      console.error("Failed to load attachments:", err);
    } finally {
      setAttachmentsLoading(false);
    }
  };

  // Fetch History
  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const { data } = await api.get(`/tickets/${id}/history`);
      const list = Array.isArray(data.history) ? data.history : [];
      historyCache.set(id, list);
      setHistory(list);
    } catch (err) {
      console.error("Failed to load ticket history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    const cached = ticketCache.get(id);
    if (cached) {
      setTicket(cached);
      setComments(commentsCache.get(id) || []);
      setAttachments(attachmentsCache.get(id) || []);
      setHistory(historyCache.get(id) || []);
      setLoading(false);
    } else {
      setLoading(true);
    }

    fetchTicket();
    fetchComments();
    fetchAttachments();
    fetchHistory();
  }, [id]);

  // Allowed transitions matching backend logic
  const allowedTransitionsMap = {
    OPEN: ["ASSIGNED", "IN_PROGRESS", "CLOSED"],
    ASSIGNED: ["IN_PROGRESS", "WAITING_FOR_USER", "RESOLVED"],
    IN_PROGRESS: ["WAITING_FOR_USER", "RESOLVED"],
    WAITING_FOR_USER: ["IN_PROGRESS", "RESOLVED"],
    RESOLVED: ["CLOSED", "REOPENED"],
    CLOSED: ["REOPENED"],
    REOPENED: ["ASSIGNED", "IN_PROGRESS", "CLOSED"],
  };

  let nextStatuses = (ticket && allowedTransitionsMap[ticket.status]) || [];
  // Business rule: Employees can only close or reopen eligible tickets
  if (currentRoleId === 1) {
    nextStatuses = nextStatuses.filter((s) => ["REOPENED", "CLOSED"].includes(s));
  }

  // Handle Status Update
  const handleStatusChange = async (newStatus) => {
    if (!newStatus || newStatus === ticket.status) return;

    setUpdatingStatus(true);
    setStatusMessage({ type: "", text: "" });

    try {
      await api.patch(`/tickets/${id}/status`, { status: newStatus });
      setStatusMessage({
        type: "success",
        text: `Status updated to ${newStatus.replace(/_/g, " ")}.`,
      });
      fetchTicket();
      fetchHistory();
    } catch (err) {
      console.error("Failed to update status:", err);
      setStatusMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update ticket status.",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle Add Comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);

    try {
      await api.post(`/tickets/${id}/comments`, {
        comment: newComment.trim(),
        is_internal: isInternalComment,
      });

      setNewComment("");
      setIsInternalComment(false);
      fetchComments();
    } catch (err) {
      console.error("Failed to add comment:", err);
      alert(err.response?.data?.message || "Failed to post comment.");
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle Upload Attachment
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAttachmentError("");
    setUploadingAttachment(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      await api.post(`/attachments/tickets/${id}/attachments`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      e.target.value = "";
      fetchAttachments();
    } catch (err) {
      console.error("Failed to upload attachment:", err);
      setAttachmentError(
        err.response?.data?.message || "Failed to upload file. Max size 10MB."
      );
    } finally {
      setUploadingAttachment(false);
    }
  };

  // Handle Download Attachment
  const handleDownloadAttachment = async (attachment) => {
    try {
      const res = await api.get(`/attachments/${attachment.id}/download`, {
        responseType: "blob",
      });

      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", attachment.original_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed:", err);
      alert(err.response?.data?.message || "Failed to download attachment.");
    }
  };

  // Handle Delete Attachment
  const handleDeleteAttachment = async (attachmentId) => {
    if (!window.confirm("Are you sure you want to delete this attachment?")) {
      return;
    }

    try {
      await api.delete(`/attachments/${attachmentId}`);
      fetchAttachments();
    } catch (err) {
      console.error("Failed to delete attachment:", err);
      alert(err.response?.data?.message || "Failed to delete attachment.");
    }
  };

  // Styles
  const getStatusStyle = (status) => {
    const styles = {
      OPEN: "bg-blue-100 text-blue-700 border-blue-200",
      ASSIGNED: "bg-purple-100 text-purple-700 border-purple-200",
      IN_PROGRESS: "bg-amber-100 text-amber-700 border-amber-200",
      WAITING_FOR_USER: "bg-orange-100 text-orange-700 border-orange-200",
      RESOLVED: "bg-green-100 text-green-700 border-green-200",
      CLOSED: "bg-slate-200 text-slate-700 border-slate-300",
      REOPENED: "bg-red-100 text-red-700 border-red-200",
    };

    return styles[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getPriorityStyle = (priority) => {
    const styles = {
      LOW: "bg-slate-100 text-slate-700",
      MEDIUM: "bg-blue-100 text-blue-700",
      HIGH: "bg-orange-100 text-orange-700",
      URGENT: "bg-red-100 text-red-700 font-semibold",
    };

    return styles[priority] || "bg-gray-100 text-gray-700";
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  if (loading && !ticket) {
    return (
      <div className="mx-auto max-w-6xl pb-12 animate-pulse space-y-6">
        <div className="h-6 bg-slate-200 rounded w-36 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div className="h-4 bg-slate-200 rounded w-28" />
              <div className="h-7 bg-slate-200 rounded w-2/3" />
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <div className="h-4 bg-slate-200 rounded w-full" />
                <div className="h-4 bg-slate-200 rounded w-5/6" />
                <div className="h-4 bg-slate-200 rounded w-4/6" />
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div className="h-8 bg-slate-200 rounded w-1/3" />
              <div className="h-20 bg-slate-100 rounded" />
            </div>
          </div>
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div className="h-5 bg-slate-200 rounded w-1/2" />
              <div className="h-8 bg-slate-200 rounded w-full" />
              <div className="h-8 bg-slate-200 rounded w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="mx-auto max-w-2xl bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center">
        <ShieldAlert size={48} className="mx-auto text-red-500 mb-3" />
        <h2 className="text-xl font-bold text-slate-900">Unable to load ticket</h2>
        <p className="text-slate-600 mt-2 text-sm">
          {error || "Ticket not found or you do not have permission to view it."}
        </p>
        <button
          onClick={() => navigate(backPath)}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <ArrowLeft size={16} />
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Check if current user is authorized to change status
  const canChangeStatus =
    currentRoleId === 3 || // Admin
    (currentRoleId === 2 && Number(ticket.assigned_agent_id) === currentUserId) || // Assigned agent
    (currentRoleId === 1 && Number(ticket.requester_id) === currentUserId); // Ticket creator

  return (
    <div className="mx-auto max-w-6xl pb-12">
      {/* Top Bar Navigation */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          onClick={() => navigate(backPath)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition cursor-pointer w-fit"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        {/* Quick status badge & ID */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">ID: #{ticket.id}</span>
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold border ${getStatusStyle(
              ticket.status
            )}`}
          >
            {(ticket.status || "").replace(/_/g, " ")}
          </span>
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getPriorityStyle(
              ticket.priority
            )}`}
          >
            {ticket.priority} Priority
          </span>
        </div>
      </div>

      {/* Main Grid: Ticket Details (Left 7 cols) & Actions/Meta (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Ticket Info & Tabs */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                {ticket.ticket_number}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {ticket.title}
              </h1>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Description
              </h3>
              <div className="text-slate-800 text-sm whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                {ticket.description}
              </div>
            </div>
          </div>

          {/* Interactive Tabs Card (Comments, Attachments, Audit Trail) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Tabs Bar */}
            <div className="flex border-b border-slate-200 bg-slate-50/70 px-4 sm:px-6">
              <button
                onClick={() => setActiveTab("comments")}
                className={`flex items-center gap-2 py-4 px-3 border-b-2 font-semibold text-sm transition cursor-pointer ${
                  activeTab === "comments"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <MessageSquare size={16} />
                Comments ({comments.length})
              </button>

              <button
                onClick={() => setActiveTab("attachments")}
                className={`flex items-center gap-2 py-4 px-3 border-b-2 font-semibold text-sm transition cursor-pointer ${
                  activeTab === "attachments"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <Paperclip size={16} />
                Attachments ({attachments.length})
              </button>

              <button
                onClick={() => setActiveTab("history")}
                className={`flex items-center gap-2 py-4 px-3 border-b-2 font-semibold text-sm transition cursor-pointer ${
                  activeTab === "history"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <History size={16} />
                Activity Timeline ({history.length})
              </button>
            </div>

            {/* Tab 1: Comments */}
            {activeTab === "comments" && (
              <div className="p-6">
                {/* Comments List */}
                <div className="space-y-4 mb-6">
                  {commentsLoading ? (
                    <p className="text-xs text-slate-400">Loading comments...</p>
                  ) : comments.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-sm">
                      <MessageSquare size={32} className="mx-auto mb-2 opacity-40" />
                      No comments yet. Start the conversation below.
                    </div>
                  ) : (
                    comments.map((c) => {
                      const isInternal = Boolean(c.is_internal);
                      return (
                        <div
                          key={c.id}
                          className={`rounded-xl p-4 border transition ${
                            isInternal
                              ? "bg-amber-50/80 border-amber-200 text-amber-900"
                              : "bg-slate-50 border-slate-200 text-slate-800"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900">
                                {c.user_name || "User"}
                              </span>
                              {isInternal && (
                                <span className="inline-flex items-center gap-1 rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                                  <Lock size={10} /> Internal Note
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {c.created_at
                                ? new Date(c.created_at).toLocaleString()
                                : ""}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">
                            {c.comment}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* New Comment Box */}
                <form onSubmit={handleAddComment} className="pt-4 border-t border-slate-100">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Add a comment
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write your reply or update..."
                    className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Only Agents & Admins can post internal staff notes */}
                    {[2, 3].includes(currentRoleId) ? (
                      <label className="flex items-center gap-2 text-xs font-medium text-amber-800 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isInternalComment}
                          onChange={(e) => setIsInternalComment(e.target.checked)}
                          className="rounded border-amber-400 text-amber-600 focus:ring-amber-400"
                        />
                        <span className="flex items-center gap-1">
                          <Lock size={12} /> Post as Internal Staff Note (hidden from requester)
                        </span>
                      </label>
                    ) : (
                      <span className="text-xs text-slate-400">
                        Public message visible to the support team.
                      </span>
                    )}

                    <button
                      type="submit"
                      disabled={submittingComment || !newComment.trim()}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition cursor-pointer disabled:opacity-50"
                    >
                      <Send size={15} />
                      {submittingComment ? "Posting..." : "Send Reply"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tab 2: Attachments */}
            {activeTab === "attachments" && (
              <div className="p-6">
                {attachmentError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                    {attachmentError}
                  </div>
                )}

                {/* Upload Section */}
                <div className="mb-6 p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Upload an Attachment
                    </p>
                    <p className="text-xs text-slate-500">
                      Upload screenshots, diagnostic logs, or documents (Max 10MB)
                    </p>
                  </div>

                  <label className="flex items-center gap-2 rounded-lg bg-white border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer">
                    <Paperclip size={14} />
                    <span>{uploadingAttachment ? "Uploading..." : "Select File"}</span>
                    <input
                      type="file"
                      disabled={uploadingAttachment}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Attachments List */}
                <div className="space-y-3">
                  {attachmentsLoading ? (
                    <p className="text-xs text-slate-400">Loading attachments...</p>
                  ) : attachments.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-sm">
                      <Paperclip size={32} className="mx-auto mb-2 opacity-40" />
                      No files attached to this ticket.
                    </div>
                  ) : (
                    attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                            <Paperclip size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">
                              {att.original_name}
                            </p>
                            <p className="text-xs text-slate-400">
                              {formatFileSize(att.file_size)} •{" "}
                              {att.created_at
                                ? new Date(att.created_at).toLocaleDateString()
                                : ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleDownloadAttachment(att)}
                            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition cursor-pointer"
                            title="Download file"
                          >
                            <Download size={16} />
                          </button>
                          {(currentRoleId === 3 || att.uploaded_by === currentUserId) && (
                            <button
                              onClick={() => handleDeleteAttachment(att.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition cursor-pointer"
                              title="Delete file"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: History Timeline */}
            {activeTab === "history" && (
              <div className="p-6">
                {historyLoading ? (
                  <p className="text-xs text-slate-400">Loading activity timeline...</p>
                ) : history.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    No history recorded for this ticket yet.
                  </p>
                ) : (
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {history.map((event) => (
                      <div key={event.id} className="relative">
                        <div className="absolute -left-6 top-1 h-3 w-3 rounded-full border-2 border-white bg-blue-600 ring-2 ring-blue-100" />
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            {event.action?.replace(/_/g, " ")}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            By <span className="font-medium text-slate-700">{event.user_name || "System"}</span> •{" "}
                            {event.created_at
                              ? new Date(event.created_at).toLocaleString()
                              : ""}
                          </p>
                          {event.new_value && (
                            <div className="mt-1.5 text-[11px] bg-slate-50 border border-slate-200 p-2 rounded text-slate-600 font-mono">
                              {event.new_value}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Metadata & Status Controls */}
        <div className="lg:col-span-4 space-y-6">
          {/* Status Changer Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Status Management
            </h3>

            {statusMessage.text && (
              <div
                className={`mb-4 p-3 rounded-lg text-xs flex items-center gap-2 ${
                  statusMessage.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {statusMessage.type === "success" ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <AlertCircle size={16} />
                )}
                {statusMessage.text}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">Current Status</p>
                <div
                  className={`inline-block rounded-full px-3 py-1 text-xs font-bold border ${getStatusStyle(
                    ticket.status
                  )}`}
                >
                  {(ticket.status || "").replace(/_/g, " ")}
                </div>
              </div>

              {canChangeStatus && nextStatuses.length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-700 mb-2">
                    Transition Ticket Status
                  </p>
                  <div className="flex flex-col gap-2">
                    {nextStatuses.map((nxt) => (
                      <button
                        key={nxt}
                        disabled={updatingStatus}
                        onClick={() => handleStatusChange(nxt)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition cursor-pointer disabled:opacity-50 ${
                          nxt === "RESOLVED"
                            ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                            : nxt === "REOPENED"
                            ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                            : nxt === "CLOSED"
                            ? "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
                            : "bg-slate-50 border-slate-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                        }`}
                      >
                        {nxt === "REOPENED"
                          ? "Reopen Ticket"
                          : nxt === "CLOSED"
                          ? "Close Ticket"
                          : `Change to ${nxt.replace(/_/g, " ")}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!canChangeStatus && (
                <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                  Only assigned support agents or administrators can modify ticket status.
                </p>
              )}
            </div>
          </div>

          {/* Ticket Information Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
              Ticket Details
            </h3>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                <Tag size={16} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Priority</p>
                <p className="text-sm font-semibold text-slate-800">
                  {ticket.priority}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                <Calendar size={16} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Created At</p>
                <p className="text-sm font-semibold text-slate-800">
                  {ticket.created_at
                    ? new Date(ticket.created_at).toLocaleString()
                    : "—"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                <Clock size={16} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Last Updated</p>
                <p className="text-sm font-semibold text-slate-800">
                  {ticket.updated_at
                    ? new Date(ticket.updated_at).toLocaleString()
                    : "—"}
                </p>
              </div>
            </div>

            {ticket.requester_name && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                  <User size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Requester</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {ticket.requester_name}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
