import { useRef, useEffect } from "react";
import { 
    Container, 
    Typography
} from "@mui/material";
import { NotificationItem } from "../../components/NotificationItem";
import useNotifications from "../../contexts/NotificationsContext/useNotifications";
import { dataProvider } from "../../providers/dataProvider";

export const Notificaciones = () => {
    const { notifications, markAsRead, lastClickedNotification } = useNotifications();

    const itemsRef = useRef({});

    useEffect(() => {
        if (lastClickedNotification && itemsRef.current[lastClickedNotification]) {
            itemsRef.current[lastClickedNotification].scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    }, [lastClickedNotification]);

    const handleRead = async (id) => {
        markAsRead(id);
        dataProvider.actualizarNotificacion(id, { leido: true })
        .then(({ data }) => {
            console.log("Notificación marcada como leída:", data);
        })
        .catch(error => {
            console.error("Error al marcar notificación como leída:", error);
        });
    }

    return (
        <Container maxWidth="md" sx={{ mt: 2, pb: 4 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
                Notificaciones
            </Typography>
            {notifications.map((notif) => (
                <div
                    key={notif.id_notificacion}
                    ref={(el) => (itemsRef.current[notif.id_notificacion] = el)}
                >
                <NotificationItem 
                    titulo={notif.titulo} 
                    detalle={notif.detalle} 
                    fecha={notif.fecha} 
                    leido={notif.leido}
                    onRead={() => handleRead(notif.id_notificacion)} 
                />
                </div>
            ))}
        </Container>
    );
}


