import React, { useEffect, useState } from "react";
import { TbMessageChatbot } from "react-icons/tb";
import { GiCoffeeCup } from "react-icons/gi";
import { IoMdPerson } from "react-icons/io";
import { MdEmail } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import { BiLogoFacebookCircle } from "react-icons/bi";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FaApple } from "react-icons/fa";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LogoDark from "../assets/images/Pixel & Pen(B&W).png";

function Sign_In_Page() {
  const [showPassword, setshowPassword] = useState(false);
  const [showConfirmPassword, setshowConfirmPassword] = useState();
  const [form, setForm] = useState({
    pass: "",
    cpass: "",
    email: "",
    username: "",
    RegisterAs: "",
  });
  const [Strength, setStrength] = useState();
  const [valuePassMatch, setvaluePassMatch] = useState();
  const [Error, setError] = useState();
  const [isEmailExist, setisEmailExist] = useState(null);
  const [isUserExist, setisUserExist] = useState(null);

  const showTogglePassword = () => {
    setshowPassword((prevState) => !prevState);
  };

  const showToggleConfirmPassword = () => {
    setshowConfirmPassword((prevState) => !prevState);
  };

  function checkPasswordMatch(e) {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);

    if (name === "pass" || name === "cpass") {
      const { pass, cpass } = updatedForm;

      if (!pass || !cpass) {
        setvaluePassMatch("Password field can't be left Empty");
      } else if (pass === cpass) {
        setvaluePassMatch("Password Matched");
      } else {
        setvaluePassMatch("Password didn't Match");
      }
    }
  }

  const passwordMatch = {
    "Password Matched": "text-green-500  border-green-500",
    "Password didn't Match": "text-red-500 border-red-500",
    "Password field can't be left Empty": "text-yellow-500 border-red-500",
  };

  function CheckPasswordStrength(e) {
    // Update the form state with the password value
    setForm({ ...form, [e.target.name]: e.target.value });
    // Get the password from the event (the value being typed)
    let password = e.target.value;

    // If the password is empty, set strength to empty string
    if (password.length === 0) {
      setStrength("");
    }
    // Check if the password is strong (length >= 8 and contains lower, upper, digit, special character)
    else if (
      password.length >= 8 &&
      /[a-z]/.test(password) &&
      /\d/.test(password) &&
      /[A-Z]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    ) {
      setStrength("Password is Strong");
    }
    // Check if the password is medium (length >= 8, and contains lower, upper, and digit)
    else if (
      password.length >= 8 &&
      /[a-z]/.test(password) &&
      /\d/.test(password) &&
      /[A-Z]/.test(password)
    ) {
      setStrength("Password is Medium");
    }
    // Check if the password is weak (length >= 4)
    else if (password.length >= 4) {
      setStrength("Password is Weak");
    } else {
      setStrength("Password is Very Weak");
    }
    console.log(password);
  }

  const strengthClasses = {
    "Password is Very Weak": "text-red-500 border-red-500",
    "Password is Weak": "text-orange-500 border-orange-500",
    "Password is Medium": "text-yellow-500 border-yellow-500",
    "Password is Strong": "text-green-500 border-green-500",
  };

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    console.log(form);
  }

  async function checkUsernameExist(username) {
    if (username) {
      try {
        const response = await fetch(
          `http://localhost:3000/check-username/${username}`
        );
        if (response.ok) {
          let data = await response.json();
          setisUserExist(data.exists);
        } else {
          throw new Error("Email check failed");
        }
      } catch (err) {
        console.log("Error checking email existence:", err);
      }
    } else {
      setisUserExist(null);
    }
  }

  useEffect(() => {
    if (form.username) {
      checkUsernameExist(form.username);
      console.log(form.username);
    }
  }, [form.username]);

  async function checkEmailExist(email) {
    if (email) {
      try {
        const response = await fetch(
          `http://localhost:3000/check-email/${email}`
        );
        if (response.ok) {
          let data = await response.json();
          setisEmailExist(data.exists);
        } else {
          throw new Error("Email check failed");
        }
      } catch (err) {
        console.log("Error checking email existence:", err);
      }
    } else {
      setisEmailExist(null);
    }
  }

  useEffect(() => {
    if (form.email) {
      checkEmailExist(form.email);
      console.log(form.email);
    }
  }, [form.email]);

  function handlePasswordChange(e) {
    checkPasswordMatch(e);
    CheckPasswordStrength(e);
  }

  async function handleFormSubmit(e) {
    e.preventDefault();

    if (form.pass !== form.cpass) {
      toast.error("Check credentials and Retry again!");
      return; // Don't submit the form
    } else if (isEmailExist || isUserExist) {
      toast.error("Email or username already exists!");
      return; // Don't submit the form
    } else {
      try {
        const response = await fetch("http://localhost:3000/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: form.username,
            password: form.pass,
            email: form.email,
          }),
        });
        const result = await response.json();
        if (response.ok) {
          toast.success("You are successfully registered, now you can login");
        } else {
          toast.error(result.message || "An error occurred");
        }
      } catch (err) {
        toast.error("An error occured");
      }

      setForm({ pass: "", cpass: "", email: "", username: "" });
      setStrength("");
      setvaluePassMatch("");
      console.log("Form submitted successfully");
      // toast.result("You are successfully ")
    }
  }

  return (
    <>
      <main className="flex md:items-center bg-white md:bg-slate-200 h-[100vh]  justify-center">
        <div className="page sm:h-[95vh]  h-auto md:justify-center flex w-[90%] lg:w-[60%]">
          {/* Left Side */}
          <div className="bg-gradient-to-b   sm:rounded-bl-sm sm:rounded-tl-sm hidden sm:flex  p-3 justify-center items-center from-blue-400 w-2/5 to-violet-400 h-full ">
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
          <div className="md:w-3/5 w-[99%] rounded-md md:rounded-br-md md:rounded-tr-md bg-white main-login space-y-4 flex flex-col items-center p-2">
            <p className="head animated-gradient text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-purple-500 font-medium text-2xl">
              SIGN UP HERE
            </p>
            <form
              action="POST"
              onSubmit={handleFormSubmit}
              className="flex flex-col space-y-6 w-full mt-9 md:w-[80%] lg:w-[70%]"
            >
              <div className="Register-choice bg-gray-300 p-1 rounded-md">
                <select
                  name="RegisterAs"
                  className="w-full p-2 border text-slate-500 bg-white rounded-sm focus:outline-none focus:ring-2 focus:bg-white"
                >
                  <option value="">Sign Up as...</option>
                  <option value="Admin">SignUp as Admin</option>
                  <option value="Contributor">SignUp as Contributor</option>
                  <option value="Reader">SignUp as Reader</option>
                </select>
              </div>

              <div className="input-email relative w-full">
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="border-b-2 border-gray-300 w-full xs:w-full focus:outline-none focus:border-blue-500 text-gray-600 px-4"
                  placeholder="Enter Email"
                />
                <MdEmail
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  size={20}
                  color="grey"
                />
                {isEmailExist ? (
                  <p className={`absolute left-3 text-red-500`}>
                    Email already exists
                  </p>
                ) : (
                  ""
                )}
              </div>

              <div className="input-username relative w-full">
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  minLength={4}
                  required
                  className="border-b-2 border-gray-300 w-full xs:w-full focus:outline-none focus:border-blue-500 text-gray-600 py-2 px-4"
                  placeholder="Enter Username"
                />
                <IoMdPerson
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  size={20}
                  color="grey"
                />
                {isUserExist ? (
                  <p className={`absolute left-3 text-red-500`}>
                    Username already exists
                  </p>
                ) : (
                  ""
                )}
              </div>

              <div className="input-pass relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.pass}
                  maxLength={16}
                  minLength={4}
                  name="pass"
                  onChange={handlePasswordChange}
                  className="border-b-2 border-gray-300 w-full xs:w-full focus:outline-none focus:border-blue-500 text-gray-600 py-2 px-4"
                  placeholder="Enter Password"
                />
                <div
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  onClick={showTogglePassword}
                >
                  {showPassword ? (
                    <FaEyeSlash
                      className="hover:cursor-pointer"
                      size={20}
                      color="grey"
                    /> // If password is visible, show FaEyeSlash
                  ) : (
                    <FaEye
                      size={20}
                      className="hover:cursor-pointer"
                      color="grey"
                    /> // If password is hidden, show FaEye
                  )}
                </div>
                <p className={`absolute left-3 ${strengthClasses[Strength]}`}>
                  {Strength}
                </p>
              </div>

              <div className="input-cpass  py-2 relative w-full">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={form.cpass}
                  name="cpass"
                  className="border-b-2 border-gray-300 w-full xs:w-full focus:outline-none focus:border-blue-500 text-gray-600 py-2 px-4"
                  placeholder="Enter Confirm Password"
                  onChange={handlePasswordChange}
                />
                <div
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  onClick={showToggleConfirmPassword}
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash
                      className="hover:cursor-pointer"
                      size={20}
                      color="grey"
                    /> // If password is visible, show FaEyeSlash
                  ) : (
                    <FaEye
                      className="hover:cursor-pointer"
                      size={20}
                      color="grey"
                    /> // If password iPlease verify ths hidden, show FaEye
                  )}
                </div>
                <p
                  className={`absolute ${passwordMatch[valuePassMatch]} left-3`}
                >
                  {valuePassMatch}
                </p>
              </div>
              <input
                type="submit"
                value="Continue"
                className="bg-gradient-to-r  text-white hover:from-blue-500 hover:to-purple-600 animated-gradient hover:cursor-pointer sm:p-3 p-2 rounded-md from-blue-400 to-purple-500 font-medium text-2xl"
              />
              <ToastContainer />
            </form>

            <p className="text-gray-400">OR Sign Up with</p>

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
                to="/Login"
                className="text-transparent underline bg-clip-text bg-gradient-to-b from-blue-400 to-purple-500 font-medium hover:underline hover:bg-gradient-to-b hover:from-blue-600 hover:to-purple-700"
              >
                Login Here
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default Sign_In_Page;
