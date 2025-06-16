import { SERVER_URL } from "../config";
import axios from 'axios';
import { getAuthHeaders } from "./general_be_api";
import { scPrivateCall } from "./api_client";


export async function deleteCompany(companyId) {

    const data = {
        company_id: companyId,
    }
    return await scPrivateCall("company/delete", 'DELETE', data)
}


export async function addFirstCompany(providerId, companyName) {
    const data = {
        provider_id: providerId,
        company_name: companyName
    }
    return await scPrivateCall("company/add-first", 'POST', data)    
}
export async function addNewCompany(providerId, companyName, credJson) {

    const data = {
        provider_id: providerId,
        company_name: companyName,
        cred_json: credJson
    }
    return await scPrivateCall("company/add", 'POST', data)

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

export async function updateCompanyProvider(data, companyId) {
    data.company_id = companyId;

    return await scPrivateCall("company/provider", 'PUT', data)
}

export async function updateCompany(data, companyId, companyName) {
    data.company_id = companyId;
    // data.company_name = companyName;

    return await scPrivateCall("company", 'PUT', data)
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



export const createCompanyShare = async ({ companyId, userEmail, permission }) => {
    const data = {
        company_id: companyId,
        user_email: userEmail,
        permission: permission
    }
    return await scPrivateCall("company-shares/", 'POST', data)
    const response = await axios.post(
        `${SERVER_URL}/company-shares/`,
        {
            company_id: companyId,
            user_email: userEmail,
            permission: permission
        },
        { headers: getAuthHeaders() }
    );
    return response.data;
};

export const getCompanyShares = async (companyId) => {
    return await scPrivateCall(`company-shares/?company_id=${companyId}`)

    const response = await axios.get(
        `${SERVER_URL}/company-shares/`,
        {
            params: { company_id: companyId }, // This is part of the query string, not the body
            headers: getAuthHeaders()
        }
    );
    return response.data;
};

export const removeCompanyShare = async (companyId, shareId) => {
    return await scPrivateCall(`company-shares/${shareId}/?company_id=${companyId}`, 'DELETE')
    const response = await axios.delete(
        `${SERVER_URL}/company-shares/${shareId}/`,
        { headers: getAuthHeaders() }
    );
    return response.data;
};
