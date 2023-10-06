import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReactGA from "react-ga4";

export const useGoogleAnalytics = () => {
  const location = useLocation();
  const isProduction = process.env.NODE_ENV === "production";

  useEffect(() => {
    if (isProduction) {
      ReactGA.send({
        hitType: "pageview",
        page: location.pathname,
        title: location.pathname,
      });
    }
  }, [location]); // eslint-disable-line react-hooks/exhaustive-deps
};
