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
        <h1 className="text-2xl font-bold text-slate-800">Suppliers</h1>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          + Add Supplier
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-100 text-slate-600 text-sm">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Contact Person</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3 w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id} className="border-t border-slate-100">
                <td className="p-3">{s.name}</td>
                <td className="p-3 text-slate-500">{s.contactPerson}</td>
                <td className="p-3 text-slate-500">{s.email}</td>
                <td className="p-3 text-slate-500">{s.phoneNumber}</td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => openEditModal(s)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(s.id)}
                    className="text-red-600 hover:underline text-sm"
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
              <label className="block text-sm font-medium text-slate-600 mb-1 capitalize">
                {field === "contactPerson" ? "Contact Person" : field}
              </label>
              <input
                type="text"
                value={form[field]}
                onChange={(e) =>
                  setForm({ ...form, [field]: e.target.value })
                }
                className="w-full border border-slate-300 rounded-md px-3 py-2 mb-4"
                required={field === "name"}
              />
            </div>
          ))}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
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