import { useEffect, useState, useRef } from "react";
import {
    Card,
    CardContent,
    Typography,
    Box,
} from "@mui/material";

const useVisibilityObserver = (ref) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => setIsVisible(entry.isIntersecting),
            { threshold: 0.8 } // al menos 80% visible
        );

        if (ref.current) observer.observe(ref.current);

        return () => {
            if (ref.current) observer.unobserve(ref.current);
        };
    }, [ref]);

    return isVisible;
}

export const NotificationItem = ({ titulo, detalle, fecha, leido, onRead }) => {
    const ref = useRef();
    const isVisible = useVisibilityObserver(ref);

    useEffect(() => {
        if (isVisible && !leido) {
            onRead();
        }
    }, [isVisible, leido, titulo]);


    return (
        <Card
            variant="outlined"
            sx={{
                backgroundColor: leido ? '#f5f5f5' : '#e3f2fd',
                borderLeft: leido ? '4px solid #ccc' : '4px solid #1976d2',
                mb: 2,
                boxShadow: 1,
            }}
            ref={ref}
        >
            <CardContent>
                <Box display="flex" justifyContent="space-between">
                <Typography variant="h6" fontWeight="bold">
                    {titulo}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {fecha}
                </Typography>
                </Box>
                <Typography variant="body1" mt={1}>
                    {detalle}
                </Typography>
            </CardContent>
        </Card>
    );
}
