    import React, { useState } from "react";
    import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Box, FormControl, InputLabel, MenuItem, Select, type AlertColor } from "@mui/material";
    import AppSnackbar from "./AppSnackBar";
    import { getTransactionById, updateTransactionById } from "../api/transactions.api";

    type Transaction = {
    id?: number;
    description: string;
    amount: number;
    source: "BANK" | "SYSTEM";
    };

    type TransactionRowProps = {
    transactionId: number;
    onUpdated?: () => void;
    };

    const UpdateTransactionModal: React.FC<TransactionRowProps> = ({ transactionId, onUpdated }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [transaction, setTransaction] = useState<Transaction>({ description: "", amount: 0, source: "SYSTEM" });

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("success");

    const handleOpen = async () => {
  setOpen(true);
  setLoading(true);
  try {
    const data = await getTransactionById(transactionId);
    if (!data) throw new Error("Failed to load transaction");
    console.log("Transaction loaded:", data);
    setTransaction(data);
  } catch (err) {
    console.error(err);
    setSnackbarMessage("Failed to load transaction");
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
    setOpen(false);
  } finally {
    setLoading(false);
  }
};


    const handleClose = () => setOpen(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
        const { name, value } = e.target;
        setTransaction(prev => ({ ...prev, [name]: name === "amount" ? Number(value) : value }));
    };

    const handleUpdate = async () => {
        setLoading(true);
        try {
        const success = await updateTransactionById(transactionId, transaction);
        if (!success) throw new Error("Update failed");

        setSnackbarMessage("Transaction updated successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setOpen(false);

        if (onUpdated) onUpdated(); // refresh listing
        } catch (err) {
        console.error(err);
        setSnackbarMessage("Failed to update transaction");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        } finally {
        setLoading(false);
        }
    };

    return (
        <>
        <Button variant="outlined" color="primary" onClick={handleOpen}>
            Edit
        </Button>

        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogContent>
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" p={2}>
                <CircularProgress />
                </Box>
            ) : (
                <>
                <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={transaction.description}
                    onChange={handleChange}
                    margin="normal"
                />
                <TextField
                    fullWidth
                    label="Amount"
                    name="amount"
                    type="number"
                    value={transaction.amount}
                    onChange={handleChange}
                    margin="normal"
                />
                <FormControl fullWidth margin="normal">
                    <InputLabel>Source</InputLabel>
                    <Select
                    name="source"
                    value={transaction.source}
                    onChange={handleChange}
                    >
                    <MenuItem value="BANK">BANK</MenuItem>
                    <MenuItem value="SYSTEM">SYSTEM</MenuItem>
                    </Select>
                </FormControl>
                </>
            )}
            </DialogContent>
            <DialogActions>
            <Button onClick={handleClose} disabled={loading}>Cancel</Button>
            <Button onClick={handleUpdate} variant="contained" color="primary" disabled={loading}>
                Update
            </Button>
            </DialogActions>
        </Dialog>

        <AppSnackbar
            open={snackbarOpen}
            onClose={() => setSnackbarOpen(false)}
            message={snackbarMessage}
            severity={snackbarSeverity}
        />
        </>
    );
    };

    export default UpdateTransactionModal;
