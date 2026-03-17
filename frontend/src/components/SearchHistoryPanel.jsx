const SearchHistoryPanel = ({ history, onSelectKeyword, loading }) => {
    if (loading) {
        return (
            <div className="flex items-center gap-2 text-slate-400 text-sm py-2">
                <span className="w-4 h-4 border-2 border-slate-300 border-t-brand-500 rounded-full animate-spin" />
                Loading history…
            </div>
        );
    }

    if (!history || history.length === 0) {
        return (
            <p className="text-slate-400 text-sm italic">
                No search history yet. Try searching for a keyword!
            </p>
        );
    }

    return (
        <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                Recent Searches
            </h3>
            <div className="flex flex-wrap gap-2">
                {history.map((item) => (
                    <button
                        key={item._id}
                        onClick={() => onSelectKeyword(item.keyword)}
                        className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-600 text-sm font-medium px-3 py-1.5 rounded-full transition-all duration-150"
                    >
                        <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {item.keyword}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SearchHistoryPanel;
