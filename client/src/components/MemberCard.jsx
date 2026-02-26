import React from "react";
import styled from "styled-components";
import { tagColors } from "../data/data";
import { Avatar } from "@mui/material";
import UserAvatar from "./UserAvatar";

const Container = styled.div`
  padding: 6px 4px;
  text-align: left;
  margin: 1px 0px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0; /* Important for flex child truncation */
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
`;

const Name = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.textSoft};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EmailId = styled.div`
  font-size: 10px;
  font-weight: 400;
  color: ${({ theme }) => theme.textSoft + "99"};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Role = styled.div`
  font-size: 10px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 12px;
  color: ${({ tagColor, theme }) => tagColor + theme.lightAdd};
  background-color: ${({ tagColor, theme }) => tagColor + "10"};
  white-space: nowrap;
`;

const Access = styled.div`
  font-size: 10px;
  font-weight: 500;
  color: ${({ theme }) => theme.soft2};
  padding: 4px 8px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.soft2 + "33"};
  white-space: nowrap;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  margin-left: 8px;
`;



const MemberCard = ({ member }) => {
  return (
    <Container>
      <Wrapper>
        <UserAvatar sx={{ width: '38px', height: '38px' }} user={member.id} />
        <Details>
          <Name>{member.id.name}</Name>
          <EmailId>{member.id.email}</EmailId>
        </Details>
      </Wrapper>
      <RightSection>
        <Role
          tagColor={tagColors[Math.floor(Math.random() * tagColors.length)]}
        >
          {member.role}
        </Role>
        <Access>{member.access}</Access>
      </RightSection>
    </Container>
  );
};

export default MemberCard;
