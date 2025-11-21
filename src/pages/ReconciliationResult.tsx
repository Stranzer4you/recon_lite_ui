import React, { useEffect, useState } from "react";
import "./ReconciliationResult.css";
import { getReconciliationHistory, type ReconciliationHistory } from "../api/reconciliation.api";
import AppSnackBar from "../components/AppSnackBar";
import { CircularProgress } from "@mui/material";

const ReconciliationResult: React.FC = () => {
  const [history, setHistory] = useState<ReconciliationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });   

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await getReconciliationHistory();
      if (data) setHistory(data);
      else setSnackbar({ open: true, message: "Failed to load reconciliation history", severity: "error" });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Failed to load reconciliation history", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div className="reconciliation-container">
      <h2>Reconciliation History</h2>

      {loading ? (
        <div className="loading-container">
          <CircularProgress />
        </div>
      ) : (
        <div className="table-container">
          <table className="transactions-table">
            <thead>
              <tr>
                <th className="left-align">ID</th>
                <th className="left-align">Matched Count</th>
                <th className="left-align">Unmatched Count</th>
                <th className="left-align">Raw Count</th>
                <th className="left-align">Created At</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id} className="table-row">
                  <td className="left-align">{item.id}</td>
                  <td className="left-align">{item.matchedCount}</td>
                  <td className="left-align">{item.unmatchedCount}</td>
                  <td className="left-align">{item.rawCount}</td>
                  <td className="left-align">{item.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AppSnackBar
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </div>
  );
};

export default ReconciliationResult;
