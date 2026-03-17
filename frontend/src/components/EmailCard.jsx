import { useState } from "react";

const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const parseSender = (from) => {
    // E.g. "John Doe <john@example.com>" -> { name: "John Doe", email: "john@example.com" }
    const match = from.match(/^(.*?)\s*<(.+)>$/);
    if (match) return { name: match[1].trim().replace(/"/g, ""), email: match[2] };
    return { name: from, email: from };
};

const EmailCard = ({ email, onReadMore, onReply }) => {
    const sender = parseSender(email.from);

    return (
        <div className="card hover:shadow-md transition-all duration-200 animate-slide-up group">
            <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                    {sender.name[0]?.toUpperCase() || "?"}
                </div>

                <div className="flex-1 min-w-0">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                            <p className="font-semibold text-slate-800 text-sm truncate max-w-xs">{sender.name}</p>
                            <p className="text-slate-400 text-xs truncate">{sender.email}</p>
                        </div>
                        <span className="text-slate-400 text-xs flex-shrink-0">{formatDate(email.date)}</span>
                    </div>

                    {/* Subject */}
                    <h3 className="text-slate-900 font-medium text-sm mb-2 line-clamp-1">{email.subject}</h3>

                    {/* Preview / Snippet */}
                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">{email.snippet}</p>

                    {/* Actions */}
                    <div className="mt-3 flex items-center gap-4">
                        <button
                            onClick={() => onReadMore(email)}
                            className="inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-700 text-sm font-medium transition-colors duration-150 group-hover:translate-x-0.5"
                        >
                            Read More
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        <button
                            onClick={() => onReply(email)}
                            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-brand-600 text-sm font-medium transition-colors duration-150"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                            Reply
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailCard;
