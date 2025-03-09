import { SERVER_URL } from "../config";
import axios from 'axios';

export async function refreshProviderData(cred_id) {

    const data = { cred_id: cred_id };
    const token = localStorage.getItem("sc_token");

    try {
        const response = await axios.post(`${SERVER_URL}/refresh-provider-data`,
            data,
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${token}`
                }
            });

        console.log(response.data);
        return response;
    } catch (error) {
        console.log(error);
        alert("Error refreshing data.")
        return false;
    }
}

export async function getAllClients(cred_id) {
    const cacheKey = `clients_${cred_id}`;
    const cacheTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    // Check cache first
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        const now = new Date().getTime();
        if (now - parsedData.timestamp < cacheTime) {
            console.log("Using cache for clients");
            
            return parsedData.response.data;
        }
    }
    console.log("No cache for clients");
    
    const data = { cred_id: cred_id };
    const token = localStorage.getItem("sc_token");

    try {
        const response = await axios.post(`${SERVER_URL}/clients`,
            data,
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${token}`
                }
            });

        // console.log(response.data);

        // Cache the response
        localStorage.setItem(cacheKey, JSON.stringify({
            response: response,
            timestamp: new Date().getTime()
        }));

        return response.data;
    } catch (error) {
        console.log(error);
        alert("Error fetching clients.")
        return false;
    }
}