import { SERVER_URL } from "../config";
import axios from "axios";



export const checkToken = async (token) => {
    if (!token){
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


export const register = async (username, password) => {
    try {
        const response = await axios.post(`${SERVER_URL}/register`, { username, password });
        if (response.status === 201) {
            localStorage.setItem("sc_token", response.data.token);
            return true;
        } else {
            alert("register error");
        }
    } catch (error) {
        alert("register error");
    }
};


export const login = async (username, password) => {
    try {
        const response = await axios.post(`${SERVER_URL}/login`, { username, password });
        if (response.status === 200) {
            localStorage.setItem("sc_token", response.data.token);
            return true;
        } else {
            alert("login error");
        }
    } catch (error) {
        alert("login error");
    }
};


