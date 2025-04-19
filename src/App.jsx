import React from "react";
import { Link } from "react-router-dom";

// Components
import Footer from "./components/Footer";

const PixelAndPenHomepage = () => {
  const features = [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-10 h-10 text-blue-600 dark:text-blue-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      title: "Diverse Content",
      description:
        "Explore a wide range of topics from tech to lifestyle, written by passionate contributors.",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-10 h-10 text-green-600 dark:text-green-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.768-.231-1.484-.634-2.026M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.768.231-1.484.634-2.026M14 10a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      title: "Community-Driven",
      description:
        "Connect with writers and readers from around the world, share insights, and grow together.",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-10 h-10 text-purple-600 dark:text-purple-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
          />
        </svg>
      ),
      title: "Role-Based Platform",
      description:
        "Tailored experiences for admins, contributors, and readers with personalized dashboards.",
    },
  ];

  const topContributors = [
    {
      name: "Roshan Singh",
      posts: 42,
      avatar: "/api/placeholder/100/100",
    },
    {
      name: "Suraj Singh Bhoj",
      posts: 35,
      avatar: "/api/placeholder/100/100",
    },
    {
      name: "Md Javed",
      posts: 28,
      avatar: "/api/placeholder/100/100",
    },
  ];

  const teamMembers = [
    {
      name: "Roshan Singh",
      socialLinks: [
        { type: "LinkedIn", url: "#" },
        { type: "GitHub", url: "#" },
      ],
    },
    {
      name: "Suraj Singh Bhoj",
      socialLinks: [
        { type: "LinkedIn", url: "#" },
        { type: "Twitter", url: "#" },
      ],
    },
    {
      name: "Mohammed Javed",
      socialLinks: [
        { type: "LinkedIn", url: "#" },
        { type: "Twitter", url: "#" },
      ],
    },
  ];

  return (
    <>
      <div className="min-h-screen background-colors transition-colors duration-200">
        {/* Hero Section */}
        <header className="animated-gradient bg-gradient-to-r  from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 text-white py-20">
          <div className="container mx-auto text-center px-4">
            <h1 className="text-5xl font-bold mb-4">Pixel and Pen</h1>
            <p className="text-2xl mb-8">A Space for Readers and Writers</p>
            <div className="space-x-4">
              <button className="bg-white text-blue-600 px-6 py-3 rounded-full hover:bg-blue-100 transition duration-200">
                Start Reading
              </button>
              <Link to="/login">
                <button className="border border-white text-white px-6 py-3 mt-2 rounded-full hover:bg-white hover:text-blue-600  transition duration-200">
                  Become a Contributor
                </button>
              </Link>
            </div>
          </div>
        </header>

        {/* Features Section */}
        <section className="container mx-auto py-16 px-4">
          <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">
            Why Pixel and Pen?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md dark:shadow-gray-800 text-center transition-colors duration-200"
              >
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Top Contributors */}
        <section className="bg-gray-100 dark:bg-gray-800 py-16 transition-colors duration-200">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">
              Top Contributors
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {topContributors.map((contributor, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md dark:shadow-gray-800 text-center transition-colors duration-200"
                >
                  <img
                    src={contributor.avatar}
                    alt={contributor.name}
                    className="mx-auto mb-4 w-24 h-24 rounded-full"
                  />
                  <h3 className="text-xl font-semibold dark:text-white">
                    {contributor.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Contributor
                  </p>
                  <div className="flex justify-center items-center mt-2 text-gray-500 dark:text-gray-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="inline-block mr-2 w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    {contributor.posts} Published Posts
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="container mx-auto py-16 px-4">
          <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">
            Our Developer Team
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md dark:shadow-gray-800 text-center transition-colors duration-200"
              >
                <h3 className="text-xl font-semibold dark:text-white">
                  {member.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Full Stack Developer
                </p>
                <div className="flex justify-center space-x-4">
                  {member.socialLinks.map((link, linkIndex) => (
                    <a
                      key={linkIndex}
                      href={link.url}
                      className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                    >
                      {link.type}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default PixelAndPenHomepage;
