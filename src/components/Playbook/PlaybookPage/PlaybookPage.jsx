import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getPlaybook, isPlaybookConfigValid, updatePlaybook } from "../../../api/playbook_api";
import "./PlaybookPage.css";
import LoadingSpinner from "../../../utils/LoadingSpinner";
import ErrorMessage from "../../../utils/ErrorMessage";
import PlaybookHeader from "../PlaybookHeader/PlaybookHeader";
import PlaybookContent from "../PlaybookContent/PlaybookContent";
import { useConfirmation } from "../../../utils/ConfirmationContext";
import { PlaybookProvider } from "../../../utils/PlaybookContext";


const PlaybookPage = () => {
    const { id } = useParams();
    const { confirmAction } = useConfirmation();
    const [state, setState] = useState({
        playbook: null,
        formData: null,
        editMode: false,
        error: "",
        loading: true,
        saving: false,
        activeDropdown: null
    });

    const [contextData, setContextData] = useState({
        client_id: null,
        document_id: null
    });

    const fetchPlaybook = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true }));
        try {
            const data = await getPlaybook(id);

            console.log(data);
            setContextData({
                client_id: data.client?.id || null,
                // document_id: data.document?.id || null,
                document_data: data.document_data,
                client_data: data.client_data,
                playbook_doc_type: data.doc_type,
            });

            setState(prev => ({
                ...prev,
                playbook: data,
                formData: {
                    only_business_days: data.only_business_days,
                    config: JSON.parse(JSON.stringify(data.config)),
                    document_id: data.document?.id || null,
                    document_doc_type: data.document_data?.doc_type || null,
                    client_id: data.client?.id || null,
                    company_id: data.company?.id || null,
                },
                loading: false
            }));
        } catch (error) {
            setState(prev => ({ ...prev, error: "Failed to load playbook", loading: false }));
        }
    }, [id]);

    useEffect(() => {

        if (!id) {
            alert("missing id param for playbook-page")
        }
        fetchPlaybook();
    }, [fetchPlaybook]);

    const handleSave = async () => {
        setState(prev => ({ ...prev, error: "" }));
        const validationResult = isPlaybookConfigValid(state.formData.config);

        if (!validationResult.valid) {
            setState(prev => ({ ...prev, error: validationResult.error }));
            return;
        }

        setState(prev => ({ ...prev, saving: true }));
        try {
            await updatePlaybook(id, state.formData);
            await fetchPlaybook();
            setState(prev => ({ ...prev, editMode: false, saving: false }));
        } catch (error) {
            setState(prev => ({ ...prev, error: "Failed to save playbook", saving: false }));
        }
    };

    const handleCancel = () => {
        if (state.editMode) {
            confirmAction(
                "האם אתה בטוח שברצונך לבטל את השינויים?",
                () => {
                    setState(prev => ({
                        ...prev,
                        formData: {
                            only_business_days: state.playbook.only_business_days,
                            config: JSON.parse(JSON.stringify(state.playbook.config)),
                            document_id: state.playbook.document?.id || null,
                            client_id: state.playbook.client?.id || null,
                            company_id: state.playbook.company?.id || null,
                        },
                        editMode: false,
                        error: ""
                    }));
                },
                {
                    yesMsg: "בטל שינויים",
                    noMsg: "לא, השאר"
                }
            );
        }
    };

    const updateFormData = updater => {
        setState(prev => ({
            ...prev,
            formData: updater(prev.formData)
        }));
    };

    const removePhase = (phaseIdx) => {
        if (!state.editMode) return;

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
        if (!state.editMode) return;

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

    if (state.loading) return <LoadingSpinner message="טוען פלייבוק..." />;
    if (!state.playbook || !state.formData) return <ErrorMessage message="שגיאה בטעינת נתוני הפלייבוק" />;
    return (
        <PlaybookProvider value={contextData}>
            <div className={`playbook-page-container ${state.editMode ? 'edit-mode' : ''}`}>
                <PlaybookHeader
                    playbook={state.playbook}
                    editMode={state.editMode}
                    error={state.error}
                    saving={state.saving}
                    onEdit={() => setState(prev => ({ ...prev, editMode: true }))}
                    onSave={handleSave}
                    onCancel={handleCancel}
                />

                <PlaybookContent
                    formData={state.formData}
                    editMode={state.editMode}
                    updateFormData={updateFormData}
                    addPhase={addPhase}
                    validateAndUpdateProperty={validateAndUpdateProperty}
                    removePhase={removePhase}
                />
            </div>
        </PlaybookProvider>
    );


    // return (
    //     <div className={`playbook-page-container ${state.editMode ? 'edit-mode' : ''}`}>
    //         <PlaybookHeader
    //             playbook={state.playbook}
    //             editMode={state.editMode}
    //             error={state.error}
    //             saving={state.saving}
    //             onEdit={() => setState(prev => ({ ...prev, editMode: true }))}
    //             onSave={handleSave}
    //             onCancel={handleCancel}
    //         />

    //         <PlaybookContent
    //             formData={state.formData}
    //             editMode={state.editMode}
    //             updateFormData={updateFormData}
    //             addPhase={addPhase}
    //             validateAndUpdateProperty={validateAndUpdateProperty}
    //             removePhase={removePhase}
    //         />
    //     </div>
    // );
};

export default PlaybookPage;