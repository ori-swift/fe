import { SERVER_URL } from "../config";
import axios from "axios";
import { getAuthHeaders } from "./general_be_api";
import { scPrivateCall } from "./api_client";

export async function getTokenByProviderCredential(credential, provider = "google") {
    try {
        const res = await axios.post(
            `${SERVER_URL}/auth/${provider}/`,
            JSON.stringify({ credential: credential }),
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        console.log(res);

        localStorage.setItem("sc_token", res.data.data.token);

        return res.data.data.token;
    } catch (error) {
        console.log(error);
        alert("ERROR 159. please try again later")
    }
}


export const checkToken = async (token) => {

    localStorage.setItem("sc_token", token)
    return await scPrivateCall("check-token")
};

export const requestEmailCode = async (email) => {
    try {
        const response = await axios.post(`${SERVER_URL}/auth/verify-email`, { email });
        console.log(response);
        return response

    } catch (error) {
        console.log(error);
        alert("register error");
        throw error;

    }
}

export const register = async (username, email, password, emailCode) => {
    try {
        const response = await axios.post(`${SERVER_URL}/register`, { username, email, password, email_verification_code: emailCode });
        if (response.status === 201) {
            localStorage.setItem("sc_token", response.data.token);
            return true;
        } else {
            alert("register error");
        }
    } catch (error) {
        console.log(error);
        alert("register error");
        throw error;

    }
};

export const login = async (email, password) => {
    try {
        const response = await axios.post(`${SERVER_URL}/login`, { email, password });
        if (response.status === 200) {
            localStorage.setItem("sc_token", response.data.token);
            return true;
        } else {
            console.log(response);

            alert("login error");
        }
    } catch (error) {
        alert("login error");
    }
};

export const logout = async () => {
    // delete token at BE (disconnect all connected devices)
    try {
        console.log("About to logout");

        // const response = await axios.post(`${SERVER_URL}/auth/logout`, {}, { headers: getAuthHeaders() });
        const response = await scPrivateCall("auth/logout", 'POST')
        console.log("logged out", response);
    } catch (error) {
        console.log(error);
        alert("logout error");
    }
};


export const requestPasswordReset = async (email) => {
    try {
        return await axios.post(`${SERVER_URL}/auth/request-reset/`, { email });
    } catch (err) {
        alert("Error: " + (err.response?.data?.error || err.message));
        throw err;
    }
};

export const resetPassword = async ({ email, code, newPassword }) => {
    try {
        return await axios.post(`${SERVER_URL}/auth/reset-password/`, {
            email,
            code,
            new_password: newPassword,
        });
    } catch (err) {
        alert("Error: " + (err.response?.data?.error || err.message));
        throw err;
    }
};
