import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import Layout from "../components/Layout";

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");

  const loadStaff = () => {
    axiosInstance
      .get("/staff")
      .then((res) => setStaff(res.data))
      .catch(() => setError("Failed to load staff"));
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await axiosInstance.post(`/staff?name=${encodeURIComponent(name)}`);
      setName("");
      setError("");
      loadStaff();
    } catch {
      setError("Failed to add staff member");
    }
  };

  const startEdit = (s) => {
    setEditingId(s.id);
    setEditName(s.name);
  };

  const handleUpdate = async (id) => {
    try {
      await axiosInstance.put(`/staff/${id}?name=${encodeURIComponent(editName)}`);
      setEditingId(null);
      setError("");
      loadStaff();
    } catch {
      setError("Failed to update staff member");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/staff/${id}`);
      setError("");
      loadStaff();
    } catch {
      setError("Failed to delete staff member");
    }
  };

  return (
    <Layout>
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">
        Staff
      </h1>

      {error && (
        <div className="bg-stamp/10 text-stamp p-3 rounded-sm mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleAdd} className="flex gap-2 mb-6 max-w-md">
        <input
          type="text"
          placeholder="Staff member name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 border border-ledger-line bg-white rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-brass"
        />
        <button
          type="submit"
          className="bg-brass hover:bg-brass-dark text-white px-4 py-2 rounded-sm text-sm transition"
        >
          Add
        </button>
      </form>

      <div className="bg-white rounded-sm border border-ledger-line max-w-md overflow-hidden">
        {staff.length === 0 ? (
          <p className="p-4 text-slate-text text-sm">No staff members yet.</p>
        ) : (
          <table className="w-full text-left">
            <tbody>
              {staff.map((s) => (
                <tr key={s.id} className="border-t border-ledger-line first:border-t-0">
                  <td className="p-3">
                    {editingId === s.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="border border-ledger-line rounded-sm px-2 py-1 text-sm w-full"
                      />
                    ) : (
                      <span className="text-ink text-sm">{s.name}</span>
                    )}
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    {editingId === s.id ? (
                      <>
                        <button
                          onClick={() => handleUpdate(s.id)}
                          className="text-sage text-sm hover:underline mr-3"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-slate-text text-sm hover:underline"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(s)}
                          className="text-brass-dark text-sm hover:underline mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="text-stamp text-sm hover:underline"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
 }