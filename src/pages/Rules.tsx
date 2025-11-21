import React, { useEffect, useState } from "react";
import "./Rules.css";
import AppSnackBar from "../components/AppSnackBar";
import { type AlertColor } from "@mui/material/Alert";
import EditIcon from "@mui/icons-material/Edit";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import {
  type Rule,
  getAllRules,
  getRuleById,
  createRule,
  updateRuleById,
  updateRuleStatus,
} from "../api/rules.api";

const Rules: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<{ isActive?: boolean; ruleType?: string; priority?: number }>({});

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: "", severity: "success" });

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newRule, setNewRule] = useState<Omit<Rule, "id" | "createdAt">>({
    ruleName: "",
    ruleType: "",
    description: "",
    priority: 1,
    isActive: true,
    ruleValue: null,
  });

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editRuleId, setEditRuleId] = useState<number | null>(null);
  const [editRuleData, setEditRuleData] = useState<Omit<Rule, "id" | "createdAt">>({
    ruleName: "",
    ruleType: "",
    description: "",
    priority: 1,
    isActive: true,
    ruleValue: null,
  });
  const [loadingEdit, setLoadingEdit] = useState(false);

  const loadRules = async () => {
    setLoading(true);
    const res = await getAllRules(filters);
    setRules(res);
    setLoading(false);
  };

  useEffect(() => {
    loadRules();
  }, [filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const { name, value } = e.target;

  let val: string | boolean | number | undefined;

  if (value === "") val = undefined;
  else if (value === "true") val = true;
  else if (value === "false") val = false;
  else if (name === "priority") val = Number(value);
  else val = value;

  setFilters((prev) => ({ ...prev, [name]: val }));
};


  const handleCreateRule = async () => {
    if (!newRule.ruleName || !newRule.ruleType) return;

    try {
      await createRule(newRule);
      setSnackbar({ open: true, message: "Rule created successfully!", severity: "success" });
      setOpenAddDialog(false);
      setNewRule({ ruleName: "", ruleType: "", description: "", priority: 1, isActive: true, ruleValue: null });
      loadRules();
    } catch {
      setSnackbar({ open: true, message: "Failed to create rule", severity: "error" });
    }
  };

  const handleEditClick = async (id: number) => {
    setOpenEditDialog(true);
    setEditRuleId(id);
    setLoadingEdit(true);
    const rule = await getRuleById(id);
    if (rule) setEditRuleData(rule);
    setLoadingEdit(false);
  };

  const handleUpdateRule = async () => {
    if (!editRuleId) return;
    try {
      await updateRuleById(editRuleId, editRuleData);
      setSnackbar({ open: true, message: "Rule updated successfully!", severity: "success" });
      setOpenEditDialog(false);
      loadRules();
    } catch {
      setSnackbar({ open: true, message: "Failed to update rule", severity: "error" });
    }
  };

  const handleToggle = async (rule: Rule) => {
    try {
      await updateRuleStatus(rule.id, !rule.isActive);
      setSnackbar({
        open: true,
        message: `Rule ${rule.isActive ? "deactivated" : "activated"}!`,
        severity: "success",
      });
      loadRules();
    } catch {
      setSnackbar({ open: true, message: "Failed to toggle rule", severity: "error" });
    }
  };

  return (
    <div className="rules-container">
      {/* Header + Filters */}
      <div className="rules-header">
        <h2>Rules</h2>
        <div className="rules-filters">
          <select name="isActive" value={filters.isActive === undefined ? "" : filters.isActive ? "true" : "false"} onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <select name="ruleType" value={filters.ruleType || ""} onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="MATCH_BY_DATE_AMOUNT">MATCH_BY_DATE_AMOUNT</option>
            <option value="AMOUNT_GREATER_THAN">AMOUNT_GREATER_THAN</option>
          </select>
          <select name="priority" value={filters.priority || ""} onChange={handleFilterChange}>
            <option value="">All</option>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
          </select>
          <Button variant="contained" color="primary" onClick={() => setOpenAddDialog(true)}>
            Add Rule
          </Button>
        </div>
      </div>

      {loading ? (
        <Box p={2} textAlign="center">
          <CircularProgress />
        </Box>
      ) : (
        <table className="rules-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Value</th>
              <th>Priority</th>
              <th>Active</th>
              <th>Description</th>
              <th>Date</th>
              <th className="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => (
              <tr key={rule.id}>
                <td>{rule.ruleName}</td>
                <td>{rule.ruleType}</td>
                <td>{rule.ruleValue}</td>
                <td>{rule.priority}</td>
                <td>{rule.isActive ? "Active" : "Inactive"}</td>
                <td>{rule.description}</td>
                <td>{rule.createdAt}</td>
                <td className="actions-col">
                  <button className="icon-btn edit-btn" onClick={() => handleEditClick(rule.id)}>
                    <EditIcon fontSize="small" />
                  </button>
                  <button className="icon-btn toggle-btn" onClick={() => handleToggle(rule)}>
                    {rule.isActive ? <ToggleOffIcon color="success" /> : <ToggleOnIcon color="error" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Add Rule Modal */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Rule</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Rule Name"
            fullWidth
            value={newRule.ruleName}
            onChange={(e) => setNewRule({ ...newRule, ruleName: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            value={newRule.description}
            onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Rule Type</InputLabel>
            <Select
              value={newRule.ruleType}
              onChange={(e) => setNewRule({ ...newRule, ruleType: e.target.value })}
            >
              <MenuItem value="">Select Type</MenuItem>
              <MenuItem value="MATCH_BY_DATE_AMOUNT">MATCH_BY_DATE_AMOUNT</MenuItem>
              <MenuItem value="AMOUNT_GREATER_THAN">AMOUNT_GREATER_THAN</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Rule Value"
            fullWidth
            value={newRule.ruleValue}
            onChange={(e) => setNewRule({ ...newRule, ruleValue: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Priority</InputLabel>
            <Select
              value={newRule.priority}
              onChange={(e) => setNewRule({ ...newRule, priority: Number(e.target.value) })}
            >
              <MenuItem value={1}>1</MenuItem>
              <MenuItem value={2}>2</MenuItem>
              <MenuItem value={3}>3</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              value={newRule.isActive ? "true" : "false"}
              onChange={(e) => setNewRule({ ...newRule, isActive: e.target.value === "true" })}
            >
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateRule}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Rule Modal */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Rule</DialogTitle>
        <DialogContent>
          {loadingEdit ? (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TextField
                margin="dense"
                label="Rule Name"
                fullWidth
                value={editRuleData.ruleName}
                onChange={(e) => setEditRuleData({ ...editRuleData, ruleName: e.target.value })}
              />
              <TextField
                margin="dense"
                label="Description"
                fullWidth
                value={editRuleData.description}
                onChange={(e) => setEditRuleData({ ...editRuleData, description: e.target.value })}
              />
              <FormControl fullWidth margin="dense">
                <InputLabel>Rule Type</InputLabel>
                <Select
                  value={editRuleData.ruleType}
                  onChange={(e) => setEditRuleData({ ...editRuleData, ruleType: e.target.value })}
                >
                  <MenuItem value="">Select Type</MenuItem>
                  <MenuItem value="MATCH_BY_DATE_AMOUNT">MATCH_BY_DATE_AMOUNT</MenuItem>
                  <MenuItem value="AMOUNT_GREATER_THAN">AMOUNT_GREATER_THAN</MenuItem>
                </Select>
              </FormControl>
              <TextField
                margin="dense"
                label="Rule Value"
                fullWidth
                value={editRuleData.ruleValue}
                onChange={(e) => setEditRuleData({ ...editRuleData, ruleValue: e.target.value })}
              />
              <FormControl fullWidth margin="dense">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={editRuleData.priority}
                  onChange={(e) => setEditRuleData({ ...editRuleData, priority: Number(e.target.value) })}
                >
                  <MenuItem value={1}>1</MenuItem>
                  <MenuItem value={2}>2</MenuItem>
                  <MenuItem value={3}>3</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin="dense">
                <InputLabel>Status</InputLabel>
                <Select
                  value={editRuleData.isActive ? "true" : "false"}
                  onChange={(e) => setEditRuleData({ ...editRuleData, isActive: e.target.value === "true" })}
                >
                  <MenuItem value="true">Active</MenuItem>
                  <MenuItem value="false">Inactive</MenuItem>
                </Select>
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateRule} disabled={loadingEdit}>
            Update
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

export default Rules;
