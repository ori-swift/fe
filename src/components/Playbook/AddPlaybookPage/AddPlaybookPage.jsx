import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { isPlaybookConfigValid, addNewPlaybook } from "../../../api/playbook_api";
import LoadingSpinner from "../../../utils/LoadingSpinner";
import ErrorMessage from "../../../utils/ErrorMessage";
import { useConfirmation } from "../../../utils/ConfirmationContext";
import PlaybookContent from "../PlaybookContent/PlaybookContent";
import TargetInfo from "../TargetInfo/TargetInfo";
import ActionButtons from "../ActionButtons/ActionButtons";
import "./../PlaybookPage/PlaybookPage.css";

const AddPlaybookPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const clientId = searchParams.get("clientId");
    const documentId = searchParams.get("documentId");

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
        playbook: {
            document: documentId ? { id: documentId, provider_doc_id: documentId } : null,
            client: clientId ? { id: clientId, name: clientId } : null,
        },
        error: "",
        loading: true,
        saving: false,
        targetType: "global"
    });

    useEffect(() => {
        if (!clientId && !documentId) {
            alert("ERROR: no client/document specify.");
            navigate("/home");
            return;
        }

        setState(prev => ({
            ...prev,
            formData: {
                ...prev.formData,
                company_id: 1,
            },
            loading: false,
            targetType: documentId ? "document" : (clientId ? "client" : "global")
        }));
    }, [documentId, clientId, navigate]);

    const handleSave = async () => {
        setState(prev => ({ ...prev, error: "" }));
        const validationResult = isPlaybookConfigValid(state.formData.config);

        if (!validationResult.valid) {
            setState(prev => ({ ...prev, error: validationResult.error }));
            return;
        }

        setState(prev => ({ ...prev, saving: true }));
        try {
            const response = await addNewPlaybook(state.formData, { 
                documentId: documentId || null, 
                clientId: clientId || null 
            });
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

    const validateAndUpdateProperty = (phaseIdx, property, value, shouldValidate = true) => {
        let errorMessage = "none"; // Default to "none" to indicate no error

        // Process the value
        let processedValue = value;

        if (property === "start_day") {
            processedValue = value === "" ? 0 : parseInt(value, 10);

            // If we're just updating during typing without validation, apply the change
            if (!shouldValidate) {
                updateFormData(currentFormData => {
                    const updated = { ...currentFormData };
                    updated.config.phases[phaseIdx][property] = processedValue;
                    return updated;
                });
                return "none";
            }

            // Otherwise, perform full validation
            if (isNaN(processedValue) || processedValue < 0) {
                errorMessage = "יום התחלה חייב להיות מספר חיובי";
                setState(prev => ({ ...prev, error: errorMessage }));
                return errorMessage;
            }

            // Validate phase order
            updateFormData(currentFormData => {
                const updated = { ...currentFormData };
                const phases = updated.config.phases;

                if ((phaseIdx > 0 && processedValue <= phases[phaseIdx - 1].start_day) ||
                    (phaseIdx < phases.length - 1 && processedValue >= phases[phaseIdx + 1].start_day)) {
                    errorMessage = "יום התחלה מפר את סדר הפאזות";
                    setState(prev => ({ ...prev, error: errorMessage }));
                    return currentFormData;
                }

                updated.config.phases[phaseIdx][property] = processedValue;
                setState(prev => ({ ...prev, error: "" }));
                return updated;
            });

            return errorMessage;
        }

        if (property === "repeat_interval") {
            if (value === "" || value === "null") {
                processedValue = null;
            } else {
                processedValue = parseInt(value, 10);

                // If we need to validate
                if (shouldValidate && (isNaN(processedValue) || processedValue < 1)) {
                    errorMessage = "מרווח חזרה חייב להיות מספר חיובי";
                    setState(prev => ({ ...prev, error: errorMessage }));
                    return errorMessage;
                }
            }
        }

        updateFormData(currentFormData => {
            const updated = { ...currentFormData };
            updated.config.phases[phaseIdx][property] = processedValue;
            setState(prev => ({ ...prev, error: "" }));
            return updated;
        });

        return errorMessage;
    };

    if (state.loading) return <LoadingSpinner message="טוען..." />;

    return (
        <div className="playbook-page-container edit-mode">
            <div className="playbook-page-header">
                <div className="playbook-page-header-content">
                    <div className="playbook-page-title-section">
                        <h1 className="playbook-page-title">יצירת פלייבוק</h1>
                        <TargetInfo playbook={state.playbook} />
                    </div>

                    <ActionButtons
                        editMode={true}
                        saving={state.saving}
                        playbook={state.playbook}
                        onSave={handleSave}
                        onCancel={handleCancel}
                    />
                </div>

                {state.error && <ErrorMessage message={state.error} />}
            </div>

            <PlaybookContent
                formData={state.formData}
                editMode={true}
                updateFormData={updateFormData}
                addPhase={addPhase}
                validateAndUpdateProperty={validateAndUpdateProperty}
                removePhase={removePhase}
            />
        </div>
    );
};

export default AddPlaybookPage;