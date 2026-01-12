import React from 'react';
import { Avatar } from '@mui/material';

const UserAvatar = ({ user, sx, ...props }) => {
    // If user has an image, use it
    // If not, use a deterministic safe anime-style avatar from DiceBear (adventurer)
    // which is professional and safe for all ages.
    // We use the user's email or ID as a seed for consistency.
    const name = user?.name || 'User';
    const seed = user?.name || user?.email || name;
    const fallbackSrc = `https://robohash.org/${encodeURIComponent(seed)}`;

    return (
        <Avatar
            src={user?.img || fallbackSrc}
            alt={name}
            sx={{
                ...sx,
                bgcolor: user?.img ? 'transparent' : 'primary.main',
                fontSize: sx?.width ? `${parseInt(sx.width) / 2}px` : 'inherit'
            }}
            {...props}
        >
            {!user?.img && !fallbackSrc && name.charAt(0)}
        </Avatar>
    );
};

export default UserAvatar;
