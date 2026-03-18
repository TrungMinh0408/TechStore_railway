import {
    X,
    BadgeDollarSign,
    LayoutDashboard,
    Settings,
    ShoppingCart,
    Boxes,
    Users
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ isOpen, setIsOpen }) {

    const location = useLocation();

    const user = JSON.parse(localStorage.getItem("user"));
    const role = user?.branchRole; // branch_manager | staff

    const menuItems = [
        {
            icon: <LayoutDashboard size={18} />,
            label: "Dashboard",
            path: "/dashboard",
            roles: ["branch_manager"]
        },
        {
            icon: <BadgeDollarSign size={18} />,
            label: "POS",
            path: "/pos",
            roles: ["branch_manager", "staff"]
        },
        {
            icon: <ShoppingCart size={18} />,
            label: "Purchases",
            path: "/purchases",
            roles: ["branch_manager"]
        },
        {
            icon: <Boxes size={18} />,
            label: "Inventory",
            path: "/inventories",
            roles: ["branch_manager"]
        },
        {
            icon: <Users size={18} />,
            label: "Activity Logs",
            path: "/activity",
            roles: ["branch_manager"]
        },

    ];

    // lọc menu theo role
    const filteredMenu = menuItems.filter(item =>
        item.roles.includes(role)
    );

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside
                className={`
                fixed lg:static top-0 left-0 h-full z-[70]
                w-64 bg-app-card transition-all duration-300 ease-in-out
                shadow-[1px_0_10px_rgba(0,0,0,0.02)]
                ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            `}
            >
                {/* Mobile Header */}
                <div className="flex items-center justify-between p-6 lg:hidden">

                    <span className="font-bold text-blue-600 tracking-widest text-xs">
                        HỆ THỐNG
                    </span>

                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>

                </div>

                <div className="flex flex-col justify-between h-full p-4">

                    {/* MENU */}
                    <div>

                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-4">
                            Danh Mục
                        </h2>

                        <ul className="space-y-1.5">

                            {filteredMenu.map((item, index) => {

                                const isActive = location.pathname === item.path;

                                return (
                                    <Link
                                        to={item.path}
                                        key={index}
                                        onClick={() => setIsOpen(false)}
                                    >

                                        <li
                                            className={`
                                            flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold cursor-pointer transition-all
                                            ${isActive
                                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                                                    : "text-slate-600 opacity-80 hover:opacity-100 hover:bg-slate-50 dark:hover:bg-slate-800/50"}
                                        `}
                                        >

                                            <span className={isActive ? "text-white" : "text-blue-600"}>
                                                {item.icon}
                                            </span>

                                            <span>
                                                {item.label}
                                            </span>

                                        </li>

                                    </Link>
                                );

                            })}

                        </ul>

                    </div>

                    {/* SETTINGS */}
                    <div className="pb-4">

                        <Link
                            to="/settings"
                            onClick={() => setIsOpen(false)}
                        >

                            <div
                                className={`
                                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold cursor-pointer transition-all
                                ${location.pathname === "/settings"
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                                        : "text-slate-600 opacity-80 hover:opacity-100 hover:bg-slate-50 dark:hover:bg-slate-800/50"}
                            `}
                            >

                                <span className={location.pathname === "/settings" ? "text-white" : "text-blue-600"}>
                                    <Settings size={18} />
                                </span>

                                <span>
                                    Settings
                                </span>

                            </div>

                        </Link>

                    </div>

                </div>

            </aside>
        </>
    );
}