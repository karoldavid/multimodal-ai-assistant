import Cookie from "universal-cookie";
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

export const sendVoice = async (text: string) => {
  try {
    const response = await axios.post(`${backendUrl}/api/voice`, { text });
    return response.data;
  } catch (error) {
    console.error("Error sending voice input to backend:", error);
    throw error;
  }
};

interface TokenResponse {
  authToken: string | null;
  region?: string;
  error?: string;
}

export async function getTokenOrRefresh(): Promise<TokenResponse> {
  const cookie = new Cookie();
  const speechToken = cookie.get("speech-token");

  if (speechToken === undefined) {
    try {
      const res = await axios.get(`${backendUrl}/api/get-speech-token`);
      const token = res.data.token;
      const region = res.data.region;
      cookie.set("speech-token", `${region}:${token}`, {
        maxAge: 540,
        path: "/",
      });

      console.log("Token fetched from backend: " + token);
      return { authToken: token, region };
    } catch (err) {
      const errorResponse = (err as any)?.response?.data;
      console.log(errorResponse);
      return { authToken: null, error: errorResponse };
    }
  } else {
    console.log("Token fetched from cookie: " + speechToken);
    const idx = speechToken.indexOf(":");
    return {
      authToken: speechToken.slice(idx + 1),
      region: speechToken.slice(0, idx),
    };
  }
}
