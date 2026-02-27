"use client";

import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8 text-[#271c70]">
      <section className="max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
        <p className="text-lg text-gray-700 mb-10">
          Do you have a question, a collaboration idea, or a mission project to share?
          Fill out the form below and our team will get back to you as soon as possible.
        </p>

        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow-lg p-6 text-left"
          >
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#ff9c4b]"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#ff9c4b]"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#ff9c4b]"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#271c70] text-white font-semibold py-3 rounded-md hover:bg-[#ff9c4b] transition"
            >
              Send Message
            </button>
          </form>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-2xl font-bold text-[#ff9c4b] mb-4">Thank you for your message!</h2>
            <p className="text-gray-700">
              We have received your message and will respond as quickly as possible.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
