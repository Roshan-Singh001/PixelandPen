import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./index.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import Navbar from "./components/Navbar.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";

import App from "./App.jsx";
import Blog from "./pages/Blog";
import Category from "./pages/Category";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Footer from "./components/Footer.jsx";
import Login_page from "./pages/Login_page.jsx";
import Sign_Up_Page from "./pages/Sign_Up_Page.jsx";
import OtpVerification from "./pages/OtpVerification.jsx";
import Error404 from "./pages/Error404.jsx";
import Admin from "./pages/dashboard/admin_dashboard.jsx";
import Contributor from "./pages/dashboard/contri_dashboard.jsx";
import Reader from "./pages/dashboard/subs_dashboard.jsx";
import Profile from "./pages/profilePage.jsx";
import ArticlePage from "./pages/article-page.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <Navbar />
        <App />
        <Footer />
      </>
    ),
  },
  {
    path: "/blog",
    element: (
      <>
        <Navbar />
        <Blog />
        <Footer />
      </>
    ),
  },
  {
    path: "/category",
    element: (
      <>
        <Navbar />
        <Category />
        <Footer />
      </>
    ),
  },
  {
    path: "/about",
    element: (
      <>
        <Navbar />
        <About />
        <Footer />
      </>
    ),
  },
  {
    path: "/contact",
    element: (
      <>
        <Navbar />
        <Contact />
        <Footer />
      </>
    ),
  },
  {
    path: "/login",
    element: (
      <>
        <Login_page />
      </>
    ),
  },
  {
    path: "/register",
    element: (
      <>
        <Sign_Up_Page />
      </>
    ),
  },
  {
    path: "/verify-otp",
    element: (
      <>
        <OtpVerification />
      </>
    ),
  },
  {
    path: "/dashboard/admin",
    element: (
      <>
        <AuthProvider>
          <Admin />
        </AuthProvider>
      </>
    ),
  },
  {
    path: "/dashboard/contributor",
    element: (
      <>
        <AuthProvider>
        <Contributor />
        </AuthProvider>
      </>
    ),
  },
  {
    path: "/dashboard/reader",
    element: (
      <>
      <AuthProvider>
        <Reader />
        </AuthProvider>
      </>
    ),
  },
  {
    path: "/:slug",
    element: (
      <>
        <Navbar />
        <Error404 />
        <Footer />
      </>
    ),
  },
  {
    path: "/profile",
    element: (
      <>
        <Navbar />
        <Profile />
        <Footer />
      </>
    ),
  },
  {
    path: "/article/:slug",
    element: (
      <>
        <Navbar />
        <ArticlePage />
        <Footer />
      </>
    ),
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>
);
