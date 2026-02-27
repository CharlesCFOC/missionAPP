"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import HopeAiSidebar from "@/components/hopeAi/HopeAiSidebar";

type AppShellProps = {
  children: ReactNode;
};

const PRIVATE_QUERY_VALUES = new Set(["1", "true", "yes", "on"]);

export default function AppShell({ children }: AppShellProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const privateFlag = searchParams?.get("private")?.toLowerCase() ?? "";
  const isPrivate = PRIVATE_QUERY_VALUES.has(privateFlag);
  const isAuthRoute = pathname?.startsWith("/auth") ?? false;
  const showNavbarOnLogin = pathname === "/auth/login";
  const hideShellChrome = isPrivate || (isAuthRoute && !showNavbarOnLogin);
  const mainPaddingTop = hideShellChrome ? "pt-0" : "pt-20";
  const [hopeAiOpen, setHopeAiOpen] = useState(false);

  useEffect(() => {
    const root = document.querySelector("main.app-shell");
    if (!root) return;

    const targets = new Set<HTMLElement>();
    root.querySelectorAll("section, article, header").forEach((element) => {
      targets.add(element as HTMLElement);
    });
    Array.from(root.children).forEach((element) => {
      targets.add(element as HTMLElement);
    });

    if (targets.size === 0) return;

    const prefersReducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    if (prefersReducedMotion) {
      targets.forEach((element) => {
        if (element.dataset.scrollFade === "false") return;
        element.classList.add("scroll-fade", "is-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );

    targets.forEach((element) => {
      if (element.dataset.scrollFade === "false") return;
      element.classList.add("scroll-fade");
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  return (
    <>
      {!hideShellChrome && (
        <Navbar
          hopeAiOpen={hopeAiOpen}
          onToggleHopeAi={() => setHopeAiOpen((prev) => !prev)}
        />
      )}
      <main
        className={`flex-grow app-shell ${
          mainPaddingTop
        } transition-[padding-right] duration-300 ease-out ${
          !hideShellChrome && hopeAiOpen ? "lg:pr-[420px]" : ""
        }`}
        data-private={isPrivate ? "true" : "false"}
      >
        {children}
      </main>
      {!hideShellChrome && (
        <HopeAiSidebar open={hopeAiOpen} onClose={() => setHopeAiOpen(false)} />
      )}
    </>
  );
}
