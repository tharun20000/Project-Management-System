import React, { useState } from "react";
import styled from "styled-components";
import { CircularProgress } from "@mui/material";
import { votePoll } from "../api";
import { useDispatch } from "react-redux";
import { openSnackbar } from "../redux/snackbarSlice";
import PollCard from "./PollCard";

const Container = styled.div`
  background-color: ${({ theme }) => theme.card};
  border-radius: 12px;
  padding: 16px;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid ${({ theme }) => theme.soft};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const Question = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0;
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const OptionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
  padding: 10px 14px;
  border-radius: 8px;
  background-color: ${({ selected, theme }) => selected ? theme.primary + "20" : theme.bgLighter};
  border: 1px solid ${({ selected, theme }) => selected ? theme.primary : theme.soft};
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;

  &:hover {
    background-color: ${({ theme }) => theme.primary + "10"};
  }
`;

const OptionText = styled.span`
  z-index: 1;
  font-weight: 500;
`;

const VoteCount = styled.span`
  z-index: 1;
  font-size: 12px;
  color: ${({ theme }) => theme.textSoft};
`;

const ProgressBar = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${({ percent }) => percent}%;
    background-color: ${({ theme }) => theme.primary + "15"};
    z-index: 0;
    transition: width 0.3s ease;
`;


const UserVote = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.textSoft};
  margin-top: 8px;
  text-align: right;
`;

const PollComponent = ({ poll, teamId, currentUserId, onVote }) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const totalVotes = poll.options.reduce((acc, opt) => acc + opt.votes.length, 0);
  const userVotedOptionIndex = poll.options.findIndex(opt => opt.votes.includes(currentUserId));

  const handleVote = async (optionIndex) => {
    if (userVotedOptionIndex === optionIndex) return; // Already voted this

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await votePoll(teamId, poll._id, optionIndex, token);
      dispatch(openSnackbar({ message: "Vote cast successfully", severity: "success" }));
      onVote(); // Trigger refresh
    } catch (err) {
      dispatch(openSnackbar({ message: err.response?.data?.message || "Error voting", severity: "error" }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container>
      <Header>
        <Question>{poll.question}</Question>
      </Header>
      <OptionsContainer>
        {poll.options.map((option, index) => {
          const percent = totalVotes > 0 ? Math.round((option.votes.length / totalVotes) * 100) : 0;
          const isSelected = userVotedOptionIndex === index;

          return (
            <OptionButton
              key={index}
              selected={isSelected}
              onClick={() => handleVote(index)}
              disabled={loading}
            >
              <ProgressBar percent={percent} />
              <OptionText>{option.text}</OptionText>
              <VoteCount>{percent}% ({option.votes.length})</VoteCount>
            </OptionButton>
          );
        })}
      </OptionsContainer>
      <UserVote>
        {totalVotes} votes • {userVotedOptionIndex !== -1 ? "You voted" : "Cast your vote"}
      </UserVote>
    </Container>
  );
};

export default PollComponent;
