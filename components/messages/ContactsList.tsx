"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface Contact {
  id: number;
  name: string;
  role: string;
  status: "online" | "offline" | "busy";
  image: string;
}

export default function ContactsList() {
  const [searchTerm, setSearchTerm] = useState("");

  const contacts: Contact[] = [
    {
      id: 1,
      name: "Charles D.",
      role: "Coordinator",
      status: "online",
      image:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 2,
      name: "Marie L.",
      role: "Missionary",
      status: "busy",
      image:
        "https://images.unsplash.com/photo-1603415526960-f7e0328b1a2c?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 3,
      name: "David K.",
      role: "Organizer",
      status: "offline",
      image:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    },
  ];

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 bg-white/10 backdrop-blur-md rounded-lg shadow-md text-white">
      <h2 className="text-xl font-semibold mb-4 text-[#4fa5ff]">Contacts</h2>

      <input
        type="text"
        placeholder="Search contacts..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full mb-4 p-2 rounded-md bg-white/20 text-white placeholder-gray-300 outline-none"
      />

      <div className="space-y-3 overflow-y-auto max-h-[60vh]">
        {filteredContacts.map((contact) => (
          <motion.div
            key={contact.id}
            className="flex items-center gap-3 bg-white/5 hover:bg-white/20 p-3 rounded-md cursor-pointer transition"
          >
            <div className="relative">
              <img
                src={contact.image}
                alt={contact.name}
                className="w-10 h-10 rounded-full object-cover border border-white/30"
              />
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                  contact.status === "online"
                    ? "bg-green-400"
                    : contact.status === "busy"
                    ? "bg-yellow-400"
                    : "bg-gray-400"
                }`}
              ></span>
            </div>

            <div>
              <p className="font-semibold">{contact.name}</p>
              <p className="text-xs text-gray-300">{contact.role}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
