import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import supplierApi from "../../api/supplierApi";

export default function ViewSupplier() {
    const { id } = useParams();
    const [supplier, setSupplier] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchSupplier = async () => {
        try {
            setLoading(true);
            const res = await supplierApi.getById(id);
            setSupplier(res.data);
        } catch (error) {
            console.error("Fetch supplier detail error:", error);
            alert(error?.response?.data?.message || "Failed to load supplier");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSupplier();
    }, [id]);

    if (loading) {
        return <div className="p-6 text-slate-500">Loading supplier...</div>;
    }

    if (!supplier) {
        return <div className="p-6 text-slate-500">Supplier not found.</div>;
    }

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800">Supplier Detail</h1>
                <Link
                    to="/suppliers"
                    className="rounded-md border border-black px-4 py-2 text-black hover:bg-black hover:text-white"
                >
                    Back
                </Link>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                        <p className="mb-1 text-sm text-slate-500">Name</p>
                        <p className="font-medium text-slate-800">{supplier.name}</p>
                    </div>

                    <div>
                        <p className="mb-1 text-sm text-slate-500">Phone</p>
                        <p className="font-medium text-slate-800">{supplier.phone}</p>
                    </div>

                    <div>
                        <p className="mb-1 text-sm text-slate-500">Email</p>
                        <p className="font-medium text-slate-800">{supplier.email}</p>
                    </div>

                    <div>
                        <p className="mb-1 text-sm text-slate-500">Address</p>
                        <p className="font-medium text-slate-800">{supplier.address}</p>
                    </div>

                    <div>
                        <p className="mb-1 text-sm text-slate-500">Status</p>
                        <span
                            className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${supplier.isActive
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                        >
                            {supplier.isActive ? "Active" : "Inactive"}
                        </span>
                    </div>

                    <div>
                        <p className="mb-1 text-sm text-slate-500">Created At</p>
                        <p className="font-medium text-slate-800">
                            {supplier.createdAt
                                ? new Date(supplier.createdAt).toLocaleString()
                                : "N/A"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}