import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import purchaseApi from "../../api/purchaseApi";
import { toast } from "react-toastify";

export default function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();

  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [fromDate, setFromDate] = useState(searchParams.get("fromDate") || "");
  const [toDate, setToDate] = useState(searchParams.get("toDate") || "");

  const fetchPurchases = async (params = {}) => {
    try {
      setLoading(true);

      const res = await purchaseApi.getAll(params);

      const purchaseList = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
          ? res.data
          : [];

      setPurchases(purchaseList);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load purchases");
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = {
      status: searchParams.get("status") || "",
      fromDate: searchParams.get("fromDate") || "",
      toDate: searchParams.get("toDate") || "",
    };

    fetchPurchases(params);
  }, [searchParams]);

  const handleFilter = () => {
    const params = {};

    if (status) params.status = status;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    setSearchParams(params);
  };

  const renderStatus = (status) => {
    const colors = {
      pending: "bg-amber-100 text-amber-700 border-amber-200",
      confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
      cancelled: "bg-rose-100 text-rose-700 border-rose-200",
      returned: "bg-blue-100 text-blue-700 border-blue-200",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium border ${colors[status] || "bg-gray-100 text-gray-600"
          }`}
      >
        {status?.toUpperCase()}
      </span>
    );
  };

  const handleConfirm = async (id) => {
    if (!window.confirm("Confirm this purchase?")) return;

    try {
      await purchaseApi.confirm(id);
      toast.success("Purchase confirmed");
      fetchPurchases({
        status,
        fromDate,
        toDate,
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Confirm failed");
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this purchase?")) return;

    try {
      await purchaseApi.cancel(id);
      toast.success("Purchase cancelled");
      fetchPurchases({
        status,
        fromDate,
        toDate,
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Cancel failed");
    }
  };

  const handleReturn = async (id) => {
    if (!window.confirm("Return this purchase to supplier?")) return;

    try {
      await purchaseApi.returnPurchase(id);
      toast.success("Purchase returned");
      fetchPurchases({
        status,
        fromDate,
        toDate,
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Return failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this purchase?")) return;

    try {
      await purchaseApi.remove(id);
      toast.success("Purchase deleted");
      fetchPurchases({
        status,
        fromDate,
        toDate,
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500 font-medium">
        <div className="animate-pulse">Loading purchases...</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Purchases
            </h1>
            <p className="text-gray-500 text-sm">
              Manage your inventory procurement
            </p>
          </div>

          <Link
            to="/purchases/create"
            className="bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-sm flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            Create Purchase
          </Link>
        </div>

        {/* FILTER */}
        <div className="flex gap-4 mb-6 items-end">
          <div>
            <label className="text-sm text-gray-600 block mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="returned">Returned</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600 block mb-1">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 block mb-1">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <button
            onClick={handleFilter}
            className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800"
          >
            Filter
          </button>
        </div>

        {/* Table */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 font-semibold text-gray-600 text-sm">
                  Supplier
                </th>
                <th className="p-4 font-semibold text-gray-600 text-sm">
                  Branch
                </th>
                <th className="p-4 font-semibold text-gray-600 text-sm">
                  Product
                </th>
                <th className="p-4 font-semibold text-gray-600 text-sm">
                  Qty
                </th>
                <th className="p-4 font-semibold text-gray-600 text-sm">
                  Cost
                </th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-center">
                  Status
                </th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-gray-400 italic">
                    No purchases found in the database.
                  </td>
                </tr>
              ) : (
                purchases.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-medium text-gray-700">
                      {item?.supplierId?.name || "-"}
                    </td>

                    <td className="p-4 text-gray-600">
                      {item?.branchId?.name || "-"}
                    </td>

                    <td className="p-4 text-gray-600 font-medium">
                      {item?.productId?.name || "-"}
                    </td>

                    <td className="p-4 text-gray-600">
                      {item?.quantity ?? 0}
                    </td>

                    <td className="p-4 text-gray-900 font-semibold">
                      ${(item?.costPrice ?? 0).toLocaleString()}
                    </td>

                    <td className="p-4 text-center">
                      {renderStatus(item?.status)}
                    </td>

                    <td className="p-4">
                      <div className="flex gap-2 justify-end">

                        {item?.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleConfirm(item._id)}
                              className="px-3 py-1.5 text-xs font-bold uppercase border border-black text-black hover:bg-black hover:text-white rounded"
                            >
                              Confirm
                            </button>

                            <button
                              onClick={() => handleCancel(item._id)}
                              className="px-3 py-1.5 text-xs font-bold bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 rounded"
                            >
                              Cancel
                            </button>

                            <button
                              onClick={() => handleDelete(item._id)}
                              className="p-1.5 text-gray-400 hover:text-rose-600"
                              title="Delete"
                            >
                              🗑
                            </button>
                          </>
                        )}

                        {item?.status === "confirmed" && (
                          <>
                            <button
                              onClick={() => handleReturn(item._id)}
                              className="px-3 py-1.5 text-xs font-medium border border-blue-500 text-blue-600 bg-white hover:bg-blue-50 rounded-md transition"
                            >
                              Return
                            </button>

                            <Link
                              to={`/purchases/${item._id}`}
                              className="px-3 py-1.5 text-xs font-bold border border-gray-300 rounded hover:bg-gray-100 text-gray-700"
                            >
                              View
                            </Link>
                          </>
                        )}

                        {(item?.status === "cancelled" ||
                          item?.status === "returned") && (
                            <Link
                              to={`/purchases/${item._id}`}
                              className="px-3 py-1.5 text-xs font-bold border border-gray-300 rounded hover:bg-gray-100 text-gray-700"
                            >
                              View
                            </Link>
                          )}

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}