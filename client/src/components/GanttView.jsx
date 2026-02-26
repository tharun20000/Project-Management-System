import React, { useMemo } from "react";
import styled, { useTheme } from "styled-components";
import { Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";

const Container = styled.div`
  background: ${({ theme }) => theme.bgLighter};
  border-radius: 16px;
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.soft};
  overflow-x: auto;

  /* Override gantt-task-react dark theme styles */
  .ganttTable {
    background: ${({ theme }) => theme.bgLighter} !important;
  }
  ._3_ygE { /* grid row */
    background: ${({ theme }) => theme.bgLighter} !important;
    color: ${({ theme }) => theme.text} !important;
  }
  ._2B2zv { /* header */
    background: ${({ theme }) => theme.bgDark || theme.bg} !important;
    color: ${({ theme }) => theme.text} !important;
  }
  ._3ZbQT, ._3ZbQT * { /* calendar */
    color: ${({ theme }) => theme.textSoft} !important;
    fill: ${({ theme }) => theme.textSoft} !important;
  }
  /* Today line */
  ._RuwuK {
    stroke: ${({ theme }) => theme.primary} !important;
  }
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${({ theme }) => theme.textSoft};
  font-size: 14px;
`;

const ViewToggle = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const ViewButton = styled.button`
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid ${({ active, theme }) => active ? theme.primary : theme.soft};
  background: ${({ active, theme }) => active ? theme.primary + "20" : "transparent"};
  color: ${({ active, theme }) => active ? theme.primary : theme.textSoft};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    border-color: ${({ theme }) => theme.primary};
    color: ${({ theme }) => theme.primary};
  }
`;

const GanttView = ({ works }) => {
  const theme = useTheme();
  const [viewMode, setViewMode] = React.useState(ViewMode.Week);

  const tasks = useMemo(() => {
    const ganttTasks = [];

    if (!works || works.length === 0) return [];

    works.forEach((work) => {
      // 1. Create the Project Task first
      // We need to calculate min start/max end from its children to define the project range
      let workMinStart = new Date(8640000000000000); // Max date
      let workMaxEnd = new Date(-8640000000000000); // Min date
      let hasValidTasks = false;

      const projectTasks = [];

      if (work.tasks && work.tasks.length > 0) {
        work.tasks.forEach((task) => {
          if (!task.start_date || !task.end_date) return;

          const start = new Date(task.start_date);
          const end = new Date(task.end_date);

          // Validate dates
          if (isNaN(start.getTime()) || isNaN(end.getTime())) return;

          if (end <= start) end.setDate(start.getDate() + 1);

          if (start < workMinStart) workMinStart = start;
          if (end > workMaxEnd) workMaxEnd = end;
          hasValidTasks = true;

          // Calculate progress
          const totalHours = (end - start) / (1000 * 60 * 60);
          const trackedHours = (task.time_tracked || 0) / 3600;
          let progress = totalHours > 0 ? Math.min((trackedHours / totalHours) * 100, 100) : 0;
          if (task.status === "Completed") progress = 100;

          projectTasks.push({
            start,
            end,
            name: task.task,
            id: String(task._id),
            type: "task",
            progress: Math.round(progress),
            project: String(work._id), // Links this task to the project task below
            styles: {
              backgroundColor: task.status === "Completed" ? "#10B981" : task.status === "Cancelled" ? "#EF4444" : theme.primary || "#854CE6",
              progressColor: task.status === "Completed" ? "#059669" : "#3B82F6",
              progressSelectedColor: "#2563EB",
            },
          });
        });
      }

      if (hasValidTasks) {
        // Add Project "Parent" Task
        const completedTasks = work.tasks.filter(t => t.status === "Completed").length;
        const workProgress = work.tasks.length > 0 ? Math.round((completedTasks / work.tasks.length) * 100) : 0;

        ganttTasks.push({
          start: workMinStart,
          end: workMaxEnd,
          name: work.title,
          id: String(work._id),
          type: "project",
          progress: workProgress,
          hideChildren: false,
          styles: {
            backgroundColor: theme.soft2 || "#666",
            backgroundSelectedColor: theme.textSoft || "#888",
            progressColor: theme.primary || "#854CE6",
            progressSelectedColor: "#6D28D9",
          },
        });

        // Add children after parent
        ganttTasks.push(...projectTasks);
      }
    });

    return ganttTasks;
  }, [works, theme]);

  if (tasks.length === 0) {
    return (
      <Container>
        <Title>📊 Gantt Chart</Title>
        <EmptyState>
          No tasks with valid dates found. Add tasks with start and end dates to see the Gantt chart.
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Title>📊 Gantt Chart</Title>
      <ViewToggle>
        <ViewButton active={viewMode === ViewMode.Day} onClick={() => setViewMode(ViewMode.Day)}>Day</ViewButton>
        <ViewButton active={viewMode === ViewMode.Week} onClick={() => setViewMode(ViewMode.Week)}>Week</ViewButton>
        <ViewButton active={viewMode === ViewMode.Month} onClick={() => setViewMode(ViewMode.Month)}>Month</ViewButton>
      </ViewToggle>
      <div style={{ height: '500px', width: '100%' }}>
        <Gantt
          tasks={tasks}
          viewMode={viewMode}
          listCellWidth="160px"
          columnWidth={viewMode === ViewMode.Month ? 300 : viewMode === ViewMode.Week ? 250 : 65}
          barFill={70}
          rowHeight={32}
          fontSize="12"
          todayColor={theme.primary + "15"}
        />
      </div>
    </Container>
  );
};

export default GanttView;
