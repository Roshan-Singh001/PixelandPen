import { useOutletContext } from "react-router-dom";
import DashboardOverview from "./DashboardOverview";

const DashboardHome3 = () => {
  const {
    userData,
    announcements,
    recentArticles, 
    statsData
  } = useOutletContext();

  return (
    <DashboardOverview
      userData={userData}
      announcements={announcements}
      recentArticles={recentArticles}
      statsData={statsData}
    />
  );
};

export default DashboardHome3;