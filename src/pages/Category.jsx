import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const API_KEY = "FavQGwLy5WRGoCTP3HGueoiVwBlfVPjKz2gLJ9wcgS8";

const Category = () => {
  const [images, setImages] = useState([]);
  const categories = [
    "Category 1",
    "Category 2",
    "Category 3",
    "Category 4",
    "Category 5",
  ];
  const combine = images.slice(0, 5).map((imgUrl, index) => {
    return { url: imgUrl, name: categories[index] };
  });

  const settings = {
    speed: 500, // Transition speed
    slidesToShow: 3, // Show 3 slides on larger screens
    slidesToScroll: 1, // Scroll one slide at a time
    autoplay: true, // Enable autoplay
    autoplaySpeed: 1000, // Autoplay speed
    arrows: false, // Disable navigation arrows
    responsive: [
      {
        breakpoint: 1024, // For screens smaller than 1024px
        settings: {
          slidesToShow: 2, // Show 2 slides
        },
      },
      {
        breakpoint: 640, // For screens smaller than 640px
        settings: {
          slidesToShow: 1, // Show 1 slide
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
      <div className="panel p-4 w-full md:h-[57vh] h-full  md:w-[98%] m-auto rounded-sm animated-gradient bg-gradient-to-r from-gray-200 to-gray-400 dark:from-gray-600 dark:to-gray-800 text-white">
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
            <Slider {...settings} className="flex ">
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

                  <div className="absolute bottom-0 left-0 w-[100%] bg-gradient-to-r from-black via-gray-800 to-black bg-opacity-80 rounded-l-lg rounded-br-lg rounded-t-none  flex opacity-65 justify-center items-center p-3 shadow-lg">
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

      <div className="main"></div>
    </div>
  );
};

export default Category;
