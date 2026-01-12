import React, { useState } from "react";
import styled, { keyframes, useTheme } from "styled-components";
import { Avatar, IconButton, Chip } from "@mui/material";
import { Favorite, FavoriteBorder, ChatBubbleOutline, Share, MoreHoriz, Search, AddPhotoAlternate, Send } from "@mui/icons-material";
import { GalaxyButton, MagicCard } from "../components/CreativeComponents";

// --- Animations ---
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

// --- Styled Components ---

const Container = styled.div`
  padding: 30px;
  background-color: ${({ theme }) => theme.bg};
  height: 100%;
  overflow-y: scroll;
  /* Premium Radial Gradient Background */
  background: 
    radial-gradient(circle at 10% 20%, ${({ theme }) => theme.bgLighter} 0%, transparent 20%),
    radial-gradient(circle at 90% 80%, ${({ theme }) => theme.primary + "15"} 0%, transparent 20%),
    radial-gradient(${({ theme }) => theme.textSoft + "10"} 1px, transparent 1px);
  background-size: 100% 100%, 100% 100%, 30px 30px;
  background-attachment: local;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 30px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const MainFeed = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: sticky;
  top: 0;
  height: fit-content;
  animation: ${fadeInUp} 0.8s ease-out;

  @media (max-width: 900px) {
    display: none;
  }
`;

// --- Header Section ---

const Header = styled.div`
  margin-bottom: 30px;
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
    content: "🚀";
    -webkit-text-fill-color: initial;
    font-size: 32px;
    animation: ${float} 3s ease-in-out infinite;
  }
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.textSoft};
  font-size: 16px;
`;

// --- Create Post Section ---

const CreatePostBox = styled.div`
  background: ${({ theme }) => theme.bgLighter};
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  border: 1px solid ${({ theme }) => theme.soft + "50"};
  animation: ${fadeInUp} 0.7s ease-out;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-start;
`;

const StyledInput = styled.textarea`
  width: 100%;
  border: none;
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text};
  padding: 16px;
  border-radius: 16px;
  font-size: 15px;
  resize: none;
  min-height: 80px;
  font-family: inherit;
  transition: all 0.3s;

  &:focus {
    outline: 2px solid ${({ theme }) => theme.primary + "50"};
    background: ${({ theme }) => theme.bgLighter};
  }

  &::placeholder {
    color: ${({ theme }) => theme.textSoft};
  }
`;

const ActionsBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid ${({ theme }) => theme.soft + "50"};
`;

const ActionButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.textSoft};
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 50px;
  transition: all 0.2s;
  font-weight: 500;

  &:hover {
    background: ${({ theme }) => theme.soft};
    color: ${({ theme }) => theme.primary};
  }
`;

// --- Post Card ---

// --- 21st.dev Inspired Components ---

const borderBeam = keyframes`
  100% {
    offset-distance: 100%;
  }
`;

const BentoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
`;

const BentoItem = styled.div`
  background: ${({ theme }) => theme.bgLighter};
  border-radius: 20px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  /* Glassmorphism */
  backdrop-filter: blur(10px);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    border-color: ${({ theme }) => theme.primary + "50"};
  }
`;

const PostCard = styled.div`
  background: ${({ theme }) => theme.bgLighter};
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  position: relative;
  overflow: hidden;
  margin-bottom: 24px;
  border: 1px solid transparent;

  /* Border Beam Effect placeholder - simplified for CSS-in-JS without extra dom nodes */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 24px; 
    padding: 2px;
    background: linear-gradient(90deg, transparent, ${({ theme }) => theme.primary}, transparent);
    -webkit-mask: 
       linear-gradient(#fff 0 0) content-box, 
       linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    opacity: 0.5;
  }

  &:hover {
     box-shadow: 0 10px 40px rgba(133, 76, 230, 0.15);
     transform: translateY(-2px);
     &::before {
       background: linear-gradient(90deg, ${({ theme }) => theme.primary}, #C77DFF, ${({ theme }) => theme.primary});
       opacity: 1;
     }
  }
`;

// Helper to render stars/badges
const Badge = styled.span`
  background: linear-gradient(135deg, #FFD700 0%, #FDB931 100%);
  color: #333;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  margin-left: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
`;

const PostHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserName = styled.h4`
  color: ${({ theme }) => theme.text};
  font-weight: 700;
  margin: 0;
  font-size: 16px;
`;

const PostMeta = styled.span`
  color: ${({ theme }) => theme.textSoft};
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const PostContent = styled.p`
  color: ${({ theme }) => theme.text};
  line-height: 1.6;
  font-size: 15px;
  margin-bottom: 16px;
  white-space: pre-line;
`;

const PostImage = styled.img`
  width: 100%;
  border-radius: 16px;
  margin-bottom: 16px;
  max-height: 400px;
  object-fit: cover;
  border: 1px solid ${({ theme }) => theme.soft};
`;

const InteractionBar = styled.div`
  display: flex;
  gap: 20px;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.soft + "30"};
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${({ liked, theme }) => liked ? '#ef4444' : theme.textSoft};
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    color: ${({ theme }) => theme.primary};
    transform: scale(1.05);
  }
`;

// --- Sidebar Components ---

const SidebarTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
  color: ${({ theme }) => theme.text};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TrendingItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-bottom: 1px solid ${({ theme }) => theme.soft + "30"};
  padding: 12px 0;
  cursor: pointer;

  &:last-child {
    border-bottom: none;
  }

  &:hover h5 {
    color: ${({ theme }) => theme.primary};
  }
`;

const TrendingTag = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.textSoft};
`;

const TrendingTopic = styled.h5`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0;
  transition: color 0.2s;
`;

// --- Dummy Data ---

const DUMMY_POSTS = [
    {
        id: 1,
        name: "Sarah Jenkins",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
        time: "2 hours ago",
        content: "Just launched the new marketing campaign for the Project Alpha! 🚀\n\nThe team did an incredible job coordinating with the design department. Loving the new features we implemented this sprint.",
        image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        likes: 24,
        comments: 5,
        isLiked: true,
    },
    {
        id: 2,
        name: "Michael Chen",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
        time: "4 hours ago",
        content: "Anyone have recommendations for managing state in large React applications? We're looking at Redux Toolkit vs just Context API for the new dashboard module. #react #development",
        likes: 12,
        comments: 18,
        isLiked: false,
    },
    {
        id: 3,
        name: "Emily Davis",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704b",
        time: "Yesterday",
        content: "Design system update is live! Check out the new component library documentation. We've added 3D elements and new glassmorphism utilities.",
        image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
        likes: 45,
        comments: 2,
        isLiked: false,
    }
];

const TRENDING = [
    { tag: "Development", topic: "#Reactjs2024" },
    { tag: "Design", topic: "#UIUXTrends" },
    { tag: "Productivity", topic: "#RemoteWorkLife" },
    { tag: "Announcements", topic: "#Q1Goals" },
];

const CommunityNew = () => {
    const theme = useTheme();
    const [posts, setPosts] = useState(DUMMY_POSTS);

    const handleLike = (id) => {
        setPosts(posts.map(post =>
            post.id === id
                ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
                : post
        ));
    };

    return (
        <Container>
            <Header>
                <Title>Community Hub</Title>
                <Subtitle>Connect, share, and grow with your team.</Subtitle>
            </Header>

            <ContentWrapper>
                <MainFeed>
                    <CreatePostBox>
                        <InputWrapper>
                            <Avatar src="https://i.pravatar.cc/150?u=myuser" sx={{ width: 44, height: 44 }} />
                            <StyledInput placeholder="Share something with the community..." />
                        </InputWrapper>
                        <ActionsBar>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <ActionButton><AddPhotoAlternate sx={{ fontSize: 20 }} /> Media</ActionButton>
                                <ActionButton><FavoriteBorder sx={{ fontSize: 20 }} /> Feeling</ActionButton>
                            </div>
                            <GalaxyButton style={{ padding: '8px 24px', fontSize: '14px' }}>
                                Post <Send sx={{ fontSize: 16, marginLeft: '6px' }} />
                            </GalaxyButton>
                        </ActionsBar>
                    </CreatePostBox>

                    {posts.map((post) => (
                        <PostCard key={post.id}>
                            <PostHeader>
                                <UserInfo>
                                    <Avatar src={post.avatar} sx={{ width: 42, height: 42 }} />
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <UserName>{post.name}</UserName>
                                            {post.id === 1 && <Badge>Top Contributor</Badge>}
                                        </div>
                                        <PostMeta>
                                            {post.time} • <GalaxyButton as="span" style={{ padding: '2px 8px', fontSize: '10px', height: 'auto', minHeight: 'auto', background: theme.primary + '20', color: theme.primary, boxShadow: 'none' }}>Team</GalaxyButton>
                                        </PostMeta>
                                    </div>
                                </UserInfo>
                                <IconButton size="small"><MoreHoriz /></IconButton>
                            </PostHeader>
                            <PostContent>{post.content}</PostContent>
                            {post.image && <PostImage src={post.image} alt="Post content" />}

                            <InteractionBar>
                                <StatItem onClick={() => handleLike(post.id)} liked={post.isLiked}>
                                    {post.isLiked ? <Favorite /> : <FavoriteBorder />} {post.likes}
                                </StatItem>
                                <StatItem>
                                    <ChatBubbleOutline /> {post.comments}
                                </StatItem>
                                <StatItem>
                                    <Share /> Share
                                </StatItem>
                            </InteractionBar>
                        </PostCard>
                    ))}
                </MainFeed>

                <Sidebar>
                    <BentoGrid>
                        <BentoItem>
                            <SidebarTitle>🔥 Trending Topics</SidebarTitle>
                            {TRENDING.map((item, index) => (
                                <TrendingItem key={index}>
                                    <TrendingTag>{item.tag}</TrendingTag>
                                    <TrendingTopic>{item.topic}</TrendingTopic>
                                </TrendingItem>
                            ))}
                        </BentoItem>

                        <BentoItem>
                            <SidebarTitle>👥 Suggested People</SidebarTitle>
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Avatar src={`https://i.pravatar.cc/150?u=${i + 20}`} sx={{ width: 36, height: 36 }} />
                                        <div>
                                            <h5 style={{ margin: 0, fontSize: '14px', color: theme.text }}>User {i + 1}</h5>
                                            <span style={{ fontSize: '12px', color: theme.textSoft }}>Developer</span>
                                        </div>
                                    </div>
                                    <Chip label="Follow" size="small" component="button" clickable sx={{ backgroundColor: theme.primary + '20', color: theme.primary, fontWeight: 600, border: 'none' }} />
                                </div>
                            ))}
                        </BentoItem>

                        <BentoItem style={{ background: 'linear-gradient(135deg, #854CE6 0%, #6A38C2 100%)', color: 'white' }}>
                            <SidebarTitle style={{ color: 'white' }}>✨ Go Pro</SidebarTitle>
                            <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '16px' }}>Unlock exclusive features and analytics.</p>
                            <button style={{ width: '100%', padding: '10px', borderRadius: '10px', background: 'white', color: '#854CE6', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Upgrade Now</button>
                        </BentoItem>
                    </BentoGrid>
                </Sidebar>
            </ContentWrapper>
        </Container>
    );
};

export default CommunityNew;
