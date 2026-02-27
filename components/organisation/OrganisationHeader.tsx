"use client";

import { Globe, Mail, Phone } from "lucide-react";

type OrganisationHeaderProps = {
  name?: string;
  tagline?: string;
  logoText?: string;
  email?: string;
  phone?: string;
  website?: string;
};

const DEFAULT_ORG = {
  name: "CFOC Mission International",
  tagline: "Faith-driven community projects and mission partnerships.",
  logoText: "CFOC",
  email: "contact@cfocimpact.org",
  phone: "+19051234567",
  website: "https://cfocimpact.org",
};

export default function OrganisationHeader({
  name = DEFAULT_ORG.name,
  tagline = DEFAULT_ORG.tagline,
  logoText = DEFAULT_ORG.logoText,
  email = DEFAULT_ORG.email,
  phone = DEFAULT_ORG.phone,
  website = DEFAULT_ORG.website,
}: OrganisationHeaderProps) {
  return (
    <div className="relative z-20 border-b border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-r from-[#0b041d]/70 via-[#1d0b49]/40 to-transparent" />
      <div className="relative max-w-6xl mx-auto px-6 py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#ff9c4b] via-[#ffd08b] to-[#4fa5ff] text-[#271c70] font-bold flex items-center justify-center text-sm">
            {logoText}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/60">
              Shared by
            </p>
            <h2 className="text-xl md:text-2xl font-semibold text-white">{name}</h2>
            <p className="text-sm text-white/70 max-w-xl">{tagline}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`mailto:${email}`}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/80 hover:border-white/40 hover:text-white transition"
            aria-label="Email"
            title="Email"
          >
            <Mail size={16} />
          </a>
          <a
            href={`tel:${phone}`}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/80 hover:border-white/40 hover:text-white transition"
            aria-label="Call"
            title="Call"
          >
            <Phone size={16} />
          </a>
          <a
            href={website}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#ff9c4b] via-[#ffb86b] to-[#ff9c4b] text-[#271c70] hover:from-[#ffd08b] hover:to-[#ff9c4b] transition"
            aria-label="Website"
            title="Website"
          >
            <Globe size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}
