import { SERVER_URL } from "../config";
import axios from 'axios';
import { getAuthHeaders } from "./general_be_api";


export async function addNewCompany(providerId, companyName, credJson) {
    try {
        const response = await axios.post(`${SERVER_URL}/providers/add`, {
            provider_id: providerId,  // Send only the ID
            company_name: companyName,
            cred_json: credJson // Keep additional data in cred_json
        }, { headers: getAuthHeaders() });

        console.log("Success:", response.data);
        return response.data;
    } catch (error) {
        console.log(error);

        // console.error("Error adding user credentials:", error.response?.data || error.message);
        let errorMsg = "Error adding user credentials:" + error.response?.data;
        console.error(errorMsg);
        // alert(errorMsg);
        error.errorMsg = errorMsg;
        throw error;
    }
}

export async function updateCompany(data, companyId, companyName) {
    data.company_id = companyId;
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

export async function updateCompanyPlan(companyId, planId) {
    try {
        const response = await axios.post(`${SERVER_URL}/company/update-plan`, {
            company_id: companyId,
            plan_id: planId
        }, { headers: getAuthHeaders() });

        console.log("Plan update success:", response.data);
        return { status: 'ok', message: response.data };
    } catch (error) {
        console.error("Error updating company plan:", error);
        throw new Error(error.response?.data || "Unknown error occurred while updating plan");
        
        return {
            status: 'error',
            errorMsg: error.response?.data || "Unknown error occurred while updating plan"
        };
    }
}