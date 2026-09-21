import React, { useEffect, useMemo, useState } from "react";
import AxiosInstance from "../../api/axiosInstance";
import { MdEmail, MdEdit, MdMenuBook, MdCheckCircle, MdError } from "react-icons/md";
import { IoMdPerson } from "react-icons/io";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LogoDark from "../../assets/images/Pixel & Pen(Main-B&W-New).png";
import MetaData from "../../components/MetaData";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]{4,}$/;

const INITIAL_FORM = { pass: "", cpass: "", email: "", username: "", RegisterAs: "" };

const ROLES = [
  { value: "Contributor", title: "Contributor", hint: "Write and publish", Icon: MdEdit },
  { value: "Reader", title: "Reader", hint: "Discover and follow", Icon: MdMenuBook },
];

const TAGLINES = ["Write what matters.", "Discover what inspires.", "Be part of the conversation."];

function evalPasswordStrength(pw) {
  if (!pw) return null;
  if (pw.length >= 8 && /[a-z]/.test(pw) && /[A-Z]/.test(pw) && /\d/.test(pw) && /[^A-Za-z0-9]/.test(pw))
    return "strong";
  if (pw.length >= 8 && /[a-z]/.test(pw) && /[A-Z]/.test(pw) && /\d/.test(pw)) return "medium";
  if (pw.length >= 4) return "weak";
  return "vweak";
}

const STRENGTH_META = {
  strong: { label: "Strong password", level: 4, text: "text-green-600 dark:text-green-400", bg: "bg-green-500" },
  medium: { label: "Medium — add a symbol to make it strong", level: 3, text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500" },
  weak: { label: "Weak — use 8+ characters with mixed case and a number", level: 2, text: "text-orange-500 dark:text-orange-400", bg: "bg-orange-500" },
  vweak: { label: "Too short", level: 1, text: "text-red-600 dark:text-red-400", bg: "bg-red-500" },
};

/** Debounced "is this taken?" check. Returns "idle" | "checking" | "taken" | "available". */
function useAvailability(value, regex, endpoint, noun) {
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    const v = value.trim();
    if (!regex.test(v)) {
      setStatus("idle");
      return;
    }

    let cancelled = false;
    setStatus("checking");

    const timer = setTimeout(async () => {
      try {
        const res = await AxiosInstance.get(`${endpoint}/${encodeURIComponent(v)}`);
        if (!cancelled) setStatus(res.data.exists ? "taken" : "available");
      } catch (err) {
        if (cancelled) return;
        setStatus("idle");
        toast.error(
          err.response?.status === 429
            ? "Too many requests. Please wait a few minutes before trying again."
            : `We couldn't check that ${noun}. Try again in a moment.`,
          { toastId: `${noun}-check-error` }
        );
      }
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [value, regex, endpoint, noun]);

  return status;
}

function Sign_Up_Page() {
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const emailStatus = useAvailability(form.email, EMAIL_REGEX, "/check-email", "email");
  const userStatus = useAvailability(form.username, USERNAME_REGEX, "/check-username", "username");

  const strength = useMemo(() => evalPasswordStrength(form.pass), [form.pass]);
  const sm = strength ? STRENGTH_META[strength] : null;
  const passMatch = !form.pass || !form.cpass ? null : form.pass === form.cpass ? "matched" : "mismatch";

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;

    if (form.pass !== form.cpass) return toast.error("Passwords don't match.");
    if (emailStatus === "taken" || userStatus === "taken") return toast.error("Email or username already in use.");
    if (!form.RegisterAs) return toast.error("Select a role to continue.");

    setSubmitting(true);
    try {
      await AxiosInstance.post("/submit", {
        username: form.username,
        password: form.pass,
        email: form.email,
        RegisterAs: form.RegisterAs,
      });
      toast.success("OTP sent — check your inbox.");
      navigate("/verify-otp", { state: { email: form.email } });
      setForm(INITIAL_FORM);
    } catch (err) {
      toast.error(
        err.response?.status === 429
          ? "Too many requests. Please wait a few minutes before trying again."
          : err.response?.data?.message || "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] dark:bg-slate-900 font-[Inter,system-ui,sans-serif] antialiased">
      <MetaData title="Sign Up" noIndex />

      {/* Keyframes for the one entrance moment on the brand panel */}
      <style>{`
        @keyframes pp-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        .pp-rise { animation: pp-rise .7s cubic-bezier(.2,.7,.2,1) both; }
        @media (prefers-reduced-motion: reduce) { .pp-rise { animation: none; } }
      `}</style>

      <main className="flex-1 flex items-center justify-center p-3 sm:p-6">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[5fr_6fr] lg:h-[min(90vh,860px)] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm rounded-2xl overflow-hidden">
          <BrandPanel />

          {/* Right panel — form */}
          <section className="bg-white dark:bg-slate-800 px-5 py-8 sm:px-10 sm:py-10 lg:px-12 lg:overflow-y-auto [scrollbar-width:thin]">
            <div className="max-w-lg mx-auto lg:min-h-full flex flex-col justify-center">
              <header className="mb-7">
                <h1 className="font-[Newsreader,Georgia,serif] text-[clamp(26px,3vw,34px)] font-medium tracking-tight leading-tight text-gray-900 dark:text-gray-50 mb-2">
                  Create your account
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Already a member?{" "}
                  <Link
                    to="/Login"
                    className="font-medium text-[#1E3A5F] dark:text-blue-400 underline underline-offset-2 hover:opacity-75 transition-opacity rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F]"
                  >
                    Sign in
                  </Link>
                </p>
              </header>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate={false}>
                {/* Role */}
                <fieldset>
                  <legend className={labelCls}>I want to join as</legend>
                  <div className="grid grid-cols-2 gap-3">
                    {ROLES.map(({ value, title, hint, Icon }) => (
                      <label key={value} className="relative cursor-pointer">
                        <input
                          type="radio"
                          name="RegisterAs"
                          value={value}
                          checked={form.RegisterAs === value}
                          onChange={handleChange}
                          required
                          className="peer sr-only"
                        />
                        <span
                          className="flex items-start gap-3 h-full rounded-lg border border-gray-200 dark:border-slate-600 px-3.5 py-3 transition
                                     hover:border-gray-300 dark:hover:border-slate-500
                                     peer-focus-visible:ring-2 peer-focus-visible:ring-[#1E3A5F]/40 dark:peer-focus-visible:ring-blue-400/40
                                     peer-checked:border-[#1E3A5F] peer-checked:bg-[#1E3A5F]/[0.04] peer-checked:ring-1 peer-checked:ring-[#1E3A5F]
                                     dark:peer-checked:border-blue-400 dark:peer-checked:bg-blue-400/10 dark:peer-checked:ring-blue-400"
                        >
                          <Icon className="mt-0.5 shrink-0 text-[#1E3A5F] dark:text-blue-400" size={18} aria-hidden />
                          <span className="min-w-0">
                            <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">{title}</span>
                            <span className="block text-xs text-gray-500 dark:text-slate-400 leading-snug">{hint}</span>
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                {/* Email */}
                <div>
                  <label htmlFor="email" className={labelCls}>Email address</label>
                  <TextInput
                    id="email"
                    icon={MdEmail}
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    status={emailStatus}
                  />
                  <StatusMsg status={emailStatus} taken="This email is already registered." available="Email is available." />
                </div>

                {/* Username */}
                <div>
                  <label htmlFor="username" className={labelCls}>Username</label>
                  <TextInput
                    id="username"
                    icon={IoMdPerson}
                    type="text"
                    name="username"
                    autoComplete="username"
                    value={form.username}
                    onChange={handleChange}
                    minLength={4}
                    pattern="[a-zA-Z0-9_]{4,}"
                    title="At least 4 characters: letters, numbers or underscores"
                    required
                    placeholder="Letters, numbers, underscores"
                    status={userStatus}
                  />
                  <StatusMsg status={userStatus} taken="Username is taken." available="Username is available." />
                </div>

                {/* Passwords */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="pass" className={labelCls}>Password</label>
                    <TextInput
                      id="pass"
                      type={showPassword ? "text" : "password"}
                      name="pass"
                      autoComplete="new-password"
                      value={form.pass}
                      onChange={handleChange}
                      required
                      maxLength={16}
                      minLength={4}
                      placeholder="Create a password"
                      right={<EyeButton show={showPassword} onToggle={() => setShowPassword((p) => !p)} />}
                    />
                    {sm && (
                      <div className="mt-2" aria-live="polite">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((i) => (
                            <span
                              key={i}
                              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= sm.level ? sm.bg : "bg-gray-200 dark:bg-slate-700"
                                }`}
                            />
                          ))}
                        </div>
                        <Msg className={sm.text}>{sm.label}</Msg>
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="cpass" className={labelCls}>Confirm password</label>
                    <TextInput
                      id="cpass"
                      type={showConfirmPassword ? "text" : "password"}
                      name="cpass"
                      autoComplete="new-password"
                      value={form.cpass}
                      onChange={handleChange}
                      required
                      placeholder="Repeat password"
                      state={passMatch === "matched" ? "success" : passMatch === "mismatch" ? "error" : null}
                      right={<EyeButton show={showConfirmPassword} onToggle={() => setShowConfirmPassword((p) => !p)} />}
                    />
                    <div aria-live="polite">
                      {passMatch === "matched" && <Msg className="text-green-600 dark:text-green-400">Passwords match</Msg>}
                      {passMatch === "mismatch" && <Msg className="text-red-600 dark:text-red-400">Passwords don't match</Msg>}
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-[#1E3A5F] hover:bg-[#162d4a] dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-70 disabled:cursor-not-allowed text-white text-sm font-semibold tracking-wide rounded-lg shadow-sm transition duration-150 enabled:hover:-translate-y-px enabled:active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F] dark:focus-visible:outline-blue-400"
                >
                  {submitting && <Spinner className="border-white/40 border-t-white" />}
                  {submitting ? "Sending your code…" : "Create account"}
                </button>
              </form>

              <p className="mt-6 text-xs text-center text-gray-400 dark:text-slate-500 leading-relaxed">
                By signing up you agree to our{" "}
                <Link to="/terms" className="text-[#1E3A5F] dark:text-blue-400 hover:underline">Terms</Link> and{" "}
                <Link to="/privacy" className="text-[#1E3A5F] dark:text-blue-400 hover:underline">Privacy Policy</Link>.
              </p>
            </div>
          </section>
        </div>
      </main>

      <ToastContainer position="top-right" autoClose={4000} hideProgressBar closeOnClick pauseOnHover theme={isDark ? "dark" : "light"} />
    </div>
  );
}

const PIXEL_GRID = [
  [0, 0, 0, 1, 0],
  [0, 0, 1, 0, 1],
  [0, 1, 0, 1, 0],
  [1, 0, 1, 0, 0],
  [0, 1, 0, 0, 0],
];

function BrandPanel() {
  return (
    <aside className="relative isolate flex flex-col justify-between overflow-hidden bg-[#1E3A5F] px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
      {/* Backdrop: fine dot grid + soft amber glow */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.12]"
        style={{
          backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage: "linear-gradient(to bottom, #000 0%, transparent 75%)",
          WebkitMaskImage: "linear-gradient(to bottom, #000 0%, transparent 75%)",
        }}
      />
      <div
        aria-hidden
        className="absolute -bottom-32 -right-24 -z-10 h-72 w-72 rounded-full bg-[#FBBF24]/15 blur-3xl"
      />

      {/* Top: logo + headline */}
      <div className="pp-rise">
        <div className="flex items-center gap-2  mb-8 lg:mb-14">
          <img src={LogoDark} alt="Pixel & Pen" className="h-9 sm:h-10 w-auto" />
          <span className="text-xl font-bold text-[#F8FAFC]">
            Pixel
            <span className="font-[Newsreader,Georgia,serif] text-[#F97316] dark:text-[#FF8A3D]"> & </span>
            Pen
          </span>
        </div>

        <p className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.22em] uppercase text-white/50 mb-4">
          Welcome to Pixel &amp; Pen
        </p>

        <h2 className="font-[Newsreader,Georgia,serif] text-[clamp(2.25rem,5vw,3.75rem)] lg:text-[clamp(2.75rem,3.6vw,3.9rem)] font-medium leading-[1.08] tracking-tight text-white">
          Where ideas find
          <br />
          <span className="italic text-[#FBBF24]">their voice.</span>
        </h2>
      </div>

      {/* Middle: taglines (hidden on small screens so the form stays close) */}
      <ul className="pp-rise hidden lg:block my-10 space-y-3" style={{ animationDelay: "120ms" }}>
        {TAGLINES.map((line) => (
          <li key={line} className="flex items-center gap-3 text-[15px] text-white/80">
            <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-[1px] bg-[#FBBF24]" />
            {line}
          </li>
        ))}
      </ul>

      {/* Bottom: quote */}
      <figure className="pp-rise hidden lg:block border-t border-white/15 pt-6" style={{ animationDelay: "240ms" }}>
        <blockquote className="font-[Newsreader,Georgia,serif] text-lg italic leading-relaxed text-white/60">
          “A pixel paints, a pen writes -
          together, they build worlds.”
        </blockquote>
      </figure>
    </aside>
  );
}

const labelCls = "block mb-1.5 text-[13px] font-medium text-gray-700 dark:text-gray-300";

function inputClasses(state, hasIcon) {
  const border =
    state === "error"
      ? "border-red-500 dark:border-red-400 focus:border-red-500 focus:ring-red-500/15"
      : state === "success"
        ? "border-green-500 dark:border-green-400 focus:border-green-500 focus:ring-green-500/15"
        : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 focus:border-[#1E3A5F] dark:focus:border-blue-400 focus:ring-[#1E3A5F]/10 dark:focus:ring-blue-400/15";

  return `w-full ${hasIcon ? "pl-9" : "pl-3"} pr-10 py-2.5 text-sm bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 border ${border} rounded-lg focus:outline-none focus:ring-4 placeholder-gray-400 dark:placeholder-slate-500 transition duration-150`;
}

/** Text input with optional leading icon, availability indicator, or custom right slot. */
function TextInput({ icon: Icon, status, state, right, ...props }) {
  const derived = state ?? (status === "taken" ? "error" : status === "available" ? "success" : null);

  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={16} aria-hidden />
      )}
      <input {...props} aria-invalid={derived === "error" || undefined} className={inputClasses(derived, !!Icon)} />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
        {right}
        {status === "checking" && <Spinner className="border-gray-300 border-t-gray-500 dark:border-slate-600 dark:border-t-slate-300" />}
        {status === "available" && <MdCheckCircle size={16} className="text-green-500" aria-hidden />}
        {status === "taken" && <MdError size={16} className="text-red-500" aria-hidden />}
      </span>
    </div>
  );
}

function Msg({ children, className = "" }) {
  return (
    <p className={`mt-1.5 text-xs font-medium flex items-start gap-1.5 ${className}`}>
      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-current shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

function StatusMsg({ status, taken, available }) {
  return (
    <div aria-live="polite">
      {status === "taken" && <Msg className="text-red-600 dark:text-red-400">{taken}</Msg>}
      {status === "available" && <Msg className="text-green-600 dark:text-green-400">{available}</Msg>}
    </div>
  );
}

function EyeButton({ show, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={show ? "Hide password" : "Show password"}
      aria-pressed={show}
      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-150 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1E3A5F] dark:focus-visible:outline-blue-400"
    >
      {show ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
    </button>
  );
}

function Spinner({ className = "" }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 ${className}`}
    />
  );
}

export default Sign_Up_Page;