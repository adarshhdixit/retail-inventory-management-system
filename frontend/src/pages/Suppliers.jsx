import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phoneNumber: "",
  });
  const [deleteId, setDeleteId] = useState(null);

  const loadSuppliers = () => {
    axiosInstance
      .get("/suppliers")
      .then((res) => setSuppliers(res.data))
      .catch(() => setError("Failed to load suppliers"));
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ name: "", contactPerson: "", email: "", phoneNumber: "" });
    setModalOpen(true);
  };

  const openEditModal = (s) => {
    setEditingId(s.id);
    setForm({
      name: s.name,
      contactPerson: s.contactPerson || "",
      email: s.email || "",
      phoneNumber: s.phoneNumber || "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axiosInstance.put(`/suppliers/${editingId}`, form);
      } else {
        await axiosInstance.post("/suppliers", form);
      }
      setModalOpen(false);
      loadSuppliers();
    } catch {
      setError("Failed to save supplier");
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/suppliers/${deleteId}`);
      setDeleteId(null);
      loadSuppliers();
    } catch {
      setError("Failed to delete supplier");
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Suppliers</h1>
        <button
          onClick={openCreateModal}
          className="bg-brass hover:bg-brass-dark text-white px-4 py-2 rounded-sm text-sm transition"
        >
          + Add Supplier
        </button>
      </div>

      {error && (
        <div className="bg-stamp/10 text-stamp p-3 rounded-sm mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-sm border border-ledger-line overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-ledger text-ink text-xs uppercase tracking-wide">
            <tr>
              <th className="p-3 font-semibold">Name</th>
              <th className="p-3 font-semibold">Contact Person</th>
              <th className="p-3 font-semibold">Email</th>
              <th className="p-3 font-semibold">Phone</th>
              <th className="p-3 font-semibold w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id} className="border-t border-ledger-line">
                <td className="p-3 text-ink text-sm">{s.name}</td>
                <td className="p-3 text-slate-text text-sm">{s.contactPerson}</td>
                <td className="p-3 text-slate-text text-sm">{s.email}</td>
                <td className="p-3 font-mono text-sm text-ink">{s.phoneNumber}</td>
                <td className="p-3 flex gap-3">
                  <button
                    onClick={() => openEditModal(s)}
                    className="text-brass-dark hover:underline text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(s.id)}
                    className="text-stamp hover:underline text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Supplier" : "Add Supplier"}
      >
        <form onSubmit={handleSubmit}>
          {["name", "contactPerson", "email", "phoneNumber"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-ink mb-1 capitalize">
                {field === "contactPerson" ? "Contact Person" : field}
              </label>
              <input
                type="text"
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="w-full border border-ledger-line rounded-sm px-3 py-2 mb-4 text-sm focus:outline-none focus:border-brass"
                required={field === "name"}
              />
            </div>
          ))}
          <button
            type="submit"
            className="w-full bg-brass hover:bg-brass-dark text-white py-2 rounded-sm text-sm transition"
          >
            Save
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteId !== null}
        message="Are you sure you want to delete this supplier?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Layout>
  );
}