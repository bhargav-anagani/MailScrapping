import { useState, useEffect } from "react";
import api from "../api/axios";
import { toast } from "react-hot-toast";

const parseSenderEmail = (from) => {
    const match = from.match(/<(.+)>/);
    return match ? match[1] : from;
};

const EmailModal = ({ email, onClose }) => {
    const [replyMode, setReplyMode] = useState(email?.replyMode || false);
    const [replyText, setReplyText] = useState("");
    const [sending, setSending] = useState(false);

    // Close on Escape key (only if not typing a reply)
    useEffect(() => {
        const handler = (e) => {
            if (e.key === "Escape" && !replyMode) onClose();
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [onClose, replyMode]);

    if (!email) return null;

    const handleSendReply = async () => {
        if (!replyText.trim()) {
            toast.error("Reply text cannot be empty");
            return;
        }

        setSending(true);
        try {
            await api.post(`/api/gmail/reply/${email.id}`, {
                replyText,
                to: parseSenderEmail(email.from),
                subject: email.subject,
                threadId: email.threadId,
                messageId: email.messageId,
                references: email.references
            });
            toast.success("Reply sent successfully!");
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send reply");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col animate-slide-up ${replyMode ? "h-[90vh]" : "max-h-[85vh]"}`}>
                {/* Header */}
                <div className="flex items-start justify-between gap-4 p-6 border-b border-slate-100 flex-shrink-0">
                    <div className="min-w-0">
                        <h2 className="text-lg font-bold text-slate-900 line-clamp-2">{email.subject}</h2>
                        <p className="text-slate-500 text-sm mt-1">{email.from}</p>
                        {email.date && (
                            <p className="text-slate-400 text-xs mt-0.5">
                                {new Date(email.date).toLocaleDateString("en-US", {
                                    weekday: "long", year: "numeric", month: "long", day: "numeric",
                                })}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="flex-shrink-0 p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors duration-150"
                        aria-label="Close"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                    {email.body ? (
                        email.body.includes("<") && email.body.includes(">") ? (
                            <div
                                className="prose prose-sm max-w-none text-slate-700 bg-white p-4 rounded-xl border border-slate-100 shadow-sm"
                                dangerouslySetInnerHTML={{ __html: email.body }}
                            />
                        ) : (
                            <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans leading-relaxed bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                {email.body}
                            </pre>
                        )
                    ) : (
                        <p className="text-slate-400 italic">No body content available.</p>
                    )}
                </div>

                {/* Reply Section / Footer */}
                {replyMode ? (
                    <div className="p-4 border-t border-slate-100 bg-white rounded-b-2xl flex-shrink-0">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block px-2">
                            Replying to {parseSenderEmail(email.from)}
                        </label>
                        <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Type your reply here..."
                            className="w-full h-32 p-3 text-sm text-slate-700 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none mb-3"
                            autoFocus
                        />
                        <div className="flex justify-end gap-3 px-2 pb-1">
                            <button
                                onClick={() => setReplyMode(false)}
                                className="px-5 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendReply}
                                disabled={sending}
                                className="btn-primary flex items-center gap-2 py-2.5 px-6 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {sending ? (
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                )}
                                Send Reply
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="px-6 py-4 border-t border-slate-100 flex justify-between bg-white rounded-b-2xl flex-shrink-0">
                        <button
                            onClick={() => setReplyMode(true)}
                            className="inline-flex items-center gap-2 text-brand-600 font-medium text-sm hover:underline"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                            Reply
                        </button>
                        <button onClick={onClose} className="btn-secondary text-sm py-2.5 px-5">
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmailModal;
