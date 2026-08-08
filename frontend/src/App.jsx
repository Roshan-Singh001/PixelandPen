"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  Feather,
  BookOpen,
  UserCog,
  PenLine,
  GitBranch,
  Tags,
  UserCircle2,
  MessageCircle,
  Bookmark,
  BarChart3,
  ShieldCheck,
  Smartphone,
  Check,
  Heart,
  Bold,
  Italic,
  Underline,
  List,
  X,
} from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis } from "recharts";

import { useTheme } from "./contexts/ThemeContext.jsx";

export default function PixelAndPenLanding() {
  return (
    <>
      <div className={`font-['Inter'] antialiased ${t.page} transition-colors duration-300`}>
        <Hero />
        <About />
        <HowItWorks />
        <Features />
        <WhyUs />
        <Vision />
        <CTA />
      </div>
    </>
  );
}

/* Design tokens */
const t = {
  page: "bg-[#FAFAF8] dark:bg-[#0B1220] text-[#1F2937] dark:text-[#F8FAFC]",
  surface: "bg-white dark:bg-[#162033]",
  border: "border-[#E5E7EB] dark:border-[#243247]",
  text: "text-[#1F2937] dark:text-[#F8FAFC]",
  muted: "text-[#6B7280] dark:text-[#AAB4C5]",
  accent: "text-[#F97316] dark:text-[#FF8A3D]",
};

const gradientBar =
  "h-[3px] w-12 rounded-full bg-gradient-to-r from-[#F97316] to-[#F59E0B] dark:from-[#FF8A3D] dark:to-[#F6B93B]";
const cardShadow =
  "shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_40px_-12px_rgba(15,23,42,0.14)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.35),0_16px_40px_-12px_rgba(0,0,0,0.55)]";

const TINTS = [
  "bg-[#1E3A5F]/10 text-[#1E3A5F] dark:bg-[#4F8EF7]/10 dark:text-[#4F8EF7] group-hover:bg-[#1E3A5F] dark:group-hover:bg-[#4F8EF7]",
  "bg-[#F59E0B]/10 text-[#F59E0B] dark:bg-[#F6B93B]/10 dark:text-[#F6B93B] group-hover:bg-[#F59E0B] dark:group-hover:bg-[#F6B93B]",
  "bg-[#F97316]/10 text-[#F97316] dark:bg-[#FF8A3D]/10 dark:text-[#FF8A3D] group-hover:bg-[#F97316] dark:group-hover:bg-[#FF8A3D]",
];



const scrollToId = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      setVisible(true);
      return;
    }
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(node);
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [reduced]);

  const delayClass =
    delay >= 300 ? "delay-300" : delay >= 200 ? "delay-200" : delay >= 150 ? "delay-150" : delay >= 100 ? "delay-100" : "";

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${delayClass} ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        } ${className}`}
    >
      {children}
    </div>
  );
}

function PixelGrid({ className = "" }) {
  return <div aria-hidden className={`pp-pixel-grid pointer-events-none absolute inset-0 ${className}`} />;
}

function SectionLabel({ children, align = "center" }) {
  return (
    <div className={`flex flex-col ${align === "center" ? "items-center" : "items-start"}`}>
      <span className={`text-xs font-semibold tracking-[0.25em] uppercase ${t.accent}`}>{children}</span>
      <span className={`${gradientBar} mt-2 mb-6`} />
    </div>
  );
}

/* Hero */
function HeroDemoCard() {
  return (
    <div className="relative mx-auto ">
      <div aria-hidden className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-[#1E3A5F]/20 via-transparent to-[#F97316]/20 blur-2xl dark:from-[#4F8EF7]/20 dark:to-[#FF8A3D]/20" />
      <div className={`pp-float rounded-2xl border ${t.border} ${t.surface} ${cardShadow}`}>
        <div className={`flex items-center gap-1.5 border-b ${t.border} px-4 py-3`}>
          <span className="h-2.5 w-2.5 rounded-full bg-[#DC2626]/70 dark:bg-[#EF4444]/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#D97706]/70 dark:bg-[#F59E0B]/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#16A34A]/70 dark:bg-[#22C55E]/70" />
          <span className={`ml-3 text-xs ${t.muted}`}>new-article.draft</span>
        </div>
        <div className="p-5 sm:p-6">
          <div className="mb-4 flex gap-2">
            {[PenLine, Tags, MessageCircle, Bookmark].map((Icon, i) => (
              <span key={i} className={`flex h-7 w-7 items-center justify-center rounded-md border ${t.border}`}>
                <Icon className={`h-3.5 w-3.5 ${t.muted}`} />
              </span>
            ))}
          </div>
          <div className="font-['Newsreader'] text-lg font-semibold">The Quiet Power of Consistent Writing</div>
          <div className="mt-2 h-2 w-3/4 rounded-full bg-[#E5E7EB] dark:bg-[#243247]" />
          <div className="mt-3 space-y-2">
            <div className="h-2 w-full rounded-full bg-[#E5E7EB] dark:bg-[#243247]" />
            <div className="h-2 w-full rounded-full bg-[#E5E7EB] dark:bg-[#243247]" />
            <div className="h-2 w-2/3 rounded-full bg-[#E5E7EB] dark:bg-[#243247]" />
          </div>
          <div className="mt-5 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#16A34A]/10 dark:bg-[#22C55E]/10 px-3 py-1 text-xs font-medium text-[#16A34A] dark:text-[#22C55E]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A] dark:bg-[#22C55E]" /> Draft saved
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#F97316] dark:text-[#FF8A3D]">
              Submit for review <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden px-6 pb-24 pt-8 lg:px-8 lg:pb-32 lg:pt-16">
      <PixelGrid className="text-[#1E3A5F]/[0.05] dark:text-[#4F8EF7]/[0.06]" />
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#F97316]/10 blur-3xl dark:bg-[#FF8A3D]/10" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#1E3A5F]/10 blur-3xl dark:bg-[#4F8EF7]/10" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
        <Reveal>

          <h1 className="text-[clamp(2.5rem,2rem+2.5vw,4.25rem)] font-['Newsreader'] font-black leading-[1.08] tracking-tight">
            Where Great Stories <span className="font-medium italic">Find Their Voice</span>
          </h1>
          <p className={`mt-6 max-w-xl text-lg leading-relaxed ${t.muted}`}>
            A modern blogging platform designed for creators, readers, and communities. Write, publish, discover, and
            engage with meaningful content through a seamless publishing experience.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <button
              onClick={() => scrollToId("how-it-works")}
              className="inline-flex items-center gap-2 rounded-md text-white bg-[#1E3A5F] dark:bg-[#4F8EF7] dark:text-[#0B1220] px-7 py-3.5 text-sm font-semibold shadow-md transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
            >
              Explore Articles <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => scrollToId("cta")}
              className={`inline-flex items-center gap-2 rounded-md border ${t.border} px-7 py-3.5 text-sm font-semibold ${t.text} transition-colors hover:border-[#1E3A5F] dark:hover:border-[#4F8EF7]`}
            >
              Become a Contributor
            </button>
          </div>
        </Reveal>

        <Reveal delay={150}>
          <HeroDemoCard />
        </Reveal>
      </div>
    </section>
  );
}

/* About */
function About() {
  return (
    <section id="about" className="px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal className="flex flex-col items-center">
          <SectionLabel>About</SectionLabel>
          <h2 className="text-[clamp(1.875rem,1.5rem+1.5vw,2.75rem)] font-['Newsreader'] font-semibold tracking-tight">
            More Than Just a Blogging Platform
          </h2>
          <p className={`mt-6 text-lg leading-relaxed ${t.muted}`}>
            Pixel &amp; Pen is built to make publishing simple, collaborative, and engaging.
          </p>
          <p className={`mt-4 leading-relaxed ${t.muted}`}>
            Whether you're sharing knowledge, telling stories, or building a community around your ideas, Pixel &amp; Pen
            provides an intuitive platform where contributors can publish quality content, readers can discover
            valuable articles, and administrators can maintain a trusted publishing environment.
          </p>
          <p className={`mt-4 leading-relaxed ${t.muted}`}>
            Our goal is to create a space where content matters and every voice has the opportunity to be heard.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* How It Works — interactive role demo */
const ROLES = [
  {
    id: "contributors",
    title: "Contributors",
    tagline: "Share your ideas with the world.",
    description:
      "Create rich articles using an intuitive editor, organize your content, save drafts, submit articles for review, and build your presence through consistent publishing.",
    icon: Feather,
  },
  {
    id: "readers",
    title: "Readers",
    tagline: "Discover content you'll enjoy.",
    description:
      "Browse articles across multiple categories, react to posts, leave comments, bookmark your favorite reads, and connect with content that inspires you.",
    icon: BookOpen,
  },
  {
    id: "administrators",
    title: "Administrators",
    tagline: "Keep the platform running smoothly.",
    description:
      "Review submitted articles, manage users, organize categories, moderate discussions, and ensure high-quality content across the platform.",
    icon: UserCog,
  },
];

function BrowserChrome({ label, children }) {
  return (
    <div className={`overflow-hidden rounded-2xl border ${t.border} ${t.surface} ${cardShadow}`}>
      <div className={`flex items-center gap-2 border-b ${t.border} px-4 py-3`}>
        <span className="h-2.5 w-2.5 rounded-full bg-[#DC2626]/70 dark:bg-[#EF4444]/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#D97706]/70 dark:bg-[#F59E0B]/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#16A34A]/70 dark:bg-[#22C55E]/70" />
        <span className={`ml-3 rounded-md border ${t.border} px-2 py-0.5 text-[11px] ${t.muted}`}>{label}</span>
      </div>
      <div className="min-h-[360px] p-5 sm:p-6">{children}</div>
    </div>
  );
}

function Toast({ message }) {
  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-0 flex justify-center transition-all duration-300 ${message ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      style={{ position: "absolute", bottom: "0.75rem" }}
    >
      <span className="rounded-full bg-[#1E3A5F] dark:bg-[#4F8EF7] px-4 py-1.5 text-xs font-medium text-white shadow-lg">
        {message || "\u00A0"}
      </span>
    </div>
  );
}

/* Contributor demo: a real, typeable, formattable editor */
function ContributorDemo() {
  const bodyRef = useRef(null);
  const timerRef = useRef(null);
  const [wordCount, setWordCount] = useState(58);
  const [status, setStatus] = useState("draft"); // draft | saved | submitted
  const [toast, setToast] = useState("");

  const flashToast = (msg) => {
    setToast(msg);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setToast(""), 2000);
  };

  const handleInput = () => {
    const text = bodyRef.current?.innerText || "";
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    setStatus("draft");
  };

  const format = (cmd) => {
    document.execCommand(cmd);
    bodyRef.current?.focus();
  };

  const saveDraft = () => {
    setStatus("saved");
    flashToast("Draft saved");
  };

  const submit = () => {
    setStatus("submitted");
    flashToast("Submitted for review");
  };

  return (
    <BrowserChrome label="pixelandpen.app/editor">
      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {[
              { icon: Bold, cmd: "bold" },
              { icon: Italic, cmd: "italic" },
              { icon: Underline, cmd: "underline" },
              { icon: List, cmd: "insertUnorderedList" },
            ].map(({ icon: Icon, cmd }) => (
              <button
                key={cmd}
                type="button"
                onClick={() => format(cmd)}
                aria-label={cmd}
                className={`flex h-8 w-8 items-center justify-center rounded-lg border ${t.border} ${t.muted} transition-colors hover:border-[#F97316] hover:text-[#F97316] dark:hover:border-[#FF8A3D] dark:hover:text-[#FF8A3D]`}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
          <span className={`text-[11px] ${t.muted}`}>{wordCount} words</span>
        </div>

        <div className="font-['Newsreader'] text-xl font-semibold">Designing for Slow Reading</div>

        <div
          ref={bodyRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          className={`mt-3 min-h-[140px] text-sm leading-relaxed ${t.muted} outline-none [&_ul]:list-disc [&_ul]:pl-5`}
        >
          There is a particular kind of attention that only slow reading rewards — the kind that notices rhythm, not
          just information. Good publishing tools should protect that pace, not fight it.
          <br />
          Try editing this paragraph. Select some text and use the toolbar above.
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={saveDraft}
              className={`rounded-md border ${t.border} px-4 py-2 text-xs font-semibold ${t.text} transition-transform active:scale-95`}
            >
              Save Draft
            </button>
            <button
              onClick={submit}
              className="rounded-md bg-[#1E3A5F] dark:bg-[#4F8EF7] dark:text-[#0B1220] px-4 py-2 text-xs font-semibold text-white transition-transform active:scale-95"
            >
              Submit for Review
            </button>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${status === "submitted"
                ? "bg-[#16A34A]/10 text-[#16A34A] dark:bg-[#22C55E]/10 dark:text-[#22C55E]"
                : status === "saved"
                  ? "bg-[#D97706]/10 text-[#D97706] dark:bg-[#F59E0B]/10 dark:text-[#F59E0B]"
                  : `${t.border} border ${t.muted}`
              }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {status === "submitted" ? "In review" : status === "saved" ? "Draft saved" : "Unsaved"}
          </span>
        </div>

        <Toast message={toast} />
      </div>
    </BrowserChrome>
  );
}

/* Reader demo: real like / bookmark state */
function ReaderDemo() {
  const [posts, setPosts] = useState([
    { id: 1, tag: "Culture", title: "The Art of Slow Journalism", reads: "3.2k", likes: 428, liked: false, bookmarked: false },
    { id: 2, tag: "Technology", title: "Building Trust in Digital Media", reads: "1.8k", likes: 251, liked: false, bookmarked: false },
    { id: 3, tag: "Essays", title: "On Writing Without an Audience", reads: "5.1k", likes: 812, liked: true, bookmarked: true },
  ]);

  const toggleLike = (id) =>
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p)));

  const toggleBookmark = (id) => setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, bookmarked: !p.bookmarked } : p)));

  return (
    <BrowserChrome label="pixelandpen.app/feed">
      <div className="space-y-4">
        {posts.map((p) => (
          <div
            key={p.id}
            className={`flex items-center justify-between gap-4 rounded-xl border ${t.border} p-4 transition-colors hover:border-[#F97316]/50 dark:hover:border-[#FF8A3D]/50`}
          >
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[#F59E0B] dark:text-[#F6B93B]">{p.tag}</span>
              <div className="mt-1 text-sm font-semibold">{p.title}</div>
              <div className={`mt-1 text-xs ${t.muted}`}>{p.reads} reads</div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => toggleLike(p.id)}
                aria-pressed={p.liked}
                className={`flex h-9 items-center gap-1.5 rounded-full border px-2.5 transition-colors ${p.liked
                    ? "border-[#F97316] bg-[#F97316]/10 text-[#F97316] dark:border-[#FF8A3D] dark:bg-[#FF8A3D]/10 dark:text-[#FF8A3D]"
                    : `${t.border} ${t.muted}`
                  }`}
              >
                <Heart className="h-3.5 w-3.5" fill={p.liked ? "currentColor" : "none"} />
                <span className="text-xs font-medium">{p.likes}</span>
              </button>
              <button
                onClick={() => toggleBookmark(p.id)}
                aria-pressed={p.bookmarked}
                className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${p.bookmarked
                    ? "border-[#1E3A5F] bg-[#1E3A5F]/10 text-[#1E3A5F] dark:border-[#4F8EF7] dark:bg-[#4F8EF7]/10 dark:text-[#4F8EF7]"
                    : `${t.border} ${t.muted}`
                  }`}
              >
                <Bookmark className="h-3.5 w-3.5" fill={p.bookmarked ? "currentColor" : "none"} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </BrowserChrome>
  );
}

/* Admin demo: real approve / reject queue + live chart */
function AdminDemo({ isDarkMode }) {
  const [pending, setPending] = useState([
    { id: 1, title: "The Ethics of AI Journalism" },
    { id: 2, title: "A Guide to Deep Work" },
    { id: 3, title: "Notes on Editorial Independence" },
  ]);
  const [approved, setApproved] = useState(0);
  const [rejected, setRejected] = useState(0);

  const resolve = (id, kind) => {
    setPending((prev) => prev.filter((p) => p.id !== id));
    if (kind === "approve") setApproved((c) => c + 1);
    else setRejected((c) => c + 1);
  };

  const chartData = [
    { name: "Mon", v: 24 },
    { name: "Tue", v: 38 },
    { name: "Wed", v: 30 },
    { name: "Thu", v: 52 },
    { name: "Fri", v: 44 },
    { name: "Sat", v: 61 },
    { name: "Sun", v: 48 },
  ];
  const axisColor = isDarkMode ? "#AAB4C5" : "#6B7280";
  const barColor = isDarkMode ? "#4F8EF7" : "#1E3A5F";

  return (
    <BrowserChrome label="pixelandpen.app/admin">
      <div className="mb-2 flex items-center justify-between">
        <span className={`text-xs font-semibold uppercase tracking-wide ${t.muted}`}>Weekly submissions</span>
        <span className={`text-[11px] ${t.muted}`}>
          <span className="text-[#16A34A] dark:text-[#22C55E]">{approved} approved</span>
          {"  ·  "}
          <span className="text-[#DC2626] dark:text-[#EF4444]">{rejected} rejected</span>
        </span>
      </div>
      <div className="mb-5 h-24">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: axisColor }} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: "transparent" }} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Bar dataKey="v" radius={[4, 4, 0, 0]} fill={barColor} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={`mb-3 text-xs font-semibold uppercase tracking-wide ${t.muted}`}>
        Pending review {pending.length > 0 && `(${pending.length})`}
      </div>

      {pending.length === 0 ? (
        <div className={`flex flex-col items-center justify-center rounded-xl border border-dashed ${t.border} py-10 text-center`}>
          <Check className="h-5 w-5 text-[#16A34A] dark:text-[#22C55E]" />
          <p className={`mt-2 text-sm font-medium ${t.text}`}>All caught up</p>
          <p className={`text-xs ${t.muted}`}>No articles waiting on review.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {pending.map((item) => (
            <div key={item.id} className={`flex items-center justify-between rounded-xl border ${t.border} px-4 py-3 transition-opacity`}>
              <span className="text-sm font-medium">{item.title}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => resolve(item.id, "approve")}
                  aria-label="Approve"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[#16A34A]/10 text-[#16A34A] transition-transform hover:scale-110 dark:bg-[#22C55E]/10 dark:text-[#22C55E]"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => resolve(item.id, "reject")}
                  aria-label="Reject"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[#DC2626]/10 text-[#DC2626] transition-transform hover:scale-110 dark:bg-[#EF4444]/10 dark:text-[#EF4444]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </BrowserChrome>
  );
}

function RoleDemoPanel({ roleId, isDarkMode }) {
  if (roleId === "contributors") return <ContributorDemo />;
  if (roleId === "readers") return <ReaderDemo />;
  return <AdminDemo isDarkMode={isDarkMode} />;
}

function HowItWorks() {
  const [activeRole, setActiveRole] = useState(ROLES[0].id);
  const role = ROLES.find((r) => r.id === activeRole);
  const themeCtx = useTheme();
  const isDarkMode = themeCtx?.isDarkMode ?? false;

  return (
    <section id="how-it-works" className={`${t.surface} px-6 py-24 transition-colors duration-300 lg:px-8`}>
      <div className="mx-auto max-w-7xl">
        <Reveal className="flex flex-col items-center text-center">
          <SectionLabel>How It Works</SectionLabel>
          <h2 className="text-[clamp(1.875rem,1.5rem+1.5vw,2.75rem)] font-['Newsreader'] font-semibold tracking-tight">
            Built for Everyone
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-5 lg:items-start">
          <Reveal delay={100} className="lg:col-span-2">
            <div className="flex flex-row gap-3 lg:flex-col">
              {ROLES.map((r) => {
                const isActive = r.id === activeRole;
                const Icon = r.icon;
                return (
                  <button
                    key={r.id}
                    onClick={() => setActiveRole(r.id)}
                    className={`group flex flex-1 items-start gap-4 rounded-2xl border px-5 py-4 text-left transition-all duration-300 lg:flex-none ${isActive
                        ? `border-[#F97316] bg-[#FAFAF8] dark:border-[#FF8A3D] dark:bg-[#0B1220] ${cardShadow}`
                        : `${t.border} hover:border-[#F97316]/50 dark:hover:border-[#FF8A3D]/50`
                      }`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${isActive
                          ? "bg-[#1E3A5F] dark:bg-[#4F8EF7] dark:text-[#0B1220] text-white"
                          : `border ${t.border} text-[#6B7280] dark:text-[#AAB4C5]`
                        }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="hidden sm:block">
                      <span className="block text-sm font-semibold">{r.title}</span>
                      <span className={`mt-0.5 block text-xs ${t.muted}`}>{r.tagline}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 hidden lg:block">
              <p className={`text-sm leading-relaxed ${t.muted}`}>{role.description}</p>
            </div>
          </Reveal>

          <Reveal delay={200} className="lg:col-span-3">
            <RoleDemoPanel roleId={activeRole} isDarkMode={isDarkMode} />
            <p className={`mt-6 text-sm leading-relaxed lg:hidden ${t.muted}`}>{role.description}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* Features */
const FEATURES = [
  { icon: PenLine, title: "Rich Text Editor", desc: "Create beautifully formatted articles with an intuitive writing experience." },
  {
    icon: GitBranch,
    title: "Draft & Publishing Workflow",
    desc: "Write at your own pace, save drafts, and submit articles for editorial review before publication.",
  },
  {
    icon: Tags,
    title: "Categories & Tags",
    desc: "Organize content effectively, making it easier for readers to discover topics they're interested in.",
  },
  { icon: UserCircle2, title: "User Profiles", desc: "Personalized profiles for contributors and readers to showcase activity and engagement." },
  { icon: MessageCircle, title: "Comments & Reactions", desc: "Encourage meaningful conversations and community interaction around every article." },
  { icon: Bookmark, title: "Bookmarks", desc: "Save articles to revisit them anytime." },
  { icon: BarChart3, title: "Analytics Dashboard", desc: "Track publishing activity and gain insights into platform engagement." },
  { icon: ShieldCheck, title: "Secure Authentication", desc: "Protected accounts with role-based access for administrators, contributors, and readers." },
  { icon: Smartphone, title: "Responsive Design", desc: "Enjoy a seamless experience across desktops, tablets, and mobile devices." },
];

function Features() {
  return (
    <section id="features" className="px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal className="flex flex-col items-center text-center">
          <SectionLabel>Features</SectionLabel>
          <h2 className="text-[clamp(1.875rem,1.5rem+1.5vw,2.75rem)] font-['Newsreader'] font-semibold tracking-tight">
            Everything You Need for Modern Publishing
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 100}>
              <div
                className={`group relative h-full overflow-hidden rounded-2xl border ${t.border} ${t.surface} p-6 transition-all duration-300 hover:-translate-y-1 hover:${cardShadow}`}
              >
                <span className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-[#F97316] to-[#F59E0B] transition-transform duration-300 group-hover:scale-x-100 dark:from-[#FF8A3D] dark:to-[#F6B93B]" />
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors duration-300 group-hover:text-white ${TINTS[i % 3]}`}
                >
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
                <p className={`mt-2 text-sm leading-relaxed ${t.muted}`}>{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Why Pixel & Pen */
function VennDiagram() {
  return (
    <div className="relative mx-auto flex h-80 w-80 items-center justify-center sm:h-96 sm:w-96">
      <div className="absolute left-2 top-6 h-52 w-52 rounded-full bg-[#1E3A5F]/25 mix-blend-multiply dark:bg-[#4F8EF7]/25 dark:mix-blend-screen sm:h-60 sm:w-60" />
      <div className="absolute right-2 top-6 h-52 w-52 rounded-full bg-[#F97316]/25 mix-blend-multiply dark:bg-[#FF8A3D]/25 dark:mix-blend-screen sm:h-60 sm:w-60" />
      <div className="absolute bottom-2 h-52 w-52 rounded-full bg-[#F59E0B]/25 mix-blend-multiply dark:bg-[#F6B93B]/25 dark:mix-blend-screen sm:h-60 sm:w-60" />

      <span className="absolute left-4 top-0 text-xs font-semibold text-[#1E3A5F] dark:text-[#4F8EF7] sm:left-6">Contributors</span>
      <span className="absolute right-6 top-0 text-xs font-semibold text-[#F97316] dark:text-[#FF8A3D]">Readers</span>
      <span className="absolute bottom-2 text-xs font-semibold text-[#D97706] dark:text-[#F6B93B]">Administrators</span>

      <span className={`relative rounded-full border ${t.border} ${t.surface} px-4 py-2 font-['Newsreader'] text-sm font-semibold ${cardShadow}`}>
        Pixel &amp; Pen
      </span>
    </div>
  );
}

function WhyUs() {
  return (
    <section className={`${t.surface} px-6 py-24 transition-colors duration-300 lg:px-8`}>
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
        <Reveal>
          <SectionLabel align="left">Why Pixel &amp; Pen</SectionLabel>
          <h2 className="text-[clamp(1.875rem,1.5rem+1.5vw,2.75rem)] font-['Newsreader'] font-semibold tracking-tight">
            Designed Around Collaboration
          </h2>
          <p className={`mt-6 leading-relaxed ${t.muted}`}>Great content is rarely created in isolation.</p>
          <p className={`mt-4 leading-relaxed ${t.muted}`}>
            Pixel &amp; Pen brings together contributors who create, readers who engage, and administrators who
            maintain quality, forming a collaborative publishing environment where every role contributes to a
            better reading experience.
          </p>
          <p className={`mt-4 leading-relaxed ${t.muted}`}>
            By simplifying content management and encouraging meaningful interactions, the platform helps
            communities grow around ideas worth sharing.
          </p>
        </Reveal>

        <Reveal delay={150}>
          <VennDiagram />
        </Reveal>
      </div>
    </section>
  );
}

/* Vision */
function Vision() {
  return (
    <section id="vision" className="relative px-6 py-24 lg:px-8">
      <div className="relative mx-auto max-w-3xl text-center">
        <Reveal className="flex flex-col items-center">
          <SectionLabel>Our Vision</SectionLabel>
          <h2 className="text-[clamp(1.875rem,1.5rem+1.5vw,2.75rem)] font-['Newsreader'] font-semibold tracking-tight">Looking Ahead</h2>
          <p className={`mt-6 leading-relaxed ${t.muted}`}>
            Pixel &amp; Pen begins as a collaborative blogging platform, but this is only the beginning.
          </p>
          <p className={`mt-4 leading-relaxed ${t.muted}`}>
            As the platform evolves, we aim to explore new ways of improving how content is managed, published, and
            experienced. Future innovations will continue to focus on solving real challenges faced by creators,
            publishers, and digital communities.
          </p>
          <p className={`mt-8 text-sm font-semibold uppercase tracking-widest ${t.muted}`}>
            Every step forward will be guided by the same principle:
          </p>
          <div className="relative mt-4">
            <span
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 select-none font-['Newsreader'] text-[9rem] leading-none text-[#1E3A5F]/[0.06] dark:text-[#4F8EF7]/[0.08]"
            >
              &rdquo;
            </span>
            <p className="text-[clamp(1.5rem,1.25rem+1.25vw,2.25rem)] font-['Newsreader'] font-medium italic">
              Create better experiences around content.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* CTA */
function CTA() {
  return (
    <section id="cta" className="relative overflow-hidden px-6 py-24 lg:px-8">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A5F] to-[#0f2338] dark:from-[#0B1220] dark:to-[#162033]" />
      <PixelGrid className="text-white/[0.05]" />
      <div aria-hidden className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-[#F97316]/20 blur-3xl" />
      <div className="relative mx-auto max-w-3xl text-center">
        <Reveal>
          <h2 className="text-[clamp(1.875rem,1.5rem+1.5vw,2.75rem)] font-['Newsreader'] font-semibold tracking-tight text-white">
            Start Writing. Start Reading. Start Sharing.
          </h2>
          <p className="mx-auto mt-5 max-w-xl leading-relaxed text-white/70">
            Whether you're here to publish your first article, discover fresh perspectives, or build a thriving
            content community, Pixel &amp; Pen gives you the tools to make it happen.
          </p>
          <button className="mt-9 inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-[#F97316] to-[#F59E0B] px-8 py-4 text-sm font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98] dark:from-[#FF8A3D] dark:to-[#F6B93B]">
            Join Pixel &amp; Pen Today <ArrowRight className="h-4 w-4" />
          </button>
        </Reveal>
      </div>
    </section>
  );
}

