import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function OtpVerification() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const [otp, setOtp] = useState(Array(6).fill(""));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [timer, setTimer] = useState(600); // 10 minutes in seconds

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval); // Cleanup interval on unmount
    }
  }, [timer]);

  // Format timer as MM:SS
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleChange = (e, idx) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[idx] = value;
    setOtp(newOtp);
    setError("");
    // Move to next input if value entered
    if (value && idx < otp.length - 1) {
      document.getElementById(`otp-input-${idx + 1}`).focus();
    }
    // Move to previous input if deleted
    if (!value && idx > 0) {
      document.getElementById(`otp-input-${idx - 1}`).focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
    if (paste.length === otp.length) {
      setOtp(paste.split(""));
      setError("");
      document.getElementById(`otp-input-${otp.length - 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.some((digit) => digit === "")) {
      setError("Please enter the complete OTP.");
      setSuccess(false);
      return;
    }
    try {
      await axios.post("http://localhost:3000/OtpVerification", {
        email,
        otp: otp.join(""),
      });
      toast.success("Email verified! You can now log in.");
      setSuccess(true);
      setError("");
      navigate("/login");
    } catch (err) {
      const msg = err.response?.data?.message || "OTP verification failed";
      toast.error(msg);
      setError(msg);
      setSuccess(false);
    }
  };

  return (
    <div className="bg-white md:bg-slate-200 min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-10 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">
          OTP Verification
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Enter the 6-digit code sent to your email {email}.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          <div className="flex space-x-2 mb-4">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-input-${idx}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e, idx)}
                onPaste={idx === 0 ? handlePaste : undefined}
                className="w-10 h-12 md:w-12 md:h-14 text-center border border-gray-300 rounded-md text-lg font-semibold focus:outline-none focus:border-blue-500 transition"
                autoFocus={idx === 0}
              />
            ))}
          </div>
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          {success && (
            <div className="text-green-600 text-sm mb-2">
              OTP verified successfully!
            </div>
          )}
          <button
            type="submit"
            className="w-full mt-2 py-2 bg-gradient-to-r text-white from-blue-500 to-purple-600 animated-gradient rounded-md font-semibold hover:bg-blue-700 transition"
          >
            Verify OTP
          </button>
          <div className="mt-4 text-gray-600 text-sm">
            Time remaining: {formatTime(timer)}
          </div>
        </form>
        <div className="mt-4 text-center">
          <button
            className="text-blue-500 hover:underline text-sm"
            onClick={() => {
              setOtp(Array(6).fill(""));
              setError("");
              setSuccess(false);
              setTimer(600); // Reset timer to 10 minutes
            }}
          >
            Resend OTP
          </button>
        </div>
      </div>
    </div>
  );
}

export default OtpVerification;
