"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaLinkedin, FaFacebook, FaWhatsapp } from "react-icons/fa";

export default function ProfileTab() {
  const [isEditing, setIsEditing] = useState(false);

  const [user, setUser] = useState({
    name: "Charles DeGuigné",
    title: "Mission Director",
    organization: "CFOC Impact",
    email: "charles@example.com",
    phone: "+1 (905) 555-1234",
    country: "Canada",
    joined: "March 2024",
    languages: [
      { code: "fr", name: "French", level: "Native" },
      { code: "en", name: "English", level: "Fluent" },
      { code: "es", name: "Spanish", level: "Intermediate" },
    ],
    missionsCompleted: 5,
    projectsLed: 3,
    bio: "Dedicated to improving education access and sustainable development across the globe.",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    socialLinks: {
      linkedin: "https://linkedin.com/in/charlesdeguigne",
      whatsapp: "https://wa.me/19055551234",
      facebook: "https://facebook.com/charlesdg",
    },
    countriesVisited: 8,
    skills: ["Leadership", "Community Development", "Fundraising"],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  return (
    <section className="p-6 bg-white/10 backdrop-blur-md rounded-2xl shadow-lg text-white max-w-4xl mx-auto">
      <div className="flex flex-col items-center mb-8">
        <motion.img
          src={user.image}
          alt={user.name}
          className="w-32 h-32 rounded-full object-cover border-4 border-[#4fa5ff] shadow-lg mb-4"
          whileHover={{ scale: 1.05 }}
        />
        {!isEditing ? (
          <>
            <h2 className="text-3xl font-bold text-[#4fa5ff]">{user.name}</h2>
            <p className="text-white/70">{user.title}</p>
            <p className="text-white/60 text-sm">{user.organization}</p>
            <p className="text-white/60 text-sm">Joined {user.joined}</p>
          </>
        ) : (
          <div className="w-full max-w-md text-white space-y-3">
            <input
              name="name"
              value={user.name}
              onChange={handleChange}
              className="w-full p-2 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-[#4fa5ff]"
              placeholder="Name"
            />
            <input
              name="title"
              value={user.title}
              onChange={handleChange}
              className="w-full p-2 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-[#4fa5ff]"
              placeholder="Title"
            />
            <input
              name="organization"
              value={user.organization}
              onChange={handleChange}
              className="w-full p-2 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-[#4fa5ff]"
              placeholder="Organization"
            />
            <textarea
              name="bio"
              value={user.bio}
              onChange={handleChange}
              className="w-full p-2 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-[#4fa5ff]"
              rows={3}
              placeholder="Bio"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <div>
                <label className="block text-sm mb-1 text-white/70">Missions Completed</label>
                <input
                  type="number"
                  name="missionsCompleted"
                  value={user.missionsCompleted}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-[#4fa5ff]"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-white/70">Projects Led</label>
                <input
                  type="number"
                  name="projectsLed"
                  value={user.projectsLed}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-[#4fa5ff]"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-white/70">Countries Visited</label>
                <input
                  type="number"
                  name="countriesVisited"
                  value={user.countriesVisited || 8}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-[#4fa5ff]"
                />
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-lg font-semibold text-[#4fa5ff] mb-2">Languages</h4>
              {user.languages.map((lang, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={lang.name}
                    onChange={(e) => {
                      const newLangs = [...user.languages];
                      newLangs[index].name = e.target.value;
                      setUser({ ...user, languages: newLangs });
                    }}
                    className="flex-1 p-2 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-[#4fa5ff]"
                  />
                  <input
                    type="text"
                    value={lang.level}
                    onChange={(e) => {
                      const newLangs = [...user.languages];
                      newLangs[index].level = e.target.value;
                      setUser({ ...user, languages: newLangs });
                    }}
                    className="w-32 p-2 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-[#4fa5ff]"
                  />
                  <button
                    onClick={() => {
                      const newLangs = user.languages.filter((_, i) => i !== index);
                      setUser({ ...user, languages: newLangs });
                    }}
                    className="text-red-400 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() =>
                  setUser({
                    ...user,
                    languages: [...user.languages, { code: "xx", name: "New Language", level: "Beginner" }],
                  })
                }
                className="mt-2 px-4 py-2 bg-[#4fa5ff] text-black rounded-lg hover:bg-[#3c8ed6]"
              >
                Add Language
              </button>
            </div>

            <div className="mt-6">
              <h4 className="text-lg font-semibold text-[#4fa5ff] mb-2">Skills</h4>
              {user.skills.map((skill, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => {
                      const newSkills = [...user.skills];
                      newSkills[index] = e.target.value;
                      setUser({ ...user, skills: newSkills });
                    }}
                    className="flex-1 p-2 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-[#4fa5ff]"
                  />
                  <button
                    onClick={() => {
                      const newSkills = user.skills.filter((_, i) => i !== index);
                      setUser({ ...user, skills: newSkills });
                    }}
                    className="text-red-400 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() =>
                  setUser({
                    ...user,
                    skills: [...user.skills, "New Skill"],
                  })
                }
                className="mt-2 px-4 py-2 bg-[#4fa5ff] text-black rounded-lg hover:bg-[#3c8ed6]"
              >
                Add Skill
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-8">
        <div className="bg-[#1e1e2f]/60 p-4 rounded-xl backdrop-blur-lg shadow-md">
          <h3 className="text-2xl font-bold text-[#4fa5ff]">{user.missionsCompleted}</h3>
          <p className="text-white/70 text-sm">Missions Completed</p>
        </div>
        <div className="bg-[#1e1e2f]/60 p-4 rounded-xl backdrop-blur-lg shadow-md">
          <h3 className="text-2xl font-bold text-[#4fa5ff]">{user.projectsLed}</h3>
          <p className="text-white/70 text-sm">Projects Led</p>
        </div>
        <div className="bg-[#1e1e2f]/60 p-4 rounded-xl backdrop-blur-lg shadow-md">
          <h3 className="text-2xl font-bold text-[#4fa5ff]">{user.languages.length}</h3>
          <p className="text-white/70 text-sm">Languages Spoken</p>
        </div>
        <div className="bg-[#1e1e2f]/60 p-4 rounded-xl backdrop-blur-lg shadow-md">
          <h3 className="text-2xl font-bold text-[#4fa5ff]">+{user.countriesVisited || 8}</h3>
          <p className="text-white/70 text-sm">Countries Visited</p>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-[#4fa5ff] mb-2">Languages</h3>
        <ul className="flex flex-wrap gap-3">
          {user.languages.map((lang) => (
            <li
              key={lang.code}
              className="bg-[#1e1e2f]/60 px-3 py-2 rounded-lg text-sm shadow-md"
            >
              {lang.name} – <span className="text-white/60">{lang.level}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-[#4fa5ff] mb-2">About</h3>
        <p className="text-white/80 leading-relaxed">{user.bio}</p>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-[#4fa5ff] mb-2">Skills</h3>
        <ul className="flex flex-wrap gap-3">
          {user.skills.map((skill, index) => (
            <li key={index} className="bg-[#1e1e2f]/60 px-3 py-2 rounded-lg text-sm shadow-md">
              {skill}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-center gap-6 text-2xl mb-8">
        <a href={user.socialLinks.linkedin} target="_blank" className="hover:text-[#4fa5ff]">
          <FaLinkedin />
        </a>
        <a href={user.socialLinks.whatsapp} target="_blank" className="hover:text-[#4fa5ff]">
          <FaWhatsapp />
        </a>
        <a href={user.socialLinks.facebook} target="_blank" className="hover:text-[#4fa5ff]">
          <FaFacebook />
        </a>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={() => setIsEditing(!isEditing)}
        className="bg-[#4fa5ff] text-black px-6 py-3 rounded-lg hover:bg-[#3c8ed6] transition w-full font-semibold"
      >
        {isEditing ? "Save Changes" : "Edit Profile"}
      </motion.button>
    </section>
  );
}
