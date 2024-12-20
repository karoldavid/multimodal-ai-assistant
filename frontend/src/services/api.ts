import axios from "axios";

axios.defaults.withCredentials = true;

const backendUrl = process.env.REACT_APP_BACKEND_URL;

export const sendMessage = async (message: string) => {
  try {
    const response = await axios.post(`${backendUrl}/api/chat`, { message });
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};
