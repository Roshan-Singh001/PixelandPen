import React from "react";

const About = () => {
  return (
    <>
      <section className="dark:bg-gray-900 text-gray-800 dark:text-gray-100 px-4 py-12 sm:px-8 md:px-16 lg:px-24 xl:px-32">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold mb-8 text-center text-indigo-600 dark:text-indigo-400">
            About Pixel and Pen
          </h1>

          {/* Our Vision */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
            <p className="text-lg leading-relaxed">
              At <span className="font-bold">Pixel and Pen</span>, we believe in the power of words and visuals to inform, inspire, and ignite change.
              Our platform brings together passionate writers, designers, and readers from around the world to share compelling stories, fresh perspectives, and creative ideas.
            </p>
          </section>

          {/* What We Do */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">What We Do</h2>
            <p className="text-lg leading-relaxed mb-4">
              Pixel and Pen is a dynamic blog platform where:
            </p>
            <ul className="list-disc list-inside space-y-2 text-lg">
              <li>
                <strong>Contributors</strong> can write, design, and publish articles easily through a powerful and intuitive editor.
              </li>
              <li>
                <strong>Subscribers</strong> can follow their favorite authors, engage with articles, and receive personalized content recommendations.
              </li>
              <li>
                <strong>Admins</strong> manage the platform, moderate content, and ensure a smooth, secure user experience for all.
              </li>
            </ul>
            <p className="text-lg mt-4 leading-relaxed">
              Whether you're an aspiring blogger, a seasoned journalist, or a curious reader, Pixel and Pen gives you the tools and community to thrive.
            </p>
          </section>

          {/* Why Pixel and Pen */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">Why Pixel and Pen?</h2>
            <ul className="list-disc list-inside space-y-2 text-lg">
              <li>Clean, User-Friendly Dashboards tailored for each user type.</li>
              <li>Seamless Article Creation Tools for contributors.</li>
              <li>Rich Content Discovery for subscribers.</li>
              <li>A Collaborative Ecosystem that values creativity, credibility, and connection.</li>
            </ul>
          </section>

          {/* Join the Movement */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Join the Movement</h2>
            <p className="text-lg leading-relaxed">
              We’re not just a blog platform—we’re a <span className="font-bold">publishing revolution</span>.
              Join us to write boldly, read widely, and connect deeply.
            </p>
          </section>
        </div>
      </section>
    </>
  );
};

export default About;
