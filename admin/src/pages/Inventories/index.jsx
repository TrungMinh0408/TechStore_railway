import { useEffect, useState } from "react";
import inventoriesApi from "../../api/inventoriesApi";
import branchApi from "../../api/branchApi";

export default function InventoryIndex() {
  const [inventories, setInventories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchInventories();
  }, [selectedBranch]);

  const fetchBranches = async () => {
    try {
      const res = await branchApi.getAll();

      console.log("Branches:", res.data.branches);

      setBranches(res.data.branches || []);
    } catch (error) {
      console.error("Branch API error:", error);
    }
  };

  const fetchInventories = async () => {
    try {
      const res = await inventoriesApi.getAll(selectedBranch);

      console.log("Inventories:", res.data.data);

      setInventories(res.data.data || []);
    } catch (error) {
      console.error("Inventory API error:", error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Inventories</h1>

      {/* Branch Filter */}
      <div className="mb-6">
        <select
          className="border rounded px-3 py-2"
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
        >
          <option value="">All Branch</option>

          {branches.map((branch) => (
            <option key={branch._id} value={branch._id}>
              {branch.name}
            </option>
          ))}
        </select>
      </div>

      {/* Inventory Table */}
      <div className="overflow-x-auto bg-white shadow rounded-xl">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-left">SKU</th>
              <th className="px-4 py-3 text-left">Branch</th>
              <th className="px-4 py-3 text-left">Quantity</th>
              <th className="px-4 py-3 text-left">Updated</th>
            </tr>
          </thead>

          <tbody>
            {inventories.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-6 text-gray-500"
                >
                  No inventory found
                </td>
              </tr>
            ) : (
              inventories.map((inv) => (
                <tr key={inv._id} className="border-t">
                  <td className="px-4 py-3">
                    {inv.productId?.name}
                  </td>

                  <td className="px-4 py-3">
                    {inv.productId?.sku}
                  </td>

                  <td className="px-4 py-3">
                    {inv.branchId?.name}
                  </td>

                  <td className="px-4 py-3 font-semibold">
                    {inv.quantity}
                  </td>

                  <td className="px-4 py-3 text-gray-500">
                    {new Date(inv.updatedAt).toLocaleDateString()}
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