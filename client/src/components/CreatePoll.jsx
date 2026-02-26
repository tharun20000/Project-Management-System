import React, { useState } from "react";
import styled from "styled-components";
import { CircularProgress, IconButton } from "@mui/material";
import { Add } from "@mui/icons-material";
import { addPoll } from "../api";
import { useDispatch } from "react-redux";
import { openSnackbar } from "../redux/snackbarSlice";

const Overlay = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`;

const Container = styled.div`
  width: 90%;
  max-width: 500px;
  background-color: ${({ theme }) => theme.bgLighter};
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  border: 1px solid ${({ theme }) => theme.soft};
  box-sizing: border-box;
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  text-align: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.soft};
  background-color: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text};
  font-size: 14px;
  outline: none;
  box-sizing: border-box; 
  &:focus {
    border-color: ${({ theme }) => theme.primary};
  }
`;

const OptionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const OptionRow = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background-color: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 16px;
  box-sizing: border-box;
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const AddOptionBtn = styled.button`
    background: transparent;
    color: ${({ theme }) => theme.primary};
    border: 1px dashed ${({ theme }) => theme.primary};
    padding: 8px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    margin-top: 8px;
    &:hover {
        background: ${({ theme }) => theme.primary + "15"};
    }
`;

const CreatePoll = ({ setOpenCreatePoll, teamId, onPollCreated }) => {
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState(["", ""]);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const addOption = () => {
        setOptions([...options, ""]);
    };

    const handleSubmit = async () => {
        if (!question.trim()) {
            dispatch(openSnackbar({ message: "Question is required", severity: "error" }));
            return;
        }
        if (options.some(opt => !opt.trim())) {
            dispatch(openSnackbar({ message: "All options must be filled", severity: "error" }));
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await addPoll(teamId, { question, options }, token);
            dispatch(openSnackbar({ message: "Poll Created Successfully", severity: "success" }));
            onPollCreated(res.data); // Update parent state
            setOpenCreatePoll(false);
        } catch (err) {
            dispatch(openSnackbar({ message: err.response?.data?.message || "Error creating poll", severity: "error" }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Overlay onClick={() => setOpenCreatePoll(false)}>
            <Container onClick={(e) => e.stopPropagation()}>
                <Title>Create New Poll</Title>
                <Input
                    placeholder="Ask a question..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    autoFocus
                />
                <OptionList>
                    {options.map((opt, i) => (
                        <OptionRow key={i}>
                            <Input
                                placeholder={`Option ${i + 1}`}
                                value={opt}
                                onChange={(e) => handleOptionChange(i, e.target.value)}
                            />
                        </OptionRow>
                    ))}
                    <AddOptionBtn onClick={addOption}>+ Add Option</AddOptionBtn>
                </OptionList>
                <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Create Poll"}
                </Button>
            </Container>
        </Overlay>
    );
};

export default CreatePoll;
