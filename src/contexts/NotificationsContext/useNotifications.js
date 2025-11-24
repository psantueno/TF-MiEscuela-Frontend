import { useContext } from "react";
import NotificationContext from "./NotificationContext";

const useNotifications = () => {
    return useContext(NotificationContext);
};

export default useNotifications;