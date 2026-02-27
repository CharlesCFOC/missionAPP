"use client";

import { useEffect, useState } from "react";
import { FaArrowLeft, FaDownload, FaEye, FaFolder, FaPen, FaTrash } from "react-icons/fa";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import {
  readStoredFinanceFolders,
  removeStoredFinanceFolder,
  updateStoredFinanceFolderName,
} from "./storage";

type FinanceFolder = {
  id: string;
  name: string;
  files: number;
};

type FinanceEntry = {
  id: number;
  folderId: string;
  category: string;
  type: "Expense" | "Income";
  amount: number;
  notes: string;
  receiptUrl: string;
};

type FinanceEntryDraft = {
  category: string;
  type: FinanceEntry["type"];
  amount: string;
  notes: string;
  receiptUrl: string;
};

const BASE_FOLDERS: FinanceFolder[] = [
  {
    id: "finance-zambia",
    name: "Clean Water Initiative - Zambia",
    files: 12,
  },
  {
    id: "finance-haiti",
    name: "Youth Empowerment Hub - Haiti",
    files: 8,
  },
  {
    id: "finance-kenya",
    name: "Kenya Medical Outreach Center",
    files: 15,
  },
  {
    id: "finance-kenya-mission",
    name: "Medical Outreach - Kenya (Mission)",
    files: 5,
  },
];

const BASE_ENTRIES: FinanceEntry[] = [
  { id: 1, folderId: "finance-zambia", category: "Travel", type: "Expense", amount: 1200, notes: "", receiptUrl: "" },
  { id: 2, folderId: "finance-zambia", category: "Donations", type: "Income", amount: 2500, notes: "", receiptUrl: "" },
  { id: 3, folderId: "finance-haiti", category: "Accommodation", type: "Expense", amount: 800, notes: "", receiptUrl: "" },
  { id: 4, folderId: "finance-kenya", category: "Supplies", type: "Expense", amount: 1400, notes: "", receiptUrl: "" },
  { id: 5, folderId: "finance-kenya-mission", category: "Flights", type: "Expense", amount: 900, notes: "", receiptUrl: "" },
];

export default function FinanceTab() {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [folders, setFolders] = useState<FinanceFolder[]>(BASE_FOLDERS);

  const [entries, setEntries] = useState<FinanceEntry[]>(BASE_ENTRIES);
  const [newEntry, setNewEntry] = useState<FinanceEntryDraft>({
    category: "",
    type: "Expense",
    amount: "",
    notes: "",
    receiptUrl: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingEntry, setEditingEntry] = useState<FinanceEntryDraft>({
    category: "",
    type: "Expense",
    amount: "",
    notes: "",
    receiptUrl: ""
  });
  const [currency, setCurrency] = useState("USD");

  useEffect(() => {
    const stored = readStoredFinanceFolders();
    if (stored.length === 0) return;
    setFolders((prev) => {
      const existingIds = new Set(prev.map((folder) => folder.id));
      const additions = stored
        .map((folder) => ({
          id: folder.id,
          name: folder.name,
          files: folder.files ?? 0,
        }))
        .filter((folder) => !existingIds.has(folder.id));
      return additions.length > 0 ? [...prev, ...additions] : prev;
    });
  }, []);

  if (!selectedFolder) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-white">Finance Folders</h2>

        <div className="w-full flex justify-end mb-4">
          <button
            onClick={() => {
              const name = prompt("Folder name:");
              if (!name) return;
              const newFolder = {
                id: `folder_${Date.now()}`,
                name,
                files: 0,
              };
              setFolders((prev) => [...prev, newFolder]);
            }}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-300 text-black font-semibold rounded-lg hover:opacity-90 transition"
          >
            + New Folder
          </button>
        </div>

        <div className="space-y-3">
          {folders.length === 0 ? (
            <p className="text-white/60 italic">No finance folders yet.</p>
          ) : (
            folders.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFolder(f.id)}
                className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 transition rounded-lg px-4 py-3 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg text-[#ff9c4b]">
                    <FaFolder className="text-xl" />
                  </div>
                  <div className="flex items-center gap-3 min-w-0">
                    <p className="font-semibold text-white truncate">{f.name}</p>
                    <p className="text-white/60 text-sm whitespace-nowrap">{f.files} items</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newName = prompt("Rename folder:", f.name);
                      if (!newName) return;
                      setFolders((prev) =>
                        prev.map((x) => (x.id === f.id ? { ...x, name: newName } : x))
                      );
                      updateStoredFinanceFolderName(f.id, newName);
                    }}
                    className="text-white hover:text-orange-400 transition"
                  >
                    <FaPen size={16} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!confirm("Delete this folder?")) return;
                      setFolders((prev) => prev.filter((x) => x.id !== f.id));
                      removeStoredFinanceFolder(f.id);
                    }}
                    className="text-white hover:text-orange-400 transition"
                  >
                    <FaTrash size={16} />
                  </button>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  const COLORS = ["#4fa5ff", "#8cc4ff", "#271c70", "#ff9c4b"];

  const folderEntries = entries.filter((e) => e.folderId === selectedFolder);

  const totalIncome = folderEntries
    .filter((e) => e.type === "Income")
    .reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = folderEntries
    .filter((e) => e.type === "Expense")
    .reduce((sum, e) => sum + e.amount, 0);
  const netBalance = totalIncome - totalExpense;

  // Pie data for type breakdown
  const typeData = [
    { name: "Income", value: totalIncome },
    { name: "Expense", value: totalExpense },
  ];

  const expenseData = folderEntries
    .filter((e) => e.type === "Expense")
    .map((e) => ({ name: e.category, value: e.amount }));

  const incomeData = folderEntries
    .filter((e) => e.type === "Income")
    .map((e) => ({ name: e.category, value: e.amount }));

  const incomeVsExpenseData = [
    { name: "Income", value: totalIncome },
    { name: "Expense", value: totalExpense },
  ];

  const handleAdd = () => {
    if (!newEntry.category || !newEntry.amount || !selectedFolder) return;
    setEntries([
      ...entries,
      {
        id: entries.length + 1,
        folderId: selectedFolder,
        ...newEntry,
        amount: parseFloat(newEntry.amount),
        notes: newEntry.notes,
        receiptUrl: newEntry.receiptUrl,
      },
    ]);
    setNewEntry({ category: "", type: "Expense", amount: "", notes: "", receiptUrl: "" });
  };

  const handleEdit = (id: number) => {
    const entry = entries.find((e) => e.id === id);
    if (entry) {
      setEditingId(id);
      setEditingEntry({
        category: entry.category,
        type: entry.type,
        amount: entry.amount.toString(),
        notes: entry.notes,
        receiptUrl: entry.receiptUrl,
      });
    }
  };

  const handleSave = (id: number) => {
    setEntries(
      entries.map((e) =>
        e.id === id
          ? {
              ...e,
              category: editingEntry.category,
              type: editingEntry.type,
              amount: parseFloat(editingEntry.amount),
              notes: editingEntry.notes,
              receiptUrl: editingEntry.receiptUrl,
            }
          : e
      )
    );
    setEditingId(null);
    setEditingEntry({ category: "", type: "Expense", amount: "", notes: "", receiptUrl: "" });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingEntry({ category: "", type: "Expense", amount: "", notes: "", receiptUrl: "" });
  };

  // Force test dataset to ensure charts render even if expenseData is empty
  const forceTest = [
    { name: "Category A", value: 500 },
    { name: "Category B", value: 300 },
    { name: "Category C", value: 200 },
  ];

  return (
    <div className="p-8 text-white">
      <button
        onClick={() => setSelectedFolder(null)}
        className="mb-6 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
        aria-label="Back to finance folders"
      >
        <FaArrowLeft />
      </button>
      <h2 className="text-2xl font-bold mb-6 text-center text-[#4fa5ff]">
        {folders.find((x) => x.id === selectedFolder)?.name}
      </h2>

      <div className="flex flex-col md:flex-row justify-between gap-8">
        {/* Budget Table */}
        <div className="flex-1">
          <div className="w-full flex justify-between items-center mb-3">
            <button
              onClick={() => {
                const rows = [
                  ["Category", "Type", "Amount"],
                  ...folderEntries.map((e) => [e.category, e.type, e.amount]),
                ];
                const csv = rows.map(r => r.join(",")).join("\n");
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", "finance_export.csv");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded text-white flex items-center gap-2"
            >
              <FaDownload size={14} /> Export CSV
            </button>

            <div className="flex items-center">
              <label className="mr-2 text-white/80">Currency:</label>
              <select
                className="p-2 rounded bg-white/20 text-white"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="USD">USD ($)</option>
                <option value="CAD">CAD (C$)</option>
                <option value="EUR">EUR (€)</option>
                <option value="ZMW">ZMW (K)</option>
              </select>
            </div>
          </div>
          <table className="w-full text-sm bg-white/5 rounded-lg overflow-hidden">
            <thead className="bg-white/10 text-white/70">
              <tr>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left w-48">Notes</th>
                <th className="p-3 text-left">Income</th>
                <th className="p-3 text-left">Expense</th>
                <th className="p-3 text-left">Receipt</th>
                <th className="p-3 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {folderEntries.map((e) =>
                editingId === e.id ? (
                  <tr key={e.id} className="border-b border-white/10 bg-white/10">
                    <td className="p-3">
                      <input
                        type="text"
                        className="p-1 rounded bg-white/20 text-white w-full"
                        value={editingEntry.category}
                        onChange={(ev) =>
                          setEditingEntry({ ...editingEntry, category: ev.target.value })
                        }
                      />
                    </td>
                    <td className="p-3 w-48">
                      <input
                        type="text"
                        className="p-1 rounded bg-white/20 text-white w-full"
                        placeholder="Notes"
                        value={editingEntry.notes}
                        onChange={(ev) =>
                          setEditingEntry({ ...editingEntry, notes: ev.target.value })
                        }
                      />
                    </td>
                    <td className="p-3">
                      {editingEntry.type === "Income" ? (
                        <input
                          type="number"
                          className="p-1 rounded bg-white/20 text-white w-full"
                          value={editingEntry.amount}
                          onChange={(ev) =>
                            setEditingEntry({ ...editingEntry, amount: ev.target.value })
                          }
                        />
                      ) : (
                        ""
                      )}
                    </td>
                    <td className="p-3">
                      {editingEntry.type === "Expense" ? (
                        <input
                          type="number"
                          className="p-1 rounded bg-white/20 text-white w-full"
                          value={editingEntry.amount}
                          onChange={(ev) =>
                            setEditingEntry({ ...editingEntry, amount: ev.target.value })
                          }
                        />
                      ) : (
                        ""
                      )}
                    </td>
                    <td className="p-3">
                      <>
                        <input
                          id={`editReceiptInput_${e.id}`}
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={(ev) => {
                            const file = ev.target.files?.[0];
                            if (file) {
                              const url = URL.createObjectURL(file);
                              setEditingEntry({ ...editingEntry, receiptUrl: url });
                            }
                          }}
                        />
                        <button
                          onClick={() => document.getElementById(`editReceiptInput_${e.id}`)?.click()}
                          className="text-white hover:text-orange-400 transition"
                        >
                          <FaDownload size={14} />
                        </button>
                      </>
                    </td>
                    <td className="p-3 flex gap-2 justify-end">
                      <button
                        onClick={() => handleSave(e.id)}
                        className="px-2 py-1 bg-[#4fa5ff] hover:bg-[#8cc4ff] text-black font-semibold rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-2 py-1 bg-white/20 hover:bg-white/30 text-white font-semibold rounded"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr key={e.id} className="border-b border-white/10 hover:bg-white/10">
                    <td className="p-3">{e.category}</td>
                    <td className="p-3 text-white/70 w-48">
                      {e.notes || ""}
                    </td>
                    <td className="p-3">
                      {e.type === "Income" ? `${e.amount.toLocaleString()} ${currency}` : ""}
                    </td>
                    <td className="p-3">
                      {e.type === "Expense" ? `${e.amount.toLocaleString()} ${currency}` : ""}
                    </td>
                    <td className="p-3 flex gap-3 items-center">
                      {/* Hidden file input to upload a receipt when none exists */}
                      <input
                        id={`uploadReceipt_${e.id}`}
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(ev) => {
                          const file = ev.target.files?.[0];
                          if (file) {
                            const url = URL.createObjectURL(file);
                            setEntries(prev =>
                              prev.map(x =>
                                x.id === e.id ? { ...x, receiptUrl: url } : x
                              )
                            );
                          }
                        }}
                      />

                      {/* Download button behaves as upload trigger when no receipt exists */}
                      <button
                        onClick={() => {
                          if (!e.receiptUrl) {
                            document.getElementById(`uploadReceipt_${e.id}`)?.click();
                          }
                        }}
                        className={`text-white transition ${
                          e.receiptUrl ? "cursor-pointer hover:text-orange-400" : "opacity-60 hover:text-orange-400"
                        }`}
                        aria-label="Download or Upload receipt"
                      >
                        <FaDownload size={14} />
                      </button>

                      {/* View icon only if receipt exists */}
                      {e.receiptUrl && (
                        <button
                          onClick={() => window.open(e.receiptUrl, "_blank")}
                          className="text-white hover:text-orange-400 transition"
                          aria-label="View receipt"
                        >
                          <FaEye size={14} />
                        </button>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={() => handleEdit(e.id)}
                          className="text-white hover:text-orange-400 transition"
                        >
                          <FaPen size={14} />
                        </button>

                        <button
                          onClick={() => setEntries(entries.filter((x) => x.id !== e.id))}
                          className="text-white hover:text-orange-400 transition"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
            <tfoot className="bg-white/5 text-sm">
              <tr>
                <td className="p-3 font-semibold text-white/70">Totals</td>
                <td></td>
                <td className="p-3 font-bold text-green-400">
                  {totalIncome.toLocaleString()} {currency}
                </td>
                <td className="p-3 font-bold text-red-400">
                  {totalExpense.toLocaleString()} {currency}
                </td>
                <td className="p-3 font-bold text-orange-400">
                  = {netBalance.toLocaleString()} {currency}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>

          {/* Add new entry */}
          <div className="flex flex-wrap gap-3 mt-4">
            <input
              type="text"
              placeholder="Category"
              className="p-2 rounded bg-white/20 text-white placeholder-white/50"
              value={newEntry.category}
              onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
            />
            <input
              type="text"
              placeholder="Notes"
              className="p-2 rounded bg-white/20 text-white placeholder-white/50 w-48"
              value={newEntry.notes}
              onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
            />
            <select
              className="p-2 rounded bg-white/20 text-white"
              value={newEntry.type}
              onChange={(e) =>
                setNewEntry({
                  ...newEntry,
                  type: e.target.value as FinanceEntry["type"],
                })
              }
            >
              <option>Expense</option>
              <option>Income</option>
            </select>
            <input
              type="number"
              placeholder="Amount"
              className="p-2 rounded bg-white/20 text-white placeholder-white/50"
              value={newEntry.amount}
              onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
            />
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-[#4fa5ff] hover:bg-[#8cc4ff] text-black font-semibold rounded"
            >
              Add
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
