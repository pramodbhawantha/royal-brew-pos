
import { useState } from "react";

const API = "http://localhost:5000/api";

const getLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatLKR = (amount) =>
  `LKR ${Number(amount || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const MONTHS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

function Reports({ onBack }) {
  const today = getLocalDate();
  const currentDate = new Date();

  const [reportType, setReportType] = useState("daily");
  const [reportDate, setReportDate] = useState(today);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1);

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const getToken = () => localStorage.getItem("royalBrewToken");

  const getQuery = () => {
    if (reportType === "daily") {
      return `date=${encodeURIComponent(reportDate)}`;
    }

    return `year=${year}&month=${month}`;
  };

  const getReportUrl = () =>
    `${API}/reports/${reportType}?${getQuery()}`;

  const getCsvUrl = () =>
    `${API}/reports/${reportType}/csv?${getQuery()}`;

  const clearReport = () => {
    setReport(null);
    setError("");
  };

  const handleGenerate = async () => {
    const token = getToken();

    if (!token) {
      setError("Your session has expired. Please sign in again.");
      return;
    }

    if (reportType === "daily" && !reportDate) {
      setError("Please select a report date.");
      return;
    }

    if (
      reportType === "monthly" &&
      (!Number.isInteger(Number(year)) ||
        Number(year) < 2000 ||
        Number(year) > 2100 ||
        !Number.isInteger(Number(month)) ||
        Number(month) < 1 ||
        Number(month) > 12)
    ) {
      setError("Please select a valid year and month.");
      return;
    }

    setLoading(true);
    setError("");
    setReport(null);

    try {
      const response = await fetch(getReportUrl(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate report.");
      }

      setReport(data);
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

  const handleDownload = async () => {
    const token = getToken();

    if (!token) {
      setError("Your session has expired. Please sign in again.");
      return;
    }

    setDownloading(true);
    setError("");

    try {
      const response = await fetch(getCsvUrl(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to download CSV.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      const filename =
        reportType === "daily"
          ? `royal-brew-daily-${reportDate}.csv`
          : `royal-brew-monthly-${year}-${String(month).padStart(2, "0")}.csv`;

      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the backend server."
          : err.message
      );
    } finally {
      setDownloading(false);
    }
  };

  const summary = report?.summary;
  const topItems = report?.top_items || [];

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
                Sales Reports
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

      <main className="max-w-7xl mx-auto px-6 py-9">
        <div className="mb-8">
          <p className="text-sm text-gray-500">
            ROYAL BREW / ADMIN / REPORTS
          </p>

          <h2 className="text-3xl font-serif font-bold text-[#013d2e] mt-2">
            Sales Reports
          </h2>

          <p className="text-gray-600 mt-2">
            Review revenue, completed orders and best-selling menu items.
          </p>
        </div>

        {/* Report filters */}
        <section className="bg-white border border-[#e8e1d2] rounded-2xl p-6 shadow-sm mb-7">
          <h3 className="text-lg font-semibold text-[#013d2e] mb-5">
            Generate a Report
          </h3>

          <div className="flex flex-wrap gap-3 mb-6">
            <button
              type="button"
              onClick={() => {
                setReportType("daily");
                clearReport();
              }}
              className={`px-5 py-3 rounded-lg font-semibold border transition ${
                reportType === "daily"
                  ? "bg-[#013d2e] text-white border-[#013d2e]"
                  : "bg-white text-gray-600 border-gray-300 hover:border-[#013d2e]"
              }`}
            >
              Daily Report
            </button>

            <button
              type="button"
              onClick={() => {
                setReportType("monthly");
                clearReport();
              }}
              className={`px-5 py-3 rounded-lg font-semibold border transition ${
                reportType === "monthly"
                  ? "bg-[#013d2e] text-white border-[#013d2e]"
                  : "bg-white text-gray-600 border-gray-300 hover:border-[#013d2e]"
              }`}
            >
              Monthly Report
            </button>
          </div>

          {reportType === "daily" ? (
            <div className="max-w-sm">
              <label
                htmlFor="report-date"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Report Date
              </label>

              <input
                id="report-date"
                type="date"
                value={reportDate}
                onChange={(event) => {
                  setReportDate(event.target.value);
                  clearReport();
                }}
                max={today}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
              <div>
                <label
                  htmlFor="report-year"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Year
                </label>

                <input
                  id="report-year"
                  type="number"
                  min="2000"
                  max="2100"
                  value={year}
                  onChange={(event) => {
                    setYear(event.target.value);
                    clearReport();
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                />
              </div>

              <div>
                <label
                  htmlFor="report-month"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Month
                </label>

                <select
                  id="report-month"
                  value={month}
                  onChange={(event) => {
                    setMonth(Number(event.target.value));
                    clearReport();
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                >
                  {MONTHS.map((name, index) => (
                    <option key={name} value={index + 1}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading || downloading}
              className="bg-[#013d2e] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#02513d] transition disabled:opacity-60"
            >
              {loading ? "Generating..." : "Generate Report"}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={loading || downloading || !report}
              className="bg-[#d4af37] text-[#013d2e] px-6 py-3 rounded-lg font-semibold hover:bg-[#c5a02e] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading ? "Downloading..." : "Download CSV"}
            </button>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6"
          >
            {error}
          </div>
        )}

        {!report && !loading && !error && (
          <div className="bg-white border border-[#e8e1d2] rounded-2xl p-10 text-center">
            <p className="text-3xl mb-3">📊</p>
            <h3 className="text-xl font-semibold text-[#013d2e]">
              Your sales overview
            </h3>
            <p className="text-gray-500 mt-2">
              Select a date or month and generate a report to view sales data.
            </p>
          </div>
        )}

        {loading && (
          <div className="bg-white border border-[#e8e1d2] rounded-2xl p-10 text-center text-gray-500">
            Loading report data...
          </div>
        )}

        {report && summary && (
          <>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="text-xl font-serif font-bold text-[#013d2e]">
                  {reportType === "daily"
                    ? "Daily Sales Summary"
                    : "Monthly Sales Summary"}
                </h3>

                <p className="text-gray-500 text-sm mt-1">
                  {reportType === "daily"
                    ? `Date: ${report.date}`
                    : `${MONTHS[Number(report.month) - 1]} ${report.year}`}
                </p>
              </div>

              <span className="text-sm text-gray-500">
                Completed orders only
              </span>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
              {[
                {
                  label: "Total Orders",
                  value: Number(summary.total_orders || 0).toLocaleString("en-LK"),
                  detail: "Completed orders",
                },
                {
                  label: "Total Revenue",
                  value: formatLKR(summary.total_revenue),
                  detail: "Paid sales",
                },
                {
                  label: "Cash Sales",
                  value: formatLKR(summary.cash_sales),
                  detail: "Cash payments",
                },
                {
                  label: "Card Sales",
                  value: formatLKR(summary.card_sales),
                  detail: "Card payments",
                },
              ].map((item) => (
                <article
                  key={item.label}
                  className="bg-white border border-[#e8e1d2] rounded-2xl p-5 shadow-sm"
                >
                  <div className="w-10 h-1 bg-[#d4af37] rounded-full mb-4" />
                  <p className="text-sm text-gray-500">{item.label}</p>
                  <p className="text-2xl font-bold text-[#013d2e] mt-2 break-words">
                    {item.value}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {item.detail}
                  </p>
                </article>
              ))}
            </div>

            {/* Top items */}
            <section className="bg-white border border-[#e8e1d2] rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-[#eee7db]">
                <h3 className="text-xl font-serif font-bold text-[#013d2e]">
                  Top Selling Items
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Ranked by quantity sold.
                </p>
              </div>

              {topItems.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No paid orders were found for this period.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#f8f5ec]">
                      <tr>
                        <th className="px-6 py-4 text-sm font-semibold text-[#013d2e]">
                          Menu Item
                        </th>
                        <th className="px-6 py-4 text-sm font-semibold text-[#013d2e]">
                          Quantity Sold
                        </th>
                        <th className="px-6 py-4 text-sm font-semibold text-[#013d2e]">
                          Sales Amount
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {topItems.map((item) => (
                        <tr
                          key={item.menu_item_id}
                          className="border-t border-gray-100 hover:bg-[#fcfaf5]"
                        >
                          <td className="px-6 py-4 font-medium text-gray-800">
                            {item.menu_item_name}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {Number(item.quantity_sold || 0).toLocaleString("en-LK")}
                          </td>
                          <td className="px-6 py-4 font-semibold text-[#013d2e] whitespace-nowrap">
                            {formatLKR(item.sales_amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

        <p className="text-center text-xs text-gray-400 mt-8">
          Royal Brew Café Management System
        </p>
      </main>
    </div>
  );
}

export default Reports;
