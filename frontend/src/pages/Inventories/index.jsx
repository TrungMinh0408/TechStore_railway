import { useEffect, useState } from "react";
import inventoriesApi from "../../api/inventoriesApi";

export default function Inventory() {
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInventories = async () => {
    try {
      setLoading(true);

      const res = await inventoriesApi.getAll();

      const inventoryList = Array.isArray(res?.data?.data)
        ? res.data.data
        : [];

      setInventories(inventoryList);
    } catch (error) {
      console.error("Inventory API error:", error);
      setInventories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventories();
  }, []);

  if (loading) {
    return <div className="p-6">Loading inventories...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Inventories</h1>

      <div className="overflow-x-auto bg-white shadow rounded-2xl">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-100 text-left">
              <th className="p-4">Product</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Branch</th>
              <th className="p-4">Quantity</th>
              <th className="p-4">Updated</th>
            </tr>
          </thead>
          <tbody>
            {inventories.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-slate-500">
                  No inventory found
                </td>
              </tr>
            ) : (
              inventories.map((item) => (
                <tr key={item._id} className="border-t">
                  <td className="p-4">{item.productId?.name || "-"}</td>
                  <td className="p-4">{item.productId?.sku || "-"}</td>
                  <td className="p-4">{item.branchId?.name || "-"}</td>
                  <td className="p-4 font-semibold">{item.quantity ?? 0}</td>
                  <td className="p-4">
                    {item.updatedAt
                      ? new Date(item.updatedAt).toLocaleDateString()
                      : "-"}
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