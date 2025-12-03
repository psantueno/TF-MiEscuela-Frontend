import { Backdrop, CircularProgress, Stack, Typography } from "@mui/material";

export const LoaderOverlay = ({ open = false, message }) => {
  return (
    <Backdrop
      sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={Boolean(open)}
    >
      <Stack spacing={2} alignItems="center">
        <CircularProgress color="inherit" />
        {message && (
          <Typography
            variant="body2"
            sx={{ color: "inherit", textAlign: "center", maxWidth: 360 }}
          >
            {message}
          </Typography>
        )}
      </Stack>
    </Backdrop>
  );
};
