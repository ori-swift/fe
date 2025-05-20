import { SERVER_URL } from "../config";
import axios from 'axios';


export const getAuthHeaders = () => {
    return {
        "Content-Type": "application/json",
        "Authorization": `Token ${localStorage.getItem("sc_token")}`
    }
}


export async function refreshProviderData(cred_id) {

    const data = { company_id: cred_id };
    const token = localStorage.getItem("sc_token");

    try {
        const response = await axios.post(`${SERVER_URL}/refresh-provider-data`,
            data,
            {
                headers: getAuthHeaders()
            });

        console.log(response.data);
        return true;
    } catch (error) {
        console.log(error);
        alert("Error refreshing data.")
        return false;
    }
}


export async function getAllClients(companyId) {
    if (!companyId) {
        console.error("Company ID is required");
        return false;
    }

    const cacheKey = `clients_${companyId}`;
    const cacheTime = 0.5 * 60 * 60 * 1000; // 0.5 hour in milliseconds

    // Check cache first
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        const now = new Date().getTime();
        if (now - parsedData.timestamp < cacheTime) {
            // console.log("Using cache for clients");
            return parsedData.response.data;
        }
    }
    console.log("No cache for clients");

    try {
        const url = `${SERVER_URL}/client/?company=${companyId}`;

        const response = await axios.get(url, {
            headers: getAuthHeaders()
        });

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

export async function getClient(clientId, companyId = null) {
    if (!clientId) {
        alert("Client ID is required");
        return false;
    }

    // If companyId is provided, check if client exists in localStorage
    if (companyId) {
        const cacheKey = `clients_${companyId}`;
        const cachedData = localStorage.getItem(cacheKey);

        if (cachedData) {
            const parsedData = JSON.parse(cachedData);
            const clients = parsedData.response.data;

            // Look for client in the cached data
            const cachedClient = clients.find(client => client.id === parseInt(clientId));

            if (cachedClient) {
                console.log("Using cached client data");
                return cachedClient;
            }
            console.log("Client not found in cache");
        }
    }

    // If not found in cache or companyId not provided, fetch from server
    try {
        const url = `${SERVER_URL}/client/${clientId}/`;

        const response = await axios.get(url, {
            headers: getAuthHeaders()
        });

        // If companyId was provided but client wasn't in cache, clear the cache
        // since it means the cache is out of date
        if (companyId) {
            const cacheKey = `clients_${companyId}`;
            if (localStorage.getItem(cacheKey)) {
                localStorage.removeItem(cacheKey);
                console.log("Removed outdated client cache");
            }
        }

        return response.data;
    } catch (error) {
        console.log(error);
        alert("Error fetching client details.");
        return false;
    }
}



export async function createPlaybooksForClient(clientId, docType) {

    try {
        const response = await axios.post(`${SERVER_URL}/playbooks/`,
            {
                client_id: clientId,
                doc_type: docType
            },
            { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error("Error creating playbooks for client:", error.response?.data || error.message);
        alert("ERROR 985")
        throw error;
    }
}
export async function addContactInfo(clientId, emails = [], phones = []) {

    try {
        const response = await axios.put(`${SERVER_URL}/client/${clientId}/add_contact_info/`, {
            emails,
            phones
        },
            { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error("Error adding contact info:", error.response?.data || error.message);
        throw error;
    }
}


export const fetchProviders = async () => {
    const cacheKey = "providers";
    const cachedData = localStorage.getItem(cacheKey);
    const now = new Date().getTime();

    if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (now - timestamp < 24 * 60 * 60 * 1000) {
            return data;
        }
    }

    try {
        const response = await axios.get(`${SERVER_URL}/providers`, { headers: getAuthHeaders() });
        const newCache = { data: response.data, timestamp: now };
        localStorage.setItem(cacheKey, JSON.stringify(newCache));
        return response.data;
    } catch (error) {
        const errorMsg = 'Error fetching required fields:' + String(error) + String(error?.response?.data)
        alert(errorMsg);
        throw error;
    }
};






export async function updateClientSettings(clientId, data) {
    /*
    BE code allows these args:

        run_alerts = request.data.get("run_alerts")
        timezone = request.data.get("timezone")
        proforma_playbook_id = request.data.get("proforma_playbook_id")
        tax_invoice_playbook_id = request.data.get("tax_invoice_playbook_id")
     */

    try {
        const response = await axios.patch(
            `${SERVER_URL}/client/${clientId}/update_client/`,
            data,
            { headers: getAuthHeaders() }
        );

        // purge cache
        Object.keys(localStorage).forEach((key) => {
            if (key.startsWith("clients_")) {
                localStorage.removeItem(key);
            }
        });

        return response.data;
    } catch (error) {
        console.error("Error updating client settings:", error.response?.data || error.message);
        alert(error.response?.data?.error || "Failed to update client settings");
        throw error;
    }
}

export const fetchPlans = async () => {
    const cacheKey = "plans_cache";
    const cacheTTL = 24 * 60 * 60 * 1000; // 24 hours

    const cached = JSON.parse(localStorage.getItem(cacheKey));
    if (cached && Date.now() - cached.timestamp < cacheTTL) {
        return cached.data;
    }

    try {
        const response = await axios.get(`${SERVER_URL}/plans/`, {
            headers: getAuthHeaders(),
        });
        localStorage.setItem(
            cacheKey,
            JSON.stringify({ data: response.data, timestamp: Date.now() })
        );
        return response.data;
    } catch (error) {
        const errorMsg = 'Error fetching plans: ' + String(error) + String(error?.response?.data);
        alert(errorMsg);
        throw error;
    }
};

