import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./index.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ToastContainer, toast } from "react-toastify";
import { HelmetProvider } from "react-helmet-async";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "./components/Navbar.jsx";
import PrivateRoute from "./components/PrivateRoutes.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";


import App from "./App.jsx";
import Articles from "./pages/Articles";
import CategoryPage from "./pages/article/CategoryDetail.jsx";
import LatestArticlesPage from "./pages/article/LatestArticles.jsx";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Footer from "./components/Footer.jsx";
import Login_page from "./pages/auth/Login_page.jsx";
import Sign_Up_Page from "./pages/auth/Sign_Up_Page.jsx";
import OtpVerification from "./pages/auth/OtpVerification.jsx";
import PasswordReset from "./pages/auth/PasswordReset.jsx";
import Error404 from "./pages/Error404.jsx";

import Admin from "./pages/dashboard/admin_dashboard.jsx";
import DashboardHome from "./pages/dashboard/admin_components/Dashboard_Home.jsx";
import ArticleRequests from "./pages/dashboard/admin_components/ArticleRequests.jsx";
import ContriRequest from "./pages/dashboard/admin_components/ContriRequest.jsx";
import ReaderManage from "./pages/dashboard/admin_components/ReaderManage.jsx";
import Announcements from "./pages/dashboard/admin_components/Annoucements.jsx";
import CommentsManage from "./pages/dashboard/admin_components/CommentsManage.jsx";
import CategoryManage from "./pages/dashboard/admin_components/CategoryManage.jsx";
import SiteAnalytics from "./pages/dashboard/admin_components/SiteAnalytics.jsx";
import AdminSettings from "./pages/dashboard/admin_components/AdminSettings.jsx";

import Contributor from "./pages/dashboard/contri_dashboard.jsx";
import DashboardHome2 from "./pages/dashboard/contri_components/Dashboard_Home2.jsx";
import MyArticles from "./pages/dashboard/contri_components/MyArticles.jsx";
import MyAnalytics from "./pages/dashboard/contri_components/MyAnalytics.jsx";
import MyComments from "./pages/dashboard/contri_components/MyComments.jsx";
import ContriProfile from "./pages/dashboard/contri_components/ContriProfile.jsx";
import ContriSettings from "./pages/dashboard/contri_components/ContriSettings.jsx";
import Followers from "./pages/dashboard/contri_components/Followers.jsx";

import ArticleEditor from "./pages/dashboard/ArticleEditor.jsx";

import Reader from "./pages/dashboard/read_dashboard.jsx";
import DashboardHome3 from "./pages/dashboard/read_components/Dashboard_Home3.jsx";
import MyReads from "./pages/dashboard/read_components/MyReads.jsx";
import Comments from "./pages/dashboard/read_components/Comments.jsx";
import Likes from "./pages/dashboard/read_components/Likes.jsx";
import Bookmarks from "./pages/dashboard/read_components/Bookmarks.jsx";
import Following from "./pages/dashboard/read_components/Following.jsx"
import ReadProfile from "./pages/dashboard/read_components/ReadProfile.jsx";
import ReadSettings from "./pages/dashboard/read_components/ReadSettings.jsx";
import ReadProfilePage from "./pages/profile/ReadProfilePage.jsx";

import Profile from "./pages/profile/profilePage.jsx";
import ArticlePage from "./pages/article/ArticlePage.jsx";
import PreviewArticlePage from "./pages/article/PreviewArticlePage.jsx";

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
    path: "/articles",
    element: (
      <>
        <Navbar />
        <Articles />
        <Footer />
      </>
    ),
  },
  {
    path: "/category/:slug",
    element: (
      <>
        <Navbar />
        <CategoryPage />
        <Footer />
      </>
    ),
  },
  {
    path: "/article/latest",
    element: (
      <>
        <Navbar />
        < LatestArticlesPage />
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
    path: "/password-reset",
    element: (
      <>
        <PasswordReset />
      </>
    ),
  },
  {
    path: "/notfound",
    element: (
      <>
        <Navbar />
        <Error404 />
        <Footer />
      </>
    ),
  },
  {
    path: "/profile/cont/:slug",
    element: (
      <>
        <Navbar />
        <Profile />
        <Footer />
      </>
    ),
  },
  {
    path: "/profile/reader/:slug",
    element: (
      <>
        <Navbar />
        <ReadProfilePage />
        <Footer />
      </>
    ),
  },
  {
    path: "/view/:slug",
    element: (
      <>
        <Navbar />
        <ArticlePage />
        <Footer />
      </>
    ),
  },

  {
    element: <PrivateRoute allowedRoles={["Admin", "Contributor"]} />,
    children: [
      {
        path: "/preview/:slug",
        element: (
          <>
            <PreviewArticlePage />
          </>
        ),
      }
    ],
  },
  {
    element: <PrivateRoute allowedRoles={["Admin"]} />,
    children: [
      {
        path: "/dashboard/admin",
        element: <Admin />,
        children: [
          {
            index: true,
            element: <DashboardHome />,
          },
          {
            path: "article",
            element: <ArticleRequests />,
          },
          {
            path: "contributor",
            element: <ContriRequest />,
          },
          {
            path: "reader",
            element: <ReaderManage />,
          },
          {
            path: "announcements",
            element: <Announcements />,
          },
          {
            path: "comments",
            element: <CommentsManage />,
          },
          {
            path: "category",
            element: <CategoryManage />,
          },
          {
            path: "analytics",
            element: <SiteAnalytics />,
          },
          {
            path: "settings",
            element: <AdminSettings />,
          },
        ],
      },
    ],
  },
  {
    element: <PrivateRoute allowedRoles={["Contributor"]} />,
    children: [
      {
        path: "/dashboard/contributor",
        element: <Contributor />,
        children: [
          {
            index: true,
            element: <DashboardHome2 />,
          },
          {
            path: "profile",
            element: <ContriProfile />,
          },
          {
            path: "article",
            element: <MyArticles />,
          },
          {
            path: "followers",
            element: <Followers />,
          },
          {
            path: "comments",
            element: <MyComments />,
          },
          {
            path: "analytics",
            element: <MyAnalytics />,
          },
          {
            path: "settings",
            element: <ContriSettings />,
          },
        ]
      },
    ],
  },

  {
    element: <PrivateRoute allowedRoles={["Contributor"]} />,
    children: [
      {
        path: "/dashboard/contributor/article/editor",
        element: <ArticleEditor />,

      }
    ]
  },
  {
    element: <PrivateRoute allowedRoles={["Contributor"]} />,
    children: [
      {
        path: "/dashboard/contributor/article/editor/:articleSlug",
        element: <ArticleEditor />,

      }
    ]
  },

  {
    element: <PrivateRoute allowedRoles={["Reader"]} />,
    children: [
      {
        path: "/dashboard/reader",
        element: <Reader />,
        children: [
          {
            index: true,
            element: <DashboardHome3 />,
          },
          {
            path: "reads",
            element: <MyReads />,
          },
          {
            path: "comments",
            element: <Comments />,
          },
          {
            path: "likes",
            element: <Likes />,
          },
          {
            path: "bookmarks",
            element: <Bookmarks />,
          },
          {
            path: "following",
            element: <Following />,
          },
          {
            path: "profile",
            element: <ReadProfile />,
          },
          {
            path: "settings",
            element: <ReadSettings />,
          },
        ]
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <ThemeProvider>
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
    />
    <HelmetProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </HelmetProvider>
  </ThemeProvider>
  // {/* </StrictMode> */}
);
