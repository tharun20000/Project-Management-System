import { Search } from '@mui/icons-material'
import { Avatar } from '@mui/material'
import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { searchUsers, createChat } from '../api'

const Continer = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background-color:  ${({ theme }) => theme.card};
`

const TopBar = styled.div`
height: 70px;
border-bottom: 1px solid ${({ theme }) => theme.soft};
display: flex;
align-items: center;
padding: 0 16px;
@media (max-width: 800px) {
    height: 60px;
}
`
const Contacts = styled.div`
    flex: 1;
    overflow-y: scroll;
    background-color: ${({ theme }) => theme.contact_background};
    @media (max-width: 800px) {
        padding: 20px 0;
    }
    border-bottom-left-radius: 10px;
`


const Profile = styled.div`
    display: flex;
    flex-direction: column;
    margin-left: 16px;
    gap: 4px;
`
const Name = styled.span`
    font-weight: 500;
    font-size: 16px;
    color: ${({ theme }) => theme.text};
`

const SearchBar = styled.div`
    display: flex;
    align-items: center;
    padding: 0 16px;
    height: 56px;
    border-bottom: 1px solid ${({ theme }) => theme.soft};
    color: ${({ theme }) => theme.soft2};
    @media (max-width: 800px) {
        height: 46px;
    }
`
const SearchInput = styled.input`
    border: none;
    outline: none;
    background-color: transparent;
    font-size: 16px;
    color: ${({ theme }) => theme.text};
    margin-left: 16px;
    flex: 1;
    &::placeholder {
        color: ${({ theme }) => theme.soft2};
    }

`

const ContactCard = styled.div`
    display: flex;
    align-items: center;
    padding: 14px 12px;
    cursor: pointer;
    border-bottom: 1px solid ${({ theme }) => theme.soft};
    &:hover {
        background-color: ${({ theme }) => theme.soft};
    }
`

const Message = styled.span`
    font-size: 14px;
    color: ${({ theme }) => theme.soft2};
`
const Time = styled.span`   
    font-size: 12px;
    color: ${({ theme }) => theme.soft2};
    margin-left: auto;
`


const ChatContact = ({ showChat, setShowChat, chats, setCurrentChat, currentUser, setChats, socket }) => {
    const [query, setQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        const search = async () => {
            if (query === "") {
                setSearchResults([]);
                return;
            }
            const token = localStorage.getItem("token");
            try {
                const res = await searchUsers(query, token);
                setSearchResults(res.data);
            } catch (err) {
                console.log("Search users error:", err);
            }
        }
        const timer = setTimeout(() => {
            search();
        }, 500);
        return () => clearTimeout(timer);
    }, [query, currentUser.token]);

    const handleUserClick = async (user) => {
        // Check if chat exists
        const existingChat = chats.find(c => c.members.some(m => m._id === user._id));
        if (existingChat) {
            setCurrentChat(existingChat);
            setShowChat(true);
            setQuery("");
            setSearchResults([]);
        } else {
            try {
                const token = localStorage.getItem("token");
                const res = await createChat({ senderId: currentUser._id, receiverId: user._id }, token);
                // Manually construct the chat object for immediate state update
                const newChatForState = { ...res.data, members: [currentUser, user] };
                setChats(prev => [...prev, newChatForState]);
                setCurrentChat(newChatForState);
                setShowChat(true);
                setQuery("");
                setSearchResults([]);
            } catch (err) {
                console.log(err);
            }
        }
    }

    return (
        <Continer>
            <TopBar>
                <Avatar sx={{ width: "46px", height: '46px' }} src={currentUser?.img} />
                <Profile>
                    <Name><b>Messaging</b></Name>
                </Profile>
            </TopBar>
            <SearchBar>
                <Search />
                <SearchInput placeholder="Search people" onChange={(e) => setQuery(e.target.value)} value={query} />
            </SearchBar>
            <Contacts>
                {chats.length === 0 && query.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: 'gray' }}>No conversations yet</div>}

                {chats.filter(c => {
                    const other = c.members.find(m => m._id !== currentUser._id);
                    return other?.name.toLowerCase().includes(query.toLowerCase());
                }).map((chat) => {
                    const otherMember = chat.members.find((member) => member._id !== currentUser._id);
                    return (
                        <ContactCard key={chat._id} onClick={() => { setCurrentChat(chat); setShowChat(true) }}>
                            <Avatar src={otherMember?.img} sx={{ width: "46px", height: '46px' }} />
                            <Profile>
                                <Name>{otherMember?.name}</Name>
                                <Message>Open conversation</Message>
                            </Profile>
                            <Time>Now</Time>
                        </ContactCard>
                    )
                })}

                {query.length > 0 && searchResults.length > 0 && (
                    <>
                        {searchResults.some(u => !chats.some(c => c.members.some(m => m._id === u._id))) &&
                            <div style={{ padding: '12px 16px 4px 16px', fontSize: '12px', color: 'gray', fontWeight: '600' }}>Global Results</div>
                        }
                        {searchResults.filter(u => !chats.some(c => c.members.some(m => m._id === u._id))).map(user => (
                            <ContactCard key={user._id} onClick={() => handleUserClick(user)}>
                                <Avatar src={user.img} sx={{ width: "46px", height: '46px' }} />
                                <Profile>
                                    <Name>{user.name}</Name>
                                    <Message>Start a new conversation</Message>
                                </Profile>
                            </ContactCard>
                        ))}
                    </>
                )}
            </Contacts>
        </Continer>
    )
}

export default ChatContact