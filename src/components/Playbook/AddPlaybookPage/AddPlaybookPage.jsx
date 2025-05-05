import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { isPlaybookConfigValid, addNewPlaybook, getPlaybook } from "../../../api/playbook_api";
import LoadingSpinner from "../../../utils/LoadingSpinner";
import ErrorMessage from "../../../utils/ErrorMessage";
import { useConfirmation } from "../../../utils/ConfirmationContext";
import PlaybookContent from "../PlaybookContent/PlaybookContent";
import TargetInfo from "../TargetInfo/TargetInfo";
import ActionButtons from "../ActionButtons/ActionButtons";
import "./../PlaybookPage/PlaybookPage.css";
import { AppContext } from "../../../App";
import { getDocumentById } from "../../../api/documents_api";
import { clearLocalStorageExcept } from "../../../utils/helpers";


const AddPlaybookPage = () => {

    const navigate = useNavigate();

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
            company_id: null,
        },
        error: "",
        loading: true,
        saving: false,
        targetType: "global"
    });

    const { selectedCompany } = useContext(AppContext)

    useEffect(() => {
        // Fetch default company playbook as template
        if (!selectedCompany)
            return;
        getPlaybook(selectedCompany.playbook).then((res) => {

            // Update state with the fetched playbook data
            setState(prevState => ({
                ...prevState,
                formData: {
                    ...prevState.formData,
                    only_business_days: res.only_business_days,
                    config: res.config,
                    company_id: res.company,
                },
                playbook: {
                    ...prevState.playbook,
                    company: res.company_data,
                },
                loading: false
            }));
        }).catch(error => {
            console.error("Error fetching playbook:", error);
            setState(prevState => ({
                ...prevState,
                error: "Failed to load playbook template",
                loading: false
            }));
        });


    }, [selectedCompany]);

    const handleSave = async () => {
        setState(prev => ({ ...prev, error: "" }));
        const validationResult = isPlaybookConfigValid(state.formData.config);

        if (!validationResult.valid) {
            setState(prev => ({ ...prev, error: validationResult.error }));
            return;
        }

        setState(prev => ({ ...prev, saving: true }));
        try {
            console.log(selectedCompany.id);  // shows 26
            
            const response = await addNewPlaybook({...state.formData, company_id: selectedCompany.id});
            navigate(`/playbook/${response.id}`);
        } catch (error) {
            console.log(error);            
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
                newMode={true}
            />
        </div>
    );
};

export default AddPlaybookPage;