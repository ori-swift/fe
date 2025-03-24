import { SERVER_URL } from "../config";
import axios from 'axios';


export async function updateCompany(data, cred_id, companyName) {
    data.cred_id = cred_id;
    data.company_name = companyName;
    const token = localStorage.getItem("sc_token");
        
    
    try {
        await axios.put(`${SERVER_URL}/company`, data, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${token}`
            }
        });
        
        return { status: 'ok' };
    } catch (error) {
        return {
            status: 'error',
            errorMsg: error.response?.data?.error || "Unknown error occurred"
        };
    }
}
