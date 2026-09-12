import { useLocation, useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import AxiosInstance from "../../api/axiosInstance";
import { toast } from "react-toastify";
import { ShieldCheck, Loader2, RotateCw } from "lucide-react";

const OTP_LENGTH = 6;
const OTP_DURATION = 600; // 10 minutes

function OtpVerification() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(OTP_DURATION);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate("/signup");
    }
  }, []);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const focusInput = (idx) => {
    inputRefs.current[idx]?.focus();
  };

  const handleChange = (e, idx) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[idx] = value;
    setOtp(newOtp);
    setError("");

    if (value && idx < otp.length - 1) {
      focusInput(idx + 1);
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      focusInput(idx - 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
    if (!paste) return;

    const digits = paste.slice(0, OTP_LENGTH).split("");
    const newOtp = Array(OTP_LENGTH).fill("");
    digits.forEach((digit, i) => { newOtp[i] = digit; });
    setOtp(newOtp);
    setError("");
    focusInput(Math.min(digits.length, OTP_LENGTH - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.some((digit) => digit === "")) {
      setError("Please enter the complete OTP.");
      return;
    }
    if (timer === 0 || isVerifying) return;

    setIsVerifying(true);
    setError("");

    try {
      await AxiosInstance.post("/OtpVerification", {
        email,
        otp: otp.join(""),
      });
      toast.success("Email verified! You can now log in.");
      navigate("/login");
    } catch (err) {
      console.log(err);
      const msg = err.response?.data?.message || "OTP verification failed";
      toast.error(msg);
      setError(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (isResending) return;
    setIsResending(true);
    setError("");

    try {
      await AxiosInstance.post("/OtpVerification/resend", { email });
      toast.success("A new code has been sent to your email.");
      setOtp(Array(OTP_LENGTH).fill(""));
      setTimer(OTP_DURATION);
      focusInput(0);
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Couldn't resend the code. Try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-slate-900 flex items-center justify-center px-4 font-[Inter,system-ui,sans-serif]">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 sm:p-8">

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6 text-[#1E3A5F] dark:text-blue-400" />
          </div>
          <h1 className="font-[Newsreader,Georgia,serif] text-2xl font-black text-gray-900 dark:text-gray-50 mb-1.5">
            Verify Your Email
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Enter the 6-digit code sent to
          </p>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mt-0.5">
            {email}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex justify-center gap-2 sm:gap-2.5 mb-5">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                onPaste={handlePaste}
                disabled={timer === 0 || isVerifying}
                className="w-11 h-13 sm:w-12 sm:h-14 text-center text-lg font-semibold rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 dark:focus:ring-blue-500/30 focus:border-[#1E3A5F] dark:focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                autoFocus={idx === 0}
              />
            ))}
          </div>

          {error && (
            <p className="text-xs font-medium text-red-600 dark:text-red-400 text-center mb-4">{error}</p>
          )}

          <button
            type="submit"
            disabled={timer === 0 || isVerifying}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold rounded-lg text-white bg-[#1E3A5F] hover:bg-[#16304d] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying…
              </>
            ) : timer === 0 ? (
              "OTP Expired"
            ) : (
              "Verify OTP"
            )}
          </button>

          <div className="flex flex-col items-center gap-2 mt-5">
            {timer > 0 ? (
              <p className="text-xs text-gray-400 dark:text-slate-500">
                Code expires in <span className="font-semibold text-gray-600 dark:text-slate-300">{formatTime(timer)}</span>
              </p>
            ) : (
              <p className="text-xs text-red-500 dark:text-red-400 font-medium">
                Your code has expired
              </p>
            )}

            <button
              type="button"
              onClick={handleResend}
              // disabled={isResending || (timer > 0 && timer > OTP_DURATION - 30)}
              disabled={true}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E3A5F] dark:text-blue-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:no-underline"
            >
              {isResending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCw className="w-3.5 h-3.5" />}
              {isResending ? "Sending…" : "Resend code"}
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-gray-400 dark:text-slate-500 mt-6">
          Wrong email?{' '}
          <Link to="/signup" className="font-semibold text-[#1E3A5F] dark:text-blue-400 hover:underline">
            Go back
          </Link>
        </p>
      </div>
    </div>
  );
}

export default OtpVerification;