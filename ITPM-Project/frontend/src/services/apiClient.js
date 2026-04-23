import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:5000",
});

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete apiClient.defaults.headers.common.Authorization;
};

export const getPayload = (response) => {
  if (response?.data?.ok && response.data.data !== undefined) {
    return response.data.data;
  }

  return response.data;
};

export const getErrorMessage = (error, fallback = "Request failed.") => {
  return error?.response?.data?.message || error?.response?.data || fallback;
};

export default apiClient;
