
import { useEffect, useMemo, useState } from "react";

const API = "http://localhost:5000/api";

const emptyForm = {
  category_id: "",
  name: "",
  description: "",
  price: "",
  is_available: true,
};

function MenuManagement({ onBack }) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const getHeaders = (json = false) => {
    const token = localStorage.getItem("royalBrewToken");

    return {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(json ? { "Content-Type": "application/json" } : {}),
    };
  };

  const readResponse = async (response) => {
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Request failed.");
    }

    return data;
  };

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("royalBrewToken");

      if (!token) {
        throw new Error("Please sign in again to continue.");
      }

      const [menuResponse, categoryResponse] = await Promise.all([
        fetch(`${API}/menu`, {
          headers: getHeaders(),
        }),
        fetch(`${API}/categories`, {
          headers: getHeaders(),
        }),
      ]);

      const menuData = await readResponse(menuResponse);
      const categoryData = await readResponse(categoryResponse);

      setItems(Array.isArray(menuData) ? menuData : []);
      setCategories(
        Array.isArray(categoryData) ? categoryData : []
      );
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the server. Check that the backend is running."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return items;

    return items.filter((item) =>
      [
        item.name,
        item.description,
        item.category_name,
      ].some((value) =>
        String(value || "").toLowerCase().includes(term)
      )
    );
  }, [items, search]);

  const openCreateForm = () => {
    setEditingItem(null);
    setForm({
      ...emptyForm,
      category_id: categories[0] ? String(categories[0].id) : "",
    });
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const openEditForm = (item) => {
    setEditingItem(item);

    setForm({
      category_id: String(item.category_id),
      name: item.name || "",
      description: item.description || "",
      price: String(item.price),
      is_available: Boolean(item.is_available),
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const payload = {
        category_id: Number(form.category_id),
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        is_available: form.is_available,
      };

      const url = editingItem
        ? `${API}/menu/${editingItem.id}`
        : `${API}/menu`;

      const response = await fetch(url, {
        method: editingItem ? "PUT" : "POST",
        headers: getHeaders(true),
        body: JSON.stringify(payload),
      });

      const data = await readResponse(response);

      setSuccess(
        data.message ||
          (editingItem
            ? "Menu item updated successfully."
            : "Menu item created successfully.")
      );

      setShowForm(false);
      setEditingItem(null);
      setForm(emptyForm);

      await loadData();
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the server."
          : err.message
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Delete "${item.name}" from the menu?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API}/menu/${item.id}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        }
      );

      const data = await readResponse(response);

      setSuccess(data.message || "Menu item deleted successfully.");

      await loadData();
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the server."
          : err.message
      );
    }
  };

  const formatPrice = (price) =>
    `LKR ${Number(price).toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="min-h-screen bg-[#f8f5ec]">
      {/* Header */}
      <header className="bg-[#013d2e] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold tracking-wide">
              ROYAL BREW
            </h1>
            <p className="text-sm text-gray-300">
              Café Management System
            </p>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="border border-[#d4af37] text-[#d4af37] px-4 py-2 rounded-lg hover:bg-[#d4af37] hover:text-[#013d2e] transition"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Page title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-gray-500">
              ROYAL BREW / ADMIN / MENU
            </p>

            <h2 className="text-3xl font-serif font-bold text-[#013d2e] mt-2">
              Menu Management
            </h2>

            <p className="text-gray-600 mt-2">
              Manage menu items, categories and prices.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="bg-[#013d2e] text-white px-5 py-3 rounded-lg font-semibold hover:bg-[#02513d] transition shadow-md"
          >
            + Add Menu Item
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div
            role="alert"
            className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-5 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800"
          >
            {success}
          </div>
        )}

        {/* Add/Edit form */}
        {showForm && (
          <section className="bg-white rounded-2xl border border-[#e8e1d2] shadow-sm p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-[#013d2e]">
                {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
              </h3>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingItem(null);
                  setError("");
                }}
                className="text-gray-500 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="menu-name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Item Name *
                  </label>

                  <input
                    id="menu-name"
                    type="text"
                    maxLength={150}
                    required
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    placeholder="e.g. Cappuccino"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="menu-category"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Category *
                  </label>

                  <select
                    id="menu-category"
                    required
                    value={form.category_id}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        category_id: event.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                  >
                    <option value="">Select a category</option>

                    {categories.map((category) => (
                      <option
                        key={category.id}
                        value={String(category.id)}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="menu-price"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Price (LKR) *
                  </label>

                  <input
                    id="menu-price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={form.price}
                    onChange={(event) =>
                      setForm({ ...form, price: event.target.value })
                    }
                    placeholder="450.00"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="menu-description"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Description
                  </label>

                  <input
                    id="menu-description"
                    type="text"
                    maxLength={255}
                    value={form.description}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        description: event.target.value,
                      })
                    }
                    placeholder="Short item description"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                  />
                </div>
              </div>

              {editingItem && (
                <label className="flex items-center gap-3 mt-5 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.is_available}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        is_available: event.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-[#013d2e]"
                  />
                  Available for sale
                </label>
              )}

              <button
                type="submit"
                disabled={saving || categories.length === 0}
                className="mt-6 bg-[#013d2e] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#02513d] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving
                  ? "Saving..."
                  : editingItem
                    ? "Save Changes"
                    : "Create Menu Item"}
              </button>

              {categories.length === 0 && (
                <p className="text-sm text-red-600 mt-3">
                  Categories are unavailable. Check the Categories API.
                </p>
              )}
            </form>
          </section>
        )}

        {/* Search and count */}
        <section className="bg-white rounded-2xl border border-[#e8e1d2] shadow-sm p-5 mb-6">
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by item or category..."
              aria-label="Search menu items"
              className="w-full md:max-w-md px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
            />

            <p className="text-sm text-gray-500">
              {filteredItems.length} menu item
              {filteredItems.length === 1 ? "" : "s"}
            </p>
          </div>
        </section>

        {/* Menu table */}
        <section className="bg-white rounded-2xl border border-[#e8e1d2] shadow-sm overflow-hidden">
          {loading ? (
            <p className="p-8 text-gray-600">Loading menu items...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#f8f5ec] text-[#013d2e]">
                  <tr>
                    <th className="px-5 py-4 text-sm font-semibold">Item</th>
                    <th className="px-5 py-4 text-sm font-semibold">Category</th>
                    <th className="px-5 py-4 text-sm font-semibold">Price</th>
                    <th className="px-5 py-4 text-sm font-semibold">Status</th>
                    <th className="px-5 py-4 text-sm font-semibold">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-[#fcfaf5]">
                      <td className="px-5 py-4 min-w-56">
                        <p className="font-semibold text-gray-800">
                          {item.name}
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                          {item.description || "No description"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {item.category_name}
                      </td>

                      <td className="px-5 py-4 font-semibold text-[#013d2e] whitespace-nowrap">
                        {formatPrice(item.price)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                            Boolean(item.is_available)
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {Boolean(item.is_available)
                            ? "Available"
                            : "Unavailable"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => openEditForm(item)}
                            className="text-[#013d2e] font-semibold hover:underline"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            className="text-red-600 font-semibold hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredItems.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-12 text-center text-gray-500"
                      >
                        {search
                          ? "No menu items match your search."
                          : "No menu items found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="text-center text-xs text-gray-400 mt-6">
          Royal Brew Café Management System
        </p>
      </main>
    </div>
  );
}

export default MenuManagement;
