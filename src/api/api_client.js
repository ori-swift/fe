import axios from "axios";
import { SERVER_URL } from "../config";


export async function scPrivateCall(url, method = "GET", data = {}, extraHeaders = {}) {

    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Token ${localStorage.getItem("sc_token")}`,
        ...extraHeaders,
    };

    const payload = ["POST", "PUT", "PATCH"].includes(method.toUpperCase()) ? data : undefined

    try {
        console.log("About to run", method, url);

        const response = await axios({
            url: `${SERVER_URL}/${url}`,
            method,
            headers,
            // data: ["POST", "PUT", "PATCH"].includes(method.toUpperCase()) ? data : undefined,
            data: payload,
            // params: method.toUpperCase() === "GET" ? data : undefined,
            params: ["GET", "DELETE"].includes(method.toUpperCase()) ? data : undefined,

        });

        console.log("Response from server: ", response.data);

        return response.data.data;
    } catch (error) {
        console.log(error.response);

        const msg = error.response?.data?.message || error.message;
        console.error(`Error calling ${method} to ${url}:`, msg);
        throw new Error(msg);
    }
}