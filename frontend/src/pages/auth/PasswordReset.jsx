import { useEffect, useMemo, useRef, useState } from "react";
import AxiosInstance from "../../api/axiosInstance";
import { MdEmail, MdMailOutline, MdLockOutline, MdVpnKey, MdCheck, MdCheckCircle } from "react-icons/md";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LogoDark from "../../assets/images/Pixel & Pen(Main-B&W-New).png";
import MetaData from "../../components/MetaData";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;
const REDIRECT_DELAY_MS = 2500;
const LOGIN_PATH = "/Login";

const PASSWORD_MIN = 4;
const PASSWORD_MAX = 16;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMPTY_OTP = Array(OTP_LENGTH).fill("");

const STEP_ORDER = ["email", "otp", "reset", "done"];

const STEP_COPY = {
    email: {
        Icon: MdLockOutline,
        title: "Forgot your password?",
        body: "Enter the email associated with your Pixel & Pen account and we'll send you a verification code.",
    },
    otp: {
        Icon: MdMailOutline,
        title: "Verify your email",
        body: `We've sent a ${OTP_LENGTH}-digit verification code to your email address.`,
    },
    reset: {
        Icon: MdVpnKey,
        title: "Create a new password",
        body: "Choose a new password for your Pixel & Pen account.",
    },
    done: {
        Icon: MdCheckCircle,
        title: "Password reset successfully",
        body: "You can now sign in with your new password.",
    },
};

const RAIL_STEPS = [
    { title: "Verify your email", desc: "Tell us where to send your code." },
    { title: "Enter the code", desc: "Confirm it's really you." },
    { title: "Choose a new password", desc: "Then sign back in." },
];

function apiMessage(err, fallback) {
    if (err?.response?.status === 429) return "Too many requests. Please wait a few minutes before trying again.";
    return err?.response?.data?.message || fallback;
}

function maskEmail(email) {
    const [name = "", domain = ""] = email.split("@");
    if (!domain) return email;
    return `${name[0] ?? ""}${"•".repeat(Math.min(Math.max(name.length - 1, 1), 5))}@${domain}`;
}

function formatTime(s) {
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function evalPasswordStrength(pw) {
    if (!pw) return null;
    if (pw.length >= 8 && /[a-z]/.test(pw) && /[A-Z]/.test(pw) && /\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) return "strong";
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

function Forgot_Password_Page() {
    const navigate = useNavigate();

    const [step, setStep] = useState("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(EMPTY_OTP);
    const [otpError, setOtpError] = useState("");
    const [resetToken, setResetToken] = useState(null);
    const [pw, setPw] = useState({ pass: "", cpass: "" });
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    const code = otp.join("");
    const stepIndex = STEP_ORDER.indexOf(step);
    const strength = useMemo(() => evalPasswordStrength(pw.pass), [pw.pass]);
    const sm = strength ? STRENGTH_META[strength] : null;
    const passMatch = !pw.pass || !pw.cpass ? null : pw.pass === pw.cpass ? "matched" : "mismatch";

    /* resend countdown */
    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    /* redirect to login after success */
    useEffect(() => {
        if (step !== "done") return;
        const t = setTimeout(() => navigate(LOGIN_PATH), REDIRECT_DELAY_MS);
        return () => clearTimeout(t);
    }, [step, navigate]);

    /* ── Step 1 / resend: POST /auth/forgot-password ── */
    async function requestOtp({ resend = false } = {}) {
        if (loading) return;
        if (!EMAIL_REGEX.test(email.trim())) return toast.error("Enter a valid email address.");

        setLoading(true);
        try {
            await AxiosInstance.post("/auth/forgot-password", { email: email.trim() });
            setCooldown(RESEND_SECONDS);
            if (resend) {
                setOtp(EMPTY_OTP);
                setOtpError("");
                toast.success("A new code is on its way.");
            } else {
                toast.success("If an account exists with this email, we've sent a verification code.");
                setStep("otp");
            }
        } catch (err) {
            toast.error(apiMessage(err, "We couldn't send the code. Please try again."));
        } finally {
            setLoading(false);
        }
    }

    /* ── Step 2: POST /auth/verify-reset-otp ── */
    async function verifyOtp(e) {
        e.preventDefault();
        if (loading) return;
        if (code.length < OTP_LENGTH) return setOtpError(`Enter all ${OTP_LENGTH} digits.`);

        setLoading(true);
        try {
            const res = await AxiosInstance.post("/auth/verify-reset-otp", { email: email.trim(), otp: code });
            setResetToken(res.data?.resetToken ?? null);
            setOtpError("");
            setStep("reset");
        } catch (err) {
            const msg = apiMessage(err, "That code isn't right. Check it and try again.");
            setOtpError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }

    /* Step 3: POST /auth/reset-password */
    async function resetPassword(e) {
        e.preventDefault();
        if (loading) return;
        if (pw.pass !== pw.cpass) return toast.error("Passwords don't match.");

        setLoading(true);
        try {
            await AxiosInstance.post("/auth/reset-password", {
                email: email.trim(),
                otp: code,
                newPassword: pw.pass,
                ...(resetToken ? { resetToken } : {}),
            });
            toast.success("Password reset successfully.");
            setStep("done");
        } catch (err) {
            toast.error(apiMessage(err, "We couldn't reset your password. Please try again."));
        } finally {
            setLoading(false);
        }
    }

    function useDifferentEmail() {
        setOtp(EMPTY_OTP);
        setOtpError("");
        setStep("email");
    }

    const { Icon: StepIcon, title, body } = STEP_COPY[step];
    const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");

    return (
        <div className="min-h-screen flex flex-col bg-[#FAFAF8] dark:bg-slate-900 font-[Inter,system-ui,sans-serif] antialiased">
            <MetaData title="Forgot Password" noIndex />

            <style>{`
        @keyframes pp-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        @keyframes pp-step { from { opacity: 0; transform: translateX(18px); } to { opacity: 1; transform: none; } }
        @keyframes pp-pop  { 0% { opacity: 0; transform: scale(.6); } 60% { transform: scale(1.08); } 100% { opacity: 1; transform: none; } }
        .pp-rise { animation: pp-rise .7s cubic-bezier(.2,.7,.2,1) both; }
        .pp-step { animation: pp-step .4s cubic-bezier(.2,.7,.2,1) both; }
        .pp-pop  { animation: pp-pop .5s cubic-bezier(.2,.7,.2,1) both; }
        @media (prefers-reduced-motion: reduce) { .pp-rise, .pp-step, .pp-pop { animation: none; } }
      `}</style>

            <main className="flex-1 flex items-center justify-center p-3 sm:p-6">
                <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-[5fr_6fr] lg:min-h-[530px] lg:h-[min(84vh,760px)] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm rounded-2xl overflow-hidden">
                    <BrandPanel stepIndex={stepIndex} />

                    {/* Right panel */}
                    <section className="bg-white dark:bg-slate-800 px-5 py-8 sm:px-10 sm:py-10 lg:px-12 lg:overflow-y-auto [scrollbar-width:thin]">
                        <div className="max-w-md mx-auto lg:min-h-full flex flex-col justify-center">
                            {step !== "done" && <MobileProgress index={stepIndex} />}

                            <div key={step} className="pp-step">
                                <header className="mb-7">
                                    <span
                                        className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full ${step === "done"
                                                ? "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400 pp-pop"
                                                : "bg-[#1E3A5F]/[0.07] text-[#1E3A5F] dark:bg-blue-400/10 dark:text-blue-400"
                                            }`}
                                    >
                                        <StepIcon size={step === "done" ? 26 : 22} aria-hidden />
                                    </span>
                                    <h1 className="font-[Newsreader,Georgia,serif] text-[clamp(26px,3vw,34px)] font-medium tracking-tight leading-tight text-gray-900 dark:text-gray-50 mb-2">
                                        {title}
                                    </h1>
                                    <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400 [text-wrap:pretty]">{body}</p>
                                    {step === "otp" && (
                                        <p className="mt-3 inline-block rounded-full bg-gray-100 dark:bg-slate-700 px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-200">
                                            Sent to {maskEmail(email.trim())}
                                        </p>
                                    )}
                                </header>

                                {/* Step 1: email */}
                                {step === "email" && (
                                    <>
                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                requestOtp();
                                            }}
                                            className="space-y-5"
                                        >
                                            <div>
                                                <label htmlFor="email" className={labelCls}>Email address</label>
                                                <TextInput
                                                    id="email"
                                                    icon={MdEmail}
                                                    type="email"
                                                    name="email"
                                                    autoComplete="email"
                                                    autoFocus
                                                    required
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="you@example.com"
                                                />
                                            </div>
                                            <PrimaryButton loading={loading} loadingText="Sending code…">Send OTP</PrimaryButton>
                                        </form>

                                        <p className="mt-6 text-sm text-center text-gray-500 dark:text-gray-400">
                                            Remember your password?{" "}
                                            <Link to={LOGIN_PATH} className={linkCls}>Sign in</Link>
                                        </p>
                                    </>
                                )}

                                {/* Step 2: OTP */}
                                {step === "otp" && (
                                    <form onSubmit={verifyOtp} className="space-y-6">
                                        <div>
                                            <OtpInput
                                                value={otp}
                                                onChange={(next) => {
                                                    setOtp(next);
                                                    if (otpError) setOtpError("");
                                                }}
                                                disabled={loading}
                                                hasError={!!otpError}
                                            />
                                            <div aria-live="polite" className="min-h-[1.25rem]">
                                                {otpError && (
                                                    <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">{otpError}</p>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                                            Didn't receive it?{" "}
                                            <button
                                                type="button"
                                                onClick={() => requestOtp({ resend: true })}
                                                disabled={cooldown > 0 || loading}
                                                className={`${linkCls} disabled:no-underline disabled:cursor-not-allowed disabled:text-gray-400 dark:disabled:text-slate-500 disabled:opacity-100 disabled:hover:opacity-100`}
                                            >
                                                {cooldown > 0 ? `Resend code in ${formatTime(cooldown)}` : "Resend code"}
                                            </button>
                                        </p>

                                        <PrimaryButton loading={loading} loadingText="Verifying…" disabled={code.length < OTP_LENGTH}>
                                            Verify OTP
                                        </PrimaryButton>

                                        <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                                            Wrong email?{" "}
                                            <button type="button" onClick={useDifferentEmail} className={linkCls}>
                                                Use a different one
                                            </button>
                                        </p>
                                    </form>
                                )}

                                {/* Step 3: new password */}
                                {step === "reset" && (
                                    <form onSubmit={resetPassword} className="space-y-5">
                                        <div>
                                            <label htmlFor="pass" className={labelCls}>New password</label>
                                            <TextInput
                                                id="pass"
                                                type={showPass ? "text" : "password"}
                                                name="pass"
                                                autoComplete="new-password"
                                                autoFocus
                                                required
                                                minLength={PASSWORD_MIN}
                                                maxLength={PASSWORD_MAX}
                                                value={pw.pass}
                                                onChange={(e) => setPw((p) => ({ ...p, pass: e.target.value }))}
                                                placeholder="Create a new password"
                                                right={<EyeButton show={showPass} onToggle={() => setShowPass((s) => !s)} />}
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
                                                type={showConfirm ? "text" : "password"}
                                                name="cpass"
                                                autoComplete="new-password"
                                                required
                                                value={pw.cpass}
                                                onChange={(e) => setPw((p) => ({ ...p, cpass: e.target.value }))}
                                                placeholder="Repeat your new password"
                                                state={passMatch === "matched" ? "success" : passMatch === "mismatch" ? "error" : null}
                                                right={<EyeButton show={showConfirm} onToggle={() => setShowConfirm((s) => !s)} />}
                                            />
                                            <div aria-live="polite">
                                                {passMatch === "matched" && <Msg className="text-green-600 dark:text-green-400">Passwords match</Msg>}
                                                {passMatch === "mismatch" && <Msg className="text-red-600 dark:text-red-400">Passwords don't match</Msg>}
                                            </div>
                                        </div>

                                        <PrimaryButton loading={loading} loadingText="Resetting…" disabled={passMatch === "mismatch"}>
                                            Reset password
                                        </PrimaryButton>
                                    </form>
                                )}

                                {/* Success */}
                                {step === "done" && (
                                    <div className="space-y-5">
                                        <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400" role="status">
                                            <Spinner className="border-gray-300 border-t-gray-500 dark:border-slate-600 dark:border-t-slate-300" />
                                            Taking you to sign in…
                                        </p>
                                        <Link
                                            to={LOGIN_PATH}
                                            className="block w-full text-center py-3 px-6 bg-[#1E3A5F] hover:bg-[#162d4a] dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-semibold tracking-wide rounded-lg shadow-sm transition duration-150 hover:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F] dark:focus-visible:outline-blue-400"
                                        >
                                            Sign in now
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <ToastContainer position="top-right" autoClose={4000} hideProgressBar closeOnClick pauseOnHover theme={isDark ? "dark" : "light"} />
        </div>
    );
}

function BrandPanel({ stepIndex }) {
    return (
        <aside className="relative isolate flex flex-col justify-between overflow-hidden bg-[#1E3A5F] px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
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
            <div aria-hidden className="absolute -bottom-32 -right-24 -z-10 h-72 w-72 rounded-full bg-[#FBBF24]/15 blur-3xl" />

            <div className="pp-rise">
                <div className="flex items-center gap-2  mb-6 lg:mb-9">

                    <img src={LogoDark} alt="Pixel & Pen" className="h-9 sm:h-10 w-auto" />
                    <span className="text-xl font-bold text-[#F8FAFC]">
                        Pixel
                        <span className="font-[Newsreader,Georgia,serif] text-[#F97316] dark:text-[#FF8A3D]"> & </span>
                        Pen
                    </span>
                </div>

                <p className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.22em] uppercase text-white/50 mb-4">
                    Account recovery
                </p>

                <h2 className="font-[Newsreader,Georgia,serif] text-[clamp(2.25rem,5vw,3.5rem)] lg:text-[clamp(2.5rem,3.3vw,3.5rem)] font-medium leading-[1.1] tracking-tight text-white [text-wrap:balance]">
                    Every writer loses their place.
                    <br />
                    <span className="italic text-[#FBBF24]">Let's find yours.</span>
                </h2>
            </div>

            <ol className="pp-rise hidden lg:block my-10" style={{ animationDelay: "120ms" }} aria-label="Progress">
                {RAIL_STEPS.map((s, i) => {
                    const done = i < stepIndex;
                    const active = i === stepIndex;
                    return (
                        <li key={s.title} className="flex gap-4" aria-current={active ? "step" : undefined}>
                            <div className="flex flex-col items-center">
                                <span
                                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-all duration-500 ${done
                                            ? "bg-[#FBBF24] text-[#1E3A5F]"
                                            : active
                                                ? "border border-[#FBBF24] text-[#FBBF24] ring-4 ring-[#FBBF24]/15"
                                                : "border border-white/20 text-white/40"
                                        }`}
                                >
                                    {done ? <MdCheck size={14} aria-label="Completed" /> : i + 1}
                                </span>
                                {i < RAIL_STEPS.length - 1 && (
                                    <span
                                        className={`my-1.5 w-px flex-1 min-h-[1.25rem] transition-colors duration-500 ${done ? "bg-[#FBBF24]/60" : "bg-white/15"
                                            }`}
                                    />
                                )}
                            </div>
                            <div className={i < RAIL_STEPS.length - 1 ? "pb-5" : ""}>
                                <p className={`text-sm font-medium transition-colors duration-500 ${active || done ? "text-white" : "text-white/45"}`}>
                                    {s.title}
                                </p>
                                <p className={`text-xs leading-relaxed transition-colors duration-500 ${active ? "text-white/60" : "text-white/35"}`}>
                                    {s.desc}
                                </p>
                            </div>
                        </li>
                    );
                })}
            </ol>

        </aside>
    );
}

/** Compact progress indicator for screens where the left rail is hidden. */
function MobileProgress({ index }) {
    return (
        <div className="lg:hidden mb-6" role="group" aria-label={`Step ${index + 1} of 3`}>
            <p className="mb-2 text-xs font-medium text-gray-500 dark:text-slate-400">Step {index + 1} of 3</p>
            <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                    <span
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i <= index ? "bg-[#1E3A5F] dark:bg-blue-400" : "bg-gray-200 dark:bg-slate-700"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
   OTP input — auto-advance, backspace, arrows, paste, and SMS/email autofill
   ─────────────────────────────────────────────────────────────────────────── */

function OtpInput({ value, onChange, disabled, hasError }) {
    const refs = useRef([]);

    const focusAt = (i) => {
        const el = refs.current[Math.max(0, Math.min(OTP_LENGTH - 1, i))];
        el?.focus();
    };

    function fill(start, digits) {
        const next = value.slice();
        digits.split("").forEach((d, k) => {
            if (start + k < OTP_LENGTH) next[start + k] = d;
        });
        onChange(next);
        focusAt(Math.min(start + digits.length, OTP_LENGTH - 1));
    }

    function handleChange(i, e) {
        const digits = e.target.value.replace(/\D/g, "");
        if (!digits) {
            const next = value.slice();
            next[i] = "";
            onChange(next);
            return;
        }
        // One digit = normal typing; several = autofill / IME insertion
        fill(i, digits.length === 1 ? digits : digits.slice(0, OTP_LENGTH - i));
    }

    function handleKeyDown(i, e) {
        if (e.key === "Backspace") {
            e.preventDefault();
            const next = value.slice();
            if (next[i]) {
                next[i] = "";
                onChange(next);
            } else if (i > 0) {
                next[i - 1] = "";
                onChange(next);
                focusAt(i - 1);
            }
        } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            focusAt(i - 1);
        } else if (e.key === "ArrowRight") {
            e.preventDefault();
            focusAt(i + 1);
        }
    }

    function handlePaste(e) {
        const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
        if (!digits) return;
        e.preventDefault();
        const next = Array(OTP_LENGTH).fill("");
        digits.split("").forEach((d, k) => (next[k] = d));
        onChange(next);
        focusAt(digits.length >= OTP_LENGTH ? OTP_LENGTH - 1 : digits.length);
    }

    return (
        <div role="group" aria-label="Verification code" className="flex justify-between gap-2 sm:gap-3 max-w-sm mx-auto" onPaste={handlePaste}>
            {value.map((digit, i) => (
                <input
                    key={i}
                    ref={(el) => (refs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete={i === 0 ? "one-time-code" : "off"}
                    autoFocus={i === 0}
                    maxLength={OTP_LENGTH}
                    value={digit}
                    disabled={disabled}
                    aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
                    aria-invalid={hasError || undefined}
                    onChange={(e) => handleChange(i, e)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onFocus={(e) => e.target.select()}
                    className={`h-12 w-full min-w-0 sm:h-14 rounded-lg border bg-white dark:bg-slate-800 text-center text-xl font-semibold text-gray-900 dark:text-gray-50 transition duration-150 focus:outline-none focus:ring-4 disabled:opacity-60 ${hasError
                            ? "border-red-500 dark:border-red-400 focus:border-red-500 focus:ring-red-500/15"
                            : digit
                                ? "border-[#1E3A5F] dark:border-blue-400 focus:border-[#1E3A5F] dark:focus:border-blue-400 focus:ring-[#1E3A5F]/10 dark:focus:ring-blue-400/15"
                                : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 focus:border-[#1E3A5F] dark:focus:border-blue-400 focus:ring-[#1E3A5F]/10 dark:focus:ring-blue-400/15"
                        }`}
                />
            ))}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Shared sub-components
   ─────────────────────────────────────────────────────────────────────────── */

const labelCls = "block mb-1.5 text-[13px] font-medium text-gray-700 dark:text-gray-300";
const linkCls =
    "font-medium text-[#1E3A5F] dark:text-blue-400 underline underline-offset-2 hover:opacity-75 transition-opacity rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F] dark:focus-visible:outline-blue-400";

function inputClasses(state, hasIcon) {
    const border =
        state === "error"
            ? "border-red-500 dark:border-red-400 focus:border-red-500 focus:ring-red-500/15"
            : state === "success"
                ? "border-green-500 dark:border-green-400 focus:border-green-500 focus:ring-green-500/15"
                : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 focus:border-[#1E3A5F] dark:focus:border-blue-400 focus:ring-[#1E3A5F]/10 dark:focus:ring-blue-400/15";

    return `w-full ${hasIcon ? "pl-9" : "pl-3"} pr-10 py-2.5 text-sm bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 border ${border} rounded-lg focus:outline-none focus:ring-4 placeholder-gray-400 dark:placeholder-slate-500 transition duration-150`;
}

function TextInput({ icon: Icon, state, right, ...props }) {
    return (
        <div className="relative">
            {Icon && (
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={16} aria-hidden />
            )}
            <input {...props} aria-invalid={state === "error" || undefined} className={inputClasses(state, !!Icon)} />
            {right && <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">{right}</span>}
        </div>
    );
}

function PrimaryButton({ loading, loadingText, children, disabled, ...props }) {
    return (
        <button
            type="submit"
            disabled={loading || disabled}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-[#1E3A5F] hover:bg-[#162d4a] dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold tracking-wide rounded-lg shadow-sm transition duration-150 enabled:hover:-translate-y-px enabled:active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F] dark:focus-visible:outline-blue-400"
            {...props}
        >
            {loading && <Spinner className="border-white/40 border-t-white" />}
            {loading ? loadingText : children}
        </button>
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

export default Forgot_Password_Page;