import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import NotificationsSystem, {
  bootstrapTheme,
  dismissNotification,
  setUpNotifications,
  notify,
  Status,
} from "reapop";

export const unknownErrorNotificationMessage =
  "An unknown error occurred. Please try again or refresh the page.";

export const useUnknownErrorNotification = () => {
  const dispatch = useDispatch();
  const onError = () =>
    dispatch(notify(unknownErrorNotificationMessage, "error"));

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
        dismissAfter: 8000,
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

export const useNotify = () => {
  const dispatch = useDispatch();
  return {
    notify: (message: string, status: Status) =>
      dispatch(notify(message, status)),
  }
}

export default Notifications;
