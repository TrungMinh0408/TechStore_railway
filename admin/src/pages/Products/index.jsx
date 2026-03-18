import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import {
    Plus,
    Pencil,
    Trash2,
    Eye,
    Image as ImageIcon,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

import productApi from '../../api/productApi';

const PAGE_SIZE = 5;

const ProductIndex = () => {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [filterStatus, setFilterStatus] = useState('active');
    const [showFilter, setShowFilter] = useState(false);

    const [page, setPage] = useState(1);

    /* ================= FETCH ================= */

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await productApi.getAll();
            setProducts(Array.isArray(res.data.products) ? res.data.products : []);
        } catch (error) {
            console.error(error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    /* ================= DELETE ================= */

    const handleDelete = async (id) => {
        if (!window.confirm('Xác nhận ẩn sản phẩm này?')) return;
        await productApi.delete(id);
        setProducts(prev => prev.filter(p => p._id !== id));
    };

    /* ================= FILTER + SORT ================= */

    const filteredProducts = useMemo(() => {
        let data = [...products];

        if (filterStatus === 'active') {
            data = data.filter(p => p.isActive === true);
        } else if (filterStatus === 'inactive') {
            data = data.filter(p => p.isActive === false);
        }

        if (search.trim()) {
            data = data.filter(p =>
                p.name?.toLowerCase().includes(search.toLowerCase())
            );
        }

        switch (sortBy) {
            case 'name_asc':
                data.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                break;
            case 'price_desc':
                data.sort((a, b) => (b.price || 0) - (a.price || 0));
                break;
            case 'qty_desc':
                data.sort((a, b) => (b.quantity || 0) - (a.quantity || 0));
                break;
            case 'qty_asc':
                data.sort((a, b) => (a.quantity || 0) - (b.quantity || 0));
                break;
            case 'oldest':
                data.sort((a, b) => new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0));
                break;
            default:
                data.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
        }

        return data;
    }, [products, search, sortBy, filterStatus]);

    /* ================= PAGINATION ================= */

    const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);

    const paginatedProducts = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filteredProducts.slice(start, start + PAGE_SIZE);
    }, [filteredProducts, page]);

    useEffect(() => {
        setPage(1);
    }, [search, sortBy, filterStatus]);

    /* ================= UI ================= */

    return (
        <div className="bg-white">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Danh sách sản phẩm</h1>
                    <p className="text-sm text-slate-500">
                        Tổng cộng {filteredProducts.length} sản phẩm {filterStatus === 'active' ? '(Đang bán)' : filterStatus === 'inactive' ? '(Tạm ẩn)' : ''}
                    </p>
                </div>

                <Link
                    to="/products/create"
                    className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition"
                >
                    <Plus size={16} />
                    Thêm sản phẩm
                </Link>
            </div>

            {/* SEARCH + FILTER STATUS + SORT */}
            <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">

                <div className="flex gap-3 items-center">

                    {/* Search */}
                    <div className="relative w-72">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Tìm sản phẩm..."
                            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-slate-900 outline-none"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setFilterStatus('active')}
                            className={`px-4 py-1.5 text-xs font-medium rounded-md transition ${filterStatus === 'active'
                                ? 'bg-white shadow text-slate-900'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Đang bán
                        </button>

                        <button
                            onClick={() => setFilterStatus('inactive')}
                            className={`px-4 py-1.5 text-xs font-medium rounded-md transition ${filterStatus === 'inactive'
                                ? 'bg-white shadow text-slate-900'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Tạm ẩn
                        </button>

                        <button
                            onClick={() => setFilterStatus('all')}
                            className={`px-4 py-1.5 text-xs font-medium rounded-md transition ${filterStatus === 'all'
                                ? 'bg-white shadow text-slate-900'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Tất cả
                        </button>
                    </div>

                </div>

                {/* SORT */}
                <div className="relative">
                    <button
                        onClick={() => setShowFilter(v => !v)}
                        className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm hover:bg-slate-50 ${showFilter ? 'bg-slate-50 border-slate-900' : ''}`}
                    >
                        <Filter size={16} />
                        Sắp xếp
                    </button>

                    {showFilter && (
                        <div className="absolute top-11 right-0 z-20 bg-white border rounded-xl shadow-xl p-3 w-56">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
                                Tiêu chí sắp xếp
                            </div>

                            <div className="space-y-1">
                                {[
                                    { val: 'newest', label: 'Mới nhất' },
                                    { val: 'oldest', label: 'Cũ nhất' },
                                    { val: 'name_asc', label: 'Tên A → Z' },
                                    { val: 'price_desc', label: 'Giá bán cao → thấp' },
                                    { val: 'qty_desc', label: 'Tồn kho cao → thấp' },
                                    { val: 'qty_asc', label: 'Tồn kho thấp → cao' },
                                ].map((opt) => (
                                    <button
                                        key={opt.val}
                                        onClick={() => {
                                            setSortBy(opt.val);
                                            setShowFilter(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 text-sm rounded-md ${sortBy === opt.val
                                            ? 'bg-slate-100 font-semibold'
                                            : 'hover:bg-slate-50'
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>

                        </div>
                    )}
                </div>

            </div>

            {/* TABLE */}
            <div className="border rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-sm border-collapse">

                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="p-4 text-left font-semibold text-slate-600">Sản phẩm</th>
                            <th className="p-4 text-left font-semibold text-slate-600">Thương hiệu</th>
                            <th className="p-4 text-left font-semibold text-slate-600">Giá bán</th>
                            <th className="p-4 text-left font-semibold text-slate-600">Tồn kho</th>
                            <th className="p-4 text-left font-semibold text-slate-600">Cập nhật</th>
                            <th className="p-4 text-left font-semibold text-slate-600">Trạng thái</th>
                            <th className="p-4 text-right font-semibold text-slate-600">Thao tác</th>
                        </tr>
                    </thead>

                    <tbody>

                        {loading ? (
                            <tr>
                                <td colSpan={7} className="p-12 text-center text-slate-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin"></div>
                                        <span>Đang tải dữ liệu...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : paginatedProducts.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-12 text-center text-slate-400">
                                    Không tìm thấy sản phẩm nào
                                </td>
                            </tr>
                        ) : (
                            paginatedProducts.map(item => (
                                <tr key={item._id} className="border-t hover:bg-slate-50 transition">

                                    <td className="p-4">
                                        <div className="flex items-center gap-3">

                                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden border">
                                                {item.images?.[0] ? (
                                                    <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <ImageIcon size={20} className="text-slate-300" />
                                                )}
                                            </div>

                                            <div>
                                                <div className="font-bold text-slate-900">
                                                    {item.name}
                                                </div>

                                                <div className="text-xs text-slate-500">
                                                    {item.categoryId?.name || 'Chưa phân loại'}
                                                </div>
                                            </div>

                                        </div>
                                    </td>

                                    <td className="p-4 text-slate-600">
                                        {item.brandId?.name || '—'}
                                    </td>

                                    <td className="p-4 font-bold text-emerald-600">
                                        {item.price?.toLocaleString()}$
                                    </td>

                                    <td className="p-4 font-semibold text-slate-700">
                                        {item.quantity ?? 0}
                                    </td>

                                    <td className="p-4 text-xs text-slate-500">
                                        {item.updatedAt
                                            ? new Date(item.updatedAt).toLocaleDateString('vi-VN')
                                            : '—'}
                                    </td>

                                    <td className="p-4">
                                        <span
                                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.isActive
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-slate-100 text-slate-500'
                                                }`}
                                        >
                                            {item.isActive ? 'Đang bán' : 'Tạm ẩn'}
                                        </span>
                                    </td>

                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-1">

                                            <Link
                                                to={`/products/view/${item._id}`}
                                                className="p-2 hover:bg-slate-200 rounded-md transition text-slate-600"
                                            >
                                                <Eye size={16} />
                                            </Link>

                                            <Link
                                                to={`/products/update/${item._id}`}
                                                className="p-2 hover:bg-slate-200 rounded-md transition text-blue-600"
                                            >
                                                <Pencil size={16} />
                                            </Link>

                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                className="p-2 hover:bg-red-50 rounded-md transition text-red-500"
                                            >
                                                <Trash2 size={16} />
                                            </button>

                                        </div>
                                    </td>

                                </tr>
                            ))
                        )}

                    </tbody>
                </table>
            </div>

            {/* PAGINATION */}

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6">

                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="p-2 border rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <span className="text-sm font-medium">
                        Trang <span className="text-slate-900">{page}</span> / {totalPages}
                    </span>

                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="p-2 border rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                        <ChevronRight size={18} />
                    </button>

                </div>
            )}

        </div>
    );
};

export default ProductIndex;