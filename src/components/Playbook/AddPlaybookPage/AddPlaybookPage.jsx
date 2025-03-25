import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { isPlaybookConfigValid, addNewPlaybook } from "../../../api/playbook_api";
import LoadingSpinner from "../../../utils/LoadingSpinner";
import ErrorMessage from "../../../utils/ErrorMessage";
import BusinessDaysSettings from "../BusinessDaysSettings/BusinessDaysSettings";
import PhaseCard from "../PhaseCard/PhaseCard";
import { useConfirmation } from "../../../utils/ConfirmationContext";
import "./../PlaybookPage/PlaybookPage.css"; 

const AddPlaybookPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const clientId = searchParams.get("client_id");
    const documentId = searchParams.get("document_id");
    const { confirmAction } = useConfirmation();
    
    const [state, setState] = useState({
        formData: {
            only_business_days: true,
            config: {
                phases: [
                    {
                        start_day: 0,
                        repeat_interval: null,
                        alerts: { "09:00": ["email"] }
                    }
                ]
            },
            document_id: documentId || null,
            client_id: clientId || null,
            company_id: null, 
        },
        error: "",
        loading: true,
        saving: false,
        targetType: "global"
    });

    
    useEffect(() => {

        setState(prev => ({
            ...prev,
            formData: {
                ...prev.formData,
                company_id: 1,
            },
            loading: false,
            targetType: documentId ? "document" : (clientId ? "client" : "global")
        }));
    }, [documentId, clientId]);

    const handleSave = async () => {
        setState(prev => ({ ...prev, error: "" }));
        const validationResult = isPlaybookConfigValid(state.formData.config);

        if (!validationResult.valid) {
            setState(prev => ({ ...prev, error: validationResult.error }));
            return;
        }

        setState(prev => ({ ...prev, saving: true }));
        try {
            const response = await addNewPlaybook(state.formData);            
            navigate(`/playbook/${response.id}`);
        } catch (error) {
            setState(prev => ({ 
                ...prev, 
                error: "שגיאה ביצירת פלייבוק חדש", 
                saving: false 
            }));
        }
    };

    const handleCancel = () => {
        confirmAction(
            "האם אתה בטוח שברצונך לבטל את יצירת הפלייבוק?",
            () => {                
                navigate(-1);
            },
            { 
                yesMsg: "כן, בטל",
                noMsg: "לא, המשך ביצירה" 
            }
        );
    };

    const updateFormData = updater => {
        setState(prev => ({
            ...prev,
            formData: updater(prev.formData)
        }));
    };

    const removePhase = (phaseIdx) => {
        confirmAction(
            "האם אתה בטוח שברצונך להסיר את התקופה?",
            () => {
                updateFormData(currentFormData => {
                    const updated = { ...currentFormData };
                    updated.config.phases = updated.config.phases.filter((_, idx) => idx !== phaseIdx);
                    return updated;
                });
            }
        );
    };

    const addPhase = () => {
        updateFormData(currentFormData => {
            const updated = { ...currentFormData };
            const lastPhase = updated.config.phases[updated.config.phases.length - 1];
            const newStartDay = lastPhase.start_day + 1;

            updated.config.phases.push({
                start_day: newStartDay,
                repeat_interval: null,
                alerts: { "09:00": ["email"] }
            });
            return updated;
        });
    };

    const validateAndUpdateProperty = (phaseIdx, property, value) => {
        updateFormData(currentFormData => {
            const updated = { ...currentFormData };
            const phases = updated.config.phases;

            if (property === "start_day") {
                value = parseInt(value, 10);
                if (isNaN(value) || value < 0) {
                    setState(prev => ({ ...prev, error: "יום התחלה חייב להיות מספר חיובי" }));
                    return currentFormData;
                }
                
                if ((phaseIdx > 0 && value <= phases[phaseIdx - 1].start_day) ||
                    (phaseIdx < phases.length - 1 && value >= phases[phaseIdx + 1].start_day)) {
                    setState(prev => ({ ...prev, error: "יום התחלה מפר את סדר הפאזות" }));
                    return currentFormData;
                }
            }

            if (property === "repeat_interval") {
                if (value === "" || value === "null") {
                    value = null;
                } else {
                    value = parseInt(value, 10);
                    if (isNaN(value) || value < 1) {
                        setState(prev => ({ ...prev, error: "מרווח חזרה חייב להיות מספר חיובי" }));
                        return currentFormData;
                    }
                }
            }

            updated.config.phases[phaseIdx][property] = value;
            setState(prev => ({ ...prev, error: "" }));
            return updated;
        });
    };

    if (state.loading) return <LoadingSpinner message="טוען..." />;

    const renderTargetInfo = () => {
        if (state.targetType === "document") {
            return (
                <div className="playbook-page-target-info document">
                    <svg className="playbook-page-target-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    <span className="playbook-page-target-label">מסמך:</span>
                    <span className="playbook-page-target-value">
                        {documentId}
                    </span>
                </div>
            );
        } else if (state.targetType === "client") {
            return (
                <div className="playbook-page-target-info client">
                    <svg className="playbook-page-target-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span className="playbook-page-target-label">לקוח:</span>
                    <span className="playbook-page-target-value">
                        {clientId}
                    </span>
                </div>
            );
        } else {
            return (
                <div className="playbook-page-target-info global">
                    <svg className="playbook-page-target-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                    <span className="playbook-page-target-label">פלייבוק גלובלי</span>
                </div>
            );
        }
    };

    return (
        <div className="playbook-page-container edit-mode">            
            <div className="playbook-page-header">
                <div className="playbook-page-header-content">
                    <div className="playbook-page-title-section">
                        <h1 className="playbook-page-title">יצירת פלייבוק</h1>
                        {renderTargetInfo()}
                    </div>

                    <div className="playbook-page-editing-actions-fixed">
                        <button
                            className="playbook-page-save-btn"
                            onClick={handleSave}
                            disabled={state.saving}
                        >
                            {state.saving ? (
                                <>
                                    <div className="playbook-page-spinner-small"></div>
                                    שומר...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                        <polyline points="7 3 7 8 15 8"></polyline>
                                    </svg>
                                    שמור פלייבוק
                                </>
                            )}
                        </button>
                        <button
                            className="playbook-page-cancel-btn"
                            onClick={handleCancel}
                            disabled={state.saving}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                            בטל
                        </button>
                    </div>
                </div>

                {state.error && <ErrorMessage message={state.error} />}
            </div>
            
            <div className="playbook-page-content">
                <BusinessDaysSettings 
                    formData={state.formData}
                    editMode={true}
                    updateFormData={updateFormData}
                />
                
                <div className="playbook-page-phases-section">
                    <div className="playbook-page-section-header">
                        <h2 className="playbook-page-section-title">הגדרת התראות</h2>
                    </div>
                    
                    <div className="playbook-page-phases-container">
                        {state.formData.config.phases.map((phase, idx) => (
                            <PhaseCard 
                                key={idx}
                                phase={phase}
                                phaseIdx={idx}
                                editMode={true}
                                updatePhaseProperty={(property, value) => validateAndUpdateProperty(idx, property, value)}
                                removePhase={() => removePhase(idx)}
                                updateFormData={updateFormData}
                            />
                        ))}
                    </div>
                    
                    <button className="playbook-page-add-phase-btn" onClick={addPhase}>
                        <span className="playbook-page-add-icon">+</span> הוסף תקופה חדשה
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddPlaybookPage;