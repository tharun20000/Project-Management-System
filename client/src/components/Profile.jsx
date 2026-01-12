import { CloseRounded, CloudUpload, Shuffle } from '@mui/icons-material';
import { CircularProgress, Modal } from '@mui/material';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { openSnackbar } from '../redux/snackbarSlice';
import { updateUser as updateUserRedux } from '../redux/userSlice';
import { updateUser } from '../api';
import UserAvatar from './UserAvatar';
import DeletePopup from './DeletePopup';

const Container = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-color: #000000a7;
  display: flex;
  justify-content: center;
`;

const Wrapper = styled.div`
  width: 500px;
  height: min-content;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.bgLighter};
  color: ${({ theme }) => theme.text};
  padding: 10px;
  display: flex;
  margin-top: 80px;
  flex-direction: column;
  position: relative;
  @media (max-width: 768px) {
    width: 90%;
  }
`;

const Header = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: center;
    flex-direction: column;
    padding: 12px 12px 18px 12px;
    gap: 6px;
`;

const Title = styled.div`
  font-size: 22px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`;

const Desc = styled.div`
    font-size: 14px;
    font-weight: 400;
    color: ${({ theme }) => theme.textSoft};
`;

const Label = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.textSoft};
  margin: 12px 12px 6px 12px;
`;

const Input = styled.input`
  border: none;
  font-size: 14px;
  padding: 14px 18px;
  margin: 0px 12px;
  border-radius: 12px;
  color: ${({ theme }) => theme.textSoft};
  background-color: ${({ theme }) => theme.bgDark};
  &:focus {
    outline: 1px solid ${({ theme }) => theme.primary};
  }
`;

const Flex = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0px 12px;
    gap: 12px;
`;

const Button = styled.button`
  border: none;
  font-size: 14px;
  padding: 12px 18px;
  margin: 20px 12px 12px 12px;
  border-radius: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  background: ${({ theme }) => theme.primary};
  cursor: pointer;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  &:disabled {
    background: ${({ theme }) => theme.soft};
    color: ${({ theme }) => theme.soft2};
    cursor: not-allowed;
  }
`;

const DeleteButton = styled(Button)`
    background: ${({ theme }) => theme.soft};
    color: ${({ theme }) => theme.textSoft};
    &:hover {
        background: ${({ theme }) => theme.soft + "99"};
        color: red;
    }
`;

const Profile = ({ open, setOpen, currentUser }) => {
    const [name, setName] = useState(currentUser?.name || "");
    const [img, setImg] = useState(currentUser?.img || "");
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    // Delete Popup Logic
    const [openDelete, setOpenDelete] = useState({ state: false, name: "", id: "", type: "", token: "" });

    useEffect(() => {
        if (currentUser) {
            setName(currentUser.name);
            setImg(currentUser.img);
        }
    }, [currentUser]);

    const handleUpdate = async () => {
        setLoading(true);
        if (name === "") {
            dispatch(openSnackbar({ message: "Name cannot be empty", type: "error" }));
            setLoading(false);
            return;
        }
        const token = localStorage.getItem("token");
        await updateUser(currentUser._id, { name, img }, token)
            .then((res) => {
                dispatch(updateUserRedux(res.data));
                dispatch(openSnackbar({ message: "Profile updated successfully", type: "success" }));
                setOpen(false);
            })
            .catch((err) => {
                dispatch(openSnackbar({ message: err.message, type: "error" }));
            });
        setLoading(false);
    };

    const handleDeleteAccount = () => {
        const token = localStorage.getItem("token");
        setOpenDelete({
            state: true,
            name: currentUser.name,
            id: currentUser._id,
            type: "Account",
            token: token
        });
    };

    const handleRandomAvatar = () => {
        const randomString = Math.random().toString(36).substring(7);
        setImg(`https://robohash.org/${randomString}`);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImg(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Modal open={open} onClose={() => setOpen(false)}>
            <Container>
                <Wrapper>
                    <CloseRounded
                        sx={{ fontSize: "22px" }}
                        style={{
                            position: "absolute",
                            top: "20px",
                            right: "20px",
                            cursor: "pointer",
                            color: "inherit"
                        }}
                        onClick={() => setOpen(false)}
                    />
                    <Header>
                        <Title>User Profile</Title>
                        <Desc>Update your personal details here.</Desc>
                    </Header>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '12px', gap: '12px' }}>
                        <UserAvatar user={{ ...currentUser, img: img }} sx={{ width: '80px', height: '80px', fontSize: '32px' }} />
                        <Flex style={{ gap: '12px', margin: 0 }}>
                            <Button
                                onClick={handleRandomAvatar}
                                style={{
                                    margin: 0,
                                    padding: '8px 12px',
                                    fontSize: '12px',
                                    backgroundColor: '#854CE6',
                                    color: 'white'
                                }}
                            >
                                <Shuffle sx={{ fontSize: '16px' }} /> Random
                            </Button>
                            <label htmlFor="upload-avatar" style={{ cursor: 'pointer', margin: 0, flex: 1 }}>
                                <Input
                                    accept="image/*"
                                    id="upload-avatar"
                                    type="file"
                                    style={{ display: 'none' }}
                                    onChange={handleImageUpload}
                                />
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    backgroundColor: 'transparent',
                                    color: '#854CE6',
                                    border: '1px solid #854CE6',
                                    borderRadius: '12px',
                                    padding: '8px 12px',
                                    fontSize: '12px',
                                    fontWeight: '600'
                                }}>
                                    <CloudUpload sx={{ fontSize: '16px' }} /> Upload
                                </div>
                            </label>
                        </Flex>
                    </div>

                    <Label>Full Name</Label>
                    <Input
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <Label>Email</Label>
                    <Input
                        value={currentUser?.email}
                        disabled
                        style={{ cursor: 'not-allowed', opacity: 0.7 }}
                    />

                    <Button onClick={handleUpdate} disabled={loading}>
                        {loading ? <CircularProgress size={20} color="inherit" /> : "Update Profile"}
                    </Button>

                    <div style={{ padding: '0 12px', marginTop: '10px' }}>
                        <hr style={{ border: 'none', borderTop: '1px solid #333' }} />
                    </div>

                    <div style={{ padding: '12px' }}>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: 'red', marginBottom: '8px' }}>Danger Zone</div>
                        <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '12px' }}>
                            Deleting your account is permanent. All your data including projects, teams, and tasks will be erased.
                        </div>
                        <DeleteButton onClick={handleDeleteAccount} style={{ margin: 0 }}>
                            Delete Account
                        </DeleteButton>
                    </div>

                </Wrapper>
                {openDelete.state && (
                    <DeletePopup openDelete={openDelete} setOpenDelete={setOpenDelete} />
                )}
            </Container>
        </Modal>
    );
};

export default Profile;
