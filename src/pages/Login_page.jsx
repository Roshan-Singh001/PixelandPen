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

function Login_page() {
  const [showPassword, setshowPassword] = useState(false);
  const [form, setform] = useState({ username: "", pass: "" });
  const navigate = useNavigate();
  const showPasswordToggle = () => {
    setshowPassword((prevState) => !prevState);
  };

  function handleChange(e) {
    setform({ ...form, [e.target.name]: e.target.value });
  }

  async function handleFormValidation(e) {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.username,
          password: form.pass,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Save the JWT token in localStorage
        localStorage.setItem("authToken", result.token);
        console.log("Login successful:", result.token);
        // Redirect to Dashboard
        navigate("/Dashboard");
      } else {
        // Handle failed login with appropriate error message
        console.error("Login failed:", result.message || "Unknown error");
        toast.error(result.message || "Login failed, please try again.");
      }
    } catch (err) {
      // Handle any network or unexpected errors
      console.error("Error during login:", err);
      toast.error(`Error: ${err.message || err}`);
    }
  }

  return (
    <>
      <main className="flex md:items-center bg-white md:bg-slate-200 h-[100vh]  justify-center">
        <div className="page h-[80vh]  md:justify-center flex w-[90%] lg:w-[60%]">
          <div className="bg-gradient-to-b md:rounded-bl-md md:rounded-tl-md hidden md:flex  p-2 justify-center items-center from-blue-400 w-2/5 to-violet-400 h-full ">
            <div className="design space-y-16  flex flex-col justify-center items-center">
              <div className="logo flex flex-col  justify-center items-center">
                <TbMessageChatbot size={90} color="white" />
                <p className="text-white font-bold text-2xl">ConvoNest</p>
              </div>
              <div className="w-4/5">
                <p className="text-white font-bold text-2xl font-mono">
                  Share your smile with this world and find freinds
                </p>
              </div>
              <div className="flex flex-col justify-center items-center">
                <GiCoffeeCup size={60} color="white" />
                <p className="text-white font-semibold text-lg">Enjoy</p>
              </div>
            </div>
          </div>
          <div className="md:w-3/5 w-[99%] md:rounded-br-md md:rounded-tr-md bg-white main-login space-y-7 flex flex-col items-center p-2">
            <div className="logo md:hidden flex flex-col  justify-center items-center">
              <TbMessageChatbot size={30} color="black" />
              <p className=" font-bold text-2xl">ConvoNest</p>
            </div>
            <p className="head text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-purple-500 font-medium text-2xl">
              SIGN IN HERE
            </p>
            <form
              action="POST"
              onSubmit={handleFormValidation}
              className="flex flex-col space-y-7 w-full md:w-[80%] lg:w-[70%]"
            >
              <div className="input-username relative w-full">
                <input
                  type="text"
                  required
                  minLength={4}
                  className="border-b-2 border-gray-300 w-full xs:w-full focus:outline-none focus:border-blue-500 text-gray-600 py-2 px-4"
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
                className="bg-gradient-to-r text-white hover:from-blue-500 hover:to-purple-600 hover:cursor-pointer p-3 rounded-md from-blue-400 to-purple-500 font-medium text-2xl"
              />
              <ToastContainer />
            </form>

            <p className="text-gray-400">OR Sign In with</p>

            <div className="sign-up-with flex space-x-10">
              <div className="google bg-gray-200 hover:cursor-pointer hover:bg-slate-300 p-1 rounded-md">
                <FcGoogle size={30} />
              </div>

              <div className="facebook bg-gray-200 hover:cursor-pointer hover:bg-slate-300 p-1 rounded-md">
                <BiLogoFacebookCircle size={30} color="blue" />
              </div>

              <div className="apple bg-gray-200 hover:cursor-pointer hover:bg-slate-300 p-1 rounded-md">
                <FaApple size={30} color="black" />
              </div>
            </div>

            <div className="register-link flex space-x-3">
              <p className="text-gray-600 font-semibold ">
                Already Have an account?
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
