import React from "react";
import { useAuth } from "../../context/AuthContext";
import { LogOut, Shield, Bell } from "lucide-react";

export default function Settings() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
            <div className="max-w-2xl mx-auto space-y-8">

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        Cài đặt
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Quản lý tùy chọn tài khoản của bạn.
                    </p>
                </div>

                {/* Personal */}
                <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider ml-1">
                        Cá nhân
                    </h2>

                    {/* Profile Card */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-400 text-white flex items-center justify-center text-xl font-bold shadow-lg">
                                        {user?.name?.charAt(0).toUpperCase() || "U"}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                                </div>

                                <div>
                                    <p className="text-lg font-bold text-gray-900">
                                        {user?.name || "Người dùng"}
                                    </p>
                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                        <Shield size={14} className="text-blue-500" />
                                        Tài khoản hệ thống
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={logout}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-500 font-semibold hover:bg-red-50 active:scale-95 transition-all"
                            >
                                <LogOut size={18} />
                                <span>Đăng xuất</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* System */}
                <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider ml-1">
                        Hệ thống
                    </h2>

                    {/* Notification placeholder */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center justify-between opacity-60 cursor-not-allowed">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-gray-100 text-gray-600">
                                <Bell size={22} />
                            </div>
                            <div>
                                <span className="font-bold text-gray-800 block">
                                    Thông báo
                                </span>
                                <span className="text-xs text-gray-400">
                                    Tính năng đang phát triển
                                </span>
                            </div>
                        </div>

                        <div className="w-10 h-5 bg-gray-200 rounded-full"></div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-400 text-xs mt-10">
                    Phiên bản 1.0.4 • © 2024 Dashboard Inc.
                </p>
            </div>
        </div>
    );
}