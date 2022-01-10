import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import NotificationsSystem, {
  bootstrapTheme,
  dismissNotification,
  setUpNotifications,
  notify,
} from "reapop";

export const useUnknownErrorNotificationMessage =
  "An unknown error occurred. Please try again or refresh the page.";

export const useUnknownErrorNotification = () => {
  const dispatch = useDispatch();
  const onError = () =>
    dispatch(notify(useUnknownErrorNotificationMessage, "error"));

  return onError;
};

const Notifications: React.FC = () => {
  const dispatch = useDispatch();
  // @ts-ignore
  const notifications = useSelector(({ notifications = [] }) => notifications);
  const onError = useUnknownErrorNotification();

  useEffect(() => {
    setUpNotifications({
      defaultProps: {
        position: "bottom-right",
        dismissible: true,
        dismissAfter: 5000,
      },
    });
  }, []);

  useEffect(() => {
    window.addEventListener("error", onError);
    return () => window.removeEventListener("error", onError);
  }, []);

  return (
    <div>
      <NotificationsSystem
        notifications={notifications}
        dismissNotification={(id) => dispatch(dismissNotification(id))}
        theme={bootstrapTheme}
      />
    </div>
  );
};

export default Notifications;
