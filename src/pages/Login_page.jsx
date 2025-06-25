import React from "react";
import { TbMessageChatbot } from "react-icons/tb";
import { GiCoffeeCup } from "react-icons/gi";
import { IoMdPerson } from "react-icons/io";
import { MdEmail } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { BiLogoFacebookCircle } from "react-icons/bi";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FaApple } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LogoLight from "../assets/images/Pixel & Pen.png";
import LogoDark from "../assets/images/Pixel & Pen(B&W).png";
import axios from "axios";

function Login_page() {
  const [showPassword, setshowPassword] = useState(false);
  const [role, setRole] = useState("");
  const [form, setform] = useState({ username: "", pass: "", loginAs: "" });
  const navigate = useNavigate();
  const AxiosInstance = axios.create({
    baseURL: 'http://localhost:3000/',
    timeout: 3000,
    headers: {'X-Custom-Header': 'foobar'}
  });
  const showPasswordToggle = () => {
    setshowPassword((prevState) => !prevState);
  };

  function handleChange(e) {
    setform({ ...form, [e.target.name]: e.target.value });

    console.log(form);
  }

  async function handleFormValidation(e) {
    e.preventDefault();
    try {
      const response = await AxiosInstance.post("/validate", {
        username: form.username, // assuming `form.username` is the email
        password: form.pass,
        role: form.loginAs,
      });

      const result = response.data;
      console.log("Login successful:", result.message);

      // Save the JWT token in localStorage
      if (result.token) {
        localStorage.setItem("authToken", result.token);
        if (result.role == "Admin") {
          navigate(`/dashboard/admin`);
        }
        else if (result.role == "Contributor") {
          navigate("/dashboard/contributor");
        }
        else if(result.role== "Reader"){
          navigate("/dashboard/reader");
        }
      } else {
        console.error("No token received from backend");
      }

      

      // Redirect to Dashboard
    } catch (err) {
      // Handle any errors like 401, 400, network issues
      const errorMessage =
        err.response?.data?.message || "Login failed, please try again.";
      console.error("Error during login:", err);
      toast.error(`Error: ${errorMessage}`);
    }
  }

  return (
    <>
      <main className="flex sm:items-center bg-slate-200 h-[100vh] items-center  justify-center">
        <div className="page sm:h-[80vh] h-auto  sm:justify-center flex w-[90%] lg:w-[60%]">
          {/* left side */}
          <div className="bg-gradient-to-b  sm:rounded-bl-sm sm:rounded-tl-sm hidden sm:flex  p-3 justify-center items-center from-blue-400 w-2/5 to-violet-400 h-full ">
            <div className="design space-y-16  flex flex-col justify-center items-center">
              <div className="logo flex flex-col  justify-center items-center">
                <img src={LogoDark} alt="WebsiteLogo" />
              </div>
              <div className="w-4/5">
                <p className="text-white font-bold text-2xl font-mono">
                  “A pixel paints, a pen writes—together, they build worlds.”
                </p>
              </div>
              <div className="flex flex-col justify-center items-center">
                <GiCoffeeCup size={60} color="white" />
                <p className="text-white font-semibold text-lg">Enjoy</p>
              </div>
            </div>
          </div>
          <div className="sm:w-3/5 w-[99%] rounded-md  sm:rounded-br-sm sm:rounded-tr-sm bg-white main-login space-y-5 sm:h-full h-auto flex flex-col items-center p-2">
            <p className="head animated-gradient  text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-purple-500 font-medium text-2xl">
              SIGN IN HERE
            </p>
            <form
              action="POST"
              onSubmit={handleFormValidation}
              className="flex flex-col space-y-7 w-full sm:w-[80%] lg:w-[70%]"
            >
              <div className="login-choice bg-gray-300 p-1 rounded-md">
                <select
                  name="loginAs"
                  value={form.loginAs}
                  onChange={(e) => {
                    handleChange(e);
                    setRole(e.target.value);
                  }}
                  className={`border-none focus:shadow-none w-full p-2 border bg-white rounded-sm focus:outline-none focus:ring-2 focus:bg-white ${
                    form.loginAs === "" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <option value="" hidden>
                    Sign In as...
                  </option>
                  <option value="Admin">SignIn as Admin</option>
                  <option value="Contributor">SignIn as Contributor</option>
                  <option value="Reader">SignIn as Reader</option>
                </select>
              </div>

              <div className="input-username relative w-full">
                <input
                  type="text"
                  required
                  minLength={4}
                  className="border-b-2 border-gray-300 w-full xs:w-full ring-0 focus:ring-0 focus:shadow-none focus:outline-none focus:border-blue-500 text-gray-600 py-2 px-4"
                  onChange={handleChange}
                  name="username"
                  value={form.username}
                  placeholder="Enter Username"
                />
                <IoMdPerson
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  size={20}
                  color="grey"
                />
              </div>

              <div className="input-pass relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={4}
                  onChange={handleChange}
                  name="pass"
                  value={form.pass}
                  className="border-b-2 border-gray-300 w-full xs:w-full focus:outline-none focus:border-blue-500 text-gray-600 py-2 px-4"
                  placeholder="Enter Password"
                />
                <div
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer"
                  onClick={showPasswordToggle} // Toggle visibility on click
                >
                  {showPassword ? (
                    <FaEyeSlash size={20} color="grey" /> // If password is visible, show FaEyeSlash
                  ) : (
                    <FaEye size={20} color="grey" /> // If password is hidden, show FaEye
                  )}
                </div>
              </div>

              <input
                type="submit"
                value="Continue"
                className="bg-gradient-to-r text-white animated-gradient hover:from-blue-500 hover:to-purple-600 hover:cursor-pointer sm:p-3 p-2 rounded-md from-blue-400 to-purple-500 font-medium text-2xl"
              />
              <ToastContainer />
            </form>

            <p className="text-gray-400">OR Sign In with</p>

            <div className="sign-up-with flex space-x-10">
              <div className="google bg-gray-200 hover:cursor-pointer hover:bg-slate-300 p-1 rounded-sm">
                <FcGoogle size={30} />
              </div>

              <div className="facebook bg-gray-200 hover:cursor-pointer hover:bg-slate-300 p-1 rounded-sm">
                <BiLogoFacebookCircle size={30} color="blue" />
              </div>

              <div className="apple bg-gray-200 hover:cursor-pointer hover:bg-slate-300 p-1 rounded-sm">
                <FaApple size={30} color="black" />
              </div>
            </div>

            <div className="register-link flex space-x-3">
              <p className="text-gray-600 font-semibold ">
                Don't Have an account?
              </p>
              <Link
                to="/register"
                className="text-transparent underline bg-clip-text bg-gradient-to-b from-blue-400 to-purple-500 font-medium hover:underline hover:bg-gradient-to-b hover:from-blue-600 hover:to-purple-700"
              >
                Register Here
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default Login_page;
