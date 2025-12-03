import {
    Box,
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Typography,
    Chip,
} from "@mui/material";
import { 
    Timeline,
    TimelineItem,
    TimelineSeparator,
    TimelineConnector,
    TimelineContent,
    TimelineDot,
    TimelineOppositeContent, 
} from "@mui/lab";
import { ExpandMore } from "@mui/icons-material";
import { timelineOppositeContentClasses } from '@mui/lab/TimelineOppositeContent';

export const InformePedagogicoTimeline = ({ informes }) => {
    return (
        <Box>
            <Timeline 
                sx={{
                    [`& .${timelineOppositeContentClasses.root}`]: {
                        flex: 0.2,
                    },
                }}   
            >
                {informes.map((informe) => (
                    <TimelineItem key={informe.id_informe}>
                        <TimelineOppositeContent>
                            <Typography variant="body2" color="textSecondary">
                                {informe.fecha}
                            </Typography>
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                            <TimelineDot color="primary"/>
                            <TimelineConnector />
                        </TimelineSeparator>
                        <TimelineContent>
                            <Accordion sx={{ mb: 2 }}>
                                <AccordionSummary expandIcon={<ExpandMore />} sx={{backgroundColor: "#E8EEF7"}}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                                        <Typography>
                                            {informe.titulo}
                                        </Typography>
                                        <Chip
                                            size="small"
                                            label={informe.materia ? informe.materia : "General"}
                                            sx={{
                                                backgroundColor: "#0A2E75",
                                                color: "#fff",
                                                fontWeight: 700,
                                            }}
                                        />
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails sx={{backgroundColor: "#F2F6FB"}}>
                                    <Typography>
                                        {informe.contenido}
                                    </Typography>
                                    <Typography sx={{ mt: 2, fontSize: '0.875rem' }}>
                                        Asesor pedagógico: {informe.asesorPedagogico}
                                    </Typography>
                                </AccordionDetails>
                            </Accordion>
                        </TimelineContent>
                    </TimelineItem>
                ))}
            </Timeline>
        </Box>
    )
}
