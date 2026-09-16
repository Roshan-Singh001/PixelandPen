import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AxiosInstance from "../../api/axiosInstance.jsx";
import {
  ArrowLeft, FileText, Eye, ChevronRight, Loader2, FolderX, Tag
} from "lucide-react";

const PAGE_SIZE = 9;

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

const CategoryPage = () => {

  const { slug } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState(null);
  const [articles, setArticles] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchCategory(true);
    window.scrollTo({ top: 0 });
  }, [slug]);

  useEffect(() => {
    document.title = category ? `${category.name} · Pixel & Pen` : 'Pixel & Pen';
  }, [category]);

  const fetchCategory = () => {
    setIsLoading(true);
    setLoadError("");
    setNotFound(false);

    AxiosInstance.get(`/article/category/${slug}`)
      .then((res) => {
        console.log(res.data);
        setCategory({
          name: res.data.category[0].name,
          description: res.data.category[0].description,
          article_count: res.data.category[0].article_count,
        });
        const rows = res.data.articles || [];
        setArticles(rows);
      })
      .catch((err) => {
        console.log(err);
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          setLoadError("Couldn't load this category. Please refresh.");
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleReadArticle = (slug) => {
    navigate(`/view/${slug}`);
  };

  const handleBack = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#0B1220] font-['Inter',sans-serif]">
        <div className="bg-[#1E3A5F] dark:bg-[#0B1220] dark:border-b dark:border-[#243247]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <div className="h-4 bg-white/10 rounded w-24 mb-6 animate-pulse" />
            <div className="h-10 bg-white/10 rounded w-64 mb-4 animate-pulse" />
            <div className="h-4 bg-white/10 rounded w-full max-w-xl mb-2 animate-pulse" />
            <div className="h-4 bg-white/10 rounded w-2/3 max-w-xl animate-pulse" />
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
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
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#0B1220] font-['Inter',sans-serif] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#1E3A5F]/5 dark:bg-[#4F8EF7]/10 flex items-center justify-center mx-auto mb-5">
            <FolderX className="w-7 h-7 text-[#6B7280] dark:text-[#AAB4C5]" />
          </div>
          <h1 className="font-[Newsreader,Georgia,serif] text-2xl font-black text-[#1F2937] dark:text-[#F8FAFC] mb-2">
            Category Not Found
          </h1>
          <p className="text-sm text-[#6B7280] dark:text-[#AAB4C5] mb-6">
            This category doesn't exist or may have been removed.
          </p>
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-full text-white bg-[#1E3A5F] dark:bg-[#4F8EF7] dark:text-[#0B1220] hover:bg-[#16304f] dark:hover:bg-[#3f7de0] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#0B1220] font-['Inter',sans-serif]">

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
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/50 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </button>

          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <Tag className="w-4 h-4 text-white/70" />
            </div>
            <h1 className="font-[Newsreader,Georgia,serif] text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              {category?.name}
            </h1>
          </div>

          {category?.description && (
            <p className="text-sm sm:text-base text-white/50 leading-relaxed max-w-2xl mb-6">
              {category.description}
            </p>
          )}

          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-white/10 text-white/70">
            <FileText className="w-3.5 h-3.5" />
            {formatNumber(category?.article_count)} articles
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">

        {loadError && (
          <div className="mb-14 p-4 bg-[#DC2626]/10 dark:bg-[#EF4444]/10 border border-[#DC2626]/20 dark:border-[#EF4444]/20 rounded-xl text-center">
            <p className="text-sm font-medium text-[#DC2626] dark:text-[#EF4444] mb-3">{loadError}</p>
            <button
              onClick={() => fetchCategory()}
              className="px-4 py-2 text-xs font-semibold rounded-full text-white bg-[#1E3A5F] dark:bg-[#4F8EF7] dark:text-[#0B1220] hover:bg-[#16304f] dark:hover:bg-[#3f7de0] transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        <section>
          <div className="flex items-center justify-between mb-8 sm:mb-10">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-[#1E3A5F] dark:text-[#4F8EF7] mb-1.5">
                Browse
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1F2937] dark:text-[#F8FAFC]">
                Latest in {category?.name}
              </h2>
            </div>
          </div>

          {articles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {articles.map((article) => (
                  <ArticleCard key={article.article_id} article={article} onRead={handleReadArticle} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16 border border-dashed border-[#E5E7EB] dark:border-[#243247] rounded-2xl">
              <FileText className="w-8 h-8 text-[#6B7280] dark:text-[#AAB4C5] mx-auto mb-3" />
              <p className="text-sm text-[#6B7280] dark:text-[#AAB4C5]">No articles in this category yet</p>
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default CategoryPage;