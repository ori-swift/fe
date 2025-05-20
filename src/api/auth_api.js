import { SERVER_URL } from "../config";
import axios from "axios";


export async function getTokenByProviderCredential(credential, provider = "google") {
    try {
        const data = await axios.post(
            `${SERVER_URL}/auth/${provider}/`,
            JSON.stringify({ credential: credential }),
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        localStorage.setItem("sc_token", data.data.token);

        return data.data;
    } catch (error) {
        console.log(error);
        alert("ERROR. please try again later")
    }
}


export const checkToken = async (token) => {
    if (!token) {
        const token = localStorage.getItem("sc_token")
    }
    try {
        const res = await axios.get(`${SERVER_URL}/check-token`, {
            headers: { Authorization: `Token ${token}` }
        });
        // console.log(res.data);        
        return res.status === 200 ? res.data : false;
    } catch {
        return false;
    }
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


