import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // In production, use relative path
  : 'http://localhost:3000/api'; // In development, use full URL

// User API calls
export const loginUser = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/users/login`, userData);
        return response.data;
    } catch (error) {
        console.error('Error logging in user:', error);
        throw error;
    }
};

export const getUserById = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
};

// Meeting API calls
export const createMeeting = async (meetingData) => {
    try {
        const response = await axios.post(`${API_URL}/meetings`, meetingData);
        return response.data;
    } catch (error) {
        console.error('Error creating meeting:', error);
        throw error;
    }
};

export const getAllMeetings = async () => {
    try {
        const response = await axios.get(`${API_URL}/meetings`);
        return response.data;
    } catch (error) {
        console.error('Error fetching meetings:', error);
        throw error;
    }
};

export const getMeetingById = async (meetingId) => {
    try {
        const response = await axios.get(`${API_URL}/meetings/${meetingId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching meeting:', error);
        throw error;
    }
};

export const updateMeeting = async (meetingId, meetingData) => {
    try {
        const response = await axios.patch(`${API_URL}/meetings/${meetingId}`, meetingData);
        return response.data;
    } catch (error) {
        console.error('Error updating meeting:', error);
        throw error;
    }
};

export const deleteMeeting = async (meetingId) => {
    try {
        const response = await axios.delete(`${API_URL}/meetings/${meetingId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting meeting:', error);
        throw error;
    }
};

export const addTopicToMeeting = async (meetingId, topicData) => {
    try {
        const response = await axios.post(`${API_URL}/meetings/${meetingId}/topics`, topicData);
        return response.data;
    } catch (error) {
        console.error('Error adding topic to meeting:', error);
        throw error;
    }
};

export const addSubtopicToTopic = async (meetingId, topicId, subtopicData) => {
    try {
        const response = await axios.post(`${API_URL}/meetings/${meetingId}/topics/${topicId}/subtopics`, subtopicData);
        return response.data;
    } catch (error) {
        console.error('Error adding subtopic to topic:', error);
        throw error;
    }
};
