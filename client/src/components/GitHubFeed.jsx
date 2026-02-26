import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { CircularProgress, Avatar } from '@mui/material';
import { format } from 'timeago.js';
import { getGitHubActivity } from '../api';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const Container = styled.div`
  padding: 20px;
  background-color: ${({ theme }) => theme.bgLighter};
  border-radius: 12px;
  min-height: 400px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  color: ${({ theme }) => theme.text};
  font-size: 20px;
  font-weight: 600;
`;

const FeedList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const EventCard = styled.div`
  background-color: ${({ theme }) => theme.bgDark};
  padding: 16px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.soft};
`;

const EventHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const ActorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${({ theme }) => theme.textSoft};
  font-size: 14px;
`;

const Time = styled.div`
  color: ${({ theme }) => theme.soft2};
  font-size: 12px;
`;

const CommitList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-left: 46px;
`;

const CommitItem = styled.div`
  color: ${({ theme }) => theme.text};
  font-size: 14px;
  line-height: 1.5;
`;

const CommitLink = styled.a`
  color: ${({ theme }) => theme.primary};
  text-decoration: none;
  font-family: monospace;
  font-weight: 500;
  &:hover {
    text-decoration: underline;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: ${({ theme }) => theme.textSoft};
  gap: 16px;
  text-align: center;
`;

const GitHubFeed = ({ projectId, githubRepo }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!githubRepo) {
            setLoading(false);
            return;
        }

        const fetchActivity = async () => {
            try {
                const res = await getGitHubActivity(projectId, token);
                setEvents(res.data);
                setError(null);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load GitHub activity.");
            } finally {
                setLoading(false);
            }
        };

        fetchActivity();
    }, [projectId, githubRepo, token]);

    if (!githubRepo) {
        return (
            <Container>
                <EmptyState>
                    <ErrorOutlineIcon style={{ fontSize: 48, color: '#6b7280' }} />
                    <div>
                        <h3>No GitHub Repository Linked</h3>
                        <p style={{ marginTop: '8px', fontSize: '14px' }}>Edit project settings to link a public GitHub repository and see live commit updates here.</p>
                    </div>
                </EmptyState>
            </Container>
        );
    }

    return (
        <Container>
            <Header>
                <svg height="28" viewBox="0 0 16 16" version="1.1" width="28" aria-hidden="true" fill="currentColor">
                    <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                </svg>
                GitHub Activity ({githubRepo})
            </Header>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                    <CircularProgress />
                </div>
            ) : error ? (
                <EmptyState>
                    <ErrorOutlineIcon style={{ fontSize: 48, color: '#ef4444' }} />
                    <div style={{ color: '#ef4444' }}>{error}</div>
                </EmptyState>
            ) : events.length === 0 ? (
                <EmptyState>
                    <div>No recent commits found for this repository.</div>
                </EmptyState>
            ) : (
                <FeedList>
                    {events.map((commit) => (
                        <EventCard key={commit.id}>
                            <EventHeader>
                                <ActorInfo>
                                    <Avatar src={commit.actor.avatar} sx={{ width: 32, height: 32 }} />
                                    <div>
                                        <a href={commit.actor.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', fontWeight: 600, textDecoration: 'none' }}>
                                            {commit.actor.name}
                                        </a> committed
                                    </div>
                                </ActorInfo>
                                <Time>{format(commit.created_at)}</Time>
                            </EventHeader>
                            <CommitList style={{ marginLeft: '0px', marginTop: '12px' }}>
                                <CommitItem>
                                    <CommitLink href={commit.url} target="_blank" rel="noopener noreferrer">
                                        {commit.id.substring(0, 7)}
                                    </CommitLink> — {commit.message}
                                </CommitItem>
                            </CommitList>
                        </EventCard>
                    ))}
                </FeedList>
            )}
        </Container>
    );
};

export default GitHubFeed;
