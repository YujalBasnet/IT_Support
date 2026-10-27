import { useEffect, useState } from "react";
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  Power,
  Search,
} from "lucide-react";
import api from "../services/api";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [searchTerm, setSearchTerm] = useState("");

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [submitting, setSubmitting] = useState(false);

  // Status toggle loading state
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch all categories
  const fetchCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/categories");
      setCategories(Array.isArray(data.categories) ? data.categories : []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setError(err.response?.data?.message || "Failed to load ticket categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || "",
      description: cat.description || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      if (editingCategory) {
        await api.patch(`/categories/${editingCategory.id}`, {
          name: formData.name.trim(),
          description: formData.description.trim() || null,
        });
        setMessage({
          type: "success",
          text: `Category "${formData.name}" updated successfully.`,
        });
      } else {
        await api.post("/categories", {
          name: formData.name.trim(),
          description: formData.description.trim() || null,
        });
        setMessage({
          type: "success",
          text: `Category "${formData.name}" created successfully.`,
        });
      }

      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      console.error("Failed to save category:", err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to save category.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (cat) => {
    const nextStatus = Number(cat.is_active) !== 1;
    setTogglingId(cat.id);
    setMessage({ type: "", text: "" });

    try {
      await api.patch(`/categories/${cat.id}/status`, {
        is_active: nextStatus,
      });
      setMessage({
        type: "success",
        text: `Category "${cat.name}" is now ${nextStatus ? "enabled" : "disabled"}.`,
      });
      fetchCategories();
    } catch (err) {
      console.error("Failed to toggle category status:", err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update category status.",
      });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteCategory = async (cat) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${cat.name}"? If any tickets belong to this category, it will not be deleted.`
      )
    ) {
      return;
    }

    setDeletingId(cat.id);
    setMessage({ type: "", text: "" });

    try {
      await api.delete(`/categories/${cat.id}`);
      setMessage({
        type: "success",
        text: `Category "${cat.name}" deleted successfully.`,
      });
      fetchCategories();
    } catch (err) {
      console.error("Failed to delete category:", err);
      setMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          "Failed to delete category. Try disabling it instead.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Filtered categories
  const filteredCategories = categories.filter((c) => {
    return (
      !searchTerm ||
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalCategories = categories.length;
  const activeCategories = categories.filter((c) => Number(c.is_active) === 1).length;
  const inactiveCategories = totalCategories - activeCategories;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-emerald-600">
            System Administration
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Ticket Categories
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage categorization taxonomy for support tickets (e.g., Software, Hardware, Network, Access).
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 self-start rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-emerald-700 transition cursor-pointer"
        >
          <Plus size={20} />
          Create Category
        </button>
      </div>

      {/* Message Banner */}
      {message.text && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm border ${message.type === "success"
              ? "bg-green-50 text-green-800 border-green-200"
              : "bg-red-50 text-red-800 border-red-200"
            }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 size={18} className="shrink-0" />
          ) : (
            <AlertCircle size={18} className="shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
            <Tag size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Total Categories</p>
            <h2 className="text-2xl font-bold text-slate-900">{totalCategories}</h2>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="rounded-xl bg-green-50 p-3 text-green-600">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Active (Visible)</p>
            <h2 className="text-2xl font-bold text-green-600">{activeCategories}</h2>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
            <Power size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Disabled</p>
            <h2 className="text-2xl font-bold text-slate-600">{inactiveCategories}</h2>
          </div>
        </div>
      </div>

      {/* Categories Table Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Search */}
        <div className="pb-6 border-b border-slate-100 max-w-md">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search category name or description..."
              className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>

        {error && (
          <div className="my-4 p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-slate-500">
            <RefreshCw size={28} className="animate-spin mx-auto text-emerald-600 mb-2" />
            <p className="text-sm font-medium">Loading ticket categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Tag size={40} className="mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700">No categories found</p>
            <p className="text-xs text-slate-400 mt-1">
              Create a category to allow users to classify their tickets.
            </p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-3">Category Name</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Created</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCategories.map((cat) => {
                  const isActive = Number(cat.is_active) === 1;
                  return (
                    <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-slate-900">
                        {cat.name}
                      </td>

                      <td className="py-3.5 px-3 text-xs text-slate-600 max-w-sm">
                        {cat.description || "—"}
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-200 text-slate-600"
                            }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-slate-400"
                              }`}
                          />
                          {isActive ? "Active" : "Disabled"}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-xs text-slate-400">
                        {cat.created_at
                          ? new Date(cat.created_at).toLocaleDateString()
                          : "—"}
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(cat)}
                            disabled={togglingId === cat.id}
                            className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer disabled:opacity-50 ${isActive
                                ? "text-amber-700 hover:bg-amber-50 border border-amber-200"
                                : "text-green-700 hover:bg-green-50 border border-green-200"
                              }`}
                          >
                            {togglingId === cat.id
                              ? "Updating..."
                              : isActive
                                ? "Disable"
                                : "Enable"}
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(cat)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                            title="Edit Category"
                          >
                            <Edit2 size={16} />
                          </button>

                          <button
                            onClick={() => handleDeleteCategory(cat)}
                            disabled={deletingId === cat.id}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer disabled:opacity-50"
                            title="Delete Category"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingCategory ? "Edit Category" : "Create New Category"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g. Network & Connectivity"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Descriptionn
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe issues that fall under this category..."
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formData.name.trim()}
                  className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition disabled:opacity-50"
                >
                  {submitting
                    ? "Saving..."
                    : editingCategory
                      ? "Update Category"
                      : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
