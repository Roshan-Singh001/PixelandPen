import React, { useState, useEffect } from "react";
import Footer from "../components/Footer";

// Enhanced Slider component with auto-slide
const Slider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [images, setImages] = useState(Array(4).fill(null));
  const API_KEY = " ";

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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === 3 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const changeSlide = (direction) => {
    setCurrentSlide((prev) => {
      if (direction === "next") return prev === 3 ? 0 : prev + 1;
      return prev === 0 ? 3 : prev - 1;
    });
  };

  const SlideCard = () => (
    <div className="card opacity-100 space-y-4 flex-col dark:text-white dark:bg-gray-800 text-black absolute bottom-0 left-3 md:left-12 rounded-md p-4 bg-gray-100 shadow-xl w-[50%] h-[16rem] md:w-[27%] md:h-[13rem]">
      <span className="bg-slate-700 text-white p-1 rounded-md">Technology</span>
      <p className="md:text-2xl font-semibold">
        The impact of Technology on workplace: How Technology is changing.
      </p>
      <div className="information-writer space-x-6 items-center flex flex-wrap">
        <img src="/api/placeholder/32/32" alt="profile" className="size-8" />
        <p className="text-gray-500 text-sm">Anglena Jolie</p>
        <p className="text-gray-500 text-sm">August 20,2020</p>
      </div>
    </div>
  );

  return (
    <div className="slider relative">
      {images.map((image, index) => (
        <div
          key={index}
          className={`slide md:h-[34rem] h-[42] relative ${
            index === currentSlide ? "" : "hidden"
          }`}
        >
          <div className="pgno absolute top-0 left-4 antialiased animate-fade text-gray-300">
            {index + 1} / 4
          </div>
          <img
            src={image || "/api/placeholder/1200/800"}
            className="rounded-md h-[42rem] md:h-[32rem] w-[98%] m-auto object-cover slider-img"
            alt={`Slide ${index + 1}`}
          />
          <SlideCard />
        </div>
      ))}
      <button
        onClick={() => changeSlide("prev")}
        className="prev absolute top-40 text-white p-2 hover:bg-slate-50 focus:text-black focus:bg-slate-50 hover:text-black hover:cursor-pointer left-3"
      >
        &#10094;
      </button>
      <button
        onClick={() => changeSlide("next")}
        className="next absolute top-40 text-white p-2 hover:bg-slate-50 focus:text-black focus:bg-slate-50 hover:text-black hover:cursor-pointer right-3"
      >
        &#10095;
      </button>
    </div>
  );
};

// Enhanced BlogCard component with image fetching
const BlogCard = () => {
  const [cardImage, setCardImage] = useState(null);
  const API_KEY = " ";

  useEffect(() => {
    const fetchCardImage = async () => {
      try {
        const response = await fetch(
          `https://api.unsplash.com/photos/?client_id=${API_KEY}`
        );
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        const randomIndex = Math.floor(Math.random() * data.length);
        setCardImage(data[randomIndex].urls.small_s3);
      } catch (error) {
        console.error("Error fetching card image:", error);
      }
    };

    fetchCardImage();
  }, []);

  return (
    <div className="card space-y-2 flex-col w-[18rem] shadow-xl p-2 dark:bg-slate-700 rounded-md bg-gray-100">
      <div className="p-2 h-48 w-[280px]">
        <img
          src={cardImage || "/api/placeholder/280/192"}
          className="card-img object-cover rounded-md w-full h-full"
          alt="card-img"
        />
      </div>
      <span className="bg-blue-200 dark:bg-blue-600 text-xs rounded-md p-2">
        Technology
      </span>
      <p className="md:text-[1.3rem] font-semibold">
        The impact of Technology on workplace: How Technology is changing.
      </p>
      <div className="information-writer space-x-6 items-center flex flex-wrap">
        <img src="/api/placeholder/32/32" alt="profile" className="size-8" />
        <p className="dark:text-gray-200 text-gray-500 text-sm">
          Anglena Jolie
        </p>
        <p className="dark:text-gray-200 text-gray-500 text-sm">
          August 20,2020
        </p>
      </div>
    </div>
  );
};

// Main App component
const HomePage = () => {
  return (
    <>
      <div className="background-colors m-4 text-black dark:text-white">
        <Slider />
        <div className=" dark:bg-gray-800 relative m-auto dark:text-white  bg-gray-200 rounded-md text-black text-xl flex-col mt-[2rem] md:w-[97%]  p-2 w-[100%] ">
          <div className="heading flex justify-center">
            <h1 className="animated-gradient bg-gradient-to-r  from-blue-500 to-purple-600 dark:from-blue-600 p-2 dark:to-purple-700 text-white text-[1.9rem] font-semibold rounded-md">
              Latest Post
            </h1>
          </div>
          <div className="flex flex-wrap gap-4 justify-center items-center mt-4 p-2 rounded-md">
            {[...Array(8)].map((_, index) => (
              <BlogCard key={index} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
