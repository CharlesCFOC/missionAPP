"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Bell, ChevronDown, Menu, Sparkles, UserCircle, X } from "lucide-react";

type NavbarProps = {
  hopeAiOpen?: boolean;
  onToggleHopeAi?: () => void;
};

type DropdownKey = "mission" | "volunteers" | "organization" | "more";

type NavItem = { href: string; label: string };

export default function Navbar({
  hopeAiOpen = false,
  onToggleHopeAi,
}: NavbarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<DropdownKey | null>(null);

  const isAdminHub = pathname?.startsWith("/dashboard/admin");
  const navTextClass = isAdminHub ? "text-black" : "text-white";
  const navBorderClass = isAdminHub ? "border-black/10" : "border-white/10";
  const navLinkActiveClass = isAdminHub
    ? "text-[#ff9c4b]"
    : "text-[#ff9c4b]";
  const navLinkInactiveClass = isAdminHub
    ? "text-black/80 hover:text-[#2f6bff]"
    : "text-white/80 hover:text-[#4fa5ff]";
  const navMenuButtonBase = `w-9 h-9 rounded-full border ${
    isAdminHub ? "border-black/20" : "border-white/20"
  } text-2xl flex items-center justify-center transition translate-y-1`;
  const navMenuButtonActiveClass = isAdminHub
    ? "border-[#ff9c4b]/60 text-[#ff9c4b]"
    : "border-[#ff9c4b]/60 text-[#ff9c4b]";
  const navMenuButtonInactiveClass = isAdminHub
    ? "text-black/80 hover:text-[#2f6bff] hover:border-[#2f6bff]/60"
    : "text-white/80 hover:text-[#4fa5ff] hover:border-[#4fa5ff]/60";
  const navSubmenuBgClass = "bg-black/50 backdrop-blur-md overflow-hidden p-1";
  const navSubmenuLinkClass =
    "rounded-lg text-white/80 hover:text-white hover:bg-white/10";
  const navSubmenuActiveClass = "text-white font-semibold";
  const navMobileMenuBgClass = "bg-black/50 backdrop-blur-md";

  const missionLinks = useMemo<NavItem[]>(
    () => [
      { href: "/missions", label: "Mission Trips" },
      { href: "/projects", label: "Projects" },
    ],
    []
  );

  const volunteerLinks = useMemo<NavItem[]>(
    () => [
      { href: "/volunteerManager/overview", label: "Volunteer Overview" },
      { href: "/volunteerHub", label: "Volunteer Hub" },
    ],
    []
  );

  const organizationLinks = useMemo<NavItem[]>(
    () => [
      { href: "/missionControl", label: "Missions Manager" },
      { href: "/volunteerManager", label: "Volunteer Manager" },
    ],
    []
  );

  const moreLinks = useMemo<NavItem[]>(
    () => [
      { href: "/contact", label: "Contact" },
      { href: "/settings", label: "Settings" },
    ],
    []
  );

  const isMissionActive =
    pathname?.startsWith("/missions") ||
    pathname?.startsWith("/missionDetails") ||
    pathname?.startsWith("/projects") ||
    pathname?.startsWith("/projectDetails");
  const isVolunteersActive =
    pathname?.startsWith("/volunteerHub") ||
    pathname?.startsWith("/volunteerManager/overview");
  const isOrganizationActive =
    pathname?.startsWith("/missionControl") ||
    (pathname?.startsWith("/volunteerManager") &&
      !pathname?.startsWith("/volunteerManager/overview"));
  const isMoreActive = pathname === "/contact" || pathname === "/settings";

  useEffect(() => {
    setMenuOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  const toggleDropdown = (key: DropdownKey) => {
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  return (
    <nav
      className={`bg-transparent backdrop-blur-md py-4 px-6 flex justify-between items-center fixed top-0 left-0 w-full z-50 border-b ${navTextClass} ${navBorderClass}`}
    >
      <Link href="/" className="text-xl font-bold tracking-wide">
        CFOC Impact
      </Link>

      {/* Desktop Links */}
      <div className="hidden md:flex gap-3 items-center relative">
        <Link
          href="/"
          className={`inline-flex items-center justify-center px-3 py-2 rounded-xl text-sm font-semibold transition ${
            pathname === "/" ? navLinkActiveClass : navLinkInactiveClass
          }`}
        >
          Home
        </Link>

        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown("mission")}
            className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition ${
              isMissionActive || openDropdown === "mission"
                ? navLinkActiveClass
                : navLinkInactiveClass
            }`}
            aria-haspopup="menu"
            aria-expanded={openDropdown === "mission"}
          >
            Mission
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </button>

          {openDropdown === "mission" && (
            <div
              className={`absolute top-full left-0 mt-2 w-56 rounded-xl shadow-lg z-20 border border-white/10 ${navSubmenuBgClass}`}
              role="menu"
            >
              {missionLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  role="menuitem"
                  className={`block px-4 py-2 text-sm transition ${navSubmenuLinkClass} ${
                    pathname === link.href ? navSubmenuActiveClass : ""
                  }`}
                  onClick={() => setOpenDropdown(null)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown("volunteers")}
            className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition ${
              isVolunteersActive || openDropdown === "volunteers"
                ? navLinkActiveClass
                : navLinkInactiveClass
            }`}
            aria-haspopup="menu"
            aria-expanded={openDropdown === "volunteers"}
          >
            Volunteers
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </button>

          {openDropdown === "volunteers" && (
            <div
              className={`absolute top-full left-0 mt-2 w-64 rounded-xl shadow-lg z-20 border border-white/10 ${navSubmenuBgClass}`}
              role="menu"
            >
              {volunteerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  role="menuitem"
                  className={`block px-4 py-2 text-sm transition ${navSubmenuLinkClass} ${
                    pathname === link.href ? navSubmenuActiveClass : ""
                  }`}
                  onClick={() => setOpenDropdown(null)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown("organization")}
            className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition ${
              isOrganizationActive || openDropdown === "organization"
                ? navLinkActiveClass
                : navLinkInactiveClass
            }`}
            aria-haspopup="menu"
            aria-expanded={openDropdown === "organization"}
          >
            For Organization
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </button>

          {openDropdown === "organization" && (
            <div
              className={`absolute top-full left-0 mt-2 w-64 rounded-xl shadow-lg z-20 border border-white/10 ${navSubmenuBgClass}`}
              role="menu"
            >
              {organizationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  role="menuitem"
                  className={`block px-4 py-2 text-sm transition ${navSubmenuLinkClass} ${
                    pathname === link.href ? navSubmenuActiveClass : ""
                  }`}
                  onClick={() => setOpenDropdown(null)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            className={`${navMenuButtonBase} ${
              openDropdown === "more" || isMoreActive
                ? navMenuButtonActiveClass
                : navMenuButtonInactiveClass
            }`}
            onClick={() => toggleDropdown("more")}
            aria-haspopup="menu"
            aria-expanded={openDropdown === "more"}
          >
            +
          </button>

          {openDropdown === "more" && (
            <div
              className={`absolute top-full right-0 mt-2 w-40 rounded-xl shadow-lg z-20 border border-white/10 ${navSubmenuBgClass}`}
              role="menu"
            >
              {moreLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  role="menuitem"
                  className={`block px-4 py-2 text-sm transition ${navSubmenuLinkClass} ${
                    pathname === link.href ? navSubmenuActiveClass : ""
                  }`}
                  onClick={() => setOpenDropdown(null)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="hidden md:flex items-center gap-3 ml-4">
        <Link
          href="/settings"
          className="p-2 rounded-full bg-gradient-to-r from-[#ff9c4b] via-[#ffb86b] to-[#ff9c4b] hover:scale-105 transition-transform"
        >
          <UserCircle className="text-white" size={22} />
        </Link>
        <button
          type="button"
          className="p-2 rounded-full bg-gradient-to-r from-[#ff9c4b] via-[#ffb86b] to-[#ff9c4b] hover:scale-105 transition-transform"
        >
          <Bell className="text-white" size={22} />
        </button>
        <button
          type="button"
          aria-label={hopeAiOpen ? "Close Hope IA" : "Open Hope IA"}
          onClick={onToggleHopeAi}
          className={`p-2 rounded-full bg-gradient-to-r from-[#ff9c4b] via-[#ffb86b] to-[#ff9c4b] hover:scale-105 transition-transform ${
            hopeAiOpen ? "ring-2 ring-white/25" : ""
          }`}
        >
          <Sparkles className="text-white" size={22} />
        </button>
      </div>

      {/* Mobile Actions */}
      <div className="flex items-center gap-2 md:hidden">
        <button
          type="button"
          aria-label={hopeAiOpen ? "Close Hope IA" : "Open Hope IA"}
          onClick={onToggleHopeAi}
          className={`p-2 rounded-full bg-gradient-to-r from-[#ff9c4b] via-[#ffb86b] to-[#ff9c4b] transition-transform ${
            hopeAiOpen ? "ring-2 ring-white/25" : ""
          }`}
        >
          <Sparkles className="text-white" size={20} />
        </button>
        <button
          type="button"
          className={`md:hidden ${navTextClass}`}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div
          className={`absolute top-16 left-0 w-full text-center flex flex-col gap-3 py-4 shadow-lg z-10 md:hidden ${navMobileMenuBgClass}`}
        >
          <Link
            href="/"
            className={`mx-4 px-4 py-2 rounded-lg text-sm font-semibold transition ${
              pathname === "/" ? navLinkActiveClass : navLinkInactiveClass
            }`}
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>

          <button
            type="button"
            className={`mx-4 px-4 py-2 rounded-lg text-sm font-semibold transition ${
              isMissionActive ? navLinkActiveClass : navLinkInactiveClass
            }`}
            onClick={() => toggleDropdown("mission")}
          >
            Mission
          </button>
          {openDropdown === "mission" && (
            <div className="flex flex-col gap-2 px-8">
              {missionLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    pathname === link.href ? navLinkActiveClass : navLinkInactiveClass
                  }`}
                  onClick={() => {
                    setMenuOpen(false);
                    setOpenDropdown(null);
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          <button
            type="button"
            className={`mx-4 px-4 py-2 rounded-lg text-sm font-semibold transition ${
              isVolunteersActive ? navLinkActiveClass : navLinkInactiveClass
            }`}
            onClick={() => toggleDropdown("volunteers")}
          >
            Volunteers
          </button>
          {openDropdown === "volunteers" && (
            <div className="flex flex-col gap-2 px-8">
              {volunteerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    pathname === link.href ? navLinkActiveClass : navLinkInactiveClass
                  }`}
                  onClick={() => {
                    setMenuOpen(false);
                    setOpenDropdown(null);
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          <button
            type="button"
            className={`mx-4 px-4 py-2 rounded-lg text-sm font-semibold transition ${
              isOrganizationActive ? navLinkActiveClass : navLinkInactiveClass
            }`}
            onClick={() => toggleDropdown("organization")}
          >
            For Organization
          </button>
          {openDropdown === "organization" && (
            <div className="flex flex-col gap-2 px-8">
              {organizationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    pathname === link.href ? navLinkActiveClass : navLinkInactiveClass
                  }`}
                  onClick={() => {
                    setMenuOpen(false);
                    setOpenDropdown(null);
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <button
              type="button"
              className={`mx-auto ${navMenuButtonBase} ${
                openDropdown === "more" || isMoreActive
                  ? navMenuButtonActiveClass
                  : navMenuButtonInactiveClass
              }`}
              onClick={() => toggleDropdown("more")}
            >
              +
            </button>
            {openDropdown === "more" && (
              <div className="flex flex-col gap-2 px-6">
                {moreLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                      pathname === link.href ? navLinkActiveClass : navLinkInactiveClass
                    }`}
                    onClick={() => {
                      setMenuOpen(false);
                      setOpenDropdown(null);
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
