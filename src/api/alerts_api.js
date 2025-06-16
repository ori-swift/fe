import axios from "axios";
import { SERVER_URL } from "../config";
import { getAuthHeaders } from "./general_be_api";
import { scPrivateCall } from "./api_client";

export function getAlertTemplate(templates, {
  method,
  doc_type,
  client_id,
  document_id
}) {
  if (!templates || Object.keys(templates).length === 0) return null;

  // Flatten templates if they're nested (as shown in the console.log)
  let flatTemplates = templates;
  if (templates["0"] && typeof templates["0"] === "object") {
    flatTemplates = templates["0"];
  }

  // Helper function to find a matching template
  const find = (filterFn) => {
    return Object.values(flatTemplates).find(t => t && filterFn(t));
  };

  // Priority 1: Document-specific template
  if (document_id != null) {
    const template = find(t =>
      t.document_id === document_id &&
      t.alert_method === method
    );
    if (template) return template;
  }

  // Priority 2: Client-specific template with matching doc_type
  if (client_id != null && doc_type) {
    const template = find(t =>
      t.client_id === client_id &&
      t.document_id == null &&
      t.doc_type === doc_type &&
      t.alert_method === method
    );
    if (template) return template;
  }

  // Priority 3: Generic template (company-level) with matching doc_type
  if (doc_type) {
    const template = find(t =>
      t.client_id == null &&
      t.document_id == null &&
      t.doc_type === doc_type &&
      t.alert_method === method
    );
    if (template) return template;
  }

  // Priority 4: Default template (global company-level)
  const template = find(t =>
    t.client_id == null &&
    t.document_id == null &&
    t.doc_type == null &&
    t.alert_method == null
  );
  if (template) return template;

  // If no template is found, return null
  return null;
}

export async function addTemplate(templateData) {
  return await scPrivateCall("alert-templates/", "post", templateData)
  // console.log(templateData);
  // try {
  //   const response = await axios.post(
  //     `${SERVER_URL}/alert-templates/`,
  //     templateData,
  //     { headers: getAuthHeaders() }
  //   );
  //   return response.data;
  // } catch (error) {
  //   console.error("Error adding new alert template:", error.response?.data || error.message);
  //   throw error;
  // }
}

export async function deleteTemplate(templateId) {
  return await scPrivateCall(`alert-templates/${templateId}/`, "DELETE")
  try {
    const response = await axios.delete(
      `${SERVER_URL}/alert-templates/${templateId}/`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    const msg = "שגיאה במחיקת תבנית: " + error.response?.data || error.message
    console.error("Error removing alert template:", error.response?.data || error.message);
    alert(msg);
    throw error;
  }
}

export async function updateTemplate(templateId, templateData) {
  return await scPrivateCall(`alert-templates/${templateId}/`, 'PUT', templateData)
  try {
    const response = await axios.put(
      `${SERVER_URL}/alert-templates/${templateId}/`,
      templateData,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating alert template:", error.response?.data || error.message);
    throw error;
  }
}

export async function getCompanyTemplates(companyId) {
  return await scPrivateCall(`alert-templates/?company_id=${companyId}`, "GET")
  try {
    const response = await axios.get(`${SERVER_URL}/alert-templates/?company_id=${companyId}`, {
      headers: getAuthHeaders(),
    });
    console.log(response.data.data);
    
    return response.data;
  } catch (error) {
    console.error("Error fetching alert templates:", error.response?.data || error.message);
    throw error;
  }
}



export async function getTemplateVars() {

  return await scPrivateCall("template-variables/")

  try {
    const response = await axios.get(
      `${SERVER_URL}/template-variables/`,
      { headers: getAuthHeaders() }
    );

    return response.data;
  } catch (error) {
    console.error("Error getting template variables:", error.response?.data || error.message);
    alert("338 ERROR getting template variables")
    throw error;
  }
}

export async function fetchAlertTasks({ clientId, documentId, status, startDate, endDate, companyId, page = 1 }) {
  try {
    const params = { company_id: companyId };
    if (clientId) params.client_id = clientId;
    if (documentId) params.document_id = documentId;
    if (status) params.status = status;
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    params.page = page;


    return await scPrivateCall(`alert-tasks/?${new URLSearchParams(params).toString()}`)

    const response = await axios.get(`${SERVER_URL}/alert-tasks/`, {
      headers: getAuthHeaders(),
      params,
    });

    return response.data; // includes count, next, previous, results
  } catch (error) {
    console.error("Error fetching alert tasks:", error);
    alert("234 ERROR")
    throw error;
  }
}

