"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  CalendarDays,
  Camera,
  ChartColumnBig,
  CheckCircle2,
  CloudSun,
  Leaf,
  MapPinned,
  MessagesSquare,
  Radar,
  ShieldCheck,
  Sparkles,
  Waves,
} from "lucide-react";

const modules = [
  {
    title: "Vision diagnostics",
    body: "Upload a cotton leaf and review ranked predictions, symptoms, and treatment notes without leaving the flow.",
    icon: Camera,
    stat: "Scan, compare, decide",
  },
  {
    title: "Multilingual retrieval",
    body: "Ask practical questions in Urdu, Punjabi, or English and keep the answer grounded in your farm context.",
    icon: Bot,
    stat: "Sources, translation, audio",
  },
  {
    title: "Field community",
    body: "Collect local observations and farmer reports in a feed that feels useful instead of noisy.",
    icon: MessagesSquare,
    stat: "Posts, comments, media",
  },
];

const systemRows = [
  ["Disease engine", "FastAPI model flow for cotton disease analysis"],
  ["Assistant loop", "OpenAI answers over FAISS retrieval"],
  ["Farmer context", "Personalized around Pakistani agriculture"],
];

const proofPoints = [
  "The interface exposes the product itself instead of hiding behind generic AI marketing.",
  "Light glass surfaces, calmer spacing, and sharper typography make the app feel more premium.",
  "Animations reinforce state and hierarchy rather than acting like decoration pasted on top.",
];

const dashboardStats = [
  ["Answer languages", "03"],
  ["Connected services", "03"],
  ["Core workflows", "04"],
];

const farmRhythm = [
  {
    title: "Weather watch",
    value: "34°C",
    note: "Late afternoon scouting is easier than noon passes.",
    icon: CloudSun,
  },
  {
    title: "Mandi pulse",
    value: "steady",
    note: "No urgent selling signal. Watch for local transport swings.",
    icon: ChartColumnBig,
  },
  {
    title: "Field calendar",
    value: "this week",
    note: "Review pest pressure after irrigation and after rain windows.",
    icon: CalendarDays,
  },
  {
    title: "Local context",
    value: "Punjab",
    note: "The product language stays grounded in Pakistani farm routines.",
    icon: MapPinned,
  },
];

function PreviewWindow() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30, y: 18 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="app-window floating-soft hidden min-h-[540px] lg:block"
    >
      <div className="window-header">
        <span className="window-dot" />
        <span className="window-dot" />
        <span className="window-dot" />
        <span className="ml-3 text-xs uppercase tracking-[0.22em] text-slate-400">control deck</span>
      </div>

      <div className="grid gap-4 p-5">
        <div className="rounded-[1.7rem] border border-emerald-100 bg-[linear-gradient(135deg,rgba(228,236,220,0.94),rgba(239,244,234,0.92),rgba(232,239,226,0.9))] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm uppercase tracking-[0.18em] text-slate-500">Live assistant</div>
              <div className="mt-3 max-w-sm font-display text-2xl leading-tight text-slate-950">
                Practical guidance built for farmers, not generic chatbot demos.
              </div>
            </div>
            <div className="rounded-full border border-emerald-100 bg-slate-100/80 px-3 py-1 text-xs text-slate-600">Active</div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.3rem] border border-emerald-100 bg-slate-100/72 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Response mode</div>
              <div className="mt-2 text-sm text-slate-600">Urdu answer with citations, translation, and voice playback.</div>
            </div>
            <div className="rounded-[1.3rem] border border-emerald-100 bg-slate-100/72 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Source view</div>
              <div className="mt-2 text-sm text-slate-600">Retrieved pages remain visible as traceable source chips.</div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.6rem] border border-emerald-100 bg-slate-100/72 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-slate-900">Field signal board</div>
              <div className="data-chip">system ready</div>
            </div>
            <div className="mt-5 space-y-4">
              {systemRows.map(([title, text]) => (
                <div key={title} className="rounded-[1.2rem] border border-emerald-100 bg-[rgba(239,244,234,0.92)] px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <CheckCircle2 className="h-4 w-4 text-lime-500" />
                    {title}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-slate-600">{text}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-emerald-100 bg-slate-100/72 p-4">
            <div className="text-sm font-medium text-slate-900">Disease confidence</div>
            <div className="mt-5 space-y-4">
              {[
                ["Curl Virus", "84%"],
                ["Bacterial Blight", "11%"],
                ["Healthy Leaf", "5%"],
              ].map(([label, width]) => (
                <div key={label}>
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>{label}</span>
                    <span>{width}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-[linear-gradient(90deg,#2563eb,#06b6d4,#84cc16)]"
                      style={{ width }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-[1.2rem] border border-dashed border-emerald-100 px-4 py-5 text-sm text-slate-600">
              Media upload, diagnosis review, and treatment guidance all sit in one calmer workflow.
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {dashboardStats.map(([label, value]) => (
            <div key={label} className="rounded-[1.3rem] border border-emerald-100 bg-slate-100/72 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</div>
              <div className="mt-3 font-display text-3xl text-slate-950">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function HomeContent() {
  return (
    <div>
      <section className="relative min-h-[90vh] overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover">
          <source src="/Posterfin2.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(230,238,248,0.94),rgba(230,238,248,0.8),rgba(230,238,248,0.42))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(126,166,108,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(166,201,123,0.14),transparent_30%)]" />

        <div className="page-wrap relative">
          <div className="grid min-h-[90vh] gap-10 pb-16 pt-28 lg:grid-cols-[minmax(0,0.9fr)_minmax(460px,0.76fr)] lg:items-end">
            <div className="max-w-3xl pb-4">
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="eyebrow"
              >
                <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                futuristic farm intelligence
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.08 }}
                className="hero-title mt-6 max-w-5xl"
              >
                Precision agriculture software with a lighter, sharper pulse.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.16 }}
                className="mt-6 max-w-2xl text-lg leading-8 text-slate-600"
              >
                AgriSense combines crop vision, multilingual retrieval, and community field knowledge in a product
                surface that feels modern, trustworthy, and built for actual daily use.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.24 }}
                className="mt-8 flex flex-col gap-3 sm:flex-row"
              >
                <Link href="/assistant" className="button-primary">
                  Open the assistant
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/disease-detection" className="button-secondary">
                  Scan a leaf
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.32 }}
                className="mt-10 grid gap-3 sm:grid-cols-3"
              >
                {[
                  ["Urdu, Punjabi, English", "Practical multilingual flow"],
                  ["Grounded answers", "Source-aware retrieval output"],
                  ["Connected tools", "Built around this live stack"],
                ].map(([title, text]) => (
                  <div key={title} className="metric-tile rounded-[1.5rem] bg-slate-100/70 backdrop-blur-md">
                    <div className="text-base font-semibold text-slate-950">{title}</div>
                    <div className="mt-2 text-sm leading-6 text-slate-600">{text}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            <div className="relative">
              <PreviewWindow />
            </div>
          </div>
        </div>
      </section>

      <section className="section-cream -mt-10 rounded-t-[2.5rem] pt-14">
        <div className="page-wrap">
          <div className="mb-8 grid gap-4 lg:grid-cols-4">
            {farmRhythm.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="panel-light rounded-[1.6rem] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-emerald-100 bg-slate-100/80">
                      <Icon className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{item.title}</div>
                  </div>
                  <div className="mt-5 font-display text-3xl text-slate-950">{item.value}</div>
                  <div className="mt-3 text-sm leading-7 text-slate-600">{item.note}</div>
                </div>
              );
            })}
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
            <div className="max-w-xl">
              <div className="eyebrow">
                <Radar className="h-3.5 w-3.5 text-emerald-700" />
                product direction
              </div>
              <h2 className="section-title mt-6">A more futuristic interface that still feels useful on day one.</h2>
              <p className="section-copy mt-5">
                The redesign leans into premium product patterns: airy glass surfaces, bright technical accents,
                cinematic structure, and actual application previews instead of vague promise-heavy sections.
              </p>

              <div className="mt-8 space-y-3">
                {proofPoints.map((point) => (
                  <div key={point} className="panel-light rounded-[1.4rem] px-4 py-4">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="mt-0.5 h-5 w-5 text-teal-500" />
                      <span className="text-sm leading-7 text-slate-600">{point}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              {modules.map((module, index) => {
                const Icon = module.icon;
                return (
                  <motion.div
                    key={module.title}
                    initial={{ opacity: 0, y: 26 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.7, delay: index * 0.08 }}
                    className="panel-light rounded-[1.85rem] p-6"
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                      <div className="flex gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.2rem] border border-emerald-100 bg-slate-100/76">
                          <Icon className="h-6 w-6 text-emerald-700" />
                        </div>
                        <div>
                          <div className="font-display text-2xl font-semibold text-slate-950">{module.title}</div>
                          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{module.body}</p>
                        </div>
                      </div>
                      <div className="data-chip whitespace-nowrap">{module.stat}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="section-dark py-[4.5rem]">
        <div className="page-wrap py-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
            <div className="panel rounded-[2rem] p-6 md:p-8">
              <div className="window-header -mx-6 -mt-6 mb-6 md:-mx-8 md:-mt-8">
                <span className="window-dot" />
                <span className="window-dot" />
                <span className="window-dot" />
                <span className="ml-3 text-xs uppercase tracking-[0.22em] text-slate-400">assistant workflow</span>
              </div>

              <div className="grid gap-5">
                <div className="rounded-[1.6rem] border border-emerald-100 bg-slate-100/72 p-5">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-slate-950">Voice, translation, citations</div>
                    <div className="data-chip">live surface</div>
                  </div>
                  <div className="mt-4 space-y-3">
                    {[
                      "Quick prompt chips keep the conversation moving without feeling cluttered.",
                      "Inline translation is available where it matters, not buried in settings.",
                      "Audio playback now includes a clear stop path in the main control area.",
                    ].map((item) => (
                      <div key={item} className="rounded-[1.1rem] border border-emerald-100 bg-slate-100/76 px-4 py-3 text-sm text-slate-600">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.6rem] border border-emerald-100 bg-[linear-gradient(135deg,rgba(228,236,220,0.84),rgba(239,244,234,0.82))] p-5">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-950">
                    <Leaf className="h-4 w-4 text-lime-500" />
                    Why it feels stronger
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    The assistant behaves like a modern workspace instead of a single long chat block. State, hierarchy,
                    and action density all feel more deliberate.
                  </p>
                </div>
              </div>
            </div>

            <div className="panel rounded-[2rem] p-6 md:p-8">
              <div className="window-header -mx-6 -mt-6 mb-6 md:-mx-8 md:-mt-8">
                <span className="window-dot" />
                <span className="window-dot" />
                <span className="window-dot" />
                <span className="ml-3 text-xs uppercase tracking-[0.22em] text-slate-400">system framing</span>
              </div>

              <div className="grid gap-5">
                <div className="rounded-[1.6rem] border border-emerald-100 bg-slate-100/72 p-5">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-950">
                    <Waves className="h-4 w-4 text-emerald-500" />
                    Layout language
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {[
                      "Bright layered sections with glassmorphism that still stay readable.",
                      "Animation used for reveals, emphasis, and scan feedback.",
                      "Product previews that look like the real interface rather than filler shapes.",
                      "Copy that stays grounded in farming work instead of generic AI claims.",
                    ].map((item) => (
                      <div key={item} className="rounded-[1.1rem] border border-emerald-100 bg-slate-100/76 px-4 py-3 text-sm text-slate-600">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.6rem] border border-emerald-100 bg-slate-100/76 p-5">
                  <div className="status-line" />
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="data-chip">
                      <Waves className="h-3.5 w-3.5 text-emerald-500" />
                      bright glass surfaces
                    </span>
                    <span className="data-chip">
                      <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                      layered motion
                    </span>
                    <span className="data-chip">
                      <Leaf className="h-3.5 w-3.5 text-lime-500" />
                      agriculture tone
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
