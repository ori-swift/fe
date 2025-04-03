import { useContext, useState } from "react";
import MethodDropdown from "../MethodDropdown/MethodDropdown";
import { usePlaybook } from "../../../utils/PlaybookContext";
import { AppContext } from "../../../App";
import { getAlertTemplate } from "../../../api/alerts_api";
// import AlertTemplateModal from "../AlertTemplateModal/AlertTemplateModal";
import "./MethodsList.css"; // Assuming you'll create this file with the CSS
import TemplateModal from "../../templatesArea/TemplateModal/TemplateModal";
// import AlertTemplateModal from "../../alertTemplatesArea/AlertTemplateModal/AlertTemplateModal";


const MethodsList = ({ methods, phaseIdx, time, editMode, handleMethod }) => {
    const [activeDropdown, setActiveDropdown] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    
    const methodOptions = {
        email: "אימייל",
        sms: "SMS",
        whatsapp: "וואטסאפ"
    };

    const {document_data, client_id, playbook_doc_type} = usePlaybook();
    const {selectedCompany} = useContext(AppContext);

    if (editMode) {
        return (
            <div className="playbook-page-method-selector">                
                <div className="playbook-page-method-chips">
                    {methods.map((method, idx) => (
                        <div key={idx} className="playbook-page-method-chip">
                            <span className="playbook-page-method-name">{methodOptions[method] || method}</span>
                            <button
                                className="playbook-page-method-remove"
                                onClick={() => handleMethod(method, false)}
                                aria-label="הסר שיטת התראה"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>

                {methods.length < Object.keys(methodOptions).length && (
                    <MethodDropdown 
                        methods={methods}
                        methodOptions={methodOptions}
                        onSelect={(method) => handleMethod(method, true)}
                        isOpen={activeDropdown}
                        toggle={() => setActiveDropdown(!activeDropdown)}
                    />
                )}
            </div>
        );
    }

    const handleShowAlertTemplate = (method) => {
        console.log(selectedCompany);
        
        const alertTemplate = getAlertTemplate(selectedCompany.alert_templates,
            {
            client_id,
            doc_type: document_data?.doc_type || playbook_doc_type,
            method,
            phase_number: phaseIdx,
            is_aggregate: false,
            }
        );
        console.log(alertTemplate);
        
        setSelectedTemplate(alertTemplate);
        setShowModal(true);
    };

    return (
        <div className="playbook-page-methods-list">            
            {methods.map((method, idx) => (
                <span key={idx} className="playbook-page-method-badge">
                    {methodOptions[method] || method}
                    <div 
                        className="methods-list-info-icon" 
                        onClick={() => handleShowAlertTemplate(method)}
                        aria-label="הצג פרטי תבנית התראה"
                    >
                        i
                    </div>
                </span>
            ))}
            
            {selectedTemplate && (
                <TemplateModal 
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    template={selectedTemplate}
                />
            )}
        </div>
    );
};

export default MethodsList;

// import { useContext, useState } from "react";
// import MethodDropdown from "../MethodDropdown/MethodDropdown";
// import { usePlaybook } from "../../../utils/PlaybookContext";
// import { AppContext } from "../../../App";
// import { getAlertTemplate } from "../../../api/alerts_api";

// import "./MethodsList.css"

// const MethodsList = ({ methods, phaseIdx, time, editMode, handleMethod }) => {
//     const [activeDropdown, setActiveDropdown] = useState(false);
//     const methodOptions = {
//         email: "אימייל",
//         sms: "SMS",
//         whatsapp: "וואטסאפ"
//     };

//     const { document_data, client_id } = usePlaybook();
//     const { selectedCompany } = useContext(AppContext)

//     if (editMode) {
//         return (
//             <div className="playbook-page-method-selector">
//                 <div className="playbook-page-method-chips">
//                     {methods.map((method, idx) => (
//                         <div key={idx} className="playbook-page-method-chip">
//                             <span className="playbook-page-method-name">{methodOptions[method] || method}</span>
//                             <button
//                                 className="playbook-page-method-remove"
//                                 onClick={() => handleMethod(method, false)}
//                                 aria-label="הסר שיטת התראה"
//                             >
//                                 ×
//                             </button>
//                         </div>
//                     ))}
//                 </div>

//                 {methods.length < Object.keys(methodOptions).length && (
//                     <MethodDropdown
//                         methods={methods}
//                         methodOptions={methodOptions}
//                         onSelect={(method) => handleMethod(method, true)}
//                         isOpen={activeDropdown}
//                         toggle={() => setActiveDropdown(!activeDropdown)}
//                     />
//                 )}
//             </div>
//         );
//     }

//     const HandleShowAlertTemplate = (method) => {
//         console.log(selectedCompany);

//         const alertTemplate = getAlertTemplate(selectedCompany.alert_templates,
//             {
//                 client_id,
//                 doc_type: document_data.doc_type,
//                 method,
//                 phase_number: phaseIdx,
//                 is_aggregate: false,
//             }
//         )
//         console.log(alertTemplate);
//         // output:
//         // {
//         //     "id": 10,
//         //     "alert_method": "email",
//         //     "is_aggregate": false,
//         //     "doc_type": "proforma",
//         //     "phase_number": null,
//         //     "client_id": null,
//         //     "document_id": null,
//         //     "template_content": "זוהי דוגמה לתבנית ייחודית לסאניליד, אמור לתפוס לכל הלקוחות ולכל מסמכי דרישת תשלום. אך ורק לאימייל. (ולמסמכים בודדים בלבד)"
//         // }

//     }

//     return (
//         <div className="playbook-page-methods-list">
//             {methods.map((method, idx) => (
//                 <span key={idx} className="playbook-page-method-badge">
//                     {methodOptions[method] || method}
//                     <div onClick={() => HandleShowAlertTemplate(method)}> I </div>
//                 </span>
//             ))}
//         </div>
//     );
// };

// export default MethodsList