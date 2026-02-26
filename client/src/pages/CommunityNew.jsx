import React, { useState, useEffect } from "react";
import styled, { keyframes, useTheme } from "styled-components";
import { Avatar, IconButton, Chip } from "@mui/material";
import { Favorite, FavoriteBorder, ChatBubbleOutline, Share, MoreHoriz, Search, AddPhotoAlternate, Send } from "@mui/icons-material";
import { GalaxyButton, MagicCard, PremiumLoader } from "../components/CreativeComponents";
import { useDispatch, useSelector } from "react-redux";
import { openSnackbar } from "../redux/snackbarSlice";
import { getPosts, createPost, likePost, addComment, getComments } from "../api";
import { format } from "timeago.js";

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

const TRENDING = [
  { tag: "Development", topic: "#Reactjs2024" },
  { tag: "Design", topic: "#UIUXTrends" },
  { tag: "Productivity", topic: "#RemoteWorkLife" },
  { tag: "Announcements", topic: "#Q1Goals" },
];

const CommentsSection = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid ${({ theme }) => theme.soft + "30"};
  animation: ${fadeInUp} 0.5s ease-out;
`;

const CommentItem = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
`;

const CommentInputWrapper = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 16px;
`;

const CommentInput = styled.input`
    width: 100%;
    background: ${({ theme }) => theme.bg};
    border: 1px solid ${({ theme }) => theme.soft};
    padding: 10px 16px;
    border-radius: 20px;
    color: ${({ theme }) => theme.text};
    outline: none;
    font-size: 14px;
    transition: all 0.3s;

    &:focus {
        border-color: ${({ theme }) => theme.primary};
    }
`;

const CommunityNew = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [postLoading, setPostLoading] = useState(false);
  const [openComments, setOpenComments] = useState(null); // ID of post with active comments section
  const [comments, setComments] = useState([]); // Comments for the active post
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);


  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await getPosts(token);
        setPosts(res.data);
        setLoading(false);
      } catch (err) {
        dispatch(openSnackbar({ message: err.response?.data?.message || err.message, type: "error" }));
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchPosts();
    }
  }, [currentUser, dispatch]);

  const handleLike = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await likePost(id, token);
      setPosts(posts.map(post =>
        post._id === id
          ? {
            ...post,
            likes: post.likes.includes(currentUser._id)
              ? post.likes.filter(uid => uid !== currentUser._id)
              : [...post.likes, currentUser._id]
          }
          : post
      ));
    } catch (err) {
      dispatch(openSnackbar({ message: "Failed to like post", type: "error" }));
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
    setPostLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await createPost({ desc: newPost }, token);
      // Assuming the backend returns the full new post object.
      // If the backend returns consistent structure, prepending it should work.
      setPosts([res.data, ...posts]);
      setNewPost("");
      dispatch(openSnackbar({ message: "Post created successfully!", type: "success" }));
      setPostLoading(false);
    } catch (err) {
      dispatch(openSnackbar({ message: err.response?.data?.message || err.message, type: "error" }));
      setPostLoading(false);
    }
  };

  const isLiked = (post) => {
    return post.likes.includes(currentUser?._id);
  };

  const handleCommentClick = async (postId) => {
    if (openComments === postId) {
      setOpenComments(null);
      setComments([]);
      return;
    }
    setOpenComments(postId);
    try {
      const token = localStorage.getItem("token");
      const res = await getComments(postId, token);
      setComments(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddComment = async (postId) => {
    if (!commentText.trim()) return;
    setCommentLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await addComment({ postId, desc: commentText }, token);
      setComments([res.data, ...comments]);
      setCommentText("");
      // Update comments count in posts list locally
      setPosts(posts.map(p => p._id === postId ? { ...p, comments: [...p.comments, res.data._id] } : p));
      setCommentLoading(false);
    } catch (err) {
      dispatch(openSnackbar({ message: err.response?.data?.message || err.message, type: "error" }));
      setCommentLoading(false);
    }
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
              <Avatar src={currentUser?.img} sx={{ width: 44, height: 44 }}>{currentUser?.name[0]}</Avatar>
              <StyledInput
                placeholder="Share something with the community..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
              />
            </InputWrapper>
            <ActionsBar>
              <div style={{ display: 'flex', gap: '8px' }}>
                <ActionButton><AddPhotoAlternate sx={{ fontSize: 20 }} /> Media</ActionButton>
                <ActionButton><FavoriteBorder sx={{ fontSize: 20 }} /> Feeling</ActionButton>
              </div>
              <GalaxyButton
                style={{ padding: '8px 24px', fontSize: '14px' }}
                onClick={handleCreatePost}
                disabled={postLoading}
              >
                {postLoading ? "Posting..." : "Post"} <Send sx={{ fontSize: 16, marginLeft: '6px' }} />
              </GalaxyButton>
            </ActionsBar>
          </CreatePostBox>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
              <PremiumLoader />
            </div>
          ) : (
            posts.map((post) => (
              <PostCard key={post._id}>
                <PostHeader>
                  <UserInfo>
                    <Avatar src={post.img} sx={{ width: 42, height: 42 }}>{post.name?.[0]}</Avatar>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <UserName>{post.name}</UserName>
                        {/* Logic for badges can be improved based on user role */}
                      </div>
                      <PostMeta>
                        {format(post.createdAt)}
                      </PostMeta>
                    </div>
                  </UserInfo>
                  <IconButton size="small"><MoreHoriz /></IconButton>
                </PostHeader>
                <PostContent>{post.desc}</PostContent>
                {post.img && <PostImage src={post.img} alt="Post content" />}

                <InteractionBar>
                  <StatItem onClick={() => handleLike(post._id)} liked={isLiked(post)}>
                    {isLiked(post) ? <Favorite /> : <FavoriteBorder />} {post.likes.length}
                  </StatItem>
                  <StatItem onClick={() => handleCommentClick(post._id)}>
                    <ChatBubbleOutline /> {post.comments?.length || 0}
                  </StatItem>
                  <StatItem>
                    <Share /> Share
                  </StatItem>
                </InteractionBar>

                {openComments === post._id && (
                  <CommentsSection>
                    {comments.map((comment) => (
                      <CommentItem key={comment._id}>
                        <Avatar src={comment.img} sx={{ width: 32, height: 32 }}>{comment.name?.[0]}</Avatar>
                        <div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <b style={{ fontSize: '14px', color: theme.text }}>{comment.name}</b>
                            <span style={{ fontSize: '11px', color: theme.textSoft }}>{format(comment.createdAt)}</span>
                          </div>
                          <p style={{ fontSize: '13px', color: theme.textSoft, marginTop: '2px' }}>{comment.desc}</p>
                        </div>
                      </CommentItem>
                    ))}
                    {comments.length === 0 && <div style={{ fontSize: '13px', color: theme.textSoft, marginBottom: '10px' }}>No comments yet.</div>}

                    <CommentInputWrapper>
                      <Avatar src={currentUser?.img} sx={{ width: 32, height: 32 }}>{currentUser?.name[0]}</Avatar>
                      <CommentInput
                        placeholder="Write a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleAddComment(post._id)}
                        disabled={commentLoading}
                        color="primary"
                      >
                        <Send fontSize="small" />
                      </IconButton>
                    </CommentInputWrapper>
                  </CommentsSection>
                )}

              </PostCard>
            ))
          )}
          {!loading && posts.length === 0 && (
            <div style={{ textAlign: "center", color: theme.textSoft, padding: "20px" }}>
              No posts yet. Be the first to share something!
            </div>
          )}
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




          </BentoGrid>
        </Sidebar>
      </ContentWrapper>
    </Container>
  );
};

export default CommunityNew;
