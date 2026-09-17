import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AxiosInstance from "../../api/axiosInstance";
import MetaData from "../../components/MetaData";
import {
  FileText, Eye, ArrowLeft, BookOpen, SlidersHorizontal,
  ChevronDown, X, AlertCircle
} from "lucide-react";

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatNumber(num) {
  const n = num || 0;
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString();
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'most_viewed', label: 'Most Viewed' },
  { value: 'most_liked', label: 'Most Liked' },
];

const ArticleCard = ({ article, onRead }) => (
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
      <h3 className="text-base font-bold text-[#1F2937] dark:text-[#F8FAFC] leading-snug line-clamp-2 mb-2 group-hover:text-[#1E3A5F] dark:group-hover:text-[#4F8EF7] transition-colors">
        {article.title}
      </h3>
      {article.description && (
        <p className="text-xs text-[#6B7280] dark:text-[#AAB4C5] leading-relaxed line-clamp-2 mb-3">
          {article.description}
        </p>
      )}
      <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-[#AAB4C5] pt-3 border-t border-[#E5E7EB] dark:border-[#243247]">
        <span className="truncate font-medium">{article.author}</span>
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

const LatestArticlesPage = () => {

  const navigate = useNavigate();

  const [allArticles, setAllArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [sortBy, setSortBy] = useState("newest");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    document.title = 'All Articles · Pixel & Pen';
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const [articlesRes, categoriesRes] = await Promise.allSettled([
        AxiosInstance.get('/article/all'),
        AxiosInstance.get('/article/categories'),
      ]);

      setAllArticles(articlesRes.status === 'fulfilled' ? (articlesRes.value.data.articles || []) : []);
      setCategories(categoriesRes.status === 'fulfilled' ? (categoriesRes.value.data.categories || []) : []);

      if (articlesRes.status === 'rejected') {
        setLoadError("Couldn't load articles. Please refresh.");
      }
    } catch (error) {
      console.log(error);
      setLoadError("Couldn't load articles. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  };

  const visibleArticles = (() => {
    let list = allArticles;

    if (selectedCategory !== "all") {
      list = list.filter((a) => a.category_slug === selectedCategory || a.category_name === selectedCategory);
    }

    const sorted = [...list];
    switch (sortBy) {
      case 'oldest':
        sorted.sort((a, b) => new Date(a.publish_at) - new Date(b.publish_at));
        break;
      case 'most_viewed':
        sorted.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
        break;
      case 'most_liked':
        sorted.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
        break;
      case 'newest':
      default:
        sorted.sort((a, b) => new Date(b.publish_at) - new Date(a.publish_at));
        break;
    }
    return sorted;
  })();

  const hasActiveFilters = selectedCategory !== "all" || sortBy !== "newest";

  const clearFilters = () => {
    setSelectedCategory("all");
    setSortBy("newest");
  };

  const handleReadArticle = (slug) => {
    navigate(`/view/${slug}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#0B1220] font-['Inter',sans-serif]">
        <div className="bg-[#1E3A5F] dark:bg-[#0B1220] dark:border-b dark:border-[#243247]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <div className="h-4 bg-white/10 rounded w-24 mb-5 animate-pulse" />
            <div className="h-10 bg-white/10 rounded w-56 mb-3 animate-pulse" />
            <div className="h-4 bg-white/10 rounded w-80 animate-pulse" />
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="h-14 bg-[#E5E7EB] dark:bg-[#243247] rounded-2xl mb-8 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white dark:bg-[#162033] border border-[#E5E7EB] dark:border-[#243247] rounded-2xl overflow-hidden animate-pulse">
                <div className="h-44 bg-[#E5E7EB] dark:bg-[#243247]" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-[#E5E7EB] dark:bg-[#243247] rounded w-full" />
                  <div className="h-4 bg-[#E5E7EB] dark:bg-[#243247] rounded w-2/3" />
                  <div className="h-3 bg-[#E5E7EB] dark:bg-[#243247] rounded w-1/2 mt-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#0B1220] font-['Inter',sans-serif]">
      <MetaData
        title="Latest Articles"
        description="Read the latest articles, stories, and insights from Pixel & Pen."
        url="/article/latest"
      />

      {/* Header */}
      <div className="relative overflow-hidden bg-[#1E3A5F] dark:bg-[#0B1220] dark:border-b dark:border-[#243247]">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,.10) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/50 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </button>

          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-white/70" />
            </div>
            <h1 className="font-[Newsreader,Georgia,serif] text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              All Articles
            </h1>
          </div>

          <p className="text-sm sm:text-base text-white/50 leading-relaxed max-w-2xl mb-6">
            Every article published on Pixel &amp; Pen — sorted, filtered, and ready to read.
          </p>

          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-white/10 text-white/70">
            <FileText className="w-3.5 h-3.5" />
            {formatNumber(allArticles.length)} articles
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">

        {loadError && (
          <div className="mb-10 p-4 bg-[#DC2626]/10 dark:bg-[#EF4444]/10 border border-[#DC2626]/20 dark:border-[#EF4444]/20 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-[#DC2626] dark:text-[#EF4444] shrink-0" />
            <p className="text-sm font-medium text-[#DC2626] dark:text-[#EF4444] flex-1">{loadError}</p>
            <button
              onClick={fetchData}
              className="px-3 py-1.5 text-xs font-semibold rounded-full text-white bg-[#DC2626] dark:bg-[#EF4444] hover:opacity-90 transition-opacity shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* Filter / Sort bar */}
        <div className="bg-white dark:bg-[#162033] border border-[#E5E7EB] dark:border-[#243247] rounded-2xl p-4 sm:p-5 mb-10">
          <div className="flex flex-col sm:flex-row gap-3">

            {/* Category filter */}
            <div className="relative flex-1">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full appearance-none pl-4 pr-9 py-2.5 text-sm font-medium rounded-xl border border-[#E5E7EB] dark:border-[#243247] bg-[#FAFAF8] dark:bg-[#0B1220] text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 dark:focus:ring-[#4F8EF7]/20 focus:border-[#1E3A5F] dark:focus:border-[#4F8EF7] transition-colors cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug || cat.name}>
                    {cat.name}
                    {cat.article_count != null ? ` (${cat.article_count})` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] dark:text-[#AAB4C5] pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative shrink-0 w-full sm:w-52">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none pl-4 pr-9 py-2.5 text-sm font-medium rounded-xl border border-[#E5E7EB] dark:border-[#243247] bg-[#FAFAF8] dark:bg-[#0B1220] text-[#1F2937] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 dark:focus:ring-[#4F8EF7]/20 focus:border-[#1E3A5F] dark:focus:border-[#4F8EF7] transition-colors cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] dark:text-[#AAB4C5] pointer-events-none" />
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-xl border border-[#E5E7EB] dark:border-[#243247] text-[#6B7280] dark:text-[#AAB4C5] hover:border-[#DC2626] dark:hover:border-[#EF4444] hover:text-[#DC2626] dark:hover:text-[#EF4444] transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Section header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-[#1E3A5F] dark:text-[#4F8EF7] mb-1.5">
              {selectedCategory === "all" ? "All articles" : categories.find((c) => (c.slug || c.name) === selectedCategory)?.name ?? selectedCategory}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1F2937] dark:text-[#F8FAFC]">
              {visibleArticles.length} {visibleArticles.length === 1 ? 'article' : 'articles'}
              {hasActiveFilters && (
                <span className="text-base font-normal text-[#6B7280] dark:text-[#AAB4C5] ml-2">
                  matching filters
                </span>
              )}
            </h2>
          </div>

          {hasActiveFilters && (
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#1E3A5F] dark:bg-[#4F8EF7]" />
              <span className="text-xs font-semibold text-[#1E3A5F] dark:text-[#4F8EF7]">Filtered</span>
            </div>
          )}
        </div>

        {/* Grid */}
        {visibleArticles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleArticles.map((article) => (
              <ArticleCard
                key={article.article_id}
                article={article}
                onRead={handleReadArticle}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-24 border border-dashed border-[#E5E7EB] dark:border-[#243247] rounded-2xl">
            <div className="w-14 h-14 rounded-2xl bg-[#1E3A5F]/5 dark:bg-[#4F8EF7]/10 flex items-center justify-center mb-5">
              <SlidersHorizontal className="w-6 h-6 text-[#6B7280] dark:text-[#AAB4C5]" />
            </div>
            <p className="text-base font-semibold text-[#1F2937] dark:text-[#F8FAFC] mb-1.5">
              No articles match your filters
            </p>
            <p className="text-sm text-[#6B7280] dark:text-[#AAB4C5] max-w-xs mb-6">
              Try adjusting your category or sort selection.
            </p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-full text-white bg-[#1E3A5F] dark:bg-[#4F8EF7] dark:text-[#0B1220] hover:bg-[#16304f] dark:hover:bg-[#3f7de0] transition-colors"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default LatestArticlesPage;