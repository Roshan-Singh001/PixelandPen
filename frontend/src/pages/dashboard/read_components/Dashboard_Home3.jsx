import { useOutletContext } from "react-router-dom";
import DashboardOverview from "./DashboardOverview";

const DashboardHome3 = () => {
  const {
    articlesReadCount,
    likedArticlesCount,
    savedArticlesCount,
    userData,
    announcements,
    recentArticles, 
  } = useOutletContext();

  return (
    <DashboardOverview
      userData={userData}
      announcements={announcements}
      recentArticles={recentArticles}
      articlesReadCount={articlesReadCount}
      likedArticlesCount={likedArticlesCount}
      savedArticlesCount={savedArticlesCount}
    />
  );
};

export default DashboardHome3;