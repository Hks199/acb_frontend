// pages/PublicRoute.jsx
import { Navigate } from "react-router";

const PublicRoute = ({ isAuth, children }) => {
  if (isAuth) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default PublicRoute;
