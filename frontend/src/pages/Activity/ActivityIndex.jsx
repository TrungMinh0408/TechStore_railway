import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import activityApi from "../../api/activityApi";

export default function ActivityIndex() {
    const [searchParams, setSearchParams] = useSearchParams();

    // Local form state
    const [formFilters, setFormFilters] = useState({
        action: searchParams.get("action") || "",
        level: searchParams.get("level") || "",
    });

    const [logs, setLogs] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    // Get actual values from URL for API calls
    const currentPage = Number(searchParams.get("page")) || 1;
    const currentAction = searchParams.get("action") || "";
    const currentLevel = searchParams.get("level") || "";

    // Fetch only when URL parameters change
    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const res = await activityApi.getAll({
                    action: currentAction,
                    level: currentLevel,
                    page: currentPage,
                    limit: 10
                });
                setLogs(res.data.data || []);
                setTotalPages(res.data.totalPages || 1);
            } catch (err) {
                console.error("Fetch failed", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [currentAction, currentLevel, currentPage]);

    const handleInputChange = (e) => {
        setFormFilters({ ...formFilters, [e.target.name]: e.target.value });
    };

    const handleSearch = () => {
        const params = { page: 1 };
        if (formFilters.action) params.action = formFilters.action;
        if (formFilters.level) params.level = formFilters.level;

        setSearchParams(params);
    };

    const changePage = (page) => {
        const params = Object.fromEntries([...searchParams]);
        params.page = page;
        setSearchParams(params);
    };

    return (
        <div className="min-h-screen bg-white text-black p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-4xl font-black tracking-tighter uppercase">Activity Logs</h1>
                    <p className="text-gray-400 text-sm mt-2 font-medium">Monitoring system events and staff interactions.</p>
                </header>

                {/* FILTER SECTION */}
                <div className="flex flex-wrap items-end gap-8 mb-10 pb-10 border-b border-gray-100">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Action Type</label>
                        <select
                            name="action"
                            value={formFilters.action}
                            onChange={handleInputChange}
                            className="block w-56 bg-transparent border-b border-gray-200 py-2 focus:border-black outline-none transition-all text-sm cursor-pointer appearance-none hover:border-gray-400"
                        >
                            <option value="">All Actions</option>
                            <option value="LOGIN">login</option>
                            <option value="CREATE_SALE">create</option>
                            <option value="UPDATE_ORDER">update</option>
                            <option value="CONFIRM_PURCHASE">Confirm</option>
                            <option value="CANCEL_PURCHASE">Cancel</option>
                            <option value="DELETE_PURCHASE">Delete</option>
                            <option value="RETURN_PURCHASE">Return</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Severity Level</label>
                        <select
                            name="level"
                            value={formFilters.level}
                            onChange={handleInputChange}
                            className="block w-44 bg-transparent border-b border-gray-200 py-2 focus:border-black outline-none transition-all text-sm cursor-pointer appearance-none hover:border-gray-400"
                        >
                            <option value="">All Levels</option>
                            <option value="INFO">INFO</option>
                            <option value="WARN">WARNING</option>
                            <option value="ERROR">ERROR</option>
                        </select>
                    </div>

                    <button
                        onClick={handleSearch}
                        className="bg-black text-white px-10 py-3 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95 shadow-sm"
                    >
                        Apply Filters
                    </button>

                    {/* Clear Filters Button */}
                    {(currentAction || currentLevel) && (
                        <button
                            onClick={() => {
                                setFormFilters({ action: "", level: "" });
                                setSearchParams({});
                            }}
                            className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* DATA TABLE */}
                <div className={`transition-all duration-300 ${loading ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                    <div className="overflow-x-auto text-[13px]">
                        <table className="w-full text-left border-separate border-spacing-y-0">
                            <thead>
                                <tr className="border-b border-black">
                                    <th className="pb-4 font-bold uppercase tracking-wider text-gray-400 text-[10px]">Actor</th>
                                    <th className="pb-4 font-bold uppercase tracking-wider text-gray-400 text-[10px]">Action</th>
                                    <th className="pb-4 font-bold uppercase tracking-wider text-gray-400 text-[10px]">Status</th>
                                    <th className="pb-4 font-bold uppercase tracking-wider text-gray-400 text-[10px]">Description</th>
                                    <th className="pb-4 font-bold uppercase tracking-wider text-gray-400 text-[10px] text-right">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {logs.length > 0 ? (
                                    logs.map((log) => (
                                        <tr key={log._id} className="group hover:bg-gray-50/50 transition-colors">
                                            <td className="py-5 pr-4">
                                                <span className="font-bold text-black">{log.actorId?.name || "System"}</span>
                                            </td>
                                            <td className="py-5 pr-4">
                                                <span className="font-mono text-[11px] bg-gray-100 px-2 py-1 rounded text-gray-600 uppercase">
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="py-5 pr-4">
                                                <span className={`font-bold text-[10px] ${log.level === 'ERROR' ? 'text-red-500' :
                                                    log.level === 'WARN' ? 'text-orange-400' : 'text-blue-500'
                                                    }`}>
                                                    {log.level}
                                                </span>
                                            </td>
                                            <td className="py-5 pr-4 text-gray-500 max-w-md italic">
                                                {log.message}
                                            </td>
                                            <td className="py-5 text-right text-gray-400 tabular-nums">
                                                {new Date(log.createdAt).toLocaleString('en-GB', {
                                                    day: '2-digit', month: 'short', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-20 text-center text-gray-400 uppercase tracking-widest text-[11px]">
                                            No logs found matching your criteria
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION */}
                    {totalPages > 1 && (
                        <div className="mt-16 flex items-center justify-center gap-4">
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => changePage(i + 1)}
                                    className={`w-10 h-10 rounded-full text-[11px] font-black transition-all border ${currentPage === i + 1
                                        ? "bg-black text-white border-black"
                                        : "text-gray-400 border-transparent hover:border-gray-200 hover:text-black"
                                        }`}
                                >
                                    {String(i + 1).padStart(2, '0')}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}