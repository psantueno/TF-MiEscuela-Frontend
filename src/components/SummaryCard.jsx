import {
    Card,
    CardContent,
    Typography,
    Stack,
    Box
} from "@mui/material";

export const SummaryCard = ({ title, mainContent, secondaryContent = null, type }) => {
    return (
        <Card
            sx={{
                minWidth: 150,
                flex: 1,
                border: '1px solid',
                borderColor: 'grey.200',
                borderRadius: 2,
                backgroundColor: 'grey.50',
                color: 'text.primary',
                boxShadow: 'none',
            }}
        >
            <CardContent sx={{ py: 2, height: '100%' }}>
                <Stack spacing={1}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {title}
                    </Typography>
                    {secondaryContent && (
                        <Typography variant="body2" color="text.secondary">
                            {secondaryContent}
                        </Typography>
                    )}
                    <Box sx={{ flexGrow: 1 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {mainContent}
                    </Typography>
                </Stack>
            </CardContent>
        </Card>
    );
}

