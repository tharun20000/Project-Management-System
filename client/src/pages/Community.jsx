import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { Favorite, FavoriteBorder, Delete, Send, Image as ImageIcon, Close } from '@mui/icons-material';
import { Avatar, IconButton, CircularProgress } from '@mui/material';
import { getPosts, createPost, likePost, deletePost } from '../api';
import { openSnackbar } from '../redux/snackbarSlice';
import UserAvatar from '../components/UserAvatar';
import { format } from 'timeago.js';

const Container = styled.div`
  padding: 20px 40px;
  height: 100%;
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${({ theme }) => theme.bg};
  @media (max-width: 768px) {
    padding: 20px 10px;
  }
`;

const FeedWrapper = styled.div`
    width: 100%;
    max-width: 700px;
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const CreatePostCard = styled.div`
    background-color: ${({ theme }) => theme.bgLighter};
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const TopPart = styled.div`
    display: flex;
    align-items: center;
    gap: 14px;
`;

const Input = styled.input`
    width: 100%;
    border: none;
    background-color: ${({ theme }) => theme.bg};
    color: ${({ theme }) => theme.text};
    padding: 12px 16px;
    border-radius: 20px;
    font-size: 14px;
    &:focus {
        outline: 1px solid ${({ theme }) => theme.primary};
    }
`;

const BottomPart = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 10px;
    border-top: 1px solid ${({ theme }) => theme.soft};
`;

const ActionButton = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    color: ${({ theme }) => theme.textSoft};
    cursor: pointer;
    font-size: 14px;
    padding: 8px 12px;
    border-radius: 8px;
    &:hover {
        background-color: ${({ theme }) => theme.soft};
    }
`;

const PostBtn = styled.button`
    background-color: ${({ theme }) => theme.primary};
    color: white;
    border: none;
    padding: 8px 24px;
    border-radius: 20px;
    font-weight: 600;
    cursor: pointer;
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const PostCard = styled.div`
    background-color: ${({ theme }) => theme.bgLighter};
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const UserInfo = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
`;

const UserDetails = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const UserName = styled.span`
    font-weight: 600;
    color: ${({ theme }) => theme.text};
`;

const Time = styled.span`
    font-size: 12px;
    color: ${({ theme }) => theme.textSoft};
`;

const PostContent = styled.div`
    font-size: 15px;
    color: ${({ theme }) => theme.text};
    line-height: 1.5;
    margin-bottom: 16px;
    white-space: pre-wrap; 
`;

const PostImage = styled.img`
    width: 100%;
    max-height: 500px;
    object-fit: cover;
    border-radius: 12px;
    margin-bottom: 16px;
`;

const Actions = styled.div`
    display: flex;
    align-items: center;
    gap: 20px;
    padding-top: 12px;
    border-top: 1px solid ${({ theme }) => theme.soft};
`;

const ActionItem = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    color: ${({ theme }) => theme.textSoft};
    cursor: pointer;
    font-size: 14px;
`;

const ImagePreview = styled.div`
    position: relative;
    width: 100%;
    margin-bottom: 10px;
`;

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [desc, setDesc] = useState("");
  const [img, setImg] = useState("");
  const { currentUser } = useSelector(state => state.user);
  const dispatch = useDispatch();

  const fetchPosts = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    await getPosts(token)
      .then((res) => {
        setPosts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        dispatch(openSnackbar({ message: err.response?.data?.message || err.message, type: "error" }));
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = async () => {
    if (!desc && !img) return;
    setCreateLoading(true);
    const token = localStorage.getItem("token");
    await createPost({ desc, imgUrl: img, name: currentUser.name, img: currentUser.img }, token)
      .then((res) => {
        setPosts([res.data, ...posts]);
        setDesc("");
        setImg("");
        dispatch(openSnackbar({ message: "Post created successfully", type: "success" }));
      })
      .catch((err) => {
        dispatch(openSnackbar({ message: err.response?.data?.message || err.message, type: "error" }));
      });
    setCreateLoading(false);
  };

  const handleLike = async (id) => {
    const token = localStorage.getItem("token");
    await likePost(id, token)
      .then(() => {
        setPosts(posts.map(p => {
          if (p._id === id) {
            return {
              ...p,
              likes: p.likes.includes(currentUser._id)
                ? p.likes.filter(uid => uid !== currentUser._id)
                : [...p.likes, currentUser._id]
            };
          }
          return p;
        }));
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    await deletePost(id, token)
      .then(() => {
        setPosts(posts.filter(p => p._id !== id));
        dispatch(openSnackbar({ message: "Post deleted", type: "success" }));
      })
      .catch((err) => {
        dispatch(openSnackbar({ message: err.response?.data?.message || err.message, type: "error" }));
      });
  };

  return (
    <Container>
      <FeedWrapper>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#854CE6', marginBottom: '-10px' }}>Community Feed</div>
        <CreatePostCard>
          <TopPart>
            <UserAvatar user={currentUser} sx={{ width: 45, height: 45 }} />
            <Input
              placeholder={`What's on your mind, ${currentUser?.name}?`}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </TopPart>
          {img && (
            <ImagePreview>
              <img src={img} alt="Preview" style={{ width: '100%', borderRadius: '12px', maxHeight: '300px', objectFit: 'cover' }} />
              <IconButton
                onClick={() => setImg("")}
                style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white' }}
              >
                <Close />
              </IconButton>
            </ImagePreview>
          )}
          <BottomPart>
            <label htmlFor="post-img" style={{ cursor: 'pointer' }}>
              <ActionButton>
                <ImageIcon sx={{ color: '#2ecc71' }} />
                Photo
              </ActionButton>
              <input
                type="file"
                id="post-img"
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
            <PostBtn onClick={handleCreatePost} disabled={createLoading || (!desc && !img)}>
              {createLoading ? <CircularProgress size={20} color="inherit" /> : "Post"}
            </PostBtn>
          </BottomPart>
        </CreatePostCard>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            <CircularProgress />
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post._id}>
              <UserInfo>
                <UserDetails>
                  <Avatar src={post.img} sx={{ width: 40, height: 40 }} />
                  <div>
                    <UserName>{post.name}</UserName>
                    <div style={{ fontSize: '12px', color: '#aaa' }}>{format(post.createdAt)}</div>
                  </div>
                </UserDetails>
                {post.userId === currentUser._id && (
                  <IconButton onClick={() => handleDelete(post._id)} size="small">
                    <Delete fontSize="small" />
                  </IconButton>
                )}
              </UserInfo>
              <PostContent>{post.desc}</PostContent>
              {post.imgUrl && <PostImage src={post.imgUrl} />}
              <Actions>
                <ActionItem onClick={() => handleLike(post._id)}>
                  {post.likes.includes(currentUser._id) ? (
                    <Favorite sx={{ color: '#e74c3c' }} />
                  ) : (
                    <FavoriteBorder />
                  )}
                  {post.likes.length} Likes
                </ActionItem>
              </Actions>
            </PostCard>
          ))
        )}
      </FeedWrapper>
    </Container>
  );
};

export default Community;