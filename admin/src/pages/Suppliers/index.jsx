import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import supplierApi from "../../api/supplierApi";

export default function Suppliers() {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await supplierApi.getAll();
            setSuppliers(res.data || []);
        } catch (error) {
            console.error("Fetch suppliers error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this supplier?")) return;

        try {
            await supplierApi.remove(id);
            setSuppliers((prev) => prev.filter((item) => item._id !== id));
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800">
                    Supplier Management
                </h1>

                <Link
                    to="/suppliers/create"
                    className="rounded-md border border-black px-4 py-2 text-black hover:bg-black hover:text-white"
                >
                    + Add Supplier
                </Link>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow">
                <table className="min-w-full text-sm">
                    <thead className="bg-slate-100 text-slate-700">
                        <tr>
                            <th className="px-6 py-3 text-left">#</th>
                            <th className="px-6 py-3 text-left">Name</th>
                            <th className="px-6 py-3 text-left">Phone</th>
                            <th className="px-6 py-3 text-left">Email</th>
                            <th className="px-6 py-3 text-left">Address</th>
                            <th className="px-6 py-3 text-left">Status</th>
                            <th className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="7" className="py-8 text-center text-slate-500">
                                    Loading suppliers...
                                </td>
                            </tr>
                        ) : suppliers.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="py-8 text-center text-slate-500">
                                    No suppliers found
                                </td>
                            </tr>
                        ) : (
                            suppliers.map((supplier, index) => (
                                <tr key={supplier._id} className="border-t hover:bg-slate-50">
                                    <td className="px-6 py-3">{index + 1}</td>

                                    <td className="px-6 py-3 font-medium text-slate-800">
                                        {supplier.name}
                                    </td>

                                    <td className="px-6 py-3 text-slate-600">
                                        {supplier.phone}
                                    </td>

                                    <td className="px-6 py-3 text-slate-600">
                                        {supplier.email}
                                    </td>

                                    <td className="px-6 py-3 text-slate-600">
                                        {supplier.address}
                                    </td>

                                    <td className="px-6 py-3">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-medium ${supplier.isActive
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                                }`}
                                        >
                                            {supplier.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>

                                    <td className="space-x-2 px-6 py-3 text-center">
                                        <Link
                                            to={`/suppliers/view/${supplier._id}`}
                                            className="rounded border border-black px-3 py-1 text-xs text-black hover:bg-black hover:text-white"
                                        >
                                            View
                                        </Link>

                                        <Link
                                            to={`/suppliers/update/${supplier._id}`}
                                            className="rounded border border-black px-3 py-1 text-xs text-black hover:bg-black hover:text-white"
                                        >
                                            Update
                                        </Link>

                                        <button
                                            onClick={() => handleDelete(supplier._id)}
                                            className="rounded border border-black px-3 py-1 text-xs text-black hover:bg-black hover:text-white"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}