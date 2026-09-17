import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AxiosInstance from "../api/axiosInstance";
import {
  Search, Clock, ArrowRight, FileText, TrendingUp, Tag, Eye,
  UserRound, Sparkles, Flame, ChevronLeft, ChevronRight, X, Loader2, SearchX
} from "lucide-react";
import MetaData from "../components/MetaData";

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatNumber(num) {
  const n = num || 0;
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString();
}

const HomePage = () => {

  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Articles · Pixel & Pen';
  }, []);

  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [latestArticles, setLatestArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [trending, setTrending] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const [featuredRes, latestRes, categoriesRes, trendingRes] = await Promise.allSettled([
        AxiosInstance.get('/article/featured'),
        AxiosInstance.get('/article/latest'),
        AxiosInstance.get('/article/categories'),
        AxiosInstance.get('/article/trending'),
      ]);

      const allFailed = [featuredRes, latestRes, categoriesRes, trendingRes].every((r) => r.status === 'rejected');

      if (allFailed) {
        setLoadError("Couldn't load articles. Please try again later.");
      } else {
        setFeaturedArticles(featuredRes.status === 'fulfilled' ? (featuredRes.value.data.articles || []) : []);
        setLatestArticles(latestRes.status === 'fulfilled' ? (latestRes.value.data.articles || []) : []);
        setCategories(categoriesRes.status === 'fulfilled' ? (categoriesRes.value.data.categories || []) : []);
        setTrending(trendingRes.status === 'fulfilled' ? (trendingRes.value.data.articles || []) : []);
      }
    } catch (error) {
      console.log(error);
      setLoadError("Couldn't load articles. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    const query = searchInput.trim();
    if (!query) return;

    setActiveQuery(query);
    setIsSearching(true);
    setSearchError("");
    window.scrollTo({ top: 0, behavior: 'smooth' });

    AxiosInstance.get('/article/search', { params: { q: query } })
      .then((res) => {
        setSearchResults(res.data.articles || []);
      })
      .catch((err) => {
        console.log(err);
        setSearchError("Couldn't complete the search. Please try again.");
        setSearchResults([]);
      })
      .finally(() => setIsSearching(false));
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleClearSearch = () => {
    setActiveQuery("");
    setSearchInput("");
    setSearchResults([]);
    setSearchError("");
  };

  const handleReadArticle = (slug) => {
    navigate(`/view/${slug}`);
  };

  const handleViewAll = () => {
    window.open('/article/latest', '_blank', 'noopener,noreferrer');
  };

  const handleCategoryClick = (categorySlug) => {
    navigate(`/category/${categorySlug}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#0B1220] font-['Inter',sans-serif]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-14">
          <div className="h-14 bg-[#E5E7EB] dark:bg-[#243247] rounded-full w-full max-w-2xl mx-auto animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="h-72 lg:h-96 bg-[#E5E7EB] dark:bg-[#243247] rounded-2xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-5 bg-[#E5E7EB] dark:bg-[#243247] rounded-full w-24 animate-pulse" />
              <div className="h-9 bg-[#E5E7EB] dark:bg-[#243247] rounded w-full animate-pulse" />
              <div className="h-9 bg-[#E5E7EB] dark:bg-[#243247] rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-[#E5E7EB] dark:bg-[#243247] rounded w-full animate-pulse mt-4" />
              <div className="h-4 bg-[#E5E7EB] dark:bg-[#243247] rounded w-5/6 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isShowingSearch = activeQuery !== "";

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#0B1220] font-['Inter',sans-serif]">
      <MetaData
        title="Articles"
        description="Fresh writing on technology, design, and the way we work — curated daily."
        url="/articles"
      />

      {/* Hero / Search band */}
      <div className="relative overflow-hidden bg-[#1E3A5F] dark:bg-[#0B1220] dark:border-b dark:border-[#243247]">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,.10) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center">
          <h1 className="font-[Newsreader,Georgia,serif] text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-4 max-w-2xl mx-auto">
            Ideas worth your attention
          </h1>
          <p className="text-sm sm:text-base text-white/50 mb-8 max-w-xl mx-auto">
            Fresh writing on technology, design, and the way we work — curated daily.
          </p>

          <div className="max-w-xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] dark:text-[#AAB4C5]" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search articles, topics, authors..."
                className="w-full pl-11 pr-10 py-3.5 text-sm rounded-full border-0 bg-white dark:bg-[#162033] text-[#1F2937] dark:text-[#F8FAFC] placeholder-[#6B7280]/60 dark:placeholder-[#AAB4C5]/50 focus:outline-none focus:ring-4 focus:ring-white/20 shadow-lg shadow-black/10 transition-shadow"
              />
              {isShowingSearch && (
                <button
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#6B7280] dark:text-[#AAB4C5] hover:bg-[#1E3A5F]/5 dark:hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="inline-flex items-center gap-1.5 px-6 py-3.5 text-sm font-semibold rounded-full text-[#1E3A5F] dark:text-[#0B1220] bg-white hover:bg-white/90 shadow-lg shadow-black/10 transition-colors shrink-0 disabled:opacity-70"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span className="hidden sm:inline">{isSearching ? "Searching…" : "Search"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">

        {loadError && !isShowingSearch && (
          <div className="mb-14 p-4 bg-[#DC2626]/10 dark:bg-[#EF4444]/10 border border-[#DC2626]/20 dark:border-[#EF4444]/20 rounded-xl text-center">
            <p className="text-sm font-medium text-[#DC2626] dark:text-[#EF4444]">{loadError}</p>
          </div>
        )}

        {isShowingSearch ? (
          /* ---------------- Search results (replaces homepage content) ---------------- */
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10">
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-[#1E3A5F] dark:text-[#4F8EF7] mb-1.5">
                  Search results
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#1F2937] dark:text-[#F8FAFC]">
                  {isSearching ? (
                    <>Searching for "{activeQuery}"…</>
                  ) : (
                    <>
                      {searchResults.length} result{searchResults.length === 1 ? '' : 's'} for "{activeQuery}"
                    </>
                  )}
                </h2>
              </div>
              <button
                onClick={handleClearSearch}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-full border-2 border-[#1E3A5F] dark:border-[#4F8EF7] text-[#1E3A5F] dark:text-[#4F8EF7] hover:bg-[#1E3A5F] hover:text-white dark:hover:bg-[#4F8EF7] dark:hover:text-[#0B1220] transition-colors self-start sm:self-auto shrink-0"
              >
                <X className="w-4 h-4" />
                Back to Home
              </button>
            </div>

            {isSearching ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="bg-white dark:bg-[#162033] border border-[#E5E7EB] dark:border-[#243247] rounded-2xl overflow-hidden animate-pulse">
                    <div className="h-44 bg-[#E5E7EB] dark:bg-[#243247]" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-[#E5E7EB] dark:bg-[#243247] rounded w-full" />
                      <div className="h-4 bg-[#E5E7EB] dark:bg-[#243247] rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : searchError ? (
              <div className="text-center py-16 border border-dashed border-[#E5E7EB] dark:border-[#243247] rounded-2xl">
                <p className="text-sm text-[#DC2626] dark:text-[#EF4444] mb-4">{searchError}</p>
                <button
                  onClick={handleSearch}
                  className="px-5 py-2.5 text-sm font-semibold rounded-full text-white bg-[#1E3A5F] dark:bg-[#4F8EF7] dark:text-[#0B1220] hover:bg-[#16304f] dark:hover:bg-[#3f7de0] transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((article) => (
                  <ArticleResultCard key={article.article_id} article={article} onRead={handleReadArticle} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center text-center py-20 border border-dashed border-[#E5E7EB] dark:border-[#243247] rounded-2xl">
                <div className="w-14 h-14 rounded-2xl bg-[#1E3A5F]/5 dark:bg-[#4F8EF7]/10 flex items-center justify-center mb-4">
                  <SearchX className="w-6 h-6 text-[#6B7280] dark:text-[#AAB4C5]" />
                </div>
                <p className="text-base font-semibold text-[#1F2937] dark:text-[#F8FAFC] mb-1.5">
                  No articles found for "{activeQuery}"
                </p>
                <p className="text-sm text-[#6B7280] dark:text-[#AAB4C5] max-w-xs">
                  Try a different keyword, or browse categories and the latest articles instead.
                </p>
                <button
                  onClick={handleClearSearch}
                  className="mt-6 inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-full text-white bg-[#1E3A5F] dark:bg-[#4F8EF7] dark:text-[#0B1220] hover:bg-[#16304f] dark:hover:bg-[#3f7de0] transition-colors"
                >
                  Back to Home
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </section>
        ) : (
          /* ---------------- Normal homepage content ---------------- */
          <>
            {/* Featured Articles */}
            {featuredArticles.length > 0 && (
              <section className="mb-16 sm:mb-24 group">
                <FeaturedSlider articles={featuredArticles} onRead={handleReadArticle} />
              </section>
            )}

            <div className="h-px bg-gradient-to-r from-transparent via-[#E5E7EB] dark:via-[#243247] to-transparent mb-16 sm:mb-24" />

            {/* Latest Articles */}
            <section className="mb-16 sm:mb-24">
              <div className="flex items-end justify-between mb-8 sm:mb-10">
                <div>
                  <p className="text-xs font-semibold tracking-widest uppercase text-[#1E3A5F] dark:text-[#4F8EF7] mb-1.5">
                    Fresh off the press
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#1F2937] dark:text-[#F8FAFC]">Latest Articles</h2>
                </div>
              </div>

              {latestArticles.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {latestArticles.map((article) => (
                      <ArticleResultCard key={article.article_id} article={article} onRead={handleReadArticle} />
                    ))}
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={handleViewAll}
                      className="inline-flex items-center gap-1.5 px-6 py-3 text-sm font-semibold rounded-full border-2 border-[#1E3A5F] dark:border-[#4F8EF7] text-[#1E3A5F] dark:text-[#4F8EF7] hover:bg-[#1E3A5F] hover:text-white dark:hover:bg-[#4F8EF7] dark:hover:text-[#0B1220] transition-colors"
                    >
                      View All Articles
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-16 border border-dashed border-[#E5E7EB] dark:border-[#243247] rounded-2xl">
                  <FileText className="w-8 h-8 text-[#6B7280] dark:text-[#AAB4C5] mx-auto mb-3" />
                  <p className="text-sm text-[#6B7280] dark:text-[#AAB4C5]">No articles yet</p>
                </div>
              )}
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-[#E5E7EB] dark:via-[#243247] to-transparent mb-16 sm:mb-24" />

            {/* Categories + Trending */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-8">

              {/* Categories */}
              <section className="lg:col-span-3">
                <div className="flex items-center gap-2.5 mb-7">
                  <div className="w-9 h-9 rounded-lg bg-[#1E3A5F]/10 dark:bg-[#4F8EF7]/15 flex items-center justify-center shrink-0">
                    <Tag className="w-4 h-4 text-[#1E3A5F] dark:text-[#4F8EF7]" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#1F2937] dark:text-[#F8FAFC]">Categories</h2>
                </div>

                {categories.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryClick(category.slug)}
                        className="group flex items-center justify-between gap-2 px-4 py-3.5 rounded-xl border border-[#E5E7EB] dark:border-[#243247] bg-white dark:bg-[#162033] hover:border-[#1E3A5F] dark:hover:border-[#4F8EF7] hover:shadow-md transition-all"
                      >
                        <span className="text-sm font-semibold text-[#1F2937] dark:text-[#F8FAFC] group-hover:text-[#1E3A5F] dark:group-hover:text-[#4F8EF7] transition-colors truncate">
                          {category.name}
                        </span>
                        {category.article_count != null && (
                          <span className="text-xs font-medium text-[#6B7280] dark:text-[#AAB4C5] shrink-0">
                            {category.article_count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#6B7280] dark:text-[#AAB4C5]">No categories yet</p>
                )}
              </section>

              {/* Trending */}
              <section className="lg:col-span-2">
                <div className="flex items-center gap-2.5 mb-7">
                  <div className="w-9 h-9 rounded-lg bg-[#F97316]/10 dark:bg-[#FF8A3D]/15 flex items-center justify-center shrink-0">
                    <Flame className="w-4 h-4 text-[#F97316] dark:text-[#FF8A3D]" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#1F2937] dark:text-[#F8FAFC]">Trending</h2>
                </div>

                {trending.length > 0 ? (
                  <div className="bg-white dark:bg-[#162033] border border-[#E5E7EB] dark:border-[#243247] rounded-2xl overflow-hidden">
                    {trending.map((article, index) => (
                      <button
                        key={article.article_id}
                        onClick={() => handleReadArticle(article.slug)}
                        className="group w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-[#1E3A5F]/[0.03] dark:hover:bg-white/[0.03] transition-colors border-b border-[#E5E7EB] dark:border-[#243247] last:border-0"
                      >
                        <span className="font-[Newsreader,Georgia,serif] text-2xl font-black text-[#E5E7EB] dark:text-[#243247] group-hover:text-[#F97316] dark:group-hover:text-[#FF8A3D] transition-colors tabular-nums shrink-0 w-9">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[#1F2937] dark:text-[#F8FAFC] leading-snug line-clamp-2 group-hover:text-[#1E3A5F] dark:group-hover:text-[#4F8EF7] transition-colors">
                            {article.title}
                          </p>
                          {article.views != null && (
                            <span className="flex items-center gap-1 text-xs text-[#6B7280] dark:text-[#AAB4C5] mt-1.5">
                              <TrendingUp className="w-3 h-3" />
                              {formatNumber(article.views)} views
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#6B7280] dark:text-[#AAB4C5]">Nothing trending yet</p>
                )}
              </section>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

const FeaturedSlider = ({ articles, onRead }) => {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(null);

  const hasMultiple = articles.length > 1;

  useEffect(() => {
    if (!hasMultiple || isPaused) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % articles.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [hasMultiple, isPaused, articles.length]);

  const goTo = (i) => setIndex(((i % articles.length) + articles.length) % articles.length);
  const goNext = () => goTo(index + 1);
  const goPrev = () => goTo(index - 1);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > 50) goPrev();
    else if (delta < -50) goNext();
    touchStartX.current = null;
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {articles.map((featured) => (
            <div key={featured.article_id} className="w-full shrink-0">
              <button
                onClick={() => onRead(featured.slug)}
                className="group w-full text-left grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center"
              >
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1E3A5F]/10 to-[#F97316]/10 dark:from-[#4F8EF7]/10 dark:to-[#FF8A3D]/10 h-64 sm:h-80 lg:h-[26rem] shadow-lg shadow-[#1E3A5F]/5">
                  {featured.thumbnail_url ? (
                    <img
                      src={featured.thumbnail_url}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="w-12 h-12 text-[#1E3A5F]/20 dark:text-[#4F8EF7]/20" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded-full bg-white/95 dark:bg-[#162033]/95 backdrop-blur-sm text-[#F97316] dark:text-[#FF8A3D] shadow-sm">
                      <Sparkles className="w-3 h-3" />
                      Featured
                    </span>
                  </div>
                </div>

                <div>
                  {featured.category_name && (
                    <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold rounded-full bg-[#1E3A5F]/10 dark:bg-[#4F8EF7]/15 text-[#1E3A5F] dark:text-[#4F8EF7]">
                      {featured.category_name}
                    </span>
                  )}
                  <h2 className="font-[Newsreader,Georgia,serif] text-2xl sm:text-3xl lg:text-4xl font-black leading-tight text-[#1F2937] dark:text-[#F8FAFC] mb-4 group-hover:text-[#1E3A5F] dark:group-hover:text-[#4F8EF7] transition-colors">
                    {featured.title}
                  </h2>
                  {featured.description && (
                    <p className="text-sm sm:text-base text-[#6B7280] dark:text-[#AAB4C5] leading-relaxed mb-6 line-clamp-3">
                      {featured.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-9 h-9 rounded-full bg-[#1E3A5F]/10 dark:bg-[#4F8EF7]/15 flex items-center justify-center shrink-0 overflow-hidden">
                      {featured.profile_pic ? (
                        <img src={featured.profile_pic} alt={featured.author} className="w-full h-full object-cover" />
                      ) : (
                        <UserRound className="w-4 h-4 text-[#1E3A5F] dark:text-[#4F8EF7]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      {featured.author && (
                        <p className="text-sm font-semibold text-[#1F2937] dark:text-[#F8FAFC] truncate">{featured.author}</p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-[#6B7280] dark:text-[#AAB4C5]">
                        {featured.views != null && (
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {formatNumber(featured.views)} views
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-full text-white bg-[#1E3A5F] dark:bg-[#4F8EF7] dark:text-[#0B1220] group-hover:gap-2.5 group-hover:shadow-lg group-hover:shadow-[#1E3A5F]/20 transition-all">
                    Read Article
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>

      {hasMultiple && (
        <>
          <button
            onClick={goPrev}
            aria-label="Previous featured article"
            className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-[#162033] border border-[#E5E7EB] dark:border-[#243247] text-[#1F2937] dark:text-[#F8FAFC] shadow-lg opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity"
            style={{ opacity: isPaused ? 1 : undefined }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goNext}
            aria-label="Next featured article"
            className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-[#162033] border border-[#E5E7EB] dark:border-[#243247] text-[#1F2937] dark:text-[#F8FAFC] shadow-lg opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity"
            style={{ opacity: isPaused ? 1 : undefined }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-center gap-2 mt-8">
            {articles.map((article, i) => (
              <button
                key={article.article_id}
                onClick={() => goTo(i)}
                aria-label={`Go to featured article ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === index
                  ? 'w-8 bg-[#1E3A5F] dark:bg-[#4F8EF7]'
                  : 'w-1.5 bg-[#E5E7EB] dark:bg-[#243247] hover:bg-[#1E3A5F]/40 dark:hover:bg-[#4F8EF7]/40'
                  }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const ArticleResultCard = ({ article, onRead }) => (
  <button
    onClick={() => onRead(article.slug)}
    className="group text-left bg-white dark:bg-[#162033] border border-[#E5E7EB] dark:border-[#243247] rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-[#1E3A5F]/5 hover:-translate-y-1 transition-all duration-200"
  >
    <div className="relative h-44 bg-gradient-to-br from-[#1E3A5F]/5 to-[#F97316]/5 dark:from-[#4F8EF7]/5 dark:to-[#FF8A3D]/5 overflow-hidden">
      {article.thumbnail_url ? (
        <img
          src={article.thumbnail_url}
          alt=""
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <FileText className="w-8 h-8 text-[#1E3A5F]/15 dark:text-[#4F8EF7]/15" />
        </div>
      )}
      {article.category_name && (
        <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full bg-white/95 dark:bg-[#162033]/95 backdrop-blur-sm text-[#1E3A5F] dark:text-[#4F8EF7] shadow-sm">
          {article.category_name}
        </span>
      )}
    </div>
    <div className="p-5">
      <h3 className="text-base font-bold text-[#1F2937] dark:text-[#F8FAFC] leading-snug line-clamp-2 mb-3 group-hover:text-[#1E3A5F] dark:group-hover:text-[#4F8EF7] transition-colors">
        {article.title}
      </h3>
      {article.description && (
        <p className="text-xs text-[#6B7280] dark:text-[#AAB4C5] leading-relaxed line-clamp-2 mb-3">
          {article.description}
        </p>
      )}
      <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-[#AAB4C5] pt-3 border-t border-[#E5E7EB] dark:border-[#243247]">
        <span className="truncate">{article.author}</span>
        <div className="flex items-center gap-2 shrink-0">
          {article.views != null && (
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {formatNumber(article.views)}
            </span>
          )}
          {article.publish_at && <span>{formatDate(article.publish_at)}</span>}
        </div>
      </div>
    </div>
  </button>
);



export default HomePage;