import React, { useState, useEffect } from "react";
import { IoMdPerson } from "react-icons/io";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LogoDark from "../../assets/images/Pixel & Pen(B&W).png";
import PixelPenLoader from "../../components/PixelPenLoader";
import { useAuth } from "../../contexts/AuthContext";

const inputBase =
  "w-full px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-slate-600 rounded focus:outline-none focus:border-[#1E3A5F] dark:focus:border-blue-400 focus:ring-2 focus:ring-[#1E3A5F]/10 dark:focus:ring-blue-400/10 placeholder-gray-400 dark:placeholder-slate-500 transition duration-150";

const FieldLabel = ({ children }) => (
  <label className="block mb-1.5 text-[11px] font-semibold tracking-widest uppercase text-gray-700 dark:text-gray-300">
    {children}
  </label>
);

const EyeButton = ({ show, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-label={show ? "Hide password" : "Show password"}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-150"
  >
    {show ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
  </button>
);

const FEATURES = [
  { n: "01", title: "Manage your content",  desc: "Access BlogFlow and all your drafts, posts, and analytics." },
  { n: "02", title: "Collaborate with teams", desc: "Work alongside contributors and admins in one place." },
  { n: "03", title: "Publish anywhere",      desc: "Distribute content across platforms without leaving the ecosystem." },
];

function Login_Page() {
  const { loggedIn, userData, loading, login } = useAuth();
  const [isLoading, setIsLoading]   = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: "", pass: "", loginAs: "" });
  const navigate = useNavigate();

  /* redirect if already logged in */
  useEffect(() => {
    if (loggedIn && !loading && userData?.userRole) {
      navigate(`/dashboard/${userData.userRole.toLowerCase()}`);
    }
  }, [loggedIn, loading, userData, navigate]);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.loginAs) { toast.error("Select a role to continue."); return; }
    setIsLoading(true);
    try {
      const result = await login(form.username, form.pass, form.loginAs);
      if (result.success) {
        toast.success("Welcome back!");
        navigate(`/dashboard/${result.userRole.toLowerCase()}`);
      } else {
        toast.error(result.error || "Login failed — check your credentials.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    }
    setIsLoading(false);
  }

  if (isLoading || loading) return <PixelPenLoader />;
  if (loggedIn && userData?.userRole) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] dark:bg-slate-900 font-[Inter,system-ui,sans-serif] antialiased">


      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-5xl border border-gray-200 dark:border-slate-700 grid grid-cols-1 lg:grid-cols-[2fr_3fr] bg-white dark:bg-slate-800 shadow-sm">

          {/* ── Left panel ──────────────────────────────────────────────── */}
          <div className="relative flex flex-col justify-between bg-[#1E3A5F] p-10 lg:p-12 overflow-hidden">


            <div className="relative z-10">
              {/* Logo */}
              <div className="mb-10">
                <img
                  src={LogoDark}
                  alt="Pixel & Pen"
                  className="h-7 brightness-0 invert opacity-90"
                />
              </div>

              {/* Headline */}
              <div className="mb-10">
                <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/40 mb-3">
                  Welcome back
                </p>
                <h2 className="font-[Newsreader,Georgia,serif] text-[clamp(24px,2.5vw,34px)] font-medium leading-[1.15] tracking-tight text-white">
                  Your content,{" "}
                  <em className="text-[#FBBF24]" style={{ fontStyle: "italic" }}>waiting for you.</em>
                </h2>
              </div>

              {/* Feature list */}
              <div className="flex flex-col">
                {FEATURES.map(({ n, title, desc }, i) => (
                  <div key={n} className="flex gap-4">
                    <div className="flex flex-col items-center pt-1">
                      <span className="w-2 h-2 rounded-full bg-[#F59E0B] flex-shrink-0" />
                      {i < FEATURES.length - 1 && (
                        <span className="w-px flex-1 bg-white/10 my-1.5" />
                      )}
                    </div>
                    <div className={i < FEATURES.length - 1 ? "pb-5" : ""}>
                      <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#FBBF24] mb-0.5">{n}</p>
                      <p className="text-sm font-medium text-white mb-0.5">{title}</p>
                      <p className="text-xs text-white/45 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quote */}
            <div className="relative z-10 pt-8 border-t border-white/10">
              <blockquote className="font-[Newsreader,Georgia,serif] text-sm italic text-white/45 leading-relaxed">
                "A pixel paints, a pen writes — together, they build worlds."
              </blockquote>
            </div>
          </div>

          {/* ── Right panel — form ──────────────────────────────────────── */}
          <div className="p-8 sm:p-12 bg-white dark:bg-slate-800">
            <div className="max-w-md mx-auto">

              {/* Header */}
              <div className="mb-8">
                <h1 className="font-[Newsreader,Georgia,serif] text-[clamp(24px,2.5vw,32px)] font-medium tracking-tight leading-tight text-gray-900 dark:text-gray-50 mb-2">
                  Sign in to your account
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No account yet?{" "}
                  <Link
                    to="/register"
                    className="font-medium text-[#1E3A5F] dark:text-blue-400 underline underline-offset-2 hover:opacity-75 transition-opacity"
                  >
                    Register here
                  </Link>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Role */}
                <div>
                  <FieldLabel>Sign in as</FieldLabel>
                  <div className="relative">
                    <select
                      name="loginAs"
                      value={form.loginAs}
                      onChange={handleChange}
                      className={`${inputBase} appearance-none pr-8 ${!form.loginAs ? "text-gray-400 dark:text-slate-500" : ""}`}
                    >
                      <option value="" disabled hidden>Select a role</option>
                      <option value="Admin">Admin</option>
                      <option value="Contributor">Contributor</option>
                      <option value="Reader">Reader</option>
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-[10px]">▾</span>
                  </div>
                </div>

                {/* Username */}
                <div>
                  <FieldLabel>Username</FieldLabel>
                  <div className="relative">
                    <IoMdPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={16} />
                    <input
                      type="text"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      required
                      minLength={4}
                      placeholder="Enter your username"
                      className={`${inputBase} pl-9`}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <FieldLabel>Password</FieldLabel>
                    <a
                      href="#"
                      className="text-[11px] font-medium text-[#1E3A5F] dark:text-blue-400 hover:opacity-75 transition-opacity"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="pass"
                      value={form.pass}
                      onChange={handleChange}
                      required
                      minLength={4}
                      placeholder="Enter your password"
                      className={`${inputBase} pr-10`}
                    />
                    <EyeButton show={showPassword} onToggle={() => setShowPassword(p => !p)} />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full mt-1 py-3 px-6 bg-[#1E3A5F] hover:bg-[#162d4a] dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-xs font-semibold tracking-widest uppercase rounded transition-all duration-150 hover:-translate-y-px active:translate-y-0"
                >
                  Sign in
                </button>
              </form>

              {/* Terms */}
              <p className="mt-6 text-xs text-center text-gray-400 dark:text-slate-500 leading-relaxed">
                By signing in you agree to our{" "}
                <Link to="/terms"   className="text-[#1E3A5F] dark:text-blue-400 hover:underline">Terms</Link>
                {" "}and{" "}
                <Link to="/privacy" className="text-[#1E3A5F] dark:text-blue-400 hover:underline">Privacy Policy</Link>.
              </p>

            </div>
          </div>

        </div>
      </main>

      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar
        closeOnClick
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default Login_Page;