import axios from "axios";
import { getAuthHeaders } from "./general_be_api";
import { SERVER_URL } from "../config";

export async function getPlaybook(playbookId) {
    try {        
        
        const response = await axios.get(`${SERVER_URL}/playbooks/${playbookId}/`, {
            headers: getAuthHeaders()
        });
        console.log("Fetched playbook:", response.data);
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
        
        const response = await axios.get(`${SERVER_URL}/playbooks/?${queryParams}`, {
            headers: getAuthHeaders()
        });
        
        console.log("Fetched playbooks:", response.data);
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
            return { valid: false, error: "Config must be a dictionary." };
        }

        // Check for allowed top-level keys
        const allowedTopKeys = ["phases"];
        const topKeys = Object.keys(config);
        const unexpectedKeys = topKeys.filter(key => !allowedTopKeys.includes(key));
        if (unexpectedKeys.length > 0) {
            return { 
                valid: false, 
                error: `Unexpected top-level keys in config: ${unexpectedKeys.join(', ')}` 
            };
        }

        // Check phases
        const phases = config.phases || [];
        if (!Array.isArray(phases) || phases.length === 0) {
            return { valid: false, error: "Config must contain a list of phases." };
        }

        // Validate each phase
        for (let i = 0; i < phases.length; i++) {
            const phase = phases[i];
            
            if (!phase || typeof phase !== 'object' || Array.isArray(phase)) {
                return { valid: false, error: "Each phase must be a dictionary." };
            }

            // Validate start_day
            if (!('start_day' in phase) || 
                typeof phase.start_day !== 'number' || 
                phase.start_day < 0) {
                return { 
                    valid: false, 
                    error: "Each phase must have 'start_day' as key with a positive integer as value" 
                };
            }

            // Validate alerts
            const alerts = phase.alerts;
            if (!alerts || typeof alerts !== 'object' || Array.isArray(alerts)) {
                return { valid: false, error: "Each phase must have a dict of 'alerts' keyed by time." };
            }

            if (Object.keys(alerts).length === 0 && i === 0) {
                return { valid: false, error: "First phase alerts cannot be empty" };
            }

            const validAlerts = ["email", "sms", "whatsapp"];
            for (const [timeStr, methods] of Object.entries(alerts)) {
                // Validate time format
                const timePattern = /^(?:[01]?\d|2[0-3]):(?:00|15|30|45)$/;



                if (typeof timeStr !== 'string' || !timePattern.test(timeStr)) {
                    return { 
                        valid: false, 
                        error: `Alert time keys must be strings formated 'xx:yy'. with interval of 30 mintues. you sent: ${timeStr}` 
                    };
                }

                // Validate methods
                if (!Array.isArray(methods)) {
                    return { 
                        valid: false, 
                        error: `Alert methods at ${timeStr} must be a list.` 
                    };
                }

                if (methods.length === 0) {
                    return { 
                        valid: false, 
                        error: `Empty methods is not allowed. (for ${timeStr})` 
                    };
                }

                // Check for duplicates
                if (new Set(methods).size !== methods.length) {
                    return { 
                        valid: false, 
                        error: `Duplicate alert methods found at ${timeStr}: ${methods}` 
                    };
                }

                // Check for valid method types
                const invalidMethods = methods.filter(method => !validAlerts.includes(method));
                if (invalidMethods.length > 0) {
                    return { 
                        valid: false, 
                        error: `Invalid alert types at ${timeStr}: ${invalidMethods.join(', ')}` 
                    };
                }
            }

            // Ensure alert times are in ascending order
            const alertTimes = Object.keys(alerts);
            const sortedTimes = [...alertTimes].sort();
            if (alertTimes.join() !== sortedTimes.join()) {
                return {
                    valid: false,
                    error: `Alert times must be in ascending order. Got: ${alertTimes.join(', ')}`
                };
            }
            
            // Validate repeat_interval
            if ('repeat_interval' in phase && phase.repeat_interval !== null) {
                if (typeof phase.repeat_interval !== 'number' || phase.repeat_interval < 1) {
                    return { 
                        valid: false, 
                        error: `repeat_interval must be a positive integer or None. got: ${phase.repeat_interval}` 
                    };
                }
            }

            // Ensure phases are in chronological order
            if (i > 0 && phases[i].start_day <= phases[i-1].start_day) {
                return { 
                    valid: false, 
                    error: `Phases must be ordered by increasing start_day. got: ${JSON.stringify(phases)}` 
                };
            }
        }

        // If all checks pass
        return { valid: true };
    } catch (error) {
        console.error("Validation error:", error);
        return { valid: false, error: `Invalid configuration: ${error.message}` };
    }
}
