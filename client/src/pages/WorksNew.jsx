import React, { useState, useEffect } from "react";
import styled, { keyframes, useTheme } from "styled-components";
import { Avatar, IconButton, Chip, LinearProgress } from "@mui/material";
import { MoreHoriz, CheckCircleOutline, DonutLarge, CalendarToday, Assignment, ArrowForward } from "@mui/icons-material";
import { GalaxyButton, PremiumLoader } from "../components/CreativeComponents";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { useDispatch, useSelector } from "react-redux";
import { openSnackbar } from "../redux/snackbarSlice";
import { userWorks, userTasks } from "../api";

// --- Animations ---
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Styled Components ---

const Container = styled.div`
  padding: 30px;
  background-color: ${({ theme }) => theme.bg};
  height: 100%;
  overflow-y: scroll;
  background: 
    radial-gradient(circle at 10% 20%, ${({ theme }) => theme.bgLighter} 0%, transparent 20%),
    radial-gradient(circle at 90% 80%, ${({ theme }) => theme.primary + "15"} 0%, transparent 20%),
    radial-gradient(${({ theme }) => theme.textSoft + "10"} 1px, transparent 1px);
  background-size: 100% 100%, 100% 100%, 30px 30px;
  background-attachment: local;
`;

const Header = styled.div`
  margin-bottom: 40px;
  animation: ${fadeInUp} 0.6s ease-out;
`;

const Title = styled.h1`
  font-size: 34px;
  font-weight: 800;
  background: linear-gradient(to right, ${({ theme }) => theme.text}, ${({ theme }) => theme.primary});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;

  &::before {
    content: "💼";
    -webkit-text-fill-color: initial;
    font-size: 32px;
  }
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.textSoft};
  font-size: 16px;
`;

// --- Bento Stats Grid ---

const BentoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
  animation: ${fadeInUp} 0.7s ease-out;
`;

const BentoCard = styled.div`
  background: ${({ theme }) => theme.bgLighter};
  border-radius: 24px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 160px;
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-5px);
    border-color: ${({ theme }) => theme.primary + "50"};
  }
`;

const StatValue = styled.h2`
  font-size: 42px;
  font-weight: 800;
  color: ${({ theme }) => theme.text};
  margin: 0;
`;

const StatLabel = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.textSoft};
  display: flex;
  align-items: center;
  gap: 6px;
`;

// --- Works Section ---

const SectionTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const WorksGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 40px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const WorkColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const WorkCard = styled.div`
  background: ${({ theme }) => theme.bgLighter};
  border-radius: 20px;
  padding: 24px;
  border: 1px solid ${({ theme }) => theme.soft + "30"};
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  animation: ${fadeInUp} 0.8s ease-out;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  }
  
  /* Border Beam Effect */
   &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 20px; 
    padding: 2px;
    background: linear-gradient(90deg, transparent, ${({ theme }) => theme.primary}, transparent);
    -webkit-mask: 
       linear-gradient(#fff 0 0) content-box, 
       linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover::before {
      opacity: 0.5;
  }
`;

const WorkHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const WorkTitle = styled.h4`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin: 0 0 4px 0;
`;

const WorkDate = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.textSoft};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const MemberGroup = styled.div`
  display: flex;
  padding-left: 10px;
`;

// --- Tasks Table (Simplified) ---

const TaskSection = styled.div`
  background: ${({ theme }) => theme.bgLighter};
  border-radius: 24px;
  padding: 30px;
  border: 1px solid ${({ theme }) => theme.soft + "30"};
`;

const TaskRow = styled.div`
  display: grid;
  grid-template-columns: 50px 3fr 1fr 1fr 1fr;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid ${({ theme }) => theme.soft + "30"};
  color: ${({ theme }) => theme.text};
  font-size: 14px;

  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 768px) {
      grid-template-columns: 3fr 1fr;
      gap: 10px;
      /* Hide other columns on mobile for now */
      & > *:nth-child(1), & > *:nth-child(3), & > *:nth-child(4) {
          display: none;
      }
  }
`;

const TaskHeader = styled(TaskRow)`
  font-weight: 700;
  color: ${({ theme }) => theme.textSoft};
  border-bottom: 2px solid ${({ theme }) => theme.soft + "30"};
`;

const WorksNew = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [works, setWorks] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const worksRes = await userWorks(token);
        const tasksRes = await userTasks(token);

        setWorks(worksRes.data);
        setTasks(tasksRes.data);
        setLoading(false);
      } catch (err) {
        dispatch(openSnackbar({ message: err.response?.data?.message || err.message || "Failed to fetch data", type: "error" }));
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchData();
    }
  }, [currentUser, dispatch]);

  const completedWorks = works.filter(w => w.status === "Completed");
  const pendingWorks = works.filter(w => w.status === "Working" || w.status === "In Progress");
  const pendingTasksCount = tasks.filter(t => t.status !== "Completed").length;

  return (
    <Container>
      <Header>
        <Title>My Works</Title>
        <Subtitle>Manage your ongoing projects and personal tasks.</Subtitle>
      </Header>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", width: "100%", padding: "40px" }}>
          <PremiumLoader />
        </div>
      ) : (
        <>
          <BentoGrid>
            <BentoCard>
              <div>
                <StatLabel><DonutLarge sx={{ fontSize: 16 }} /> Total Works</StatLabel>
                <StatValue>{works.length}</StatValue>
              </div>
              <LinearProgress variant="determinate" value={works.length > 0 ? (completedWorks.length / works.length) * 100 : 0} sx={{ borderRadius: 5, height: 6, backgroundColor: theme.soft }} />
            </BentoCard>
            <BentoCard>
              <div>
                <StatLabel><Assignment sx={{ fontSize: 16 }} /> Pending Tasks</StatLabel>
                <StatValue>{pendingTasksCount}</StatValue>
              </div>
              <div style={{ fontSize: '12px', color: theme.textSoft }}>Keep it up!</div>
            </BentoCard>
            <BentoCard style={{ background: `linear-gradient(135deg, ${theme.primary} 0%, #6A38C2 100%)` }}>
              <div>
                <StatLabel style={{ color: 'rgba(255,255,255,0.8)' }}><CheckCircleOutline sx={{ fontSize: 16 }} /> Completed</StatLabel>
                <StatValue style={{ color: 'white' }}>{completedWorks.length}</StatValue>
              </div>
              <GalaxyButton style={{ background: 'rgba(255,255,255,0.2)', width: 'fit-content', padding: '6px 16px', fontSize: '12px' }}>
                View Archive <ArrowForward sx={{ fontSize: 14 }} />
              </GalaxyButton>
            </BentoCard>
          </BentoGrid>

          <WorksGrid>
            <WorkColumn>
              <SectionTitle><DonutLarge sx={{ color: '#3b82f6' }} /> In Progress</SectionTitle>
              {pendingWorks.length === 0 ? (
                <div style={{ color: theme.textSoft, padding: '20px' }}>No works in progress.</div>
              ) : (
                pendingWorks.map((work) => (
                  <WorkCard key={work._id}>
                    <WorkHeader>
                      <div>
                        <WorkTitle>{work.title}</WorkTitle>
                        <WorkDate><CalendarToday sx={{ fontSize: 12 }} /> {new Date(work.createdAt).toLocaleDateString()}</WorkDate>
                      </div>
                      <IconButton size="small"><MoreHoriz /></IconButton>
                    </WorkHeader>
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', color: theme.textSoft }}>
                        <span>Status</span>
                        <span>Working</span>
                      </div>
                      <LinearProgress variant="determinate" value={60} sx={{ borderRadius: 4, height: 6, backgroundColor: theme.soft, '& .MuiLinearProgress-bar': { backgroundColor: '#3b82f6' } }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <MemberGroup>
                        {work.members?.slice(0, 3).map((m) => (
                          <Avatar key={m._id} src={m.img} sx={{ width: 28, height: 28, marginLeft: '-8px', border: `2px solid ${theme.bgLighter}` }}>
                            {m.name[0]}
                          </Avatar>
                        ))}
                      </MemberGroup>
                      <Chip label="On Track" size="small" sx={{ height: 24, fontSize: 11, backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }} />
                    </div>
                  </WorkCard>
                ))
              )}
            </WorkColumn>

            <WorkColumn>
              <SectionTitle><CheckCircleOutline sx={{ color: '#10b981' }} /> Completed</SectionTitle>
              {completedWorks.length === 0 ? (
                <div style={{ color: theme.textSoft, padding: '20px' }}>No completed works yet.</div>
              ) : (
                completedWorks.map((work) => (
                  <WorkCard key={work._id} style={{ opacity: 0.8 }}>
                    <WorkHeader>
                      <div>
                        <WorkTitle>{work.title}</WorkTitle>
                        <WorkDate><CalendarToday sx={{ fontSize: 12 }} /> {new Date(work.updatedAt).toLocaleDateString()}</WorkDate>
                      </div>
                      <IconButton size="small"><MoreHoriz /></IconButton>
                    </WorkHeader>
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', color: theme.textSoft }}>
                        <span>Completed</span>
                        <span>100%</span>
                      </div>
                      <LinearProgress variant="determinate" value={100} sx={{ borderRadius: 4, height: 6, backgroundColor: theme.soft, '& .MuiLinearProgress-bar': { backgroundColor: '#10b981' } }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <MemberGroup>
                        {work.members?.slice(0, 3).map((m) => (
                          <Avatar key={m._id} src={m.img} sx={{ width: 28, height: 28, marginLeft: '-8px', border: `2px solid ${theme.bgLighter}` }}>
                            {m.name[0]}
                          </Avatar>
                        ))}
                      </MemberGroup>
                      <Chip label="Done" size="small" sx={{ height: 24, fontSize: 11, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }} />
                    </div>
                  </WorkCard>
                ))
              )}
            </WorkColumn>
          </WorksGrid>

          <SectionTitle>Your Tasks</SectionTitle>
          <TaskSection>
            <TaskHeader>
              <span>No</span>
              <span>Task Name</span>
              <span>Start Date</span>
              <span>Deadline</span>
              <span>Status</span>
            </TaskHeader>
            {tasks.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: theme.textSoft }}>No tasks found.</div>
            ) : (
              tasks.map((task, index) => (
                <TaskRow key={task._id}>
                  <span>{index + 1}</span>
                  <span style={{ fontWeight: 600 }}>{task.task}</span>
                  <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                  <span style={{ color: '#ef4444' }}>{new Date(task.end_date).toLocaleDateString()}</span>
                  <Chip
                    label={task.status}
                    size="small"
                    sx={{
                      width: 'fit-content',
                      fontSize: 11,
                      backgroundColor: task.status === 'Completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: task.status === 'Completed' ? '#10b981' : '#ef4444'
                    }}
                  />
                </TaskRow>
              ))
            )}
          </TaskSection>
        </>
      )}
    </Container>
  );
};

export default WorksNew;
