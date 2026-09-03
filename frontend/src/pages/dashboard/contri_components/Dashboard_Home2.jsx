import { useOutletContext } from "react-router-dom";
import DashboardOverview from "./DashboardOverview";

const DashboardHome2 = () => {
  const {
    userData,
    status,
    announcements,
    recentArticles, 
    rejectReason,
    statsData,
    setIsRender,
  } = useOutletContext();

  return (
    <DashboardOverview
      userData={userData}
      status={status}
      setIsRender={setIsRender}
      announcements={announcements}
      recentArticles={recentArticles}
      rejectReason={rejectReason}
      statsData={statsData}
    />
  );
};

export default DashboardHome2;