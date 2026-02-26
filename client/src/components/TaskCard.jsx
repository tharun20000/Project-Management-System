import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { Avatar, Menu, MenuItem, IconButton, Tooltip } from "@mui/material";
import { PlayArrow, Pause, Timer } from "@mui/icons-material";
import UserAvatar from "./UserAvatar";
import { updateTaskStatus, deleteTask, startTimer, stopTimer } from "../api/index";
import { useDispatch } from "react-redux";
import { openSnackbar } from "../redux/snackbarSlice";


const Card = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  gap: 8px;
  border-left: 1.8px solid ${({ theme }) => theme.soft + "99"};
  border-right: 1.8px solid ${({ theme }) => theme.soft + "99"};
  border-bottom: 1.8px solid ${({ theme }) => theme.soft + "99"};
  background-color: ${({ theme }) => theme.card};
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  &:hover {
    transition: all 0.2s ease-in-out;
    background-color: ${({ theme }) => theme.bgDark + "40"};
  }

  ${({ completed, theme }) =>
    completed === "Completed" &&
    `
    background-color: ${theme.soft + "30"};
    `}
  ${({ completed, theme }) =>
    completed === "Cancelled" &&
    `
    background-color: #EF444410;
    `}
`;

const No = styled.div`
  width: 4%;
  font-size: 12px;
  text-overflow: ellipsis;
  font-weight: 500;
  color: ${({ theme }) => theme.soft2};
  display: -webkit-box;
  -webkit-line-clamp: 5; /* number of lines to show */
  line-clamp: 5;
  -webkit-box-orient: vertical;

  ${({ completed, theme }) =>
    completed === "Completed" &&
    `
    text-decoration: line-through;
    `}
  ${({ completed, theme }) =>
    completed === "Cancelled" &&
    `
    text-decoration: line-through;
    color: #EF4444;
    `}
`;

const Task = styled.div`
  width: 50%;
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.soft2};
  padding: 6px;

  ${({ completed, theme }) =>
    completed === "Completed" &&
    `
    text-decoration: line-through;
    `}
  ${({ completed, theme }) =>
    completed === "Cancelled" &&
    `
    text-decoration: line-through;
    color: #EF4444;
    `}
`;

const TaskTitle = styled.div`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 4px;
`;

const ImpactRow = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
`;

const RiskBadge = styled.span`
  font-size: 9px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  color: #fff;
  background: ${({ risk }) =>
    risk === 'High' ? '#ef4444' :
      risk === 'Medium' ? '#f59e0b' :
        risk === 'Low' ? '#10b981' : '#6b7280'
  };
`;

const ModuleTag = styled.span`
  font-size: 9px;
  padding: 2px 6px;
  border-radius: 4px;
  background: ${({ theme }) => theme.primary + "20"};
  color: ${({ theme }) => theme.primary};
  border: 1px solid ${({ theme }) => theme.primary + "40"};
`;

const DateCell = styled.div`
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  text-overflow: ellipsis;
  width: 14%;
  color: ${({ theme }) => theme.soft2};
  ${({ enddate, theme }) =>
    enddate &&
    `
    color: ${theme.pink};
    `}
  display: -webkit-box;
  -webkit-line-clamp: 5; /* number of lines to show */
  line-clamp: 5;
  -webkit-box-orient: vertical;

  ${({ completed, theme }) =>
    completed === "Completed" &&
    `
  text-decoration: line-through;
  `}
  ${({ completed, theme }) =>
    completed === "Cancelled" &&
    `
  text-decoration: line-through;
  color: #EF4444;
  `}
`;

const Status = styled.div`
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  width: 10%;
  color: ${({ theme }) => theme.yellow};
  padding: 4px 8px;
  background: ${({ theme }) => theme.yellow + "10"};
  border-radius: 8px;

  ${({ completed, theme }) =>
    completed === "Completed" &&
    `
    color: ${theme.green};
    background: ${theme.green + "10"};
    `}
  ${({ completed }) =>
    completed === "Cancelled" &&
    `
    color: #EF4444;
    background: #EF444410;
    `}
  
  &:hover {
    filter: brightness(0.9);
    transform: scale(1.05);
    transition: all 0.2s ease-in-out;
  }
`;

const TimerWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  width: 12%;
  justify-content: center;
`;

const TimerDisplay = styled.div`
  font-size: 11px;
  font-weight: 600;
  font-family: 'Courier New', monospace;
  color: ${({ isActive, theme }) => isActive ? theme.primary : theme.soft2};
  min-width: 55px;
  text-align: center;
  ${({ isActive }) =>
    isActive &&
    `
    animation: pulse 1.5s ease-in-out infinite;
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
  `}
`;

const TimerButton = styled(IconButton)`
  width: 26px !important;
  height: 26px !important;
  background: ${({ isActive, theme }) => isActive ? theme.primary + "20" : theme.soft + "50"} !important;
  color: ${({ isActive, theme }) => isActive ? theme.primary : theme.textSoft} !important;
  transition: all 0.2s ease !important;
  &:hover {
    background: ${({ isActive, theme }) => isActive ? theme.primary + "40" : theme.primary + "20"} !important;
    color: ${({ theme }) => theme.primary} !important;
    transform: scale(1.1);
  }
`;

const Members = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

// Helper: format seconds to HH:MM:SS
const formatTime = (totalSeconds) => {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const TaskCard = ({ item, index, members, updateTaskLocal, deleteTaskLocal }) => {
  const token = localStorage.getItem("token");
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Timer state
  const [isTimerActive, setIsTimerActive] = useState(item.active_session?.is_active || false);
  const [totalTime, setTotalTime] = useState(item.time_tracked || 0);
  const [liveSeconds, setLiveSeconds] = useState(0);
  const intervalRef = useRef(null);

  // Calculate initial elapsed time if timer was already running
  useEffect(() => {
    if (item.active_session?.is_active && item.active_session?.start_time) {
      setIsTimerActive(true);
      const startMs = new Date(item.active_session.start_time).getTime();
      const elapsed = Math.floor((Date.now() - startMs) / 1000);
      setLiveSeconds(elapsed);
    } else {
      setIsTimerActive(false);
      setLiveSeconds(0);
    }
    setTotalTime(item.time_tracked || 0);
  }, [item.active_session, item.time_tracked]);

  // Live ticker
  useEffect(() => {
    if (isTimerActive) {
      intervalRef.current = setInterval(() => {
        setLiveSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isTimerActive]);

  const handleTimerToggle = async (e) => {
    e.stopPropagation();
    try {
      if (isTimerActive) {
        const res = await stopTimer(item._id, token);
        setIsTimerActive(false);
        setTotalTime(res.data.time_tracked);
        setLiveSeconds(0);
        if (intervalRef.current) clearInterval(intervalRef.current);
        dispatch(openSnackbar({ message: "Timer stopped", severity: "success" }));
      } else {
        await startTimer(item._id, token);
        setIsTimerActive(true);
        setLiveSeconds(0);
        dispatch(openSnackbar({ message: "Timer started", severity: "success" }));
      }
    } catch (err) {
      dispatch(openSnackbar({ message: err.response?.data?.message || "Timer error", severity: "error" }));
    }
  };

  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (e) => {
    e?.stopPropagation();
    setAnchorEl(null);
  };

  const handleStatusChange = async (newStatus) => {
    handleClose();
    if (item.status === newStatus) return;

    await updateTaskStatus(item._id, newStatus, token)
      .then((res) => {
        dispatch(openSnackbar({ message: "Task status updated", severity: "success" }));
        updateTaskLocal(item._id, newStatus);
      })
      .catch((err) => {
        dispatch(openSnackbar({ message: err.response?.data?.message || "Error updating status", severity: "error" }));
      });
  };

  const handleDelete = async () => {
    handleClose();
    await deleteTask(item._id, token)
      .then((res) => {
        dispatch(openSnackbar({ message: "Task deleted successfully", severity: "success" }));
        if (deleteTaskLocal) deleteTaskLocal(item._id);
      })
      .catch((err) => {
        dispatch(openSnackbar({ message: err.response?.data?.message || "Error deleting task", severity: "error" }));
      });
  };

  const displayTime = totalTime + liveSeconds;

  return (
    <Card completed={item.status}>
      <No completed={item.status}>{index + 1}.</No>
      <Task completed={item.status}>
        <TaskTitle>{item.task}</TaskTitle>
        {(item.impact_risk || item.impact_modules?.length > 0) && (
          <ImpactRow>
            {item.impact_risk && <RiskBadge risk={item.impact_risk}>{item.impact_risk} Risk</RiskBadge>}
            {item.impact_modules?.map((mod, i) => (
              <ModuleTag key={i}>{mod}</ModuleTag>
            ))}
          </ImpactRow>
        )}
      </Task>
      <DateCell completed={item.status}>
        {item.start_date.split("-").reverse().join("-")}
      </DateCell>
      <DateCell enddate completed={item.status}>
        {item.end_date.split("-").reverse().join("-")}
      </DateCell>
      <Status
        completed={item.status}
        onClick={handleClick}
      >
        {item.status}
      </Status>
      <TimerWrapper>
        {item.status !== "Completed" && item.status !== "Cancelled" && (
          <Tooltip title={isTimerActive ? "Pause Timer" : "Start Timer"}>
            <TimerButton
              size="small"
              isActive={isTimerActive}
              onClick={handleTimerToggle}
            >
              {isTimerActive ? <Pause sx={{ fontSize: 14 }} /> : <PlayArrow sx={{ fontSize: 14 }} />}
            </TimerButton>
          </Tooltip>
        )}
        <TimerDisplay isActive={isTimerActive}>
          {displayTime > 0 || isTimerActive ? formatTime(displayTime) : "--:--"}
        </TimerDisplay>
      </TimerWrapper>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        PaperProps={{
          style: {
            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)',
            borderRadius: '12px',
          }
        }}
      >
        <MenuItem onClick={() => handleStatusChange("Working")}>Working</MenuItem>
        <MenuItem onClick={() => handleStatusChange("Completed")}>Completed</MenuItem>
        <MenuItem onClick={() => handleStatusChange("Cancelled")}>Cancelled</MenuItem>
        <MenuItem onClick={handleDelete} style={{ color: '#EF4444' }}>Delete</MenuItem>
      </Menu>
      <Members
        style={{
          justifyContent: "center",
          width: "20%",
        }}
      >
        {item.members.slice(0, 5).map((member) => (
          <UserAvatar
            key={member._id}
            sx={{
              marginRight: "-13px",
              width: "28px",
              height: "28px",
              fontSize: "16px",
            }}
            user={member}
          />
        ))}

        {item.members.length > 5 && (
          <Avatar
            sx={{
              marginRight: "-13px",
              width: "28px",
              height: "28px",
              fontSize: "12px",
            }}
          >
            +{item.members.length - 5}
          </Avatar>
        )}
      </Members>
    </Card>
  );
};

export default TaskCard;
