import axios from "axios";
import { SERVER_URL } from "../config";
import { getAuthHeaders } from "./general_be_api";

// helper to clean empty filter params
const cleanParams = (params) => {
    const cleaned = {};
    Object.entries(params).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
            cleaned[key] = value;
        }
    });
    return cleaned;
};

export async function fetchDocumentsByCompany(companyId, page = 1, pageSize = 10, filters = {}) {
    try {
        const params = cleanParams({
            company_id: companyId,
            page,
            page_size: pageSize,
            ...filters,
        });

        const response = await axios.get(`${SERVER_URL}/documents`, {
            headers: getAuthHeaders(),
            params,
        });

        return response.data;
    } catch (error) {
        console.error("Error fetching documents:", error);
        throw error;
    }
}

export async function fetchDocumentsByClient(clientId) {
    try {
        const params = cleanParams({ client_id: clientId });

        const response = await axios.get(`${SERVER_URL}/documents`, {
            headers: getAuthHeaders(),
            params,
        });

        return response.data.results || [];
    } catch (error) {
        console.error("Error fetching documents:", error);
        alert("Error fetching documents of client");
        throw error;
    }
}

export async function getDocumentById(documentId) {
    const cacheKey = `document_${documentId}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 30 * 60 * 1000) {
            return data;
        }
        localStorage.removeItem(cacheKey);
    }

    try {
        const response = await axios.get(`${SERVER_URL}/documents`, {
            headers: getAuthHeaders(),
            params: cleanParams({ document_id: documentId }),
        });

        const data = response.data;
        localStorage.setItem(cacheKey, JSON.stringify({
            data,
            timestamp: Date.now()
        }));

        return data;
    } catch (error) {
        console.error("Error fetching document:", error);
        alert("Error fetching document");
        throw error;
    }
}

export async function updateDocument(docId, { runAlerts = null, playbookId = null }) {
    try {
        const payload = {};
        if (runAlerts !== null) payload.run_alerts = runAlerts;
        if (playbookId !== null) payload.playbook_id = playbookId;

        const response = await axios.patch(
            `${SERVER_URL}/document/update/${docId}`,
            payload,
            { headers: getAuthHeaders() }
        );
        // remove doc from cache
        localStorage.removeItem(`document_${docId}`)
        return response.data;
    } catch (error) {
        console.error("Error updating document:", error.response?.data || error.message);
        alert(error.response?.data?.error || "Failed to update document");
        throw error;
    }
}

export async function getDocumentPdfLink(docId) {
    try {
        const response = await axios.get(
            `${SERVER_URL}/document/pdf-link/${docId}`,
            { headers: getAuthHeaders() }
        );

        // console.log("PDF link received:", response.data);
        return response.data;
    } catch (error) {
        let errorMsg = "Error fetching PDF link: " + (error.response?.data?.error || error.message);
        console.error(errorMsg);
        alert(errorMsg)
        error.errorMsg = errorMsg;
        throw error;
    }
}
