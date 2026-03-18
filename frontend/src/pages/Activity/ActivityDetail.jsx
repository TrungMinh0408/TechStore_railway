import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import activityApi from "../../api/activityApi";

export default function ActivityDetail() {
  const { id } = useParams();
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await activityApi.getDetail(id);
      setLog(res.data.data || null);
    } catch (error) {
      console.error("Fetch log detail error:", error);
      setLog(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const formatDateTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!log) {
    return <div className="p-6 text-red-500">Log not found</div>;
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-4">
        <Link to="/activity" className="text-blue-600 hover:underline">
          ← Back to activity logs
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Activity Log Detail</h1>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Staff</p>
            <p className="font-medium">{log.actorId?.name || "-"}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{log.actorId?.email || "-"}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Action</p>
            <p className="font-medium">{log.action}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-medium">{log.status}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Branch</p>
            <p className="font-medium">{log.branchId?.name || "-"}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Time</p>
            <p className="font-medium">{formatDateTime(log.createdAt)}</p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm text-gray-500 mb-2">Description</p>
          <div className="border rounded-lg p-4 bg-slate-50">
            {log.description || "No description"}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm text-gray-500 mb-2">Metadata</p>
          <pre className="border rounded-lg p-4 bg-slate-50 overflow-auto text-sm">
            {JSON.stringify(log.metadata || {}, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}