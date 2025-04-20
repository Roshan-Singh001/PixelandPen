import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const categories = [
    "Lifestyle",
    "Technology",
    "Travel",
    "Business",
    "Economy",
    "Sports",
  ];
  const socialLinks = ["GitHub", "LinkedIn", "Twitter"];

  return (
    <footer className="dark:bg-gray-800 bg-gray-200  text-black dark:text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="flex-1">
            <h4 className="text-xl font-bold mb-4">Pixel and Pen</h4>
            <p className="mb-4">
              Empowering writers, inspiring readers. Join our community today.
            </p>
            <div className="space-y-2">
              <p>
                <b>Email:</b> example123@gmail.com
              </p>
              <p>
                <b>Phone:</b> 112233445566
              </p>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="flex-1">
            <h4 className="text-xl font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="hover:text-blue-300 transition duration-300"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="hover:text-blue-300 transition duration-300"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  to="/category"
                  className="hover:text-blue-300 transition duration-300"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-blue-300 transition duration-300"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-blue-300 transition duration-300"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories Section */}
          <div className="flex-1">
            <h4 className="text-xl font-bold mb-4">Categories</h4>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category}>
                  <a
                    href="#"
                    className="hover:text-blue-300 transition duration-300"
                  >
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Social Section */}
          <div className="flex-1">
            <h4 className="text-xl font-bold mb-4">Weekly Newsletter</h4>
            <p className="mb-4">Get blog articles and offers via email</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // Add newsletter submission logic here
              }}
            >
              <input
                type="email"
                placeholder="Your email"
                className="w-[80%] p-3 text-sm outline-none bg-gray-700 border border-gray-600 rounded-md mb-2 text-white placeholder-gray-400 mx-auto"
                required
              />
              <button
                type="submit"
                className="w-[80%] p-3 text-sm bg-blue-600 text-white font-bold rounded-md cursor-pointer hover:bg-blue-700 transition duration-300 mx-auto"
              >
                Subscribe
              </button>
            </form>

            <div className="mt-6">
              <h4 className="text-xl font-bold mb-4">Connect With Us</h4>
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="text-white hover:text-blue-300 transition duration-300"
                  >
                    {social}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="text-center mt-8 pt-8 border-t border-gray-700">
          © {new Date().getFullYear()} Pixel and Pen. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
