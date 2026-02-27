import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <section
      className="flex min-h-screen items-center justify-center px-4 py-16"
      data-scroll-fade="false"
    >
      <div className="w-full max-w-lg">{children}</div>
    </section>
  );
}
