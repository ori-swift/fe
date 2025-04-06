import axios from "axios";
import { SERVER_URL } from "../config";
import { getAuthHeaders } from "./general_be_api";


/**
 * Selects the most specific alert template from a set of templates based on provided criteria.
 * 
 * Matching priority (most specific to least) aligned with Django model constraints:
 *  1. method__doc_{document_id}__phase_{phase_number} (unique_document_phase_template)
 *  2. method__doc_{document_id} (unique_document_template)
 *  3. method__client_{client_id}__{doc_type}__phase_{phase_number} (unique_client_phase_template)
 *  4. method__client_{client_id}__{doc_type} (unique_client_template)
 *  5. method__client_{client_id}__phase_{phase_number}
 *  6. method__client_{client_id}
 *  7. method__{doc_type}__phase_{phase_number}
 *  8. method__{doc_type} (unique_company_default_template)
 *  9. method__phase_{phase_number}
 *
 * For aggregates:
 *  1. method__aggregate__client_{client_id} (unique_client_aggregate_template)
 *  2. method__aggregate (unique_company_aggregate_template)
 *
 * Falls back to system templates:
 *  - system[method__{doc_type}]
 *  - system[method__aggregate] (for aggregates)
 *
 * @param {Object} templates - Object with 'unique' and 'system' template mappings.
 * @param {Object} options - Options to match a template.
 * @param {string} options.method - Alert method (e.g., 'email', 'sms', 'whatsapp').
 * @param {boolean} [options.is_aggregate=false] - Aggregate mode.
 * @param {string} [options.doc_type] - Document type.
 * @param {string} [options.client_id] - Client ID.
 * @param {string} [options.document_id] - Document ID.
 * @param {number} [options.phase_number] - Phase number.
 * @returns {string|null} - Matched template or null.
 */
export function getAlertTemplate(templates, {
  method,
  is_aggregate = false,
  doc_type,
  client_id,
  document_id,
  phase_number,
}) {
  if (!method) return null;

  const unique = templates.unique || {};
  const system = templates.system || {};

  // Normalize keys by sorting parts to avoid mismatch due to order
  const normalizeKey = (key) => key.split('__').sort().join('__');
  const buildKey = (...parts) => parts.filter(Boolean).join('__');

  // Normalize template keys
  const normalizeTemplates = (templateObj) => {
    const map = {};
    for (const key in templateObj) {
      map[normalizeKey(key)] = templateObj[key];
    }
    return map;
  };

  const normalizedUnique = normalizeTemplates(unique);
  const normalizedSystem = normalizeTemplates(system);
  const candidates = [];

  if (!is_aggregate) {
    // 1. Document + Phase (unique_document_phase_template)
    if (document_id && phase_number !== undefined)
      candidates.push(buildKey(method, `doc_${document_id}`, `phase_${phase_number}`));

    // 2. Document (unique_document_template)
    if (document_id)
      candidates.push(buildKey(method, `doc_${document_id}`));

    // 3. Client + DocType + Phase (unique_client_phase_template)
    if (client_id && doc_type && phase_number !== undefined)
      candidates.push(buildKey(method, `client_${client_id}`, doc_type, `phase_${phase_number}`));

    // 4. Client + DocType (unique_client_template)
    if (client_id && doc_type)
      candidates.push(buildKey(method, `client_${client_id}`, doc_type));

    // 5. Client + Phase
    if (client_id && phase_number !== undefined)
      candidates.push(buildKey(method, `client_${client_id}`, `phase_${phase_number}`));

    // 6. Client
    if (client_id)
      candidates.push(buildKey(method, `client_${client_id}`));

    // 7. DocType + Phase
    if (doc_type && phase_number !== undefined)
      candidates.push(buildKey(method, doc_type, `phase_${phase_number}`));

    // 8. DocType (unique_company_default_template)
    if (doc_type)
      candidates.push(buildKey(method, doc_type));

    // 9. Phase
    if (phase_number !== undefined)
      candidates.push(buildKey(method, `phase_${phase_number}`));
  } else {
    // Aggregate-specific candidates
    // 1. Client aggregate (unique_client_aggregate_template)
    if (client_id)
      candidates.push(buildKey(method, 'aggregate', `client_${client_id}`));

    // 2. Company aggregate (unique_company_aggregate_template)
    candidates.push(buildKey(method, 'aggregate'));
  }

  // Try unique templates first
  for (const key of candidates) {
    const normalized = normalizeKey(key);
    if (normalizedUnique[normalized]) return normalizedUnique[normalized];
  }

  // Fallback to system templates
  if (is_aggregate) {
    // System aggregate template
    const sysKey = normalizeKey(buildKey(method, 'aggregate'));
    if (normalizedSystem[sysKey]) return normalizedSystem[sysKey];
  } else if (doc_type) {
    // System doc_type template
    const sysKey = normalizeKey(buildKey(method, doc_type));
    if (normalizedSystem[sysKey]) return normalizedSystem[sysKey];
  }

  return null;
}


export async function addTemplate(templateData) {
  console.log(templateData);
  try {
    const response = await axios.post(
      `${SERVER_URL}/alert-templates/`,
      templateData,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding new alert template:", error.response?.data || error.message);
    alert("339 ERROR adding template")
    throw error;
  }
}

export async function deleteTemplate(templateId) {
  try {
    const response = await axios.delete(
      `${SERVER_URL}/alert-templates/${templateId}/`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error("Error removing alert template:", error.response?.data || error.message);
    alert("334 ERROR delete template")
    throw error;
  }
}

export async function updateTemplate(templateId, templateData) {

  try {
    const response = await axios.put(
      `${SERVER_URL}/alert-templates/${templateId}/`,
      templateData,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating alert template:", error.response?.data || error.message);
    alert("335 ERROR update template")
    throw error;
  }
}

export async function getTemplateVars() {
  console.log(getAuthHeaders());

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