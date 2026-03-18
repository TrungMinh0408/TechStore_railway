import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, Layers } from 'lucide-react';
import categoryApi from '../../api/categoriesApi';

const CategoryIndex = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await categoryApi.getAll();
            setCategories(res.data || []);
        } catch (error) {
            console.error("Lỗi:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Xác nhận xóa danh mục này?")) {
            try {
                await categoryApi.delete(id);
                setCategories(prev => prev.filter(item => item._id !== id));
            } catch (error) { alert("Xóa thất bại!"); }
        }
    };

    return (
        <div className="bg-white">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Danh mục sản phẩm</h1>
                    <p className="text-sm text-slate-500 mt-1">Quản lý các nhóm hàng hóa của hệ thống</p>
                </div>
                <Link
                    to="/categories/create"
                    className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg hover:bg-slate-800 transition-all no-underline font-medium shadow-sm"
                >
                    <Plus size={18} /> Thêm danh mục
                </Link>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 text-[13px] uppercase tracking-wider font-semibold text-slate-600">Tên danh mục</th>
                            <th className="p-4 text-[13px] uppercase tracking-wider font-semibold text-slate-600">Mô tả</th>
                            <th className="p-4 text-[13px] uppercase tracking-wider font-semibold text-slate-600">Trạng thái</th>
                            <th className="p-4 text-[13px] uppercase tracking-wider font-semibold text-slate-600 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan="4" className="p-12 text-center text-slate-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
                                        <span>Đang tải dữ liệu...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : categories.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="p-12 text-center text-slate-400">Không có dữ liệu danh mục</td>
                            </tr>
                        ) : categories.map((item) => (
                            <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                                            <Layers size={18} />
                                        </div>
                                        <span className="font-semibold text-slate-900">{item.name}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-slate-600 max-w-[300px] truncate">
                                    {item.description || <span className="text-slate-300 italic">Chưa có mô tả</span>}
                                </td>
                                <td className="p-4">
                                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${item.isActive
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                                        }`}>
                                        {item.isActive ? 'Hoạt động' : 'Tạm ẩn'}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-1">
                                        <Link
                                            title="Xem chi tiết"
                                            to={`/categories/view/${item._id}`}
                                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all"
                                        >
                                            <Eye size={18} />
                                        </Link>
                                        <Link
                                            title="Chỉnh sửa"
                                            to={`/categories/update/${item._id}`}
                                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-all"
                                        >
                                            <Pencil size={18} />
                                        </Link>
                                        <button
                                            title="Xóa"
                                            onClick={() => handleDelete(item._id)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all bg-transparent border-none cursor-pointer"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CategoryIndex;