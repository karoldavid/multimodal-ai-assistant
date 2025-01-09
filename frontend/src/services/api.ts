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

export const sendFile = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    await axios.post(`${backendUrl}/api/file`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};
