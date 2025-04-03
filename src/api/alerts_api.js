import axios from "axios";
import { SERVER_URL } from "../config";
import { getAuthHeaders } from "./general_be_api";
/**
 * Selects the most appropriate alert template based on given parameters.
 * Matches keys regardless of order by normalizing them.
 */
export function getAlertTemplate(templates, {
  method,
  is_aggregate = false,
  doc_type,
  client_id,
  document_id,
  phase_number,
}) {

  const unique = templates.unique || {};
  const system = templates.system || {};

  const normalizeKey = (key) => key.split('__').sort().join('__');
  const buildKey = (...parts) => parts.filter(Boolean).join('__');

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

  if (is_aggregate) {
    if (client_id) candidates.push(buildKey(method, 'aggregate', `client_${client_id}`));
    candidates.push(buildKey(method, 'aggregate'));
  } else {
    if (document_id && phase_number !== undefined)
      candidates.push(buildKey(method, `doc_${document_id}`, `phase_${phase_number}`));
    if (client_id && doc_type && phase_number !== undefined)
      candidates.push(buildKey(method, `client_${client_id}`, doc_type, `phase_${phase_number}`));
    if (document_id)
      candidates.push(buildKey(method, `doc_${document_id}`));
    if (client_id && doc_type)
      candidates.push(buildKey(method, `client_${client_id}`, doc_type));
    if (doc_type)
      candidates.push(buildKey(method, doc_type));
  }

  for (const key of candidates) {
    const normalized = normalizeKey(key);
    if (normalizedUnique[normalized]) return normalizedUnique[normalized];
  }

  // fallback to system
  if (is_aggregate) {
    const sysKey = normalizeKey(buildKey(method, 'aggregate'));
    if (normalizedSystem[sysKey]) return normalizedSystem[sysKey];
  } else if (doc_type) {
    const sysKey = normalizeKey(buildKey(method, doc_type));
    if (normalizedSystem[sysKey]) return normalizedSystem[sysKey];
  }

  return null;
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