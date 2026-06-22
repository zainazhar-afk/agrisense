import Link from "next/link";
import { ArrowUpRight, Bot, Camera, MessagesSquare, Sprout } from "lucide-react";
import { navigationLinks } from "@/components/layout/siteConfig";

const modules = [
  {
    title: "Disease Lab",
    href: "/disease-detection",
    description: "Scan cotton leaves and compare treatment guidance in one flow.",
    icon: Camera,
  },
  {
    title: "Farmer Assistant",
    href: "/assistant",
    description: "Ask in Urdu, Punjabi, or English and get source-backed help.",
    icon: Bot,
  },
  {
    title: "Community",
    href: "/social",
    description: "Share field observations, photos, and practical follow-ups.",
    icon: MessagesSquare,
  },
];

export default function Footer() {
  return (
    <footer className="relative mt-10 overflow-hidden bg-[linear-gradient(180deg,#7ea66c_0%,#5f8d58_18%,#355a3c_58%,#1e3528_100%)] text-white">
      <div className="absolute inset-x-0 top-0 h-14 bg-[linear-gradient(180deg,rgba(231,239,248,0.86),rgba(231,239,248,0))]" />
      <div className="absolute left-1/2 top-0 h-24 w-[88%] -translate-x-1/2 rounded-b-[3rem] border-x border-b border-white/10 bg-[rgba(255,255,255,0.08)] blur-[0.2px]" />
      <div className="absolute -left-16 top-20 h-56 w-56 rounded-full bg-lime-300/10 blur-3xl" />
      <div className="absolute -right-20 bottom-12 h-64 w-64 rounded-full bg-emerald-200/10 blur-3xl" />

      <div className="page-wrap relative py-16">
        <div className="rounded-t-[2.8rem] rounded-b-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_30px_80px_rgba(8,20,12,0.18)] backdrop-blur-xl md:p-8">
          <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2rem_2rem_1.4rem_1.4rem] border border-white/10 bg-[rgba(245,255,244,0.08)] p-6 md:p-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/78">
                <Sprout className="h-3.5 w-3.5 text-lime-200" />
                AgriSense
              </div>

              <h2 className="mt-6 max-w-2xl font-display text-[clamp(2.1rem,3.8vw,3.4rem)] leading-[0.94] text-white">
                Built for fields, seasons, crop stress, and everyday farm decisions.
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-8 text-white/74">
                AgriSense brings crop diagnosis, multilingual retrieval, and community knowledge into one connected
                workspace for Pakistani farmers.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {navigationLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="inline-flex items-center rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm text-white/78 transition hover:border-lime-200/40 hover:bg-white/12 hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              {modules.map((item, index) => {
                const Icon = item.icon;
                const shapeClass =
                  index === 0
                    ? "rounded-[1.8rem_1.8rem_1.2rem_1.2rem]"
                    : index === 1
                      ? "rounded-[1.2rem_1.8rem_1.8rem_1.2rem]"
                      : "rounded-[1.2rem_1.2rem_1.8rem_1.8rem]";

                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className={`${shapeClass} border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.05))] p-5 transition duration-200 hover:-translate-y-1 hover:border-lime-200/30 hover:shadow-[0_22px_50px_rgba(15,35,18,0.18)]`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] border border-white/10 bg-white/10">
                        <Icon className="h-5 w-5 text-lime-200" />
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-white/56" />
                    </div>
                    <div className="mt-5 font-display text-xl font-semibold text-white">{item.title}</div>
                    <p className="mt-2 text-sm leading-7 text-white/70">{item.description}</p>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-5 text-sm text-white/58 md:flex-row md:items-center md:justify-between">
            <span>Built for Pakistani farmers with retrieval, crop vision, and field collaboration.</span>
            <span className="text-white/72">AgriSense</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
