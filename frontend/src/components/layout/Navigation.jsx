"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationLinks } from "./siteConfig";

export const NavItems = ({ mobile = false }) => {
  const pathname = usePathname();

  return (
    <>
      {navigationLinks.map((item) => {
        const Icon = item.icon;
        const active =
          item.href === "/"
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium ${
              active
                ? "bg-[var(--accent)] text-white"
                : mobile
                  ? "border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </>
  );
};

export const DesktopNav = () => <div className="flex items-center gap-1"><NavItems /></div>;

export const MobileNav = () => <div className="space-y-2"><NavItems mobile /></div>;

export const MobileMenuButton = () => null;

export const Logo = () => (
  <Link href="/" className="font-display text-lg font-semibold text-[var(--ink)]">
    AgriSense
  </Link>
);

export default function Navigation() {
  return <DesktopNav />;
}
