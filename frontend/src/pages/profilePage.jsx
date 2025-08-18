import { IoMdPeople } from "react-icons/io";
import { TiMessages } from "react-icons/ti";
import { Link } from "react-router-dom";
import { useState } from "react";
function ProfilePage() {
  const [isBlogsHidden, setIsBlogsHidden] = useState(true);
  const userBlogs = [
    { name: "Europe best places to visit ", link: "#" },
    { name: "Roam is the best country in world !! Here is why", link: "#" },
  ];
  return (
    <div className="min-h-screen bg-gray-200  dark:bg-gray-900 p-10 md:p-24">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 relative">
        <div className="w-32 h-32 shadow-2xl rounded-full absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 p-1">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuNhTZJTtkR6b-ADMhmzPvVwaLuLdz273wvQ&s"
            alt="Profile"
            className="w-full h-full rounded-full object-cover"
          />
        </div>

        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Roshan Singh
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">Age: 29</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Location: San Francisco
          </p>
          <p className="mt-2 text-gray-700 dark:text-gray-200">
            Passionate writer and traveler. Sharing stories, tutorials, and
            lifestyle tips through blogs.
          </p>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="#"
            className="flex items-center space-x-2 px-5 py-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition"
          >
            <IoMdPeople size={24} className="text-black dark:text-white" />
            <span className="text-gray-800 dark:text-white">Followers</span>
          </Link>
          <Link
            to="#"
            className="flex items-center space-x-2 px-5 py-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition"
          >
            <TiMessages size={24} className="text-black dark:text-white" />
            <span className="text-gray-800 dark:text-white">Message</span>
          </Link>
        </div>

        <div className="mt-6 text-sm text-gray-700 dark:text-gray-300">
          <p>
            <strong>Email:</strong> roshanS@gmail.com
          </p>
          <p>
            <strong>Website:</strong> www.RoshanS.blog
          </p>
          <p>
            <strong>Joined:</strong> January 2023
          </p>
          <p>
            <strong>Topics:</strong> Travel, Technology, Health, Minimalism
          </p>
        </div>

        <div
          onClick={() => setIsBlogsHidden((prevState) => !prevState)}
          className="mt-6 flex justify-center"
        >
          <button className="px-6 py-2 text-white font-semibold bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-purple-700 transition duration-300">
            View Blogs
          </button>
        </div>

        {isBlogsHidden ? null : (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {userBlogs.map((blog, index) => (
              <Link
                key={index}
                href={blog.link}
                className="block px-6 py-3 text-white text-center font-semibold bg-gradient-to-r from-indigo-500 to-pink-500 rounded-lg shadow hover:shadow-xl hover:from-indigo-600 hover:to-pink-600 transition duration-300"
              >
                {blog.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
