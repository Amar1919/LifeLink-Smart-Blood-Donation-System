
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

const BLOOD_GROUPS = [
  "A+", "A-", "B+", "B-",
  "AB+", "AB-", "O+", "O-",
];

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [allocating, setAllocating] = useState(false);

  const [form, setForm] = useState({
    requestId: "",
    bloodBankId: "",
    bloodGroup: "",
    unitsAllocated: 1,
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  // Initial inventory loading
  useEffect(() => {
    let active = true;

    async function loadInventory() {
      try {
        const response = await apiRequest("/inventory");

        if (active) {
          const rows = Array.isArray(response.data)
            ? response.data
            : [];

          setInventory(rows);
        }
      } catch (error) {
        if (active) {
          setMessage(error.message || "Unable to fetch inventory.");
          setMessageType("error");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadInventory();

    return () => {
      active = false;
    };
  }, []);

  // Blood bank list
  const bloodBanks = useMemo(() => {
    return inventory.reduce((banks, item) => {
      const id = String(item.blood_bank_id);

      if (!banks.some((bank) => bank.id === id)) {
        banks.push({
          id,
          name: item.bank_name,
        });
      }

      return banks;
    }, []);
  }, [inventory]);

  // Blood groups available in selected bank
  const availableGroups = useMemo(() => {
    return inventory.filter(
      (item) => String(item.blood_bank_id) === form.bloodBankId
    );
  }, [inventory, form.bloodBankId]);

  const selectedStock = inventory.find(
    (item) =>
      String(item.blood_bank_id) === form.bloodBankId &&
      item.blood_group === form.bloodGroup
  );

  const totalUnits = inventory.reduce(
    (total, item) => total + Number(item.units_available || 0),
    0
  );

  const totalBanks = bloodBanks.length;

  const stockByGroup = BLOOD_GROUPS.map((group) => ({
    group,
    units: inventory
      .filter((item) => item.blood_group === group)
      .reduce(
        (total, item) => total + Number(item.units_available || 0),
        0
      ),
  }));

  // Refresh inventory manually
  async function handleRefresh() {
    try {
      setRefreshing(true);
      setMessage("");

      const response = await apiRequest("/inventory");

      const rows = Array.isArray(response.data)
        ? response.data
        : [];

      setInventory(rows);
    } catch (error) {
      setMessage(error.message || "Unable to refresh inventory.");
      setMessageType("error");
    } finally {
      setRefreshing(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => {
      if (name === "bloodBankId") {
        return {
          ...previous,
          bloodBankId: value,
          bloodGroup: "",
        };
      }

      return {
        ...previous,
        [name]: value,
      };
    });

    setMessage("");
  }

  // Allocate blood
  async function handleAllocation(event) {
    event.preventDefault();

    setMessage("");

    const requestId = Number(form.requestId);
    const bloodBankId = Number(form.bloodBankId);
    const unitsAllocated = Number(form.unitsAllocated);

    if (
      !Number.isInteger(requestId) ||
      requestId <= 0 ||
      !Number.isInteger(bloodBankId) ||
      bloodBankId <= 0 ||
      !form.bloodGroup ||
      !Number.isInteger(unitsAllocated) ||
      unitsAllocated <= 0
    ) {
      setMessage("Please enter valid allocation details.");
      setMessageType("error");
      return;
    }

    if (!selectedStock) {
      setMessage("Please select a valid blood group and blood bank.");
      setMessageType("error");
      return;
    }

    if (unitsAllocated > Number(selectedStock.units_available)) {
      setMessage("The selected blood bank does not have enough units.");
      setMessageType("error");
      return;
    }

    try {
      setAllocating(true);

      const response = await apiRequest("/inventory/allocate", {
        method: "POST",
        body: JSON.stringify({
          requestId,
          bloodBankId,
          bloodGroup: form.bloodGroup,
          unitsAllocated,
        }),
      });

      setMessage(
        response.message || "Blood allocated successfully!"
      );
      setMessageType("success");

      setForm({
        requestId: "",
        bloodBankId: "",
        bloodGroup: "",
        unitsAllocated: 1,
      });

      // Refresh stock after successful allocation
      const inventoryResponse = await apiRequest("/inventory");

      setInventory(
        Array.isArray(inventoryResponse.data)
          ? inventoryResponse.data
          : []
      );
    } catch (error) {
      setMessage(error.message || "Blood allocation failed.");
      setMessageType("error");
    } finally {
      setAllocating(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100";

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      <nav className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="text-2xl font-extrabold text-red-600">
            LifeLink<span className="text-gray-800">.</span>
          </Link>

          <div className="flex flex-wrap items-center gap-5 text-sm font-medium">
            <Link href="/dashboard" className="text-gray-600 hover:text-red-600">
              Dashboard
            </Link>
            <Link href="/donors" className="text-gray-600 hover:text-red-600">
              Donors
            </Link>
            <Link href="/requests" className="text-gray-600 hover:text-red-600">
              Requests
            </Link>
            <Link href="/my-requests" className="text-gray-600 hover:text-red-600">
              My Requests
            </Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-red-600">
              Blood Bank Management
            </p>
            <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
              Blood Inventory
            </h1>
            <p className="mt-2 text-gray-500">
              Monitor available blood units and manage allocations.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold transition hover:bg-gray-50 disabled:opacity-50"
          >
            {refreshing ? "Refreshing..." : "↻ Refresh Inventory"}
          </button>
        </div>

        {message && (
          <div
            role="status"
            className={`mt-6 rounded-xl border p-4 text-sm ${
              messageType === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        {loading ? (
          <div className="mt-8 rounded-2xl bg-white p-12 text-center shadow-sm">
            Loading blood inventory...
          </div>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">Total Available Units</p>
                <p className="mt-2 text-3xl font-extrabold text-red-600">
                  {totalUnits}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">Connected Blood Banks</p>
                <p className="mt-2 text-3xl font-extrabold">
                  {totalBanks}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">Inventory Records</p>
                <p className="mt-2 text-3xl font-extrabold">
                  {inventory.length}
                </p>
              </div>
            </div>

            <section className="mt-8">
              <h2 className="text-xl font-extrabold">Stock by Blood Group</h2>

              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
                {stockByGroup.map((item) => (
                  <div
                    key={item.group}
                    className="rounded-2xl border border-gray-100 bg-white p-4 text-center shadow-sm"
                  >
                    <p className="text-xl font-extrabold text-red-600">
                      {item.group}
                    </p>
                    <p className="mt-2 text-2xl font-bold">
                      {item.units}
                    </p>
                    <p className="text-xs text-gray-500">units</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-10">
              <h2 className="text-xl font-extrabold">Blood Bank Stock</h2>

              {inventory.length === 0 ? (
                <div className="mt-4 rounded-2xl bg-white p-8 text-center text-gray-500">
                  No inventory records found.
                </div>
              ) : (
                <div className="mt-4 overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
                  <table className="w-full min-w-150 text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500">
                      <tr>
                        <th className="px-5 py-4 font-semibold">Blood Bank</th>
                        <th className="px-5 py-4 font-semibold">Blood Group</th>
                        <th className="px-5 py-4 font-semibold">Available Units</th>
                        <th className="px-5 py-4 font-semibold">Stock Status</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {inventory.map((item) => {
                        const units = Number(item.units_available || 0);

                        return (
                          <tr key={item.inventory_id}>
                            <td className="px-5 py-4 font-semibold">
                              {item.bank_name}
                            </td>
                            <td className="px-5 py-4 font-bold text-red-600">
                              {item.blood_group}
                            </td>
                            <td className="px-5 py-4">{units} units</td>
                            <td className="px-5 py-4">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-bold ${
                                  units === 0
                                    ? "bg-red-50 text-red-700"
                                    : units <= 3
                                      ? "bg-yellow-50 text-yellow-700"
                                      : "bg-green-50 text-green-700"
                                }`}
                              >
                                {units === 0
                                  ? "Out of stock"
                                  : units <= 3
                                    ? "Low stock"
                                    : "Available"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="mt-10 grid gap-8 lg:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <p className="text-sm font-bold uppercase tracking-widest text-red-600">
                  Allocation
                </p>
                <h2 className="mt-2 text-2xl font-extrabold">
                  Allocate Blood
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Allocate available blood units to an existing blood request.
                </p>

                <form onSubmit={handleAllocation} className="mt-6 space-y-5">
                  <div>
                    <label className="text-sm font-semibold">
                      Blood Request ID
                    </label>
                    <input
                      type="number"
                      name="requestId"
                      min="1"
                      required
                      value={form.requestId}
                      onChange={handleChange}
                      placeholder="Enter request ID"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold">
                      Select Blood Bank
                    </label>
                    <select
                      name="bloodBankId"
                      required
                      value={form.bloodBankId}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="">Choose a blood bank</option>
                      {bloodBanks.map((bank) => (
                        <option key={bank.id} value={bank.id}>
                          {bank.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold">
                      Blood Group
                    </label>
                    <select
                      name="bloodGroup"
                      required
                      value={form.bloodGroup}
                      onChange={handleChange}
                      disabled={!form.bloodBankId}
                      className={inputClass}
                    >
                      <option value="">Choose a blood group</option>
                      {availableGroups.map((item) => (
                        <option
                          key={item.inventory_id}
                          value={item.blood_group}
                        >
                          {item.blood_group} — {item.units_available} units
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold">
                      Units to Allocate
                    </label>
                    <input
                      type="number"
                      name="unitsAllocated"
                      min="1"
                      max={selectedStock?.units_available || undefined}
                      required
                      value={form.unitsAllocated}
                      onChange={handleChange}
                      className={inputClass}
                    />

                    {selectedStock && (
                      <p className="mt-2 text-xs text-gray-500">
                        Available stock: {selectedStock.units_available} units
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={allocating || !inventory.length}
                    className="w-full rounded-xl bg-red-600 px-5 py-4 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {allocating ? "Allocating..." : "Allocate Blood"}
                  </button>
                </form>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-extrabold">
                  Allocation Guidelines
                </h2>

                <div className="mt-5 space-y-4 text-sm leading-6 text-gray-600">
                  <div className="rounded-xl bg-blue-50 p-4">
                    <p className="font-bold text-blue-800">
                      1. Select a valid request
                    </p>
                    <p className="mt-1">
                      Enter the ID of an existing blood request.
                    </p>
                  </div>

                  <div className="rounded-xl bg-blue-50 p-4">
                    <p className="font-bold text-blue-800">
                      2. Select available stock
                    </p>
                    <p className="mt-1">
                      Choose the blood bank and blood group from the inventory.
                    </p>
                  </div>

                  <div className="rounded-xl bg-blue-50 p-4">
                    <p className="font-bold text-blue-800">
                      3. Enter the required units
                    </p>
                    <p className="mt-1">
                      The backend checks stock availability and prevents
                      allocating more than the request requires.
                    </p>
                  </div>

                  <div className="rounded-xl bg-green-50 p-4">
                    <p className="font-bold text-green-800">
                      Database transaction
                    </p>
                    <p className="mt-1">
                      Successful allocations are recorded in MySQL and
                      inventory stock is reduced.
                    </p>
                  </div>

                  <p className="text-xs text-gray-400">
                    Allocation is subject to backend validation and
                    authorization.
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
      </section>

      <footer className="mt-10 border-t border-gray-200 bg-white px-5 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} LifeLink. Every drop counts.
      </footer>
    </main>
  );
}
