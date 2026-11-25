import axios from "axios";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/+$/, "");

const axiosInstance = axios.create({
    baseURL: API_URL
});

// Attach the access token to every API request.
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem("refreshToken");
                const response = await axios.post(`${API_URL}/auth/refresh`, {
                    refreshToken
                });

                const newAccessToken = response.data.accessToken;
                localStorage.setItem("accessToken", newAccessToken);
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return axiosInstance(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
