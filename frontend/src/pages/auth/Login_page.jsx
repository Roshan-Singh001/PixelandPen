import React, { useState, useEffect } from "react";
import { IoMdPerson } from "react-icons/io";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { MdEdit, MdMenuBook, MdAdminPanelSettings } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LogoDark from "../../assets/images/Pixel & Pen(Main-B&W-New).png";
import { useAuth } from "../../contexts/AuthContext";
import MetaData from "../../components/MetaData";

const ROLES = [
  { value: "Admin", title: "Admin", Icon: MdAdminPanelSettings },
  { value: "Contributor", title: "Contributor", Icon: MdEdit },
  { value: "Reader", title: "Reader", Icon: MdMenuBook },
];

function Login_Page() {
  const { loggedIn, userData, loading, login } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: "", pass: "", loginAs: "" });

  /* redirect if already logged in */
  useEffect(() => {
    if (loggedIn && !loading && userData?.userRole) {
      navigate(`/dashboard/${userData.userRole.toLowerCase()}`);
    }
  }, [loggedIn, loading, userData, navigate]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (isLoading) return;
    if (!form.loginAs) return toast.error("Select a role to continue.");

    setIsLoading(true);
    try {
      const result = await login(form.username, form.pass, form.loginAs);
      if (result.success) {
        toast.success("Welcome back!");
        navigate(`/dashboard/${result.userRole.toLowerCase()}`);
      } else if (result.status === 429) {
        toast.error("Too many login attempts. Please wait a few minutes before trying again.");
      } else {
        toast.error(result.error || "Login failed — check your credentials.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  if (loggedIn && userData?.userRole) return null;

  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] dark:bg-slate-900 font-[Inter,system-ui,sans-serif] antialiased">
      <MetaData title="Login" noIndex />

      <style>{`
        @keyframes pp-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        .pp-rise { animation: pp-rise .7s cubic-bezier(.2,.7,.2,1) both; }
        @media (prefers-reduced-motion: reduce) { .pp-rise { animation: none; } }
      `}</style>

      <main className="flex-1 flex items-center justify-center p-3 sm:p-6">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-[5fr_6fr] lg:min-h-[530px] lg:h-[min(84vh,760px)] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm rounded-2xl overflow-hidden">
          <BrandPanel />

          {/* Right panel - form */}
          <section className="bg-white dark:bg-slate-800 px-5 py-8 sm:px-10 sm:py-10 lg:px-12 lg:overflow-y-hidden [scrollbar-width:thin]">
            <div className="max-w-md mx-auto lg:min-h-full flex flex-col justify-center">
              <header className="mb-8">
                <h1 className="font-[Newsreader,Georgia,serif] text-[clamp(26px,3vw,34px)] font-medium tracking-tight leading-tight text-gray-900 dark:text-gray-50 mb-2">
                  Sign in to your account
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No account yet?{" "}
                  <Link
                    to="/register"
                    className="font-medium text-[#1E3A5F] dark:text-blue-400 underline underline-offset-2 hover:opacity-75 transition-opacity rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F]"
                  >
                    Register here
                  </Link>
                </p>
              </header>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Role */}
                <fieldset>
                  <legend className={labelCls}>Sign in as</legend>
                  <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                    {ROLES.map(({ value, title, Icon }) => (
                      <label key={value} className="relative cursor-pointer">
                        <input
                          type="radio"
                          name="loginAs"
                          value={value}
                          checked={form.loginAs === value}
                          onChange={handleChange}
                          required
                          className="peer sr-only"
                        />
                        <span
                          className="flex flex-col items-center justify-center gap-1.5 h-full rounded-lg border border-gray-200 dark:border-slate-600 px-2 py-3 text-center transition
                                     hover:border-gray-300 dark:hover:border-slate-500
                                     peer-focus-visible:ring-2 peer-focus-visible:ring-[#1E3A5F]/40 dark:peer-focus-visible:ring-blue-400/40
                                     peer-checked:border-[#1E3A5F] peer-checked:bg-[#1E3A5F]/[0.04] peer-checked:ring-1 peer-checked:ring-[#1E3A5F]
                                     dark:peer-checked:border-blue-400 dark:peer-checked:bg-blue-400/10 dark:peer-checked:ring-blue-400"
                        >
                          <Icon className="text-[#1E3A5F] dark:text-blue-400" size={20} aria-hidden />
                          <span className="text-[13px] font-medium text-gray-900 dark:text-gray-100">{title}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

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
                    required
                    minLength={4}
                    placeholder="Enter your username"
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="pass" className="text-[13px] font-medium text-gray-700 dark:text-gray-300">
                      Password
                    </label>
                    <Link
                      to="/password-reset"
                      className="text-xs font-medium text-[#1E3A5F] dark:text-blue-400 hover:underline underline-offset-2 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F]"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <TextInput
                    id="pass"
                    type={showPassword ? "text" : "password"}
                    name="pass"
                    autoComplete="current-password"
                    value={form.pass}
                    onChange={handleChange}
                    required
                    minLength={4}
                    placeholder="Enter your password"
                    right={<EyeButton show={showPassword} onToggle={() => setShowPassword((p) => !p)} />}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-[#1E3A5F] hover:bg-[#162d4a] dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-70 disabled:cursor-not-allowed text-white text-sm font-semibold tracking-wide rounded-lg shadow-sm transition duration-150 enabled:hover:-translate-y-px enabled:active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F] dark:focus-visible:outline-blue-400"
                >
                  {isLoading && <Spinner className="border-white/40 border-t-white" />}
                  {isLoading ? "Signing in…" : "Sign in"}
                </button>
              </form>

              <p className="mt-6 text-xs text-center text-gray-400 dark:text-slate-500 leading-relaxed">
                By signing in you agree to our{" "}
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
          Welcome back
        </p>

        <h2 className="font-[Newsreader,Georgia,serif] text-[clamp(2.25rem,5vw,3.5rem)] lg:text-[clamp(2.5rem,3.3vw,3.5rem)] font-medium leading-[1.1] tracking-tight text-white [text-wrap:balance]">
          Ideas worth reading.
          <br />
          <span className="italic text-[#FBBF24]">Stories worth returning to.</span>
        </h2>
      </div>

      {/* Bottom: quote */}
      <figure className="pp-rise hidden lg:block border-t border-white/15 pt-6" style={{ animationDelay: "240ms" }}>
        <blockquote className="font-[Newsreader,Georgia,serif] text-lg italic leading-relaxed text-white/60">
          “A pixel paints, a pen writes - together, they build worlds.”
        </blockquote>
      </figure>
    </aside>
  );
}


const labelCls = "block mb-1.5 text-[13px] font-medium text-gray-700 dark:text-gray-300";

function inputClasses(hasIcon) {
  return `w-full ${hasIcon ? "pl-9" : "pl-3"} pr-10 py-2.5 text-sm bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 focus:border-[#1E3A5F] dark:focus:border-blue-400 focus:ring-[#1E3A5F]/10 dark:focus:ring-blue-400/15 rounded-lg focus:outline-none focus:ring-4 placeholder-gray-400 dark:placeholder-slate-500 transition duration-150`;
}

function TextInput({ icon: Icon, right, ...props }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={16} aria-hidden />
      )}
      <input {...props} className={inputClasses(!!Icon)} />
      {right && <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">{right}</span>}
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

export default Login_Page;