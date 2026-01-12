import { Avatar, Popover } from "@mui/material";
import UserAvatar from "./UserAvatar";
import React, { useState } from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import { logout } from "../redux/userSlice";
import { useNavigate } from 'react-router-dom';
import Profile from "./Profile";

const Wrapper = styled.div`
  min-width: 200px;
  display: flex;
  flex-direction: column;
  position: relative;
  gap: 12px;
  padding: 6px 2px;
  background-color: ${({ theme }) => theme.card};
`;

const Account = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 16px 6px 16px;
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0px 16px 0px 0px;
`;

const Name = styled.div`
  font-size: 17px;
  font-weight: 600;
  color: ${({ theme }) => theme.textSoft};
`;

const Email = styled.div`
  font-size: 12px;
  font-weight: 400;
  color: ${({ theme }) => theme.textSoft + "99"};
`;

const Hr = styled.hr`
  background-color: ${({ theme }) => theme.soft + "99"};
  border: none;
  width: 100%;
  height: 1px;
  margin: 0;
`;

const MenuItem = styled.div`
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.textSoft};
  cursor: pointer;
  &:hover {
    background-color: ${({ theme }) => theme.soft + "99"};
  }
`;

const Logout = styled.div`
  padding: 8px 16px 12px 16px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.textSoft};
  cursor: pointer;
   &:hover {
    color: ${({ theme }) => theme.primary};
  }
`;

const OutlinedBox = styled.div`
  border-radius: 6px;
  padding: 4px 16px;
  border: 1px solid ${({ theme }) => theme.soft2 + "99"};
  color: ${({ theme }) => theme.soft2 + "99"};
  font-size: 12px;
  &:hover {
    background-color: ${({ theme }) => theme.soft2 + "33"};
    }
`;

const AccountDialog = ({ open, id, anchorEl, handleClose, currentUser }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false);

  const logoutUser = () => {
    dispatch(logout())
    navigate('/');
  }
  return (
    <>
      <Popover
        anchorReference="anchorPosition"
        open={open}
        onClose={handleClose}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        anchorPosition={{ top: 60, left: 1800 }}
      >
        <Wrapper>
          <Account>
            <UserAvatar
              sx={{ width: "50px", height: "50px" }}
              user={currentUser}
            />
            <Details>
              <Name>{currentUser?.name}</Name>
              <Email>{currentUser?.email}</Email>
            </Details>
          </Account>
          <Hr />
          <MenuItem onClick={() => { setProfileOpen(true); handleClose(); }}>Profile</MenuItem>
          <Logout onClick={logoutUser}>Logout</Logout>
        </Wrapper>
      </Popover>
      {profileOpen && (
        <Profile open={profileOpen} setOpen={setProfileOpen} currentUser={currentUser} />
      )}
    </>
  );
};

export default AccountDialog;
