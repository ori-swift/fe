import axios from "axios";
import { SERVER_URL } from "../config";
import { getAuthHeaders } from "./general_be_api";
import { scPrivateCall } from "./api_client";

// Add template override for a client
export async function addClientTemplate(clientId, templateId) {
    return await scPrivateCall("client-templates/", "POST", {
        client: clientId,
        template: templateId
    })


    console.log({ clientId, templateId });
    try {
        const response = await axios.post(
            `${SERVER_URL}/client-templates/`,
            {
                client: clientId,
                template: templateId
            },
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error("Error adding client template override:", error.response?.data || error.message);
        throw error;
    }
}

// Remove template override for a client (reverts to company default)
export async function removeClientTemplate(overrideId) {
    
    return await scPrivateCall(`client-templates/${overrideId}/`, "DELETE")

    console.log({ overrideId });
    try {
        const response = await axios.delete(
            `${SERVER_URL}/client-templates/${overrideId}/`,
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error("Error removing client template override:", error.response?.data || error.message);
        throw error;
    }
}