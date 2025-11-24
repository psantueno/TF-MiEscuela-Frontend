import { useState } from "react";
import NotificationContext from "./NotificationContext";

const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [lastClickedNotification, setLastClickedNotification] = useState(null);

    const markAsRead = (id) => {
        setNotifications((prevNotifications) => 
            prevNotifications.map((notif) => 
                notif.id_notificacion === id ? { ...notif, leido: true } : notif
            )
        );
    }

    return (
        <NotificationContext.Provider value={{ notifications, setNotifications, markAsRead, lastClickedNotification, setLastClickedNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};

export default NotificationProvider;