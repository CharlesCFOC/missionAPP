"use client";
import { useState } from "react";
import CreateProjectForm from "@/components/CreateProjectForm";

export default function DashboardPage() {
  const [projects] = useState([
    {
      id: 1,
      name: "Well in Zambia",
      status: "In progress",
      progress: 72,
      donations: 12960,
      goal: 18000,
    },
    {
      id: 2,
      name: "Community school DRC",
      status: "New",
      progress: 20,
      donations: 5000,
      goal: 25000,
    },
    {
      id: 3,
      name: "Meal distribution Ghana",
      status: "Completed",
      progress: 100,
      donations: 8000,
      goal: 8000,
    },
  ]);

  const [showForm, setShowForm] = useState(false);

  const stats = [
    { label: "Active projects", value: 2 },
    { label: "Donations received", value: "$25,960" },
    { label: "Completed projects", value: 1 },
  ];

  return (
    <div className="bg-[#f5f6f7] min-h-screen p-8">
      <h1 className="text-3xl font-bold text-[#271c70] mb-8 text-center">
        Missionary Dashboard
      </h1>

      {/* STATISTICS */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition"
          >
            <p className="text-gray-500 text-sm">{s.label}</p>
            <h2 className="text-2xl font-bold text-[#271c70] mt-1">{s.value}</h2>
          </div>
        ))}
      </div>

      {/* PROJECT TABLE */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#271c70]">
            My projects
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#ff9c4b] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#271c70] transition"
          >
            {showForm ? "❌ Close form" : "➕ Create a project"}
          </button>
        </div>

        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-[#f9fafc]">
              <th className="p-3 text-sm font-semibold text-gray-600">Nom</th>
              <th className="p-3 text-sm font-semibold text-gray-600">Status</th>
              <th className="p-3 text-sm font-semibold text-gray-600">Progress</th>
              <th className="p-3 text-sm font-semibold text-gray-600">Amount received</th>
              <th className="p-3 text-sm font-semibold text-gray-600">Goal</th>
              <th className="p-3 text-sm font-semibold text-gray-600 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr
                key={p.id}
                className="border-t hover:bg-[#f9fafc] transition"
              >
                <td className="p-3 text-[#271c70] font-medium">{p.name}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      p.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : p.status === "In progress"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="p-3 text-sm text-gray-700">
                  <div className="w-full bg-gray-200 h-2 rounded-full">
                    <div
                      className={`h-2 rounded-full ${
                        p.progress === 100
                          ? "bg-green-500"
                          : p.progress >= 50
                          ? "bg-yellow-500"
                          : "bg-blue-500"
                      }`}
                      style={{ width: `${p.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">{p.progress}%</span>
                </td>
                <td className="p-3 text-sm text-gray-700">
                  ${p.donations.toLocaleString("en-US")}
                </td>
                <td className="p-3 text-sm text-gray-700">
                  ${p.goal.toLocaleString("en-US")}
                </td>
                <td className="p-3 text-right space-x-2">
                  <button className="text-[#271c70] hover:text-[#ff9c4b] text-sm font-medium">
                    View
                  </button>
                  <button className="text-[#271c70] hover:text-[#ff9c4b] text-sm font-medium">
                    Edit
                  </button>
                  <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CREATION FORM */}
      {showForm && <CreateProjectForm />}
    </div>
  );
}
