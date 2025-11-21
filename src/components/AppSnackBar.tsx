import Snackbar from "@mui/material/Snackbar";
import Alert, { type AlertColor } from "@mui/material/Alert";

interface AppSnackbarProps {
  open: boolean;
  message: string;
  severity?: AlertColor;
  onClose: () => void;
}

const AppSnackBar: React.FC<AppSnackbarProps> = ({
  open,
  message,
  severity = "success",
  onClose,
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        severity={severity}
        variant="filled"
        onClose={onClose}
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default AppSnackBar;
