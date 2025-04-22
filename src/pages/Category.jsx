import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const API_KEY = "FavQGwLy5WRGoCTP3HGueoiVwBlfVPjKz2gLJ9wcgS8";

const Category = () => {
  const [images, setImages] = useState([]);
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

  const settings = {
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1000,
    arrows: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

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

      <div className="main flex flex-col mt-10 space-y-5">
        <div className="Heading dark:text-white m-auto text-3xl font-semibold">
          Categories
        </div>

        <div className="flex h-[100vh] w-full px-4 gap-4">
          <div className="w-[14%] left-side space-y-4  overflow-y-auto bg-gray-300 dark:bg-gray-700 rounded p-4">
            <div className="flex flex-col space-y-4  dark:text-white">
              {combine.map((com, idx) => {
                return (
                  <div key={idx} className="relative  rounded-md">
                    <img
                      src={com.url}
                      alt={com.name}
                      className="w-full   rounded-md"
                    />
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-r from-black via-gray-800 to-black bg-opacity-80 rounded-b-md flex opacity-65 justify-center items-center p-3 shadow-lg">
                      <h3 className="text-lg font-semibold text-white">
                        {com.name}
                      </h3>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="w-[86%] overflow-y-auto bg-white dark:bg-gray-800 p-4 rounded shadow">
            {combine.map((com, idx) => {
              return (
                <div
                  key={idx}
                  className="flex flex-col space-y-5 mt-2 justify-center"
                >
                  <div className="category-name font-extrabold dark:text-white text-xl mx-auto">
                    {com.name}
                  </div>

                  <div className="cards flex-wrap flex gap-8 justify-center">
                    {combine.map((com, idx) => {
                      return (
                        <div
                          key={idx}
                          className="card space-y-2 flex-col w-[18rem] shadow-xl p-2 dark:bg-slate-700 rounded-md bg-gray-100"
                        >
                          <div className="p-2 h-48 w-[280px]">
                            <img
                              src={com.url}
                              className="card-img object-cover rounded-md w-full h-full"
                              alt="card-img"
                            />
                          </div>
                          <span className="bg-blue-200 dark:bg-blue-600 text-xs rounded-md p-2">
                            {com.name}
                          </span>
                          <p className="md:text-[1.3rem] font-semibold">
                            The impact of Technology on workplace: How
                            Technology is changing.
                          </p>
                          <div className="information-writer space-x-6 items-center flex flex-wrap">
                            <img src="" alt="profile" className="size-8" />
                            <p className="dark:text-gray-200 text-gray-500 text-sm">
                              Anglena Jolie
                            </p>
                            <p className="dark:text-gray-200 text-gray-500 text-sm">
                              August 20,2020
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Category;
