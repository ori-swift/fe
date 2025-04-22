import axios from "axios";
import { getAuthHeaders } from "./general_be_api";
import { SERVER_URL } from "../config";

export async function addNewPlaybook(data, { documentId = null, clientId = null }) {
    try {
        // Validate inputs
        if ((!documentId && !clientId) || (documentId && clientId)) {
            throw new Error("Either documentId OR clientId must be provided, not both or neither");
        }

        // Clean unwanted fields from data
        const { company_id, client, document, ...cleanData } = data;

        const requestData = {
            ...cleanData,
            document_id: documentId || null,
            client_id: clientId || null
        };

        const response = await axios.post(
            `${SERVER_URL}/playbooks/`,
            requestData,
            { headers: getAuthHeaders() }
        );

        return response.data;
    } catch (error) {
        if (error.response?.data?.detail) {
            alert(`Error: ${error.response.data.detail}`);
        } else {
            alert("Error creating playbook");
        }
        throw error;
    }
}
export async function getPlaybook(playbookId) {
    try {

        const response = await axios.get(`${SERVER_URL}/playbooks/${playbookId}/`, {
            headers: getAuthHeaders()
        });
        // console.log("Fetched playbook:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching playbook:", error);
        alert("Error fetching playbook");
        throw error;
    }
}

export async function getPlaybooks(filters = {}) {
    try {
        let queryParams = new URLSearchParams();

        if (filters.document) queryParams.append('document', filters.document);
        if (filters.client) queryParams.append('client', filters.client);
        if (filters.company) queryParams.append('company', filters.company);

        const response = await axios.get(`${SERVER_URL}/playbooks/?${queryParams}`, {
            headers: getAuthHeaders()
        });
        
        return response.data;
    } catch (error) {
        console.error("Error fetching playbooks:", error);
        alert("Error fetching playbooks");
        throw error;
    }
}

export async function updatePlaybook(playbookId, data) {
    try {
        const response = await axios.patch(
            `${SERVER_URL}/playbooks/${playbookId}/`,
            data,
            { headers: getAuthHeaders() }
        );
        console.log("Updated playbook:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error updating playbook:", error);
        alert("Error updating playbook");
        throw error;
    }
}

export async function deletePlaybook(playbookId) {
    try {
        // Consider adding confirmation logic here

        const response = await axios.delete(
            `${SERVER_URL}/playbooks/${playbookId}/`,
            { headers: getAuthHeaders() }
        );

        // Validate response
        if (response.status === 200 || response.status === 204) {
            console.log("Playbook deleted successfully:", response.data);
            return {
                success: true,
                data: response.data
            };
        } else {
            throw new Error(`Unexpected response status: ${response.status}`);
        }
    } catch (error) {
        console.error("Error deleting playbook:", error);

        // More informative error handling
        const errorMessage = error.response?.data?.message || "Unable to delete playbook. Please try again later.";
        alert(errorMessage);

        return {
            success: false,
            error: errorMessage
        };
    }
}


export async function createPlaybook(data) {
    try {
        const response = await axios.post(
            `${SERVER_URL}/playbooks/`,
            data,
            { headers: getAuthHeaders() }
        );
        console.log("Created playbook:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error creating playbook:", error);
        alert("Error creating playbook");
        throw error;
    }
}

export function isPlaybookConfigValid(config) {
    try {
        // Check if config is a dictionary
        if (!config || typeof config !== 'object' || Array.isArray(config)) {
            return { valid: false, error: "התצורה חייבת להיות מילון." };
        }

        // Check for allowed top-level keys
        const allowedTopKeys = ["phases"];
        const topKeys = Object.keys(config);
        const unexpectedKeys = topKeys.filter(key => !allowedTopKeys.includes(key));
        if (unexpectedKeys.length > 0) {
            return {
                valid: false,
                error: `מפתחות בלתי צפויים ברמה העליונה בתצורה: ${unexpectedKeys.join(', ')}`
            };
        }

        // Check phases
        const phases = config.phases || [];
        if (!Array.isArray(phases) || phases.length === 0) {
            return { valid: false, error: "התצורה חייבת להכיל רשימה של פאזות." };
        }

        // Validate each phase
        for (let i = 0; i < phases.length; i++) {
            const phase = phases[i];
            const phaseInfo = `פאזה ${i + 1}`;

            if (!phase || typeof phase !== 'object' || Array.isArray(phase)) {
                return { valid: false, error: `${phaseInfo}: כל פאזה חייבת להיות מילון.` };
            }

            // Validate start_day
            if (!('start_day' in phase) ||
                typeof phase.start_day !== 'number' ||
                phase.start_day < 0) {
                return {
                    valid: false,
                    error: `${phaseInfo}: כל פאזה חייבת לכלול 'start_day' כמפתח עם מספר שלם חיובי כערך`
                };
            }

            // Validate alerts
            const alerts = phase.alerts;
            if (!alerts || typeof alerts !== 'object' || Array.isArray(alerts)) {
                return { valid: false, error: `${phaseInfo}: כל פאזה חייבת לכלול מילון של 'alerts' עם מפתחות לפי זמן.` };
            }

            if (Object.keys(alerts).length === 0 && i === 0) {
                return { valid: false, error: "פאזה ראשונה חייבת להכיל התראה כלשהי" };
            }

            const validAlerts = ["email", "sms", "whatsapp"];
            for (const [timeStr, methods] of Object.entries(alerts)) {
                // Validate time format
                const timePattern = /^(?:[01]?\d|2[0-3]):(?:00|15|30|45)$/;

                if (typeof timeStr !== 'string' || !timePattern.test(timeStr)) {
                    return {
                        valid: false,
                        error: `${phaseInfo}: מפתחות זמן התראה חייבים להיות מחרוזות בפורמט 'xx:yy' עם מרווח של 15 דקות. הזמן שנשלח: ${timeStr}`
                    };
                }

                // Validate methods
                if (!Array.isArray(methods)) {
                    return {
                        valid: false,
                        error: `${phaseInfo}: שיטות התראה בזמן ${timeStr} חייבות להיות רשימה.`
                    };
                }

                if (methods.length === 0) {
                    return {
                        valid: false,
                        error: `${phaseInfo}: חסרות שיטות התראה בחלק מההגדרות. (עבור ${timeStr})`
                    };
                }

                // Check for duplicates
                if (new Set(methods).size !== methods.length) {
                    return {
                        valid: false,
                        error: `${phaseInfo}: נמצאו שיטות התראה כפולות בזמן ${timeStr}: ${methods}`
                    };
                }

                // Check for valid method types
                const invalidMethods = methods.filter(method => !validAlerts.includes(method));
                if (invalidMethods.length > 0) {
                    return {
                        valid: false,
                        error: `${phaseInfo}: סוגי התראות לא חוקיים בזמן ${timeStr}: ${invalidMethods.join(', ')}`
                    };
                }
            }

            // Ensure alert times are in ascending order
            const alertTimes = Object.keys(alerts);
            const sortedTimes = [...alertTimes].sort();
            if (alertTimes.join() !== sortedTimes.join()) {
                return {
                    valid: false,
                    error: `${phaseInfo}: זמני ההתראות חייבים להופיע בסדר עולה. שנה את: ${alertTimes.join(', ')}`
                };
            }

            // Validate repeat_interval
            if ('repeat_interval' in phase && phase.repeat_interval !== null) {
                if (typeof phase.repeat_interval !== 'number' || phase.repeat_interval < 1) {
                    return {
                        valid: false,
                        error: `${phaseInfo}: repeat_interval חייב להיות מספר שלם חיובי או null. הערך שהתקבל: ${phase.repeat_interval}`
                    };
                }
            }

            // Ensure phases are in chronological order
            if (i > 0 && phases[i].start_day <= phases[i - 1].start_day) {
                return {
                    valid: false,
                    error: `הפאזות חייבות להיות מסודרות לפי start_day עולה. הערכים שהתקבלו: ${JSON.stringify(phases)}`
                };
            }
        }

        // If all checks pass
        return { valid: true };
    } catch (error) {
        console.error("Validation error:", error);
        return { valid: false, error: `תצורה לא חוקית: ${error.message}` };
    }
}

