import axios from 'axios';
import jwt_decode from 'jwt-decode';
// Base URL is configurable via Vite env: VITE_API_BASE_URL
// Examples:
// VITE_API_BASE_URL=https://your-api.example.com/api/
// VITE_API_BASE_URL=http://localhost:8700/api/
// Fallback to relative '/api/' if not set
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/';
const API = axios.create({ baseURL });



//auth
export const signIn = async ({ email, password }) => await API.post('/auth/signin', { email, password });
export const signUp = async ({
    name,
    email,
    password,
    gender,
}) => await API.post('/auth/signup', {
    name,
    email,
    password,
    gender,
});
export const googleSignIn = async ({
    name,
    email,
    img,
}) => await API.post('/auth/google', {
    name,
    email,
    img,
}, { withCredentials: true });
export const findUserByEmail = async (email) => await API.get(`/auth/findbyemail?email=${email}`);
export const generateOtp = async (email, name, reason) => await API.get(`/auth/generateotp?email=${email}&name=${name}&reason=${reason}`);
export const verifyOtp = async (otp) => await API.get(`/auth/verifyotp?code=${otp}`);
export const resetPassword = async (email, password) => await API.put(`/auth/forgetpassword`, { email, password });

//user api
export const getUsers = async (token) => await API.get('/users/find', { headers: { "Authorization": `Bearer ${token}` } }, {
    withCredentials: true
});
export const updateUser = async (id, user, token) => await API.put(`/users/${id}`, user, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const deleteUser = async (id, token) => await API.delete(`/users/${id}`, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });

// Community
export const getPosts = async (token) => await API.get("/community", { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const createPost = async (data, token) => await API.post("/community", data, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const likePost = async (id, token) => await API.put(`/community/like/${id}`, {}, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const deletePost = async (id, token) => await API.delete(`/community/${id}`, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const searchUsers = async (search, token) => await API.get(`users/search/${search}`, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const notifications = async (token) => await API.get('/users/notifications', { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const getProjects = async (token) => await API.get(`/users/projects`, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const userWorks = async (token) => await API.get('/users/works', { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const userTasks = async (token) => await API.get('/users/tasks', { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });

//projects api
export const createProject = async (project, token) => await API.post('project/', project, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const getProjectDetails = async (id, token) => await API.get(`/project/${id}`, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const inviteProjectMembers = async (id, members, token) => await API.post(`/project/invite/${id}`, members, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const addWorks = async (id, works, token) => await API.post(`/project/works/${id}`, works, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const getWorks = async (id, token) => await API.get(`/project/works/${id}`, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const verifyProjectInvite = async (code, projectid, userid, access, role) => await API.get(`/project/invite/${code}?projectid=${projectid}&userid=${userid}&access=${access}&role=${role}`, { withCredentials: true });
export const updateProject = async (id, project, token) => await API.patch(`/project/${id}`, project, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const deleteProject = async (id, token) => await API.delete(`/project/${id}`, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const updateMembers = async (id, members, token) => await API.patch(`/project/member/${id}`, members, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const removeMembers = async (id, members, token) => await API.patch(`/project/member/remove/${id}`, members, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const updateTaskStatus = async (taskId, status, token) => await API.patch(`/project/task/${taskId}`, { status }, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const updateWorkStatus = async (workId, status, token) => await API.patch(`/project/work/${workId}`, { status }, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });



//teams api
export const createTeam = async (team, token) => await API.post('team/', team, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const getTeams = async (id, token) => await API.get(`/team/${id}`, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const inviteTeamMembers = async (id, members, token) => await API.post(`/team/invite/${id}`, members, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const addTeamProject = async (id, project, token) => await API.post(`/team/addProject/${id}`, project, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const verifyTeamInvite = async (code, teamid, userid, access, role) => await API.get(`/team/invite/${code}?teamid=${teamid}&userid=${userid}&access=${access}&role=${role}`, { withCredentials: true });
export const updateTeam = async (id, team, token) => await API.patch(`/team/${id}`, team, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const deleteTeam = async (id, token) => await API.delete(`/team/${id}`, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const updateTeamMembers = async (id, members, token) => await API.patch(`/team/member/${id}`, members, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
export const removeTeamMembers = async (id, members, token) => await API.patch(`/team/member/remove/${id}`, members, { headers: { "Authorization": `Bearer ${token}` } }, { withCredentials: true });
