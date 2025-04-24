import React, { useEffect, useState, useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaAnglesRight } from "react-icons/fa6";
const API_KEY = "FavQGwLy5WRGoCTP3HGueoiVwBlfVPjKz2gLJ9wcgS8";

const navStyle = {
  cursor: "pointer",
  position: "relative",
};

const sectionStyle = {
  padding: "20px",
  marginBottom: "80px",
};

const Category = () => {
  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  const [isActive, setIsActive] = useState(false);
  const [images, setImages] = useState([]);
  const sectionRefs = useRef([]);

  const categories = [
    "Lifestyle",
    "Travel & Adventure",
    "Food & Recipes",
    "Health & Wellness",
    "Personal Development",
    "Finance & Budgeting",
    "Technology & Gadgets",
    "Productivity Hacks",
    "Home & Decor",
    "Parenting & Family",
    "Fashion & Style",
    "Beauty & Skincare",
    "Fitness & Workouts",
    "Entertainment & Pop Culture",
    "Books & Reviews",
    "Career & Work Life",
    "Mindfulness & Meditation",
    "DIY & Crafts",
    "Marketing & Business",
    "Photography & Design",
  ];

  const combine = images.slice(0, 5).map((imgUrl, index) => {
    return { url: imgUrl, name: categories[index] };
  });

  useEffect(() => {
    sectionRefs.current = Array(combine.length)
      .fill()
      .map((_, i) => sectionRefs.current[i] || React.createRef());
  }, [combine.length]);

  const settings = {
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    arrows: false,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } },
    ],
  };

  useEffect(() => {
    console.log(isActive);
  }, [isActive]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(
          `https://api.unsplash.com/photos/?client_id=${API_KEY}`
        );
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        setImages(data.map((img) => img.urls.regular));
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    fetchImages();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Top Section */}
      <div className="panel p-4 w-full md:h-[57vh] h-full md:w-[98%] m-auto rounded-sm animated-gradient bg-gradient-to-r from-gray-200 to-gray-400 dark:from-gray-600 dark:to-gray-800 text-white">
        <div className="heading flex flex-col space-y-5 justify-center">
          <div className="flex container mx-auto text-center flex-col items-center">
            <h1 className="md:text-5xl text-3xl dark:text-white text-slate-800 font-bold">
              Start Exploring
            </h1>
            <h1 className="md:text-2xl text-xl dark:text-white text-slate-800">
              There’s Something for Everyone
            </h1>
          </div>
          <div className="slider-container w-[98%] m-auto">
            <Slider {...settings} className="flex">
              {combine.map((com, idx) => (
                <div
                  key={idx}
                  className="relative rounded-tl-3xl rounded-t-3xl"
                >
                  <img
                    src={com.url}
                    alt={com.name}
                    className="category-panel-card rounded-lg w-full"
                  />
                  <div className="absolute bottom-0 left-0 w-full bg-gradient-to-r from-black via-gray-800 to-black bg-opacity-80 rounded-l-lg rounded-br-lg rounded-t-none flex opacity-65 justify-center items-center p-3 shadow-lg">
                    <h3 className="text-lg font-semibold text-white tracking-wide">
                      {com.name}
                    </h3>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </div>

      {/* Main Section */}
      <div className="main flex flex-col mb-10 mt-10 space-y-5">
        <div className="heading flex justify-center">
          <h1 className="animated-gradient bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 p-2 dark:to-purple-700 text-white text-[1.9rem] font-semibold rounded-md">
            Categories
          </h1>
        </div>

        <div className="flex w-full h-[100vh] relative px-4 gap-4">
          {/* Sidebar Nav */}
          <div
            className={`xl:w-[15%] z-10   overflow-hidden left-side space-y-4 overflow-y-auto bg-gray-300 dark:bg-gray-700 rounded xl:p-4 ${
              isActive ? "active" : "notActive"
            }`}
          >
            <div className="relative xl:hidden p-2">
              <FaAnglesRight
                className="absolute bg-white rounded-xl m-1  top-0 z-20 right-0"
                size={24}
                onClick={() => setIsActive((prev) => !prev)}
              />
            </div>
            <div className="flex flex-col space-y-4 dark:text-white">
              {combine.map((com, idx) => (
                <div
                  key={idx}
                  style={navStyle}
                  onClick={() => scrollToSection(sectionRefs.current[idx])}
                  className={`relative  rounded-md w-[200px] xl:w-full`}
                >
                  <img
                    src={com.url}
                    alt={com.name}
                    className="w-full object-cover overflow-hidden rounded-md"
                  />
                  <div className="absolute bottom-0 left-0 w-full bg-gradient-to-r from-black via-gray-800 to-black bg-opacity-80 rounded-b-md flex opacity-65 justify-center items-center p-3 shadow-lg">
                    <h3 className="text-lg font-semibold text-white">
                      {com.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Section */}
          <div className="xl:w-[86%] w-full overflow-y-auto bg-gray-300 dark:bg-gray-800 p-4 rounded shadow">
            {combine.map((com, idx) => (
              <div
                ref={sectionRefs.current[idx]}
                style={sectionStyle}
                key={idx}
                className="flex flex-col space-y-5 mt-5 justify-center px-4 md:px-8"
              >
                <div className="category-name font-extrabold dark:text-white text-2xl md:text-4xl text-center">
                  {com.name}
                </div>

                <div className="cards  flex flex-wrap gap-6 justify-center">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="card dark:text-white flex flex-col space-y-3 w-full sm:w-[300px] md:w-[260px] lg:w-[280px] shadow-xl p-4 dark:bg-slate-700 rounded-md bg-gray-100"
                    >
                      <div className="p-1 h-48 w-full">
                        <img
                          src={com.url}
                          className="card-img object-cover rounded-md w-full h-full"
                          alt="card-img"
                        />
                      </div>

                      <span className="bg-blue-200 dark:bg-blue-600 text-xs rounded-md p-2 w-max">
                        {com.name}
                      </span>

                      <p className="text-base md:text-[1.1rem] font-semibold">
                        The impact of Technology on workplace: How Technology is
                        changing.
                      </p>

                      <div className="information-writer flex items-center gap-4 flex-wrap">
                        <img
                          src=""
                          alt="Author profile"
                          className="size-8 rounded-full bg-gray-300"
                        />
                        <p className="dark:text-gray-200 text-gray-500 text-sm">
                          Anglena Jolie
                        </p>
                        <p className="dark:text-gray-200 text-gray-500 text-sm">
                          August 20, 2020
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Category;
