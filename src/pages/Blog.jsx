import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, User, Calendar, Clock, Eye, Heart, BookmarkPlus, Share2, Star, TrendingUp, Award, Zap } from 'lucide-react';

// Enhanced Hero Slider component
const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const slides = [
    {
      title: "The Future of Artificial Intelligence in Modern Workplaces",
      category: "Technology",
      author: "Sarah Johnson",
      date: "December 15, 2024",
      readTime: "8 min read",
      views: "2.3K",
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=600&fit=crop'
    },
    {
      title: "Sustainable Development: Building Tomorrow's Green Cities",
      category: "Environment",
      author: "Michael Chen",
      date: "December 12, 2024",
      readTime: "6 min read",
      views: "1.8K",
      image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=600&fit=crop'
    },
    {
      title: "Remote Work Revolution: Tools and Strategies for Success",
      category: "Business",
      author: "Emma Rodriguez",
      date: "December 10, 2024",
      readTime: "5 min read",
      views: "3.1K",
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=600&fit=crop'
    }
  ];

  useEffect(() => {
    if (isAutoPlay) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [isAutoPlay, slides.length]);

  const changeSlide = (direction) => {
    setCurrentSlide((prev) => {
      if (direction === "next") return prev === slides.length - 1 ? 0 : prev + 1;
      return prev === 0 ? slides.length - 1 : prev - 1;
    });
  };

  return (
    <div 
      className="relative h-[50vh] sm:h-[60vh] lg:h-[70vh] rounded-2xl sm:rounded-3xl overflow-hidden group shadow-2xl"
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(true)}
    >
      <div className="absolute inset-0">
        <img
          src={slides[currentSlide].image}
          className="w-full h-full object-cover transition-all duration-700 ease-in-out"
          alt={`Slide ${currentSlide + 1}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
      </div>

      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
        <div className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1 sm:px-4 sm:py-2 text-white font-medium text-sm">
          {currentSlide + 1} / {slides.length}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-8 sm:right-8 z-10">
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 max-w-2xl shadow-2xl">
          <div className="mb-3 sm:mb-4">
            <span className="inline-block px-3 py-1 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs sm:text-sm font-semibold rounded-full">
              {slides[currentSlide].category}
            </span>
          </div>
          
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 leading-tight">
            {slides[currentSlide].title}
          </h2>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white text-xs sm:text-sm">
                  {slides[currentSlide].author}
                </p>
                <div className="flex items-center space-x-2 sm:space-x-3 text-xs text-slate-600 dark:text-slate-400">
                  <span className="hidden sm:inline">{slides[currentSlide].date}</span>
                  <span className="sm:hidden">{slides[currentSlide].date.split(',')[0]}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>{slides[currentSlide].readTime}</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">{slides[currentSlide].views} views</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => changeSlide("prev")}
        className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 backdrop-blur-md hover:bg-white/30 rounded-full p-2 sm:p-3 text-white transition-all duration-200 opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
      <button
        onClick={() => changeSlide("next")}
        className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 backdrop-blur-md hover:bg-white/30 rounded-full p-2 sm:p-3 text-white transition-all duration-200 opacity-0 group-hover:opacity-100"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </div>
  );
};

// Latest Posts Slider Component
const LatestPostsSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const posts = [
    {
      title: "Machine Learning Algorithms: A Comprehensive Guide",
      category: "AI & ML",
      author: "Dr. James Wilson",
      date: "Dec 14, 2024",
      readTime: "12 min",
      views: "4.2K",
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop'
    },
    {
      title: "Sustainable Web Design: Eco-Friendly Digital Experiences",
      category: "Web Design",
      author: "Lisa Chang",
      date: "Dec 13, 2024",
      readTime: "8 min",
      views: "2.8K",
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop'
    },
    {
      title: "Quantum Computing: What It Means for the Future",
      category: "Quantum Tech",
      author: "Prof. Alan Kumar",
      date: "Dec 12, 2024",
      readTime: "15 min",
      views: "6.1K",
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop'
    },
    {
      title: "Blockchain Beyond Cryptocurrency Applications",
      category: "Blockchain",
      author: "Maria Santos",
      date: "Dec 11, 2024",
      readTime: "10 min",
      views: "3.5K",
      image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&h=300&fit=crop'
    },
    {
      title: "Cloud Computing Security Best Practices",
      category: "Cloud Security",
      author: "Robert Kim",
      date: "Dec 10, 2024",
      readTime: "9 min",
      views: "2.9K",
      image: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=400&h=300&fit=crop'
    }
  ];

  const maxIndex = isMobile ? posts.length - 1 : Math.max(0, posts.length - 3);
  const itemWidth = isMobile ? 100 : 33.333;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % (maxIndex + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + maxIndex + 1) % (maxIndex + 1));
  };

  return (
    <div className="relative">
      <div className="">
        <div 
          className="flex overflow-x-hidden py-4 transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * itemWidth}%)` }}
        >
          {posts.map((post, index) => (
            <div key={index} className={`${isMobile ? 'w-full' : 'w-1/3'} overflow-hidden flex-shrink-0 px-2 sm:px-3`}>
              <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="relative h-40 sm:h-48 overflow-hidden">
                  <img
                    src={post.image}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    alt={post.title}
                  />
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                    <span className="px-2 py-1 sm:px-3 sm:py-1 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-semibold rounded-full">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  <div className="flex items-center space-x-2 sm:space-x-3 mb-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white">{post.author}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{post.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>{post.readTime} read</span>
                    <span>{post.views} views</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <button
        onClick={prevSlide}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 sm:-translate-x-4 bg-white dark:bg-slate-800 shadow-lg rounded-full p-2 sm:p-3 hover:shadow-xl transition-all duration-200"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-400" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2 sm:translate-x-4 bg-white dark:bg-slate-800 shadow-lg rounded-full p-2 sm:p-3 hover:shadow-xl transition-all duration-200"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-400" />
      </button>
    </div>
  );
};

// Section Header Component
const SectionHeader = ({ icon: Icon, title, subtitle, gradient }) => (
  <div className="text-center mb-6 sm:mb-8">
    <div className="flex items-center justify-center mb-3 sm:mb-4">
      <div className={`p-2 sm:p-3 rounded-full bg-gradient-to-r ${gradient} mr-2 sm:mr-3`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </div>
      <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
        {title}
      </h2>
    </div>
    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto px-4">
      {subtitle}
    </p>
  </div>
);

// Category Card Component
const CategoryCard = ({ category, count, color, image }) => (
  <div className="group cursor-pointer">
    <div className="relative h-24 sm:h-28 lg:h-32 rounded-xl sm:rounded-2xl overflow-hidden mb-3 sm:mb-4">
      <img src={image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" alt={category} />
      <div className={`absolute inset-0 bg-gradient-to-t ${color} opacity-80`}></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white px-2">
          <h3 className="text-sm sm:text-lg lg:text-xl font-bold mb-1">{category}</h3>
          <p className="text-xs sm:text-sm opacity-90">{count} articles</p>
        </div>
      </div>
    </div>
  </div>
);

// Article Card Component
const ArticleCard = ({ article, showStats = false }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
    <div className="flex items-start space-x-3 sm:space-x-4">
      <img
        src={article.image}
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl object-cover flex-shrink-0"
        alt={article.title}
      />
      <div className="flex-1 min-w-0">
        <div className="mb-2">
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold rounded-full">
            {article.category}
          </span>
        </div>
        <h3 className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
          {article.title}
        </h3>
        <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          <span className="truncate">{article.author}</span>
          <span>•</span>
          <span>{article.date}</span>
          {showStats && (
            <>
              <span className="hidden sm:inline">•</span>
              <div className="hidden sm:flex items-center space-x-1">
                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{article.views}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  </div>
);

// Author Card Component
const AuthorCard = ({ author }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 text-center">
    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-3 sm:mb-4">
      <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
    </div>
    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">{author.name}</h3>
    <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mb-3 sm:mb-4">{author.specialty}</p>
    <div className="flex justify-center space-x-4 sm:space-x-6 text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-3 sm:mb-4">
      <div className="text-center">
        <div className="font-bold text-slate-900 dark:text-white">{author.followers}</div>
        <div>Followers</div>
      </div>
      <div className="text-center">
        <div className="font-bold text-slate-900 dark:text-white">{author.articles}</div>
        <div>Articles</div>
      </div>
    </div>
    <button className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
      Follow
    </button>
  </div>
);

// Main HomePage component
const HomePage = () => {
  const categories = [
    { name: "Technology", count: 128, color: "from-blue-600/70 to-blue-800/70", image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop" },
    { name: "Design", count: 89, color: "from-purple-600/70 to-purple-800/70", image: "https://images.unsplash.com/photo-1561736778-92e52a7769ef?w=300&h=200&fit=crop" },
    { name: "Business", count: 156, color: "from-green-600/70 to-green-800/70", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop" },
    { name: "Science", count: 73, color: "from-red-600/70 to-red-800/70", image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=300&h=200&fit=crop" },
    { name: "Health", count: 95, color: "from-teal-600/70 to-teal-800/70", image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop" },
    { name: "Lifestyle", count: 112, color: "from-orange-600/70 to-orange-800/70", image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=200&fit=crop" }
  ];

  const mostViewedArticles = [
    { title: "Complete Guide to React Performance Optimization", author: "John Doe", date: "Dec 15", category: "React", views: "12.5K", image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=100&h=100&fit=crop" },
    { title: "Advanced CSS Grid Techniques for Modern Layouts", author: "Jane Smith", date: "Dec 14", category: "CSS", views: "9.8K", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
    { title: "Building Scalable Node.js Applications", author: "Mike Johnson", date: "Dec 13", category: "Node.js", views: "8.2K", image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=100&h=100&fit=crop" }
  ];

  const featuredArticles = [
    { title: "The Future of Web Development: Trends to Watch in 2025", author: "Sarah Wilson", date: "Dec 16", category: "Web Dev", views: "15.2K", image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=100&h=100&fit=crop" },
    { title: "AI-Powered Design Tools: Revolutionizing Creative Workflows", author: "Alex Chen", date: "Dec 15", category: "AI Design", views: "11.7K", image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=100&h=100&fit=crop" }
  ];

  const topAuthors = [
    { name: "Dr. Sarah Johnson", specialty: "AI & Machine Learning", followers: "25.4K", articles: 89 },
    { name: "Michael Chen", specialty: "Web Development", followers: "19.2K", articles: 156 },
    { name: "Lisa Rodriguez", specialty: "UX/UI Design", followers: "22.8K", articles: 73 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Hero Slider */}
        <div className="mb-8 sm:mb-12 lg:mb-16">
          <HeroSlider />
        </div>

        {/* Latest Posts Slider */}
        <section className="mb-8 sm:mb-12 lg:mb-16">
          <SectionHeader 
            icon={Clock}
            title="Latest Posts"
            subtitle="Stay updated with our newest articles and insights"
            gradient="from-green-600 to-blue-600"
          />
          <LatestPostsSlider />
        </section>

        {/* Categories Section */}
        <section className="mb-8 sm:mb-12 lg:mb-16">
          <SectionHeader 
            icon={Star}
            title="Explore Categories"
            subtitle="Discover content across various topics and interests"
            gradient="from-blue-600 to-purple-600"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((category, index) => (
              <CategoryCard key={index} {...category} />
            ))}
          </div>
        </section>

        

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12 lg:mb-16">
          {/* Most Viewed Articles */}
          <div className="lg:col-span-1">
            <SectionHeader 
              icon={TrendingUp}
              title="Most Viewed"
              subtitle="Popular articles this week"
              gradient="from-red-600 to-pink-600"
            />
            <div className="space-y-3 sm:space-y-4">
              {mostViewedArticles.map((article, index) => (
                <ArticleCard key={index} article={article} showStats={true} />
              ))}
            </div>
          </div>

          {/* Featured Articles */}
          <div className="lg:col-span-1">
            <SectionHeader 
              icon={Award}
              title="Featured"
              subtitle="Editor's choice articles"
              gradient="from-yellow-600 to-orange-600"
            />
            <div className="space-y-3 sm:space-y-4">
              {featuredArticles.map((article, index) => (
                <ArticleCard key={index} article={article} />
              ))}
            </div>
          </div>

          {/* Top Contributors */}
          <div className="lg:col-span-1">
            <SectionHeader 
              icon={Zap}
              title="Top Contributors"
              subtitle="Most followed writers"
              gradient="from-purple-600 to-indigo-600"
            />
            <div className="space-y-3 sm:space-y-4">
              {topAuthors.map((author, index) => (
                <AuthorCard key={index} author={author} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
