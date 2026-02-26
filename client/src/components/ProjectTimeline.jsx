import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { getSnapshots, createSnapshot } from "../api";
import { CircularProgress, IconButton } from "@mui/material";
import { AddAPhoto, HistoryToggleOff, WarningAmber } from "@mui/icons-material";
import WorkCards from "./WorkCards";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${({ theme }) => theme.bgLighter};
  padding: 16px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.soft};
`;

const TimelineRail = styled.div`
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 16px;
  background: ${({ theme }) => theme.bgLighter};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.soft};
  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.soft};
    border-radius: 4px;
  }
`;

const SnapshotDot = styled.div`
  min-width: 140px;
  padding: 12px;
  border-radius: 8px;
  background: ${({ theme, active }) => active ? theme.primary + "20" : theme.bg};
  border: 1px solid ${({ theme, active }) => active ? theme.primary : theme.soft};
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 6px;

  &:hover {
    border-color: ${({ theme }) => theme.primary};
  }
`;

const DotDate = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.textSoft};
`;

const DotMessage = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.text};
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Board = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
`;

const Column = styled.div`
  background: ${({ theme }) => theme.bgLighter};
  border-radius: 16px;
  padding: 16px;
  min-height: 400px;
  border: 1px solid ${({ theme }) => theme.soft};
  opacity: 0.9;
  filter: grayscale(0.2);
`;

const Title = styled.h3`
  font-size: 16px;
  color: ${({ theme }) => theme.text};
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AlertBox = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border-radius: 8px;
  border: 1px dashed rgba(245, 158, 11, 0.3);
  font-size: 13px;
`;

const ProjectTimeline = ({ projectId, token }) => {
    const [snapshots, setSnapshots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeSnapshot, setActiveSnapshot] = useState(null);

    const fetchSnapshots = async () => {
        try {
            setLoading(true);
            const res = await getSnapshots(projectId, token);
            setSnapshots(res.data);
            if (res.data.length > 0) {
                setActiveSnapshot(res.data[0]);
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSnapshots();
    }, [projectId]);

    const handleCreateSnapshot = async () => {
        const msg = prompt("Enter a description for this project snapshot (e.g., 'Milestone 1 completed'):", "Manual Snapshot");
        if (!msg) return;
        try {
            await createSnapshot(projectId, msg, token);
            fetchSnapshots();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Container>
            <HeaderRow>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
                    <HistoryToggleOff />
                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Project Time-Travel</span>
                </div>
                <IconButton
                    onClick={handleCreateSnapshot}
                    style={{ background: '#3b82f6', color: 'white', borderRadius: '8px', padding: '8px 16px', fontSize: '14px', gap: '8px' }}
                >
                    <AddAPhoto fontSize="small" /> Take Snapshot
                </IconButton>
            </HeaderRow>

            {snapshots.length === 0 ? (
                <AlertBox>
                    <WarningAmber />
                    No history snapshots found. Take a snapshot to start recording the state of your project.
                </AlertBox>
            ) : (
                <>
                    <TimelineRail>
                        {snapshots.map(snap => (
                            <SnapshotDot
                                key={snap._id}
                                active={activeSnapshot?._id === snap._id}
                                onClick={() => setActiveSnapshot(snap)}
                            >
                                <DotDate>{new Date(snap.createdAt).toLocaleString()}</DotDate>
                                <DotMessage>{snap.message}</DotMessage>
                                <div style={{ fontSize: '10px', color: '#888' }}>by {snap.createdBy?.name || "Unknown"}</div>
                            </SnapshotDot>
                        ))}
                    </TimelineRail>

                    {activeSnapshot && (
                        <div>
                            <AlertBox style={{ marginBottom: '16px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px dashed rgba(59, 130, 246, 0.3)' }}>
                                <span>Currently viewing snapshot from <b>{new Date(activeSnapshot.createdAt).toLocaleString()}</b>. This is a read-only view.</span>
                            </AlertBox>

                            <Board>
                                {/* Dynamically build stages from the snapshot's project data if it exists, else default */}
                                {(() => {
                                    const sData = activeSnapshot.snapshotData;
                                    const proj = sData.project || {};
                                    const oldWorks = sData.works || [];
                                    const stages = (proj.stages && proj.stages.length > 0)
                                        ? proj.stages.sort((a, b) => a.position - b.position)
                                        : [
                                            { name: "Working", color: "#3B82F6" },
                                            { name: "Completed", color: "#10B981" },
                                            { name: "Cancelled", color: "#EF4444" }
                                        ];

                                    return stages.map((stage, idx) => (
                                        <Column key={idx}>
                                            <Title>
                                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: stage.color || '#3b82f6' }} />
                                                {stage.name} ({oldWorks.filter(w => w.status === stage.name).length})
                                            </Title>
                                            {oldWorks.filter(w => w.status === stage.name).map(work => (
                                                <div key={work._id} style={{ pointerEvents: 'none', marginBottom: '16px' }}>
                                                    <WorkCards
                                                        status={stage.name}
                                                        stageColor={stage.color || "#3b82f6"}
                                                        work={work}
                                                        deleteWorkLocal={() => { }}
                                                    />
                                                </div>
                                            ))}
                                        </Column>
                                    ));
                                })()}
                            </Board>
                        </div>
                    )}
                </>
            )}
        </Container>
    );
};

export default ProjectTimeline;
