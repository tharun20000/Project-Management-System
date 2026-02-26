import { IconButton, Modal, Snackbar } from "@mui/material";
import React, { useState, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import styled from "styled-components";
import {
  CloseRounded,
  Add
} from "@mui/icons-material";
import { Avatar } from "@mui/material";
import { useDispatch } from "react-redux";
import { tagColors } from "../data/data";
import TaskCard from "./TaskCard";
import { addTask } from "../api/index";
import { openSnackbar } from "../redux/snackbarSlice";

const Container = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: scroll !important;
  position: absolute;
  top: 0;
  left: 0;
  background-color: #000000a7;
  display: flex;
  justify-content: center;
  align-item: center;
`;

const Wrapper = styled.div`
  width: 100%;
  height: min-content;
  margin: 2%;
  max-width: 800px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.bgLighter};
  color: ${({ theme }) => theme.text};
  display: flex;
  flex-direction: column;
  position: relative;
`;

const FlexDisplay = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Top = styled.div`
  padding: 6px 16px 0px 16px;
`;

const Title = styled.div`
  font-size: 20px;
  @media screen and (max-width: 480px) {
    font-size: 20px;
  }
  font-weight: 500;
  color: ${({ theme }) => theme.text};
  flex: 7;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* number of lines to show */
  line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const Desc = styled.div`
  font-size: 13px;
  font-weight: 400;
  color: ${({ theme }) => theme.soft2};
  flex: 7;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;m
  -webkit-line-clamp: 2; /* number of lines to show */
  line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  gap: 4px;
  margin-top: 8px;
`;

const Tag = styled.div`
  padding: 3px 8px;
  border-radius: 8px;
  color: ${({ tagColor, theme }) => tagColor + theme.lightAdd};
  background-color: ${({ tagColor, theme }) => tagColor + "10"};
  font-size: 12px;
  font-weight: 500;
`;

const Members = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const Hr = styled.hr`
  margin: 2px 0px;
  border: 0.5px solid ${({ theme }) => theme.soft + "99"};
`;

const Bottom = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0px 14px 0px;
`;

const Table = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 6px 10px;
`;

const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 10px;
  gap: 8px;
  border-radius: 8px 8px 0px 0px;
  border: 1.8px solid ${({ theme }) => theme.soft + "99"};
  background-color: ${({ theme }) => theme.card};
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  background-color: ${({ theme }) => theme.bgDark};
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
`;

const Task = styled.div`
  width: 50%;
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.soft2};
  display: -webkit-box;
  -webkit-line-clamp: 5; /* number of lines to show */
  line-clamp: 5;
  -webkit-box-orient: vertical;
  padding: 6px;

  ${({ completed, theme }) =>
    completed === "Completed" &&
    `
    text-decoration: line-through;
    `}
`;

const Date = styled.div`
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
`;

const NewTaskWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  border: 1px dashed ${({ theme }) => theme.soft2};
  border-radius: 8px;
  margin-top: 10px;
  width: 100%;
`;

const Input = styled.input`
  border: 1px solid ${({ theme }) => theme.soft2};
  background-color: transparent;
  color: ${({ theme }) => theme.text};
  border-radius: 4px;
  padding: 6px;
  font-size: 12px;
  width: ${({ width }) => width || "auto"};
  outline: none;
`;

const Button = styled.button`
  padding: 6px 12px;
  background-color: ${({ theme, cancel }) => cancel ? theme.soft : theme.primary};
  color: ${({ theme, cancel }) => cancel ? theme.textSoft : "white"};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;

  &:hover {
    opacity: 0.9;
  }
`;

const AddTaskButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  margin-top: 10px;
  cursor: pointer;
  color: ${({ theme }) => theme.primary};
  font-weight: 500;
  border-radius: 8px;
  &:hover {
    background-color: ${({ theme }) => theme.primary + "10"};
  }
`;

const WorkDetails = ({ setOpenWork, work, reloadWorks }) => {
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  const [task, setTask] = useState(work.tasks || []);
  const [completed, setCompleted] = useState(0);
  const [progress, setProgress] = useState(0);
  const [members, setMembers] = useState([]);

  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ task: "", desc: "", start_date: "", end_date: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTask(work.tasks || []);
  }, [work]);

  useEffect(() => {
    let count = 0;
    let Members = [];
    if (Array.isArray(task)) {
      task.forEach((item) => {
        if (item.status === "Completed") {
          count++;
        }

        if (item.members && item.members.length > 0) {
          item.members.forEach((items) => {
            if (items) {
              //check if the same member is already present in the array
              let isPresent = Members.some((member) => member._id === items._id);
              if (!isPresent) {
                Members.push(items);
              }
            }
          });
        }
      });
    }
    setCompleted(count);
    setProgress(task.length > 0 ? (count / task.length) * 100 : 0);
    setMembers(Members);
  }, [task]);

  const updateTaskLocal = (taskId, newStatus) => {
    setTask((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
    );
    if (reloadWorks) reloadWorks();
  };

  const deleteTaskLocal = (taskId) => {
    setTask((prev) => prev.filter((t) => t._id !== taskId));
    if (reloadWorks) reloadWorks();
  };

  const handleAddTask = async () => {
    if (!newTask.task || !newTask.start_date || !newTask.end_date) {
      dispatch(openSnackbar({ message: "Please fill all fields", severity: "error" }));
      return;
    }
    setLoading(true);
    try {
      const res = await addTask(work._id, { ...newTask, members: [] }, token);
      setTask([...task, res.data]);
      setShowAdd(false);
      setNewTask({ task: "", desc: "", start_date: "", end_date: "" });
      dispatch(openSnackbar({ message: "Task added successfully", severity: "success" }));
      if (reloadWorks) reloadWorks();
    } catch (err) {
      dispatch(openSnackbar({ message: err.response?.data?.message || "Error adding task", severity: "error" }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={true} onClose={() => setOpenWork(false)}>
      <Container>
        <Wrapper>
          <Top>
            <FlexDisplay>
              <Title>{work.title}</Title>
              <IconButton
                style={{
                  cursor: "pointer",
                  color: "inherit",
                }}
                onClick={() => setOpenWork(false)}
              >
                <CloseRounded style={{ color: "inherit" }} />
              </IconButton>
            </FlexDisplay>
            <Desc>
              {work.desc}
            </Desc>
            <Members
              style={{
                margin: "10px 0px",
              }}
            >
              {members.slice(0, 10).map((member) => (
                <Avatar
                  sx={{
                    marginRight: "-13px",
                    width: "30px",
                    height: "30px",
                    fontSize: "16px",
                  }}
                  src={member.img}
                >
                  {member.name.charAt(0)}
                </Avatar>
              ))}
              {members.length > 9 && (
                <Avatar
                  sx={{
                    marginRight: "-13px",
                    width: "30px",
                    height: "30px",
                    fontSize: "12px",
                  }}
                >
                  +{members.length - 9}
                </Avatar>
              )}
            </Members>
          </Top>
          <Hr />
          <Bottom>
            <Table>
              <TableHeader>
                <No style={{ fontSize: "14px", fontWeight: "800" }}>No</No>
                <Task
                  style={{ width: "51%", fontSize: "14px", fontWeight: "800" }}
                >
                  Sub-tasks
                </Task>
                <Date style={{ fontSize: "14px", fontWeight: "800" }}>
                  Start Date
                </Date>
                <Date style={{ fontSize: "14px", fontWeight: "800" }}>
                  Deadline
                </Date>
                <Date style={{ fontSize: "14px", fontWeight: "800" }}>
                  Status
                </Date>
                <Date style={{ fontSize: "14px", fontWeight: "800", width: "12%" }}>
                  Time
                </Date>
                <Date
                  style={{
                    textAlign: "center",
                    width: "20%",
                    fontSize: "14px",
                    fontWeight: "800",
                  }}
                >
                  Members
                </Date>
              </TableHeader>
              {task?.map((item, index) => (
                <TaskCard key={item._id} item={item} index={index} members={members} updateTaskLocal={updateTaskLocal} deleteTaskLocal={deleteTaskLocal} />
              ))}

              {!showAdd ? (
                <AddTaskButton onClick={() => setShowAdd(true)}>
                  <Add fontSize="small" /> Add Sub-task
                </AddTaskButton>
              ) : (
                <NewTaskWrapper>
                  <Input
                    width="5%"
                    disabled
                    value={task.length + 1}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', width: '45%' }}>
                    <Input
                      width="100%"
                      placeholder="Sub-task Title"
                      value={newTask.task}
                      onChange={(e) => setNewTask({ ...newTask, task: e.target.value })}
                      style={{ marginBottom: '4px' }}
                    />
                    <Input
                      width="100%"
                      placeholder="Sub-task Description (Used for AI Impact Analysis)"
                      value={newTask.desc}
                      onChange={(e) => setNewTask({ ...newTask, desc: e.target.value })}
                    />
                  </div>
                  <Input
                    width="15%"
                    type="date"
                    value={newTask.start_date}
                    onChange={(e) => setNewTask({ ...newTask, start_date: e.target.value })}
                  />
                  <Input
                    width="15%"
                    type="date"
                    value={newTask.end_date}
                    onChange={(e) => setNewTask({ ...newTask, end_date: e.target.value })}
                  />
                  <div style={{ display: "flex", gap: "6px" }}>
                    <Button onClick={handleAddTask} disabled={loading}>{loading ? "..." : "Add"}</Button>
                    <Button cancel onClick={() => setShowAdd(false)}>Cancel</Button>
                  </div>
                </NewTaskWrapper>
              )}

            </Table>
          </Bottom>
        </Wrapper>
      </Container>
    </Modal>
  );
};

export default WorkDetails;
