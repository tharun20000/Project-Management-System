
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Modal, Box, TextField, Button, IconButton, Typography, Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import { Add, Delete, ArrowUpward, ArrowDownward, ColorLens } from "@mui/icons-material";
import { updateProjectStages } from "../api";
import { useDispatch } from "react-redux";
import { openSnackbar } from "../redux/snackbarSlice";

const StyledModal = styled(Modal)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Container = styled(Box)`
  background-color: ${({ theme }) => theme.bgLighter};
  color: ${({ theme }) => theme.text};
  padding: 24px;
  border-radius: 12px;
  width: 500px;
  max-width: 90%;
  outline: none;
  box-shadow: 0 4px 20px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const StageList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
`;

const StageItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: ${({ theme }) => theme.bg};
  padding: 16px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.soft};
  transition: all 0.3s ease;
  &:hover {
    border-color: ${({ theme }) => theme.primary};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }
`;

const WorkflowBuilder = ({ open, setOpen, project, setProject }) => {
    const dispatch = useDispatch();
    const token = localStorage.getItem("token");
    // Default stages if none exist
    const defaultStages = [
        { name: "Working", color: "#3B82F6", position: 0 },
        { name: "Completed", color: "#10B981", position: 1 },
        { name: "Cancelled", color: "#EF4444", position: 2 }
    ];

    const [stages, setStages] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (project?.stages && project.stages.length > 0) {
            setStages([...project.stages].sort((a, b) => a.position - b.position));
        } else {
            setStages(defaultStages);
        }
    }, [project]);

    const handleAddStage = () => {
        setStages([
            ...stages,
            { name: "New Stage", color: "#854CE6", position: stages.length, type: "active" } // Default new stage
        ]);
    };

    const handleUpdateStage = (index, field, value) => {
        const newStages = [...stages];
        newStages[index] = { ...newStages[index], [field]: value };
        setStages(newStages);
    };

    const handleDeleteStage = (index) => {
        if (stages.length <= 1) {
            dispatch(openSnackbar({ message: "You must have at least one stage.", severity: "warning" }));
            return;
        }
        const newStages = stages.filter((_, i) => i !== index);
        setStages(newStages);
    };

    const handleMove = (index, direction) => {
        if (direction === -1 && index === 0) return;
        if (direction === 1 && index === stages.length - 1) return;

        const newStages = [...stages];
        const temp = newStages[index];
        newStages[index] = newStages[index + direction];
        newStages[index + direction] = temp;

        // Re-assign positions
        const reordered = newStages.map((s, i) => ({ ...s, position: i }));
        setStages(reordered);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Validation: Check for duplicate names
            const names = stages.map(s => s.name.trim());
            if (new Set(names).size !== names.length) {
                dispatch(openSnackbar({ message: "Stage names must be unique.", severity: "error" }));
                setLoading(false);
                return;
            }

            const res = await updateProjectStages(project._id, stages, token);
            setProject(res.data); // Update parent state with new project data
            dispatch(openSnackbar({ message: "Workflow updated successfully!", severity: "success" }));
            setOpen(false);
        } catch (err) {
            dispatch(openSnackbar({ message: err.response?.data?.message || "Failed to update workflow", severity: "error" }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <StyledModal open={open} onClose={() => setOpen(false)}>
            <Container>
                <Typography variant="h6" fontWeight="bold">Customize Workflow</Typography>
                <Typography variant="body2" color="textSecondary">
                    Define the stages for tasks in this project.
                </Typography>

                <StageList>
                    {stages.map((stage, index) => (
                        <StageItem key={index}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <IconButton
                                    size="small"
                                    onClick={() => handleMove(index, -1)}
                                    disabled={index === 0}
                                    sx={{
                                        color: 'white',
                                        padding: '2px',
                                        '&.Mui-disabled': { color: 'rgba(255, 255, 255, 0.3)' }
                                    }}
                                >
                                    <ArrowUpward fontSize="inherit" />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={() => handleMove(index, 1)}
                                    disabled={index === stages.length - 1}
                                    sx={{
                                        color: 'white',
                                        padding: '2px',
                                        '&.Mui-disabled': { color: 'rgba(255, 255, 255, 0.3)' }

                                    }}
                                >
                                    <ArrowDownward fontSize="inherit" />
                                </IconButton>
                            </div>

                            <TextField
                                variant="outlined"
                                size="small"
                                placeholder="Stage Name"
                                value={stage.name}
                                onChange={(e) => handleUpdateStage(index, 'name', e.target.value)}
                                sx={{
                                    flex: 1,
                                    backgroundColor: 'transparent',
                                    '& .MuiOutlinedInput-root': {
                                        color: 'white',
                                        '& fieldset': { borderColor: (theme) => theme.soft },
                                        '&:hover fieldset': { borderColor: (theme) => theme.textSoft },
                                        '&.Mui-focused fieldset': { borderColor: (theme) => theme.primary },
                                    },
                                    '& .MuiInputBase-input': { color: 'white' }
                                }}
                            />

                            <div style={{
                                position: 'relative',
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                border: '1px solid #ffffff20',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: stage.color
                            }}>
                                <input
                                    type="color"
                                    value={stage.color}
                                    onChange={(e) => handleUpdateStage(index, 'color', e.target.value)}
                                    style={{
                                        opacity: 0,
                                        width: '100%',
                                        height: '100%',
                                        cursor: 'pointer',
                                        position: 'absolute'
                                    }}
                                />
                                <ColorLens sx={{ color: 'white', opacity: 0.8, pointerEvents: 'none', fontSize: '20px' }} />
                            </div>

                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <Select
                                    value={stage.type || "active"}
                                    onChange={(e) => handleUpdateStage(index, 'type', e.target.value)}
                                    sx={{
                                        color: 'white',
                                        '.MuiOutlinedInput-notchedOutline': { borderColor: (theme) => theme.soft },
                                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: (theme) => theme.textSoft },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: (theme) => theme.primary },
                                        '.MuiSvgIcon-root': { color: 'white' }
                                    }}
                                    displayEmpty
                                >
                                    <MenuItem value="active">Active</MenuItem>
                                    <MenuItem value="completed">Completed</MenuItem>
                                    <MenuItem value="cancelled">Cancelled</MenuItem>
                                </Select>
                            </FormControl>

                            <IconButton onClick={() => handleDeleteStage(index)} color="error">
                                <Delete />
                            </IconButton>
                        </StageItem>
                    ))}
                </StageList>

                <Button
                    startIcon={<Add />}
                    onClick={handleAddStage}
                    variant="outlined"
                    fullWidth
                    sx={{ borderStyle: 'dashed' }}
                >
                    Add Stage
                </Button>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                    <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        color="primary"
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "Save Workflow"}
                    </Button>
                </Box>
            </Container>
        </StyledModal>
    );
};

export default WorkflowBuilder;
