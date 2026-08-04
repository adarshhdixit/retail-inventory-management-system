import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { getCustomerLocation } from '../utils/locationCheck';

function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [locating, setLocating] = useState(false);
  const [form, setForm] = useState({
    label: '',
    houseNumber: '',
    streetName: '',
    landmark: '',
    latitude: null,
    longitude: null,
  });

  const loadAddresses = () => {
    axiosInstance
      .get('/addresses')
      .then((res) => setAddresses(res.data))
      .catch(() => setError('Failed to load addresses'));
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      label: '',
      houseNumber: '',
      streetName: '',
      landmark: '',
      latitude: null,
      longitude: null,
    });
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (addr) => {
    setEditingId(addr.id);
    setForm({
      label: addr.label,
      houseNumber: addr.houseNumber,
      streetName: addr.streetName,
      landmark: addr.landmark,
      latitude: addr.latitude,
      longitude: addr.longitude,
    });
    setError('');
    setModalOpen(true);
  };

  const handleUseCurrentLocation = async () => {
    setLocating(true);
    setError('');
    try {
      const coords = await getCustomerLocation();

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`
      );
      const data = await res.json();
      const addr = data.address || {};

      setForm((prev) => ({
        ...prev,
        latitude: coords.latitude,
        longitude: coords.longitude,
        houseNumber: addr.house_number || prev.houseNumber,
        streetName: addr.road || addr.neighbourhood || prev.streetName,
        landmark: addr.suburb || addr.village || addr.town || prev.landmark,
      }));
    } catch {
      setError('Could not fetch your location. Please check location permissions.');
    } finally {
      setLocating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await axiosInstance.put(`/addresses/${editingId}`, form);
      } else {
        await axiosInstance.post('/addresses', form);
      }
      setModalOpen(false);
      loadAddresses();
    } catch {
      setError('Failed to save address');
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/addresses/${deleteId}`);
      setDeleteId(null);
      loadAddresses();
    } catch {
      setError('Failed to delete address');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await axiosInstance.patch(`/addresses/${id}/set-default`);
      loadAddresses();
    } catch {
      setError('Failed to set default address');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-6 max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-800">My Addresses</h1>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
        >
          + Add Address
        </button>
      </div>

      {error && !modalOpen && (
        <p className="text-red-500 text-sm mb-4 max-w-2xl">{error}</p>
      )}

      {addresses.length === 0 ? (
        <p className="text-gray-500">No saved addresses yet.</p>
      ) : (
        <div className="space-y-3 max-w-2xl">
          {addresses.map((addr) => (
            <div key={addr.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-800">{addr.label}</p>
                    {addr.isDefault && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {addr.houseNumber}, {addr.streetName}
                  </p>
                  <p className="text-sm text-gray-500">Near {addr.landmark}</p>
                </div>

                <div className="flex flex-col items-end gap-2 text-sm">
                  <div className="flex gap-3">
                    <button
                      onClick={() => openEditModal(addr)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteId(addr.id)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-gray-500 hover:underline text-xs"
                    >
                      Set as default
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Link to="/store" className="inline-block mt-6 text-blue-600 text-sm">
        ← Back to store
      </Link>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Address' : 'Add Address'}
      >
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
          <input
            type="text"
            placeholder="e.g. Home, Friend's Place"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
            required
          />

          <label className="block text-sm font-medium text-gray-700 mb-1">House / Flat Number</label>
          <input
            type="text"
            value={form.houseNumber}
            onChange={(e) => setForm({ ...form, houseNumber: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
            required
          />

          <label className="block text-sm font-medium text-gray-700 mb-1">Street Name</label>
          <input
            type="text"
            value={form.streetName}
            onChange={(e) => setForm({ ...form, streetName: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
            required
          />

          <label className="block text-sm font-medium text-gray-700 mb-1">Nearby Landmark</label>
          <input
            type="text"
            value={form.landmark}
            onChange={(e) => setForm({ ...form, landmark: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
            required
          />

          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={locating}
            className="w-full mb-2 border border-blue-600 text-blue-600 py-2 rounded-md text-sm hover:bg-blue-50 transition flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {locating
              ? 'Detecting...'
              : form.latitude
              ? 'Address auto-filled — tap to re-detect'
              : 'Detect my location'}
          </button>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition mt-4"
          >
            Save Address
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteId !== null}
        message="Delete this address? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

export default Addresses;