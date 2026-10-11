import { useState } from "react";
import MenuManagement from "./MenuManagement";
import PointOfSale from "./PointOfSale";
import Reports from "./Reports";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const token = localStorage.getItem("royalBrewToken");
      const user = localStorage.getItem("royalBrewUser");

      return token && user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  });
  const [currentPage, setCurrentPage] = useState("dashboard");

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      if (!data.token || !data.user) {
        throw new Error("Invalid response received from the server.");
      }

      localStorage.setItem("royalBrewToken", data.token);
      localStorage.setItem(
        "royalBrewUser",
        JSON.stringify(data.user)
      );

      setCurrentUser(data.user);
      setPassword("");
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the server. Please check that the backend is running."
          : err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("royalBrewToken");
    localStorage.removeItem("royalBrewUser");

    setCurrentUser(null);
    setEmail("");
    setPassword("");
    setError("");
  };

  // Dashboard after successful login

if (currentUser) {
  if (currentPage === "reports") {
    return (
      <Reports
        onBack={() => setCurrentPage("dashboard")}
      />
    );
  }

  if (currentPage === "menu") {
    return (
      <MenuManagement
        onBack={() => setCurrentPage("dashboard")}
      />
    );
  }
  if (currentPage === "pos") {
    return (
      <PointOfSale
        onBack={() => setCurrentPage("dashboard")}
      />
    );
  }
  return (
      <div className="min-h-screen bg-[#f8f5ec]">
        <header className="bg-[#013d2e] text-white px-6 py-5 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
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
                  Café Management System
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="border border-[#d4af37] text-[#d4af37] px-4 py-2 rounded-lg hover:bg-[#d4af37] hover:text-[#013d2e] transition"
            >
              Sign Out
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-10">
          <div className="mb-8">
            <p className="text-sm text-gray-500">
              ROYAL BREW / DASHBOARD
            </p>

            <h2 className="text-3xl font-serif font-bold text-[#013d2e] mt-2">
              Welcome, {currentUser.name}
            </h2>

            <p className="text-gray-600 mt-2">
              Welcome to your café management workspace.
            </p>
          </div>

          <div className="bg-white border border-[#e8e1d2] rounded-2xl p-6 shadow-sm mb-8">
            <p className="text-sm text-gray-500">
              Signed in as
            </p>

            <p className="text-lg font-semibold text-[#013d2e] mt-1">
              {currentUser.email}
            </p>

            <span className="inline-block mt-3 bg-[#e8f2ed] text-[#013d2e] px-3 py-1 rounded-full text-sm font-semibold">
              {currentUser.role}
            </span>

            <p className="text-sm text-gray-500 mt-3">
              Authentication successful.
            </p>
          </div>

          <h3 className="text-xl font-semibold text-[#013d2e] mb-4">
            System Modules
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                title: "Menu Management",
                description:
                  "Manage café menu items and prices.",
              },
              {
                title: "Point of Sale",
                description:
                  "Create customer orders and calculate totals.",
              },
              {
                title: "Sales Reports",
                description:
                  "View daily and monthly sales reports.",
              },
            ].map((module) => (
              <div
                key={module.title}
                className="bg-white border border-[#e8e1d2] rounded-2xl p-6 shadow-sm"
              >
                <div className="w-10 h-1 bg-[#d4af37] rounded-full mb-4" />

                <h4 className="text-lg font-semibold text-[#013d2e]">
                  {module.title}
                </h4>

                <p className="text-sm text-gray-600 mt-2 leading-6">
                  {module.description}
                </p>
{module.title === "Menu Management" ? (
  currentUser.role === "ADMIN" ? (
    <button
      type="button"
      onClick={() => setCurrentPage("menu")}
      className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#013d2e] hover:text-[#b08d20] transition"
    >
      Open Menu Management →
    </button>
  ) : (
    <p className="text-xs text-gray-400 mt-5">
      Admin access required
    </p>
  )
) : module.title === "Point of Sale" ? (
  <button
    type="button"
    onClick={() => setCurrentPage("pos")}
    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#013d2e] hover:text-[#b08d20] transition"
  >
    Open Point of Sale →
  </button>
) : module.title === "Sales Reports" ? (
  currentUser.role === "ADMIN" ? (
    <button
      type="button"
      onClick={() => setCurrentPage("reports")}
      className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#013d2e] hover:text-[#b08d20] transition"
    >
      Open Sales Reports →
    </button>
  ) : (
    <p className="text-xs text-gray-400 mt-5">
      Admin access required
    </p>
  )
) : (
  <p className="text-xs text-gray-400 mt-5">
    Module setup pending
  </p>
)}



              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Login page
  return (
    <div className="min-h-screen bg-[#f8f5ec] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#013d2e] mb-4 shadow-lg">
            <span className="text-[#d4af37] text-3xl font-serif font-bold">
              RB
            </span>
          </div>

          <h1 className="text-4xl font-serif font-bold text-[#013d2e] tracking-wide">
            ROYAL BREW
          </h1>

          <p className="text-gray-500 mt-2 text-sm tracking-widest uppercase">
            Café Point of Sale
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-[#e8e1d2]">
          <div className="mb-7">
            <h2 className="text-2xl font-semibold text-gray-800">
              Welcome Back
            </h2>

            <p className="text-gray-500 mt-1 text-sm">
              Sign in to access the Royal Brew system
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-5">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                autoComplete="username"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] transition"
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] transition"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#013d2e] text-white py-3 rounded-lg font-semibold tracking-wide hover:bg-[#02513d] transition duration-200 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "SIGNING IN..." : "SIGN IN"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Royal Brew Café Management System
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 Royal Brew. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default App;
