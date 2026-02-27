"use client";

import Image from "next/image";
import { FaFacebookF, FaInstagram, FaYoutube, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-30 bg-black text-gray-300 py-12 border-t border-[#2b1f46]/40">
      {/* Ligne dégradée supérieure */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#271c70] via-[#ff9c4b] to-[#271c70]" />

      {/* Logo et réseaux */}
      <div className="flex flex-col items-center space-y-6 mb-10">
        <Image
          src="/LogoApp.png"
          alt="CFOC Impact Logo"
          width={120}
          height={120}
          className="object-contain"
        />
        <div className="flex space-x-6 text-2xl">
          <a href="#" className="hover:text-[#ff9c4b] transition-colors" aria-label="Facebook">
            <FaFacebookF />
          </a>
          <a href="#" className="hover:text-[#ff9c4b] transition-colors" aria-label="Instagram">
            <FaInstagram />
          </a>
          <a href="#" className="hover:text-[#ff9c4b] transition-colors" aria-label="YouTube">
            <FaYoutube />
          </a>
          <a href="#" className="hover:text-[#ff9c4b] transition-colors" aria-label="LinkedIn">
            <FaLinkedin />
          </a>
        </div>
      </div>

      {/* Grille des liens */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 text-sm">
        <div>
          <h3 className="text-white font-semibold mb-4 text-lg">À propos</h3>
          <ul className="space-y-2">
            <li><a href="/missions" className="hover:text-[#ff9c4b]">Nos missions</a></li>
            <li><a href="/vision" className="hover:text-[#ff9c4b]">Notre vision</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-4 text-lg">Explorer</h3>
          <ul className="space-y-2">
            <li><a href="/projects" className="hover:text-[#ff9c4b]">Projets en cours</a></li>
            <li><a href="/trips" className="hover:text-[#ff9c4b]">Voyages missionnaires</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-4 text-lg">Impliquer</h3>
          <ul className="space-y-2">
            <li><a href="/donate" className="hover:text-[#ff9c4b]">Faire un don</a></li>
            <li><a href="/join" className="hover:text-[#ff9c4b]">Devenir missionnaire</a></li>
            <li><a href="/projects" className="hover:text-[#ff9c4b]">Soutenir un projet</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-4 text-lg">Contact</h3>
          <ul className="space-y-2">
            <li>Email : <a href="mailto:contact@cfocimpact.org" className="hover:text-[#ff9c4b]">contact@cfocimpact.org</a></li>
            <li>Téléphone : <a href="tel:+19051234567" className="hover:text-[#ff9c4b]">+1 (905) 123‑4567</a></li>
            <li>Adresse : 158 Harwood Ave S, Ajax, ON</li>
          </ul>
        </div>
      </div>

      {/* Ligne inférieure */}
      <div className="border-t border-gray-700 mt-10 pt-6 text-center text-xs text-gray-400">
        © {currentYear} CFOC Impact — Inspiré par la foi, guidé par la compassion.
      </div>
    </footer>
  );
}
