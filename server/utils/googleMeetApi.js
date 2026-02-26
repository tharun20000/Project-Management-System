import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

// Initialize the Google OAuth2 Client
export const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI // e.g., http://localhost:8700/api/meet/callback
);

// Scopes required for Calendar/Meet
export const SCOPES = [
    'https://www.googleapis.com/auth/calendar.events',
];

// Generate the authorization URL
export const getAuthUrl = (projectId) => {
    return oauth2Client.generateAuthUrl({
        access_type: 'offline', // Get a refresh token
        prompt: 'consent',
        scope: SCOPES,
        state: projectId // Pass the projectId so we know where to redirect/associate later
    });
};

// Create a Google Calendar Event with a Meet Link
export const createMeetLink = async (tokens, projectTitle) => {
    oauth2Client.setCredentials(tokens);
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // Generate a unique requestId for the conference data
    const requestId = `meet_${Math.random().toString(36).substring(2, 11)}`;

    const event = {
        summary: `${projectTitle} Sync`,
        description: `Auto-generated Google Meet for ${projectTitle}.`,
        start: {
            dateTime: new Date().toISOString(),
            timeZone: "UTC",
        },
        end: {
            // Default 1 hour duration
            dateTime: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(),
            timeZone: "UTC",
        },
        conferenceData: {
            createRequest: {
                requestId: requestId,
                conferenceSolutionKey: {
                    type: "hangoutsMeet",
                },
            },
        },
    };

    try {
        const response = await calendar.events.insert({
            calendarId: "primary",
            resource: event,
            conferenceDataVersion: 1, // Required to generate the Meet link
        });

        // The Hangouts Meet link is typically in conferenceData.entryPoints
        let hangoutLink = "";
        const entryPoints = response.data.conferenceData?.entryPoints;
        if (entryPoints) {
            const videoEntry = entryPoints.find(e => e.entryPointType === 'video');
            if (videoEntry) hangoutLink = videoEntry.uri;
        }

        return hangoutLink || response.data.hangoutLink; // Fallback to direct field if available
    } catch (error) {
        console.error("Error creating Calendar Event:", error);
        throw error;
    }
};
