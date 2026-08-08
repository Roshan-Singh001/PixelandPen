import { useOutletContext } from "react-router-dom";
import DashboardOverview from "./DashboardOverview";

const DashboardHome = () => {
  const {
    userData,
    statsData,
    articleRequests,
    contributorRequests,
  } = useOutletContext();

  return (
    <DashboardOverview
      userData={userData}
      statsData={statsData}
      articleRequests={articleRequests}
      contributorRequests={contributorRequests}
    />
  );
};

export default DashboardHome;