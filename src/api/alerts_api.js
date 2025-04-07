import axios from "axios";
import { SERVER_URL } from "../config";
import { getAuthHeaders } from "./general_be_api";


export function getAlertTemplate(templates, {
  method,
  is_aggregate = false,
  doc_type,
  client_id,
  document_id,
  phase_number,
}) {

  console.log(arguments);
  `
{
    "0": {
        "19__": {
            "id": 37,
            "alert_method": null,
            "is_aggregate": false,
            "doc_type": null,
            "phase_number": null,
            "client_id": null,
            "document_id": null,
            "template_content": "[CLIENT_NAME] שלום,\n\nתזכורת: חשבונית מספר [DOCUMENT_ID] על סך [TOTAL_AMOUNT] ממתינה לתשלום.\n\nנשמח להסדרת התשלום בהקדם האפשרי.\n\nבברכה,\n[COMPANY_NAME]\n"
        },
        "19__aggregate": {
            "id": 38,
            "alert_method": null,
            "is_aggregate": true,
            "doc_type": null,
            "phase_number": null,
            "client_id": null,
            "document_id": null,
            "template_content": "[CLIENT_NAME] שלום,\n\nברצוננו להזכיר כי קיימות מספר חשבוניות פתוחות מול [COMPANY_NAME].\n\nנשמח להסדרת התשלומים בהקדם האפשרי.\n\nבברכה,\n[COMPANY_NAME]\n"
        },
        "19__whatsapp__tax_invoice": {
            "id": 39,
            "alert_method": "whatsapp",
            "is_aggregate": false,
            "doc_type": "tax_invoice",
            "phase_number": null,
            "client_id": null,
            "document_id": null,
            "template_content": "שלום [CLIENT_NAME], \nחשבונית מס שהופקה טרם שולמה במלואה.\nאנא פנה בהקדם ל[COMPANY_NAME] להסדרת תשלום בסך [OPEN_AMOUNT].\n(זוהי דוגמת תבנית לוואצאפ לחשבוניות מס)"
        },
        "19__client_2173__proforma": {
            "id": 40,
            "alert_method": null,
            "is_aggregate": false,
            "doc_type": "proforma",
            "phase_number": null,
            "client_id": 2173,
            "document_id": null,
            "template_content": "תבנית שאמורה להיתפס רק לעמרי-את-משה על מסמכי דרישת תשלום"
        }
    },
    "1": {
        "client_id": 2173,
        "doc_type": "proforma",
        "method": "email",
        "phase_number": 0,
        "is_aggregate": false
    }
}
`


  if (!templates || Object.keys(templates).length === 0) {
    return null;
  }

  // Extract company ID prefix from the keys if present
  let companyId = null;
  const sampleKey = Object.keys(templates)[0];
  const prefixMatch = sampleKey.match(/^(\d+)__/);
  if (prefixMatch) {
    companyId = prefixMatch[1];
  }

  // Function to create a template key with company prefix
  const createTemplateKey = (key) => {
    return companyId ? `${companyId}__${key}` : key;
  };

  // Normalize keys by sorting parts to avoid mismatch due to order
  const normalizeKey = (key) => {
    // Extract the actual template part (after company prefix)
    const parts = key.split('__');
    // If first part is numeric (company ID), remove it
    if (parts.length > 1 && parts[0].match(/^\d+$/)) {
      parts.shift();
    }
    return parts.filter(Boolean).sort().join('__');
  };

  const buildKey = (...parts) => parts.filter(Boolean).join('__');

  // Candidates to try in order of specificity
  const candidates = [];

  if (!is_aggregate) {
    // Non-aggregate candidates

    // 1. Document + Phase
    if (document_id && phase_number !== undefined)
      candidates.push(buildKey(method, `doc_${document_id}`, `phase_${phase_number}`));

    // 2. Document
    if (document_id)
      candidates.push(buildKey(method, `doc_${document_id}`));

    // 3. Client + DocType + Phase
    if (client_id && doc_type && phase_number !== undefined)
      candidates.push(buildKey(method, `client_${client_id}`, doc_type, `phase_${phase_number}`));

    // 4. Client + DocType
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

    // 8. DocType
    if (doc_type) {
      candidates.push(buildKey(method, doc_type));
      candidates.push(doc_type); // Also try just the doc_type
    }

    // 9. Phase
    if (phase_number !== undefined)
      candidates.push(buildKey(method, `phase_${phase_number}`));

    // 10. Method only
    if (method)
      candidates.push(method);

  } else {
    // Aggregate candidates

    // 1. Client aggregate
    if (client_id)
      candidates.push(buildKey(method, 'aggregate', `client_${client_id}`));

    // 2. Method + aggregate
    if (method)
      candidates.push(buildKey(method, 'aggregate'));

    // 3. Just aggregate
    candidates.push('aggregate');
  }

  // Try direct key matches first
  for (const candidate of candidates) {
    // Try with company prefix
    const keyWithPrefix = createTemplateKey(candidate);
    if (templates[keyWithPrefix]) {
      return templates[keyWithPrefix];
    }

    // Try without prefix
    if (templates[candidate]) {
      return templates[candidate];
    }
  }

  // Try property-based matching
  let bestMatch = null;
  let bestScore = -1;

  // Score each template based on how many criteria it matches
  const scopedTemplates = templates[companyId] || templates;
  for (const key in scopedTemplates) {
    const template = scopedTemplates[key];
    let score = 0;

    // Match by aggregate flag (highest priority)
    if (template.is_aggregate === is_aggregate) {
      score += 10;
    } else {
      continue; // Skip templates that don't match the aggregate flag
    }

    // Match by method
    if (method && template.alert_method === method) {
      score += 5;
    } else if (template.alert_method === null) {
      // Null method means it's a default template
      score += 1;
    }

    // Match by doc_type
    if (doc_type && template.doc_type === doc_type) {
      score += 4;
    } else if (template.doc_type === null) {
      // Null doc_type means it matches any
      score += 1;
    }

    // Match by client_id
    if (client_id && template.client_id === client_id) {
      score += 3;
    } else if (template.client_id === null) {
      score += 1;
    }

    // Match by document_id
    if (document_id && template.document_id === document_id) {
      score += 2;
    } else if (template.document_id === null) {
      score += 1;
    }

    // Match by phase_number
    if (phase_number !== undefined && template.phase_number === phase_number) {
      score += 2;
    } else if (template.phase_number === null) {
      score += 1;
    }

    // Update best match if this template scores higher
    if (score > bestScore) {
      bestScore = score;
      bestMatch = template;
    }
  }

  if (bestMatch) return bestMatch;

  // Fallback to default template
  const defaultKey = createTemplateKey("");
  if (templates[defaultKey]) return templates[defaultKey];
  if (templates[""]) return templates[""];

  return null;

}
// /**
//  * Selects the most specific alert template from a set of templates based on provided criteria.
//  * 
//  * Matching priority (most specific to least) aligned with Django model constraints:
//  *  1. method__doc_{document_id}__phase_{phase_number} (unique_document_phase_template)
//  *  2. method__doc_{document_id} (unique_document_template)
//  *  3. method__client_{client_id}__{doc_type}__phase_{phase_number} (unique_client_phase_template)
//  *  4. method__client_{client_id}__{doc_type} (unique_client_template)
//  *  5. method__client_{client_id}__phase_{phase_number}
//  *  6. method__client_{client_id}
//  *  7. method__{doc_type}__phase_{phase_number}
//  *  8. method__{doc_type} (unique_company_default_template)
//  *  9. method__phase_{phase_number}
//  *
//  * For aggregates:
//  *  1. method__aggregate__client_{client_id} (unique_client_aggregate_template)
//  *  2. method__aggregate (unique_company_aggregate_template)
//  *
//  * Falls back to system templates:
//  *  - system[method__{doc_type}]
//  *  - system[method__aggregate] (for aggregates)
//  *
//  * @param {Object} templates - Object with 'unique' and 'system' template mappings.
//  * @param {Object} options - Options to match a template.
//  * @param {string} options.method - Alert method (e.g., 'email', 'sms', 'whatsapp').
//  * @param {boolean} [options.is_aggregate=false] - Aggregate mode.
//  * @param {string} [options.doc_type] - Document type.
//  * @param {string} [options.client_id] - Client ID.
//  * @param {string} [options.document_id] - Document ID.
//  * @param {number} [options.phase_number] - Phase number.
//  * @returns {string|null} - Matched template or null.
//  */
// export function getAlertTemplate(templates, {
//   method,
//   is_aggregate = false,
//   doc_type,
//   client_id,
//   document_id,
//   phase_number,
// }) {
//   if (!method) return null;

//   const unique = templates.unique || {};
//   const system = templates.system || {};

//   // Normalize keys by sorting parts to avoid mismatch due to order
//   const normalizeKey = (key) => key.split('__').sort().join('__');
//   const buildKey = (...parts) => parts.filter(Boolean).join('__');

//   // Normalize template keys
//   const normalizeTemplates = (templateObj) => {
//     const map = {};
//     for (const key in templateObj) {
//       map[normalizeKey(key)] = templateObj[key];
//     }
//     return map;
//   };

//   const normalizedUnique = normalizeTemplates(unique);
//   const normalizedSystem = normalizeTemplates(system);
//   const candidates = [];

//   if (!is_aggregate) {
//     // 1. Document + Phase (unique_document_phase_template)
//     if (document_id && phase_number !== undefined)
//       candidates.push(buildKey(method, `doc_${document_id}`, `phase_${phase_number}`));

//     // 2. Document (unique_document_template)
//     if (document_id)
//       candidates.push(buildKey(method, `doc_${document_id}`));

//     // 3. Client + DocType + Phase (unique_client_phase_template)
//     if (client_id && doc_type && phase_number !== undefined)
//       candidates.push(buildKey(method, `client_${client_id}`, doc_type, `phase_${phase_number}`));

//     // 4. Client + DocType (unique_client_template)
//     if (client_id && doc_type)
//       candidates.push(buildKey(method, `client_${client_id}`, doc_type));

//     // 5. Client + Phase
//     if (client_id && phase_number !== undefined)
//       candidates.push(buildKey(method, `client_${client_id}`, `phase_${phase_number}`));

//     // 6. Client
//     if (client_id)
//       candidates.push(buildKey(method, `client_${client_id}`));

//     // 7. DocType + Phase
//     if (doc_type && phase_number !== undefined)
//       candidates.push(buildKey(method, doc_type, `phase_${phase_number}`));

//     // 8. DocType (unique_company_default_template)
//     if (doc_type)
//       candidates.push(buildKey(method, doc_type));

//     // 9. Phase
//     if (phase_number !== undefined)
//       candidates.push(buildKey(method, `phase_${phase_number}`));
//   } else {
//     // Aggregate-specific candidates
//     // 1. Client aggregate (unique_client_aggregate_template)
//     if (client_id)
//       candidates.push(buildKey(method, 'aggregate', `client_${client_id}`));

//     // 2. Company aggregate (unique_company_aggregate_template)
//     candidates.push(buildKey(method, 'aggregate'));
//   }

//   // Try unique templates first
//   for (const key of candidates) {
//     const normalized = normalizeKey(key);
//     if (normalizedUnique[normalized]) return normalizedUnique[normalized];
//   }

//   // Fallback to system templates
//   if (is_aggregate) {
//     // System aggregate template
//     const sysKey = normalizeKey(buildKey(method, 'aggregate'));
//     if (normalizedSystem[sysKey]) return normalizedSystem[sysKey];
//   } else if (doc_type) {
//     // System doc_type template
//     const sysKey = normalizeKey(buildKey(method, doc_type));
//     if (normalizedSystem[sysKey]) return normalizedSystem[sysKey];
//   }

//   return null;
// }


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
    const msg = "שגיאה במחיקת תבנית: " + error.response?.data || error.message
    console.error("Error removing alert template:", error.response?.data || error.message);
    alert(msg);
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