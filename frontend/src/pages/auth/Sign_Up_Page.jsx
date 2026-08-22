import React, { useEffect, useState } from "react";
import AxiosInstance from "../../api/axiosInstance";
import { MdEmail } from "react-icons/md";
import { IoMdPerson } from "react-icons/io";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LogoDark from "../../assets/images/Pixel & Pen(B&W).png";

function evalPasswordStrength(pw) {
  if (!pw) return null;
  if (
    pw.length >= 8 &&
    /[a-z]/.test(pw) && /[A-Z]/.test(pw) &&
    /\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)
  ) return "strong";
  if (pw.length >= 8 && /[a-z]/.test(pw) && /[A-Z]/.test(pw) && /\d/.test(pw)) return "medium";
  if (pw.length >= 4) return "weak";
  return "vweak";
}

const STRENGTH_META = {
  strong: { label: "Strong password", bar: "w-full", text: "text-green-600 dark:text-green-400", bg: "bg-green-500" },
  medium: { label: "Medium", bar: "w-2/3", text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500" },
  weak: { label: "Weak", bar: "w-2/5", text: "text-orange-500 dark:text-orange-400", bg: "bg-orange-500" },
  vweak: { label: "Too short", bar: "w-1/5", text: "text-red-600 dark:text-red-400", bg: "bg-red-500" },
};

function Sign_Up_Page() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({ pass: "", cpass: "", email: "", username: "", RegisterAs: "" });
  const [strength, setStrength] = useState(null);
  const [passMatch, setPassMatch] = useState(null); // "matched" | "mismatch" | null
  const [isEmailExist, setIsEmailExist] = useState(null);
  const [isUserExist, setIsUserExist] = useState(null);

  /* ── Live availability checks ── */
  useEffect(() => {
    const email = form.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setIsEmailExist(null);
      return;
    }

    const timer = setTimeout(() => {
      AxiosInstance.get(`/check-email/${email}`)
        .then((res) => setIsEmailExist(res.data.exists))
        .catch(() => { });
    }, 500);

    return () => clearTimeout(timer);
  }, [form.email]);


  useEffect(() => {
    const username = form.username.trim();
    const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;

    if (!usernameRegex.test(username)) {
      setIsUserExist(null);
      return;
    }

    const timer = setTimeout(() => {
      AxiosInstance.get(`/check-username/${username}`)
        .then((res) => setIsUserExist(res.data.exists))
        .catch(() => { });
    }, 500);

    return () => clearTimeout(timer);
  }, [form.username]);

  /* ── Handlers ── */
  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handlePasswordChange(e) {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);

    if (name === "pass") setStrength(evalPasswordStrength(value));

    const pass = name === "pass" ? value : updated.pass;
    const cpass = name === "cpass" ? value : updated.cpass;
    if (!pass || !cpass) setPassMatch(null);
    else setPassMatch(pass === cpass ? "matched" : "mismatch");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.pass !== form.cpass) { toast.error("Passwords don't match."); return; }
    if (isEmailExist || isUserExist) { toast.error("Email or username already in use."); return; }
    if (!form.RegisterAs) { toast.error("Select a role to continue."); return; }

    try {
      await AxiosInstance.post("/submit", {
        username: form.username, password: form.pass,
        email: form.email, RegisterAs: form.RegisterAs,
      });
      toast.success("OTP sent — check your inbox.");
      navigate("/verify-otp", { state: { email: form.email } });
      setForm({ pass: "", cpass: "", email: "", username: "", RegisterAs: "" });
      setStrength(null);
      setPassMatch(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.");
    }
  }

  /* ── Derived ── */
  const emailState = isEmailExist === true ? "error" : isEmailExist === false ? "success" : null;
  const userState = isUserExist === true ? "error" : isUserExist === false ? "success" : null;
  const sm = strength ? STRENGTH_META[strength] : null;

  const STEPS = [
    { n: "01", title: "Create your account", desc: "Pick a role and set up credentials." },
    { n: "02", title: "Verify your email", desc: "A one-time code keeps things secure." },
    { n: "03", title: "Start publishing", desc: "Access BlogFlow and the full ecosystem." },
  ];

  /* ─────────────────────────────────────────────────────────────────────── */
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
                  Join the ecosystem
                </p>
                <h2 className="font-[Newsreader,Georgia,serif] text-[clamp(53px,2.5vw,34px)] font-medium leading-[1.15] tracking-tight text-white mt-[6rem]">
                  Content tools built for{" "}
                  <em className="text-[#FBBF24] not-italic text-[4rem]" style={{ fontStyle: "italic" }}>creators.</em>
                </h2>
              </div>

              {/* Steps timeline */}
              {/* <div className="flex flex-col">
                {STEPS.map(({ n, title, desc }, i) => (
                  <div key={n} className="flex gap-4">
                    
                    <div className="flex flex-col items-center pt-1">
                      <span className="w-2 h-2 rounded-full bg-[#F59E0B] flex-shrink-0" />
                      {i < STEPS.length - 1 && (
                        <span className="w-px flex-1 bg-white/10 my-1.5" />
                      )}
                    </div>
                    
                    <div className={i < STEPS.length - 1 ? "pb-5" : ""}>
                      <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#FBBF24] mb-0.5">{n}</p>
                      <p className="text-sm font-medium text-white mb-0.5">{title}</p>
                      <p className="text-xs text-white/45 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div> */}
            </div>

            {/* Quote */}
            <div className="relative z-10 pt-8 border-t border-white/10">
              <blockquote className="font-[Newsreader,Georgia,serif] text-sm italic text-white/45 leading-relaxed">
                "A pixel paints, a pen writes - together, they build worlds."
              </blockquote>
            </div>
          </div>

          {/* ── Right panel — form ──────────────────────────────────────── */}
          <div className="p-8 sm:p-12 bg-white dark:bg-slate-800">
            <div className="max-w-md mx-auto">

              {/* Header */}
              <div className="mb-8">
                <h1 className="font-[Newsreader,Georgia,serif] text-[clamp(24px,2.5vw,32px)] font-medium tracking-tight leading-tight text-gray-900 dark:text-gray-50 mb-2">
                  Create your account
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Already a member?{" "}
                  <Link
                    to="/Login"
                    className="font-medium text-[#1E3A5F] dark:text-blue-400 underline underline-offset-2 hover:opacity-75 transition-opacity"
                  >
                    Sign in
                  </Link>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Role */}
                <div>
                  <FieldLabel>Register as</FieldLabel>
                  <div className="relative">
                    <select
                      name="RegisterAs"
                      value={form.RegisterAs}
                      onChange={handleChange}
                      className={`${inputBase} appearance-none pr-8 ${!form.RegisterAs ? "text-gray-400 dark:text-slate-500" : ""}`}
                    >
                      <option value="" disabled hidden>Select a role</option>
                      <option value="Admin">Admin</option>
                      <option value="Contributor">Contributor</option>
                      <option value="Reader">Reader</option>
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-[10px]">▾</span>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <FieldLabel>Email address</FieldLabel>
                  <div className="relative">
                    <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={16} />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="you@example.com"
                      className={`${inputBase} pl-9 ${emailState === "error" ? inputError : emailState === "success" ? inputSuccess : ""}`}
                    />
                  </div>
                  {isEmailExist === true && <FieldMsg text="This email is already registered." className="text-red-600 dark:text-red-400" />}
                  {isEmailExist === false && <FieldMsg text="Email is available." className="text-green-600 dark:text-green-400" />}
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
                      minLength={4}
                      required
                      placeholder="Min. 4 characters"
                      className={`${inputBase} pl-9 ${userState === "error" ? inputError : userState === "success" ? inputSuccess : ""}`}
                    />
                  </div>
                  {isUserExist === true && <FieldMsg text="Username is taken." className="text-red-600 dark:text-red-400" />}
                  {isUserExist === false && <FieldMsg text="Username is available." className="text-green-600 dark:text-green-400" />}
                </div>

                {/* Password */}
                <div>
                  <FieldLabel>Password</FieldLabel>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="pass"
                      value={form.pass}
                      onChange={handlePasswordChange}
                      required
                      maxLength={16}
                      minLength={4}
                      placeholder="Create a password"
                      className={`${inputBase} pr-10`}
                    />
                    <EyeButton show={showPassword} onToggle={() => setShowPassword(p => !p)} />
                  </div>

                  {/* Strength bar */}
                  {sm && (
                    <div className="mt-2">
                      <div className="h-0.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-300 ${sm.bar} ${sm.bg}`} />
                      </div>
                      <FieldMsg text={sm.label} className={sm.text} />
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <FieldLabel>Confirm password</FieldLabel>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="cpass"
                      value={form.cpass}
                      onChange={handlePasswordChange}
                      required
                      placeholder="Repeat your password"
                      className={`${inputBase} pr-10`}
                    />
                    <EyeButton show={showConfirmPassword} onToggle={() => setShowConfirmPassword(p => !p)} />
                  </div>
                  {passMatch === "matched" && <FieldMsg text="Passwords match" className="text-green-600 dark:text-green-400" />}
                  {passMatch === "mismatch" && <FieldMsg text="Passwords don't match" className="text-red-600 dark:text-red-400" />}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full mt-1 py-3 px-6 bg-[#1E3A5F] hover:bg-[#162d4a] dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-xs font-semibold tracking-widest uppercase rounded transition-all duration-150 hover:-translate-y-px active:translate-y-0"
                >
                  Create account
                </button>
              </form>

              {/* Terms */}
              <p className="mt-6 text-xs text-center text-gray-400 dark:text-slate-500 leading-relaxed">
                By signing up you agree to our{" "}
                <Link to="/terms" className="text-[#1E3A5F] dark:text-blue-400 hover:underline">Terms</Link>
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

/* ─── Sub-components ──────────────────────────────────────────────────────── */
const FieldLabel = ({ children }) => (
  <label className="block mb-1.5 text-[11px] font-semibold tracking-widest uppercase text-gray-700 dark:text-gray-300">
    {children}
  </label>
);

const FieldMsg = ({ text, className }) =>
  text ? (
    <p className={`mt-1.5 text-xs font-medium flex items-center gap-1.5 ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
      {text}
    </p>
  ) : null;

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

/* shared input classes */
const inputBase =
  "w-full px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-slate-600 rounded focus:outline-none focus:border-[#1E3A5F] dark:focus:border-blue-400 focus:ring-2 focus:ring-[#1E3A5F]/10 dark:focus:ring-blue-400/10 placeholder-gray-400 dark:placeholder-slate-500 transition duration-150";

const inputError = "border-red-500 dark:border-red-400 focus:border-red-500 focus:ring-red-500/10";
const inputSuccess = "border-green-500 dark:border-green-400 focus:border-green-500 focus:ring-green-500/10";

/* ─── Main Component ──────────────────────────────────────────────────────── */


export default Sign_Up_Page;