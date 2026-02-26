import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

/**
 * Gets a Server-to-Server OAuth access token from Zoom
 */
const getZoomAccessToken = async () => {
    try {
        const auth = Buffer.from(
            `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
        ).toString('base64');

        const response = await axios.post(
            `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
            {},
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        );
        return response.data.access_token;
    } catch (error) {
        console.error("Zoom Token Request Error:", error.response?.data || error.message);
        throw new Error("Unable to fetch Zoom Access Token. Check Credentials.");
    }
}

/**
 * Creates a Zoom Meeting
 */
export const createZoomMeeting = async (projectTitle) => {
    const token = await getZoomAccessToken();

    try {
        // Fetch users to get a valid host user ID to create the meeting for
        const usersResponse = await axios.get('https://api.zoom.us/v2/users', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!usersResponse.data.users || usersResponse.data.users.length === 0) {
            throw new Error("No users found in Zoom account to host the meeting.");
        }

        const hostUserId = usersResponse.data.users[0].id;

        const response = await axios.post(
            `https://api.zoom.us/v2/users/${hostUserId}/meetings`,
            {
                topic: `${projectTitle} Sync`,
                type: 2, // Scheduled Meeting
                duration: 60, // 60 minutes
                settings: {
                    host_video: true,
                    participant_video: true,
                    join_before_host: true,
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );
        return response.data; // Contains 'join_url' and 'start_url'
    } catch (error) {
        console.error("Zoom Meeting Creation Error:", error.response?.data || error.message);
        throw new Error("Unable to create Zoom Meeting.");
    }
}
