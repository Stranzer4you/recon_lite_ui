import React, { useEffect, useState } from "react";
import "./Transaction.css";
import type { TransactionResponse } from "../types/transaction.types";
import AppSnackBar from "../components/AppSnackBar";
import { type AlertColor } from "@mui/material/Alert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SyncIcon from "@mui/icons-material/Sync";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import {
  createTransaction,
  deleteTransactionById,
  getAllTransactions,
  getTransactionById,
  updateTransactionById,
} from "../api/transactions.api";

const PAGE_SIZE = 8;

const Transaction: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openAddDialog, setOpenAddDialog] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  // --- Edit states ---
  const [editTransactionId, setEditTransactionId] = useState<number | null>(null);
  const [editTransactionData, setEditTransactionData] = useState<TransactionResponse | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const [filters, setFilters] = useState<{status?: string;source?: "BANK" | "SYSTEM"; }>({});


  const [newTxn, setNewTxn] = useState({
    description: "",
    amount: "",
    source: "BANK",
  });

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // --- Edit Handlers ---
  const handleEditClick = async (id: number) => {
    setLoadingEdit(true);
    setOpenEditDialog(true);
    setEditTransactionId(id);

    const data = await getTransactionById(id);
    if (data) {
      setEditTransactionData(data);
    } else {
      setSnackbar({ open: true, message: "Failed to load transaction", severity: "error" });
      setOpenEditDialog(false);
    }

    setLoadingEdit(false);
  };

  const handleUpdateTransaction = async () => {
    if (!editTransactionData || !editTransactionId) return;
    setLoadingEdit(true);

    const success = await updateTransactionById(editTransactionId, {
      description: editTransactionData.description,
      amount: editTransactionData.amount,
      source: editTransactionData.source as "BANK" | "SYSTEM",
    });

    if (success) {
      setSnackbar({ open: true, message: "Transaction updated successfully!", severity: "success" });
      setOpenEditDialog(false);
      await loadTransactions(currentPage); // Refresh the listing
    } else {
      setSnackbar({ open: true, message: "Failed to update transaction", severity: "error" });
    }

    setLoadingEdit(false);
  };

  const openDeleteDialog = (id: number) => {
    setDeleteId(id);
    setOpenDialog(true);
  };

  const closeDeleteDialog = () => {
    setOpenDialog(false);
    setDeleteId(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const result = await deleteTransactionById(deleteId);

    if (result) {
      setSnackbar({
        open: true,
        message: "Transaction deleted successfully!",
        severity: "success",
      });
      await loadTransactions(currentPage);
    } else {
      setSnackbar({
        open: true,
        message: "Failed to delete transaction!",
        severity: "error",
      });
    }
    closeDeleteDialog();
  };

  const handleCreateTransaction = async () => {
    if (!newTxn.description || !newTxn.amount) {
      setSnackbar({
        open: true,
        message: "Description and Amount are required",
        severity: "error",
      });
      return;
    }

    try {
      const payload = {
        description: newTxn.description,
        amount: Number(newTxn.amount),
        source: newTxn.source,
      };

      const res = await createTransaction(payload);

      if (res.status === 200 || res.status === 201) {
        setSnackbar({
          open: true,
          message: "Transaction created successfully!",
          severity: "success",
        });

        setOpenAddDialog(false);

        // Reset form
        setNewTxn({ description: "", amount: "", source: "BANK" });

        // Re-fetch transactions
        loadTransactions(currentPage);
      }
    } catch (e) {
      setSnackbar({
        open: true,
        message: "Failed to create transaction",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    loadTransactions(currentPage);
  }, [currentPage]);

 const loadTransactions = async (pageNumber: number, appliedFilters = filters) => {
  try {
    setLoading(true);
    const page = Math.max(1, Number(pageNumber) || 1);

    const res = await getAllTransactions(page, PAGE_SIZE, appliedFilters);

    setTransactions(res?.data?.transactions || []);
    setTotalPages(res?.data?.totalPages || 1);
  } catch (err) {
    console.error("Error loading transactions:", err);
  } finally {
    setLoading(false);
  }
};



  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  return (
    <div className="transactions-container">
      {/* Header */}
      <div className="transactions-header">
        <h2>Transactions</h2>
        <Button variant="contained" color="primary" onClick={() => setOpenAddDialog(true)}>
          Add Transaction
        </Button>
      </div>
<div className="transactions-filters" style={{ marginBottom: 16, display: "flex", gap: 16 }}>
  <TextField
    select
    label="Source"
    size="small"
    value={filters.source ?? ""}
    onChange={(e) => {
      const value = e.target.value as "BANK" | "SYSTEM" | "";
      setFilters(prev => ({ ...prev, source: value || undefined }));
      loadTransactions(1, { ...filters, source: value || undefined });
      setCurrentPage(1); // reset to first page
    }}
    style={{ minWidth: 120 }}
  >
    <MenuItem value="">All</MenuItem>
    <MenuItem value="BANK">BANK</MenuItem>
    <MenuItem value="SYSTEM">SYSTEM</MenuItem>
  </TextField>

  <TextField
    select
    label="Status"
    size="small"
    value={filters.status ?? ""}
    onChange={(e) => {
      const value = e.target.value || "";
      setFilters(prev => ({ ...prev, status: value || undefined }));
      loadTransactions(1, { ...filters, status: value || undefined }); // call API on change
      setCurrentPage(1); // reset to first page
    }}
    style={{ minWidth: 120 }}
  >
    <MenuItem value="">All</MenuItem>
    <MenuItem value="RAW">RAW</MenuItem>
    <MenuItem value="MATCHED">MATCHED</MenuItem>
    <MenuItem value="UNMATCHED">UNMATCHED</MenuItem>
  </TextField>
</div>

    

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="transactions-table">
          <thead>
            <tr>
              <th className="left-align">ID</th>
              <th className="left-align">Description</th>
              <th className="left-align">Amount</th>
              <th className="left-align">Source</th>
              <th className="left-align">Status</th>
              <th className="left-align">Date</th>
              <th className="actions-col">Actions</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="table-row">
                <td className="left-align">{t.id}</td>
                <td className="left-align">{t.description}</td>
                <td className="left-align">{t.amount}</td>
                <td className="left-align">{t.source}</td>
                <td className="left-align">{t.status}</td>
                <td className="left-align">{t.createdAt}</td>
                <td className="actions-col">
                  <button className="icon-btn edit-btn" onClick={() => handleEditClick(t.id)}>
                    <EditIcon fontSize="small" />
                  </button>

                  <button className="icon-btn delete-btn" onClick={() => openDeleteDialog(t.id)}>
                    <DeleteIcon fontSize="small" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination + Reconcile Row */}
      {!loading && totalPages > 0 && (
  <div className="bottom-row">
    {/* Pagination Left */}
    <div className="pagination-left">
      <Stack spacing={2}>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          shape="rounded"
        />
      </Stack>
    </div>

    {/* Reconcile Right */}
    <div className="reconcile-right">
      <button className="reconcile-btn">
        <SyncIcon fontSize="small" />
        Reconcile
      </button>
    </div>
  </div>
)}


      {/* --- Edit Modal --- */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Transaction</DialogTitle>
        <DialogContent>
          {loadingEdit || !editTransactionData ? (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TextField
                fullWidth
                label="Description"
                value={editTransactionData.description}
                onChange={(e) => setEditTransactionData({ ...editTransactionData, description: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={editTransactionData.amount}
                onChange={(e) => setEditTransactionData({ ...editTransactionData, amount: Number(e.target.value) })}
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Source</InputLabel>
                <Select
                  value={editTransactionData.source}
                  onChange={(e) =>
                    setEditTransactionData({ ...editTransactionData, source: e.target.value as "BANK" | "SYSTEM" })
                  }
                >
                  <MenuItem value="BANK">BANK</MenuItem>
                  <MenuItem value="SYSTEM">SYSTEM</MenuItem>
                </Select>
              </FormControl>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)} disabled={loadingEdit}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleUpdateTransaction} disabled={loadingEdit}>
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- Add Modal --- */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Add Transaction</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            variant="outlined"
            value={newTxn.description}
            onChange={(e) => setNewTxn({ ...newTxn, description: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            variant="outlined"
            value={newTxn.amount}
            onChange={(e) => setNewTxn({ ...newTxn, amount: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Source</InputLabel>
            <Select
              label="Source"
              value={newTxn.source}
              onChange={(e) => setNewTxn({ ...newTxn, source: e.target.value })}
            >
              <MenuItem value="BANK">BANK</MenuItem>
              <MenuItem value="SYSTEM">SYSTEM</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => { setOpenAddDialog(false); setNewTxn({ description: "", amount: "", source: "BANK" }); }}>
  Cancel
</Button>
          <Button variant="contained" onClick={handleCreateTransaction}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- Delete Modal --- */}
      <Dialog open={openDialog} onClose={closeDeleteDialog}>
        <DialogTitle>Delete Transaction</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this transaction? This action cannot be undone.
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <AppSnackBar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </div>
  );
};

export default Transaction;
