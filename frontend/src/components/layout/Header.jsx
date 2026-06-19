"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Menu, Sparkles, X } from "lucide-react";
import { navigationLinks } from "./siteConfig";

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href) =>
    href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <motion.header initial={{ y: -28, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed inset-x-0 top-0 z-50">
        <div className="page-wrap pt-4">
          <div
            className={`mx-auto flex max-w-[1280px] items-center justify-between rounded-[1.8rem] border px-4 py-3 transition-all duration-300 sm:px-5 ${
              scrolled
                ? "border-emerald-200/90 bg-[rgba(236,242,231,0.88)] shadow-[0_24px_70px_rgba(53,90,60,0.14)] backdrop-blur-2xl"
                : "border-emerald-100/90 bg-[rgba(228,236,222,0.72)] shadow-[0_16px_50px_rgba(95,141,88,0.12)] backdrop-blur-xl"
            }`}
          >
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-11 w-11 overflow-hidden rounded-[1rem] border border-emerald-100 bg-[linear-gradient(180deg,rgba(247,249,243,0.95),rgba(232,239,226,0.88))]">
                <Image src="/appLogo.png" alt="AgriSense" fill sizes="44px" className="object-cover" />
              </div>
              <div className="min-w-0">
                <div className="font-display text-[1.2rem] font-semibold tracking-tight text-slate-950">AgriSense</div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">precision farming interface</div>
              </div>
            </Link>

            <nav className="hidden items-center gap-1 rounded-full border border-emerald-100 bg-[rgba(243,247,239,0.82)] p-1 lg:flex">
              {navigationLinks.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition ${
                      active ? "text-slate-950" : "text-slate-600 hover:text-slate-950"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-active-pill"
                        className="absolute inset-0 rounded-full bg-[linear-gradient(90deg,rgba(214,231,204,0.95),rgba(235,245,226,0.94),rgba(246,250,240,0.92))]"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <Icon className="relative h-4 w-4" />
                    <span className="relative">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-[rgba(243,247,239,0.82)] px-3 py-2 text-xs text-slate-600 md:inline-flex">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                built for real field workflows
              </div>
              <Link href="/assistant" className="button-primary hidden lg:inline-flex">
                Launch assistant
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={() => setMenuOpen((current) => !current)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-emerald-100 bg-[rgba(243,247,239,0.82)] text-slate-900 lg:hidden"
                aria-label="Toggle navigation"
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/18 backdrop-blur-sm"
              aria-label="Close menu"
            />
            <motion.div
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              className="fixed inset-x-4 top-24 z-50 rounded-[1.75rem] border border-emerald-100 bg-[rgba(238,243,233,0.94)] p-4 shadow-[0_28px_70px_rgba(53,90,60,0.14)] backdrop-blur-2xl"
            >
              <div className="space-y-2">
                {navigationLinks.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-start gap-3 rounded-[1.35rem] border px-4 py-3 ${
                        active
                          ? "border-emerald-200 bg-[linear-gradient(90deg,rgba(214,231,204,0.96),rgba(243,247,239,0.96))] text-slate-950"
                          : "border-emerald-100 bg-[rgba(245,248,241,0.84)] text-slate-700"
                      }`}
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className={`mt-1 text-sm ${active ? "text-slate-600" : "text-slate-500"}`}>{item.description}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <Link href="/assistant" onClick={() => setMenuOpen(false)} className="button-primary mt-4 w-full">
                Launch assistant
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
