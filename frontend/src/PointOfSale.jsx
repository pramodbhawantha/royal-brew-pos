
import { useEffect, useMemo, useState } from "react";

const API = "http://localhost:5000/api";

function PointOfSale({ onBack }) {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState({});
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [paymentMethod, setPaymentMethod] = useState("CASH");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState(null);

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("royalBrewToken")}`,
  });

  const readResponse = async (response) => {
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Request failed.");
    }

    return data;
  };

  useEffect(() => {
    const loadMenu = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("royalBrewToken");

        if (!token) {
          throw new Error("Please sign in again.");
        }

        const response = await fetch(`${API}/menu`, {
          headers: getHeaders(),
        });

        const data = await readResponse(response);

        setMenuItems(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(
          err.message === "Failed to fetch"
            ? "Cannot connect to the backend server."
            : err.message
        );
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, []);

  const categories = useMemo(
    () => [
      "ALL",
      ...new Set(menuItems.map((item) => item.category_name)),
    ],
    [menuItems]
  );

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();

    return menuItems.filter((item) => {
      const matchesCategory =
        category === "ALL" || item.category_name === category;

      const matchesSearch =
        !term ||
        [item.name, item.description, item.category_name].some(
          (value) => String(value || "").toLowerCase().includes(term)
        );

      return matchesCategory && matchesSearch;
    });
  }, [menuItems, category, search]);

  const cartItems = Object.values(cart);

  const total = cartItems.reduce(
    (sum, item) => sum + Math.round(Number(item.price) * 100) * item.quantity,
    0
  );

  const formatPrice = (amount) =>
    `LKR ${(Number(amount) / 100).toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const addToCart = (menuItem) => {
    setError("");
    setReceipt(null);

    setCart((previous) => {
      const id = String(menuItem.id);
      const existing = previous[id];

      return {
        ...previous,
        [id]: {
          ...menuItem,
          quantity: existing ? existing.quantity + 1 : 1,
        },
      };
    });
  };

  const changeQuantity = (id, amount) => {
    setCart((previous) => {
      const existing = previous[id];

      if (!existing) return previous;

      const nextQuantity = existing.quantity + amount;
      const updated = { ...previous };

      if (nextQuantity <= 0) {
        delete updated[id];
      } else {
        updated[id] = { ...existing, quantity: nextQuantity };
      }

      return updated;
    });

    setReceipt(null);
  };

  const removeItem = (id) => {
    setCart((previous) => {
      const updated = { ...previous };
      delete updated[id];
      return updated;
    });

    setReceipt(null);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      setError("Please add at least one item to the order.");
      return;
    }

    setSubmitting(true);
    setError("");
    setReceipt(null);

    try {
      const response = await fetch(`${API}/orders`, {
        method: "POST",
        headers: {
          ...getHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            menu_item_id: Number(item.id),
            quantity: item.quantity,
          })),
          payment_method: paymentMethod,
        }),
      });

      const data = await readResponse(response);

      setReceipt(data);
      setCart({});
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the backend server."
          : err.message
      );
    } finally {
      setSubmitting(false);
    }
  };

  const startNewOrder = () => {
    setReceipt(null);
    setCart({});
    setError("");
    setPaymentMethod("CASH");
  };

  return (
    <div className="min-h-screen bg-[#f8f5ec]">
      <header className="bg-[#013d2e] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border border-[#d4af37] flex items-center justify-center">
              <span className="text-[#d4af37] text-xl font-serif font-bold">
                RB
              </span>
            </div>

            <div>
              <h1 className="text-xl font-serif font-bold tracking-wide">
                ROYAL BREW
              </h1>
              <p className="text-xs text-gray-300">
                Point of Sale
              </p>
            </div>
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

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-7">
          <p className="text-sm text-gray-500">
            ROYAL BREW / SALES / POS
          </p>
          <h2 className="text-3xl font-serif font-bold text-[#013d2e] mt-2">
            Point of Sale
          </h2>
          <p className="text-gray-600 mt-2">
            Select items, build an order and complete payment.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700"
          >
            {error}
          </div>
        )}

        {receipt && (
          <section
            role="status"
            className="mb-7 bg-white border border-green-200 rounded-2xl p-6 shadow-sm"
          >
            <p className="text-green-700 font-semibold">
              {receipt.message || "Order created successfully"}
            </p>

            <h3 className="text-2xl font-serif font-bold text-[#013d2e] mt-2">
              Order #{receipt.order?.id}
            </h3>

            <p className="text-gray-600 mt-2">
              Payment: {receipt.payment?.payment_method}
            </p>

            <p className="text-xl font-semibold text-[#013d2e] mt-2">
              Total: {formatPrice(
                Math.round(Number(receipt.order?.total_amount || 0) * 100)
              )}
            </p>

            <button
              type="button"
              onClick={startNewOrder}
              className="mt-5 bg-[#013d2e] text-white px-5 py-3 rounded-lg font-semibold hover:bg-[#02513d] transition"
            >
              + New Order
            </button>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
          {/* Menu section */}
          <section className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search coffee, tea, snacks..."
                aria-label="Search menu"
                className="flex-1 px-4 py-3 border border-[#e8e1d2] bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
              />

              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                aria-label="Filter by category"
                className="px-4 py-3 border border-[#e8e1d2] bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
              >
                {categories.map((name) => (
                  <option key={name} value={name}>
                    {name === "ALL" ? "All Categories" : name}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl p-8 text-gray-600">
                Loading menu...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <article
                    key={item.id}
                    className="bg-white border border-[#e8e1d2] rounded-2xl p-5 shadow-sm flex flex-col"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {item.category_name}
                    </p>

                    <h3 className="text-lg font-semibold text-[#013d2e] mt-2">
                      {item.name}
                    </h3>

                    <p className="text-sm text-gray-500 mt-2 flex-1">
                      {item.description || "Royal Brew selection"}
                    </p>

                    <p className="text-lg font-bold text-[#013d2e] mt-4">
                      {formatPrice(
                        Math.round(Number(item.price) * 100)
                      )}
                    </p>

                    <button
                      type="button"
                      disabled={!Boolean(item.is_available) || Boolean(receipt)}
                      onClick={() => addToCart(item)}
                      className="w-full mt-4 bg-[#013d2e] text-white py-2.5 rounded-lg font-semibold hover:bg-[#02513d] transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {!Boolean(item.is_available)
                        ? "Unavailable"
                        : receipt
                          ? "Order Completed"
                          : "+ Add to Order"}
                    </button>
                  </article>
                ))}

                {filteredItems.length === 0 && (
                  <p className="text-gray-500 p-5">
                    No available menu items match your search.
                  </p>
                )}
              </div>
            )}
          </section>

          {/* Cart section */}
          <aside>
            <div className="bg-white border border-[#e8e1d2] rounded-2xl shadow-sm p-5 lg:sticky lg:top-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-serif font-bold text-[#013d2e]">
                  Current Order
                </h3>

                <span className="bg-[#e8f2ed] text-[#013d2e] px-3 py-1 rounded-full text-sm font-semibold">
                  {cartItems.reduce(
                    (sum, item) => sum + item.quantity,
                    0
                  )}{" "}
                  items
                </span>
              </div>

              <div className="mt-5 space-y-4 max-h-80 overflow-y-auto">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="border-b border-gray-100 pb-4"
                  >
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatPrice(
                            Math.round(Number(item.price) * 100)
                          )}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(String(item.id))}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => changeQuantity(String(item.id), -1)}
                          aria-label={`Decrease ${item.name} quantity`}
                          className="w-8 h-8 border border-gray-300 rounded-lg hover:bg-gray-100"
                        >
                          −
                        </button>

                        <span className="font-semibold">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => changeQuantity(String(item.id), 1)}
                          aria-label={`Increase ${item.name} quantity`}
                          className="w-8 h-8 border border-gray-300 rounded-lg hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>

                      <p className="font-semibold text-[#013d2e]">
                        {formatPrice(
                          Math.round(Number(item.price) * 100) *
                            item.quantity
                        )}
                      </p>
                    </div>
                  </div>
                ))}

                {cartItems.length === 0 && (
                  <div className="py-10 text-center text-gray-400">
                    <p className="text-3xl mb-2">☕</p>
                    <p>Your order is empty.</p>
                    <p className="text-sm mt-1">
                      Add a menu item to begin.
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-[#e8e1d2] mt-5 pt-5">
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-[#013d2e]">
                    {formatPrice(total)}
                  </p>
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  Final prices are verified by the server.
                </p>

                <h4 className="font-semibold text-gray-800 mt-6 mb-3">
                  Payment Method
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  {["CASH", "CARD"].map((method) => (
                    <button
                      key={method}
                      type="button"
                      disabled={Boolean(receipt)}
                      onClick={() => setPaymentMethod(method)}
                      className={`py-3 rounded-lg border font-semibold transition ${
                        paymentMethod === method
                          ? "bg-[#013d2e] text-white border-[#013d2e]"
                          : "bg-white text-gray-600 border-gray-300 hover:border-[#013d2e]"
                      }`}
                    >
                      {method === "CASH" ? "Cash" : "Card"}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={
                    loading ||
                    submitting ||
                    cartItems.length === 0 ||
                    Boolean(receipt)
                  }
                  onClick={handleCheckout}
                  className="w-full mt-5 bg-[#d4af37] text-[#013d2e] py-3.5 rounded-lg font-bold hover:bg-[#c5a02e] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Processing..." : "Complete Payment"}
                </button>
              </div>
            </div>
          </aside>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          Royal Brew Café Management System
        </p>
      </main>
    </div>
  );
}

export default PointOfSale;
