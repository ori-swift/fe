import React, { useState, useEffect, useContext } from "react";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import { fetchProviders } from "../../../api/general_be_api";
import "./NewProviderModal.css"
import { addNewCompany, addFirstCompany } from "../../../api/company_api";
import { AppContext } from "../../../App";
import { useNavigate } from "react-router-dom";

const NewProviderModal = ({ show, setShow }) => {
    console.log(show);
    
    const [providers, setProviders] = useState({});
    const [companyName, setCompanyName] = useState("");
    const [selectedProvider, setSelectedProvider] = useState("");
    const [requiredFields, setRequiredFields] = useState({});
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const { userData } = useContext(AppContext);
    const navigate = useNavigate();

    // Determine if this is the user's first company
    const isFirstCompany = userData?.user?.onboarding_status === "profile_completed" && 
                          userData?.companies?.length === 0;

    useEffect(() => {
        if (show) {
            // Fetch providers when modal opens
            fetchProviders()
                .then((data) => setProviders(data))
                .catch(() => setError("שגיאה בטעינת רשימת ספקים"));
        }
    }, [show]);

    useEffect(() => {
        if (show && userData) {
            const onboardingStatus = userData.user?.onboarding_status;

            // Handle different onboarding statuses
            if (onboardingStatus === "account_created") {
                handleHide();
                navigate("/onboarding");
                return;
            }

            if (onboardingStatus === "company_added") {
                // Check if the existing company has valid credentials
                const hasCompanyWithoutCreds = userData.companies?.some(
                    company => company.relation === "admin" && !company.has_valid_credentials
                );
                
                if (hasCompanyWithoutCreds) {
                    setError("עליך לעדכן את פרטי הספק עבור החברה הקיימת");
                    // Don't auto-close, let user close manually
                    return;
                }
            }
        }
    }, [show, userData, navigate]);

    useEffect(() => {
        if (selectedProvider && !isFirstCompany) {
            // Only set required fields if it's not the first company
            const fields = providers[selectedProvider]?.req_fields || {};
            setRequiredFields(
                Object.entries(fields).reduce((acc, [key, value]) => {
                    acc[key] = { type: value.type, nickname: value.nickname };
                    return acc;
                }, {})
            );
            setFormData(
                Object.keys(fields).reduce((acc, key) => ({ ...acc, [key]: "" }), {})
            );
        } else {
            // Clear fields for first company
            setRequiredFields({});
            setFormData({});
        }
    }, [selectedProvider, providers, isFirstCompany]);

    const handleHide = () => {
        setError("");
        setCompanyName("");
        setSelectedProvider("");
        setRequiredFields({});
        setFormData({});
        setSuccess(false);
        setShow(false);
    }

    const handleProviderChange = (e) => {
        setSelectedProvider(e.target.value);
        setRequiredFields({});
        setFormData({});
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!companyName || !selectedProvider) {
            setError("נא למלא את כל השדות");
            return;
        }

        // For non-first companies, validate credential fields
        if (!isFirstCompany) {
            const isValid = Object.keys(requiredFields).every((key) => formData[key] && formData[key].trim() !== "");
            if (!isValid) {
                setError("נא למלא את כל השדות");
                return;
            }
        }

        setLoading(true);
        setError("");

        try {
            let result;
            
            if (isFirstCompany) {
                // Use addFirstCompany for first company (no credentials)
                result = await addFirstCompany(selectedProvider, companyName);
            } else {
                // Use addNewCompany for subsequent companies (with credentials)
                result = await addNewCompany(selectedProvider, companyName, formData);
            }

            if (!result) {
                setError("תקלה בהוספת ספק חדש");
            } else {
                setSuccess(true);
                setTimeout(() => {
                    handleHide();
                    // Optionally refresh the page or update context to reflect new company
                    window.location.reload();
                }, isFirstCompany ? 4000 : 2000); // Longer timeout for first company to read the message
            }
        } catch (err) {
            setError("אירעה שגיאה בעת הוספת ספק חדש\n" + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleHide} centered>
            <div className="new-ps-container">
                <Modal.Header closeButton>
                    <Modal.Title className="new-ps-title">הוספת חברה חדשה</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {success ? (
                        <Alert variant="success" className="new-ps-alert">
                            {isFirstCompany ? 
                                "החברה נוספה! כעת תוכל להוסיף ולצפות בפלייבוקים ותבניות. תוכל גם להוסיף את פרטי הספק שלך כדי להתחיל להריץ תזכורות עבור הלקוחות שלך" :
                                "הספק נוסף בהצלחה!"
                            }
                        </Alert>
                    ) : (
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="new-ps-form-group">
                                <Form.Label className="new-ps-label">שם חברה:</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="companyName"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    className="new-ps-input"
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="new-ps-form-group">
                                <Form.Label className="new-ps-label">בחר ספק:</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={selectedProvider}
                                    onChange={handleProviderChange}
                                    className="new-ps-input"
                                    required
                                >
                                    <option value="">-- בחר ספק --</option>
                                    {Object.entries(providers).map(([id, provider]) => (
                                        <option key={id} value={id}>
                                            {provider.name}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group>

                            {/* Only show credential fields if it's not the first company */}
                            {!isFirstCompany && selectedProvider &&
                                Object.entries(requiredFields).map(([key, field]) => (
                                    <Form.Group key={key} className="new-ps-form-group">
                                        <Form.Label className="new-ps-label">{field.nickname}:</Form.Label>
                                        <Form.Control
                                            type={field.type === "password" ? "password" : "text"}
                                            name={key}
                                            value={formData[key] || ""}
                                            onChange={handleChange}
                                            className="new-ps-input"
                                            required
                                        />
                                    </Form.Group>
                                ))}

                            {error && <div className="new-ps-error">{error}</div>}

                            <div className="new-ps-button-container">
                                <Button 
                                    type="submit" 
                                    disabled={loading || !selectedProvider || !companyName} 
                                    className="new-ps-submit-button"
                                >
                                    {loading ? (
                                        <>
                                            <Spinner animation="border" size="sm" />
                                            <span className="new-ps-spinner-text">מוסיף...</span>
                                        </>
                                    ) : (
                                        "הוסף חברה"
                                    )}
                                </Button>
                                <Button 
                                    variant="secondary" 
                                    onClick={handleHide} 
                                    disabled={loading} 
                                    className="new-ps-cancel-button"
                                >
                                    ביטול
                                </Button>
                            </div>
                        </Form>
                    )}
                </Modal.Body>
            </div>
        </Modal>
    );
};

export default NewProviderModal;


// import React, { useState, useEffect, useContext } from "react";
// import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
// import { fetchProviders } from "../../../api/general_be_api";
// import "./NewProviderModal.css"
// import { addNewCompany } from "../../../api/company_api";
// import { AppContext } from "../../../App";

// const NewProviderModal = ({ show, setShow }) => {
//     const [providers, setProviders] = useState({});
//     const [companyName, setCompanyName] = useState("");
//     const [selectedProvider, setSelectedProvider] = useState("");
//     const [requiredFields, setRequiredFields] = useState({});
//     const [formData, setFormData] = useState({});
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState("");
//     const [success, setSuccess] = useState(false);

//     const { userData } = useContext(AppContext)
//     console.log(userData);
//     /*
//     {
//     "user": {
//         "id": 5,
//         "username": "Ori Brook"
//     },
//     "companies": [
//         {
//             "id": 38,
//             "provider_name": "Green Invoice",
//             "provider_id": 1,
//             "company_name": "ח.י.מ",
//             "playbook": 98,            
//             "plan": {
//                 "id": 3,
//                 "name": "pro",
//                 "price_nis": 249,                
//             },            
//             "relation": "admin",
//             "has_valid_credentials": true,            
//         },
//         ..
//     ]
// }
//     */

//     useEffect(() => {
//         if (show) {
//             fetchProviders()
//                 .then((data) => setProviders(data))
//                 .catch(() => setError("שגיאה בטעינת רשימת ספקים"));
//         }
//     }, [show]);

//     useEffect(() => {
//         if (selectedProvider) {
//             const fields = providers[selectedProvider]?.req_fields || {};
//             setRequiredFields(
//                 Object.entries(fields).reduce((acc, [key, value]) => {
//                     acc[key] = { type: value.type, nickname: value.nickname };
//                     return acc;
//                 }, {})
//             );
//             setFormData(
//                 Object.keys(fields).reduce((acc, key) => ({ ...acc, [key]: "" }), {})
//             );
//         }
//     }, [selectedProvider, providers]);



//     const handleHide = () => {
//         setError("");
//         setShow(false);
//     }

//     const handleProviderChange = (e) => {
//         setSelectedProvider(e.target.value);
//         setRequiredFields({});
//         setFormData({});
//     };

//     const handleChange = (e) => {
//         setFormData({
//             ...formData,
//             [e.target.name]: e.target.value,
//         });
//     };

//     const handleSubmit = async (e) => {

//         e.preventDefault();

//         const isValid = Object.keys(requiredFields).every((key) => formData[key] && formData[key].trim() !== "");

//         if (!isValid || !companyName) {
//             setError("נא למלא את כל השדות");
//             return;
//         }

//         setLoading(true);
//         setError("");

//         try {
//             const result = await addNewCompany(selectedProvider, companyName, formData);


//             if (!result) {
//                 setError("תקלה בהוספת ספק חדש");
//             } else {
//                 setSuccess(true);
//                 setTimeout(() => {
//                     handleHide(false);
//                     setSuccess(false);
//                 }, 2000);
//             }
//         } catch (err) {
//             setError("אירעה שגיאה בעת הוספת ספק חדש\n" + err.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <Modal show={show} onHide={() => handleHide(false)} centered >
//             <div className="new-ps-container">
//                 <Modal.Header closeButton>
//                     <Modal.Title className="new-ps-title">הוספת חברה חדשה</Modal.Title>
//                 </Modal.Header>
//                 <Modal.Body>
//                     {success ? (
//                         <Alert variant="success" className="new-ps-alert">
//                             הספק נוסף בהצלחה!
//                         </Alert>
//                     ) : (
//                         <Form onSubmit={handleSubmit}>
//                             <Form.Group className="new-ps-form-group">
//                                 <Form.Label className="new-ps-label">שם חברה:</Form.Label>
//                                 <Form.Control
//                                     type="text"
//                                     name="companyName"
//                                     value={companyName}
//                                     onChange={(e) => { setCompanyName(e.target.value) }}
//                                     className="new-ps-input"
//                                     required
//                                 />
//                             </Form.Group>

//                             <Form.Group className="new-ps-form-group">
//                                 <Form.Label className="new-ps-label">בחר ספק:</Form.Label>
//                                 <Form.Control
//                                     as="select"
//                                     value={selectedProvider}
//                                     onChange={handleProviderChange}
//                                     className="new-ps-input"
//                                     required
//                                 >
//                                     <option value="">-- בחר ספק --</option>
//                                     {Object.entries(providers).map(([id, provider]) => (
//                                         <option key={id} value={id}>
//                                             {provider.name}
//                                         </option>
//                                     ))}
//                                 </Form.Control>
//                             </Form.Group>

//                             {selectedProvider &&
//                                 Object.entries(requiredFields).map(([key, field]) => (
//                                     <Form.Group key={key} className="new-ps-form-group">
//                                         <Form.Label className="new-ps-label">:{field.nickname}</Form.Label>
//                                         <Form.Control
//                                             type="text"
//                                             name={key}
//                                             value={formData[key] || ""}
//                                             onChange={handleChange}
//                                             className="new-ps-input"
//                                             required
//                                         />
//                                     </Form.Group>
//                                 ))}

//                             {error && <div className="new-ps-error">{error}</div>}

//                             <div className="new-ps-button-container">
//                                 <Button type="submit" disabled={loading || !selectedProvider} className="new-ps-submit-button">
//                                     {loading ? (
//                                         <>
//                                             <Spinner animation="border" size="sm" />
//                                             <span className="new-ps-spinner-text">מוסיף...</span>
//                                         </>
//                                     ) : (
//                                         "הוסף חברה"
//                                     )}
//                                 </Button>
//                                 <Button variant="secondary" onClick={() => handleHide(false)} disabled={loading} className="new-ps-cancel-button">
//                                     ביטול
//                                 </Button>
//                             </div>
//                         </Form>
//                     )}
//                 </Modal.Body>
//             </div>
//         </Modal>
//     );
// };

// export default NewProviderModal;
