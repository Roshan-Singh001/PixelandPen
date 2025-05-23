import React from 'react';
import { FaGithub, FaLinkedin} from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";

const Contact = () => {
  const teamMembers = [
    {
      name: 'Roshan Singh',
      github: 'https://github.com/Roshan-Singh001',
      linkedin: 'https://www.linkedin.com/in/roshan-singh-b430132b1',
      twitter: 'https://x.com/oRoshanSingh',
    },
    {
      name: 'Suraj Singh Bhoj',
      github: '#',
      linkedin: '#',
      twitter: '#',
    },
    {
      name: 'Md Javed',
      github: '#',
      linkedin: '#',
      twitter: '#',
    },
  ];

  return (
    <section className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 px-4 py-12 sm:px-8 md:px-16 lg:px-24 xl:px-32">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-8 text-indigo-600 dark:text-indigo-400">
          Contact Us
        </h1>
        <p className="text-lg mb-12">
          Meet the team behind <span className="font-bold">Pixel and Pen</span>. Feel free to connect with us!
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-6 shadow hover:shadow-lg transition duration-300"
            >
              <h2 className="text-xl font-semibold mb-4">{member.name}</h2>
              <div className="flex justify-center space-x-6 text-2xl text-gray-700 dark:text-gray-300">
                <a
                  href={member.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  <FaGithub />
                </a>
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <FaLinkedin />
                </a>
                <a
                  href={member.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-sky-500 dark:hover:text-sky-400"
                >
                  <FaXTwitter />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Contact;
