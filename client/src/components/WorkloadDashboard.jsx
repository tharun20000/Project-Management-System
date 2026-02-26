
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getWorkloadStats } from '../api';
import { Avatar, LinearProgress, CircularProgress } from '@mui/material';
import { Warning, CheckCircle, VerifiedUser } from '@mui/icons-material';

const Container = styled.div`
  background: ${({ theme }) => theme.bgLighter};
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  margin-bottom: 24px;
`;

const Title = styled.h3`
  font-size: 18px;
  color: ${({ theme }) => theme.text};
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Badge = styled.span`
    font-size: 11px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 4px 10px;
    border-radius: 20px;
    font-weight: 600;
    letter-spacing: 0.5px;
    box-shadow: 0 2px 8px rgba(118, 75, 162, 0.3);
`;

// Helper for status colors
const getStatusColor = (status) => {
    switch (status) {
        case 'Overloaded': return '#EF4444'; // Red
        case 'Free Capacity': return '#10B981'; // Green
        case 'Balanced': return '#3B82F6'; // Blue
        default: return '#3B82F6';
    }
};

const MemberCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: ${({ theme }) => theme.bg};
  border-radius: 16px;
  border: 1px solid ${({ theme, status }) => getStatusColor(status) + '30'};
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
      transform: translateY(-3px);
      border-color: ${({ theme, status }) => getStatusColor(status)};
      box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  }

  /* Subtle Side Accent */
  &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: ${({ status }) => getStatusColor(status)};
  }
`;

const MemberInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 14px;
    flex: 1;
    min-width: 0; /* Ensures text truncation works */
`;

const TextInfo = styled.div`
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;

const Name = styled.div`
    font-weight: 600;
    font-size: 15px;
    color: ${({ theme }) => theme.text};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const Email = styled.div`
    font-size: 12px;
    color: ${({ theme }) => theme.textSoft};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const Stats = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    min-width: 110px;
`;

const CountRow = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    color: ${({ theme, status }) => getStatusColor(status)};
`;

const CountValue = styled.span`
    font-size: 22px;
    font-weight: 800;
    line-height: 1;
`;

const CountLabel = styled.span`
    font-size: 13px;
    font-weight: 600;
    opacity: 0.9;
`;

const StatusChip = styled.div`
    font-size: 10px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 12px;
    background: ${({ theme, status }) => getStatusColor(status) + '15'};
    color: ${({ theme, status }) => getStatusColor(status)};
    text-transform: uppercase;
    letter-spacing: 0.6px;
    display: inline-block;
`;

const WorkloadDashboard = () => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await getWorkloadStats(token);
                setStats(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}><CircularProgress size={24} /></div>;

    if (stats.length === 0) return (
        <Container>
            <Title>
                Team Workload
                <Badge>Managerial Intelligence</Badge>
            </Title>
            <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                No active workload data available.
            </div>
        </Container>
    );

    return (
        <Container>
            <Title>
                Team Workload
                <Badge>Managerial Intelligence</Badge>
            </Title>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {stats.map((member) => (
                    <MemberCard key={member._id} status={member.status}>
                        <MemberInfo>
                            <Avatar src={member.img} sx={{ width: 44, height: 44, border: `2px solid ${getStatusColor(member.status)}` }} />
                            <TextInfo>
                                <Name>{member.name}</Name>
                                <Email>{member.email}</Email>
                            </TextInfo>
                        </MemberInfo>

                        <Stats>
                            <CountRow status={member.status}>
                                <CountValue>{member.taskCount}</CountValue>
                                <CountLabel>Tasks</CountLabel>
                                {member.status === 'Overloaded' && <Warning fontSize="small" />}
                                {member.status === 'Free Capacity' && <CheckCircle fontSize="small" />}
                                {member.status === 'Balanced' && <VerifiedUser fontSize="small" />}
                            </CountRow>
                            <StatusChip status={member.status}>{member.status}</StatusChip>
                        </Stats>
                    </MemberCard>
                ))}
            </div>
        </Container>
    );
};


export default WorkloadDashboard;
