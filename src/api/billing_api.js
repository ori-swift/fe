import axios from "axios";
import { SERVER_URL } from "../config";
import { getAuthHeaders } from "./general_be_api";
import { scPrivateCall } from "./api_client";


export const createPaymentLink = async (paymentData) => {
    // Validate required fields
    if (!paymentData.plan_id || !paymentData.company_id || !paymentData.phone) {
        throw new Error('plan_id, company_id, and phone are required');
    }
    const res =  await scPrivateCall("billing/create-payment/", "POST", paymentData)    
    // console.log(res);
    
    return res.payment_url

    try {
        const response = await axios.post(`${SERVER_URL}/billing/create-payment/`, paymentData, {
            headers: getAuthHeaders(),
        });

        return response.data.payment_url;
    } catch (error) {
        if (error.response) {
            // Server responded with error status
            const errorMessage = error.response.data?.error || 'Payment link creation failed';
            throw new Error(errorMessage);
        } else if (error.request) {
            // Network error
            throw new Error('Network error: Unable to connect to payment service');
        } else {
            // Other error
            throw new Error('Unexpected error occurred');
        }
    }
};



export async function updateCompanyPlan(companyId, planId) {
    const data = {
        company_id: companyId,
        plan_id: planId
    }
    return await scPrivateCall("billing/update-plan", 'POST', data)

    try {
        const response = await axios.post(`${SERVER_URL}/billing/update-plan`, {
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
