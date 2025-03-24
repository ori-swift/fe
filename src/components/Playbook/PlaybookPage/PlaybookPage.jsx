import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPlaybook, isPlaybookConfigValid, updatePlaybook } from "../../../api/playbook_api";
import "./PlaybookPage.css";

const PlaybookPage = () => {
    const { id } = useParams();
    const [playbook, setPlaybook] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState("");

    // Available notification methods
    const availableMethods = ["email", "sms", "whatsapp"];

    useEffect(() => {
        fetchPlaybook();
    }, [id]);

    const fetchPlaybook = async () => {
        setLoading(true);
        try {
            const data = await getPlaybook(id);
            setPlaybook(data);
            setFormData({
                only_business_days: data.only_business_days,
                config: JSON.parse(JSON.stringify(data.config)),
                document_id: data.document ? data.document.id : null,
                client_id: data.client ? data.client.id : null,
                company_id: data.company ? data.company.id : null,
            });
        } catch (error) {
            setError("Failed to load playbook");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setError("");
        const validationResult = isPlaybookConfigValid(formData.config);

        if (!validationResult.valid) {
            setError(validationResult.error);
            return;
        }

        setSaving(true);
        try {
            await updatePlaybook(id, formData);
            await fetchPlaybook();
            setEditMode(false);
        } catch (error) {
            setError("Failed to save playbook");
        } finally {
            setSaving(false);
        }
    };

    const confirmDialog = (action, message) => {
        setConfirmAction(() => action);
        setConfirmMessage(message);
        setShowConfirmation(true);
    };

    const executeConfirmedAction = () => {
        if (confirmAction) {
            confirmAction();
        }
        setShowConfirmation(false);
    };

    const handleCancel = () => {
        if (editMode) {
            confirmDialog(
                () => {
                    setFormData({
                        only_business_days: playbook.only_business_days,
                        config: JSON.parse(JSON.stringify(playbook.config)),
                        document_id: playbook.document ? playbook.document.id : null,
                        client_id: playbook.client ? playbook.client.id : null,
                        company_id: playbook.company ? playbook.company.id : null,
                    });
                    setEditMode(false);
                    setError("");
                },
                "Are you sure you want to discard your changes?"
            );
        }
    };

    // Method handlers
    const addMethod = (phaseIdx, time, method) => {
        if (!editMode) return;

        const updated = { ...formData };
        const currentMethods = updated.config.phases[phaseIdx].alerts[time] || [];

        // Only add if not already present
        if (!currentMethods.includes(method)) {
            updated.config.phases[phaseIdx].alerts[time] = [...currentMethods, method];
            setFormData(updated);
        }
    };

    const removeMethod = (phaseIdx, time, method) => {
        if (!editMode) return;

        const updated = { ...formData };
        const currentMethods = updated.config.phases[phaseIdx].alerts[time] || [];

        // Remove the method
        updated.config.phases[phaseIdx].alerts[time] = currentMethods.filter(m => m !== method);

        // If no methods left for this time, remove the time
        if (updated.config.phases[phaseIdx].alerts[time].length === 0) {
            delete updated.config.phases[phaseIdx].alerts[time];

            // If no alerts left for this phase and it's not the first phase, confirm removal
            if (Object.keys(updated.config.phases[phaseIdx].alerts).length === 0 && phaseIdx !== 0) {
                confirmDialog(
                    () => {
                        updated.config.phases.splice(phaseIdx, 1);
                        setFormData(updated);
                    },
                    "No alerts left in this phase. Remove the phase?"
                );
                return;
            }
        }

        setFormData(updated);
    };

    // Phase handlers
    const addPhase = () => {
        if (!editMode) return;

        const updated = { ...formData };
        const lastPhase = updated.config.phases[updated.config.phases.length - 1];
        const newStartDay = lastPhase.start_day + (lastPhase.repeat_interval || 1);

        updated.config.phases.push({
            start_day: newStartDay,
            repeat_interval: null,
            alerts: {
                "09:00": ["email"]
            }
        });

        setFormData(updated);
    };

    const removePhase = (phaseIdx) => {
        if (!editMode || phaseIdx === 0) return;

        confirmDialog(
            () => {
                const updated = { ...formData };
                updated.config.phases.splice(phaseIdx, 1);
                setFormData(updated);
            },
            "Are you sure you want to remove this phase?"
        );
    };

    // Alert handlers
    const addAlertTime = (phaseIdx) => {
        if (!editMode) return;

        const phase = formData.config.phases[phaseIdx];
        let hour = 9;
        const minutes = ['00', '15', '30', '45'];
        let minuteIndex = 0;
        let timeStr = `${hour.toString().padStart(2, '0')}:${minutes[minuteIndex]}`;

        while (phase.alerts[timeStr]) {
            minuteIndex++;
            if (minuteIndex >= minutes.length) {
                minuteIndex = 0;
                hour = (hour + 1) % 24;
            }
            timeStr = `${hour.toString().padStart(2, '0')}:${minutes[minuteIndex]}`;
        }

        const updated = { ...formData };
        updated.config.phases[phaseIdx].alerts[timeStr] = ["email"];
        setFormData(updated);
    };

    const updateAlertTime = (phaseIdx, oldTime, newTime) => {
        if (!editMode) return;

        const updated = { ...formData };
        const methods = updated.config.phases[phaseIdx].alerts[oldTime];

        if (updated.config.phases[phaseIdx].alerts[newTime]) {
            setError(`Time ${newTime} already exists in this phase`);
            return;
        }

        updated.config.phases[phaseIdx].alerts[newTime] = [...methods];
        delete updated.config.phases[phaseIdx].alerts[oldTime];

        setFormData(updated);
        setError("");
    };

    const updatePhaseProperty = (phaseIdx, property, value) => {
        if (!editMode) return;

        const updated = { ...formData };

        if (property === "start_day") {
            value = parseInt(value, 10);
            if (isNaN(value) || value < 0) {
                setError("Start day must be a positive number");
                return;
            }

            // Check if this would violate phase order
            if (phaseIdx > 0 && value <= updated.config.phases[phaseIdx - 1].start_day) {
                setError(`Start day must be after previous phase (>${updated.config.phases[phaseIdx - 1].start_day})`);
                return;
            }

            if (phaseIdx < updated.config.phases.length - 1 && value >= updated.config.phases[phaseIdx + 1].start_day) {
                setError(`Start day must be before next phase (<${updated.config.phases[phaseIdx + 1].start_day})`);
                return;
            }
        }

        if (property === "repeat_interval") {
            if (value === "" || value === "null") {
                value = null;
            } else {
                value = parseInt(value, 10);
                if (isNaN(value) || value < 1) {
                    setError("Repeat interval must be a positive number");
                    return;
                }
            }
        }

        updated.config.phases[phaseIdx][property] = value;
        setFormData(updated);
        setError("");
    };

    // Rendering methods
    const renderMethodsList = (phaseIdx, time, methods) => {
        if (editMode) {
            return (
                <div className="playbook-method-selector">
                    {methods.map((method, idx) => (
                        <div key={idx} className="playbook-method-chip">
                            <span className="playbook-method-name">{method}</span>
                            <button
                                className="playbook-method-remove"
                                onClick={() => removeMethod(phaseIdx, time, method)}
                            >
                                ×
                            </button>
                        </div>
                    ))}

                    <div className="playbook-method-dropdown">
                        <button className="playbook-add-method-btn">+ הוסף סוג התראה</button>
                        <div className="playbook-method-dropdown-content">
                            {availableMethods
                                .filter(method => !methods.includes(method))
                                .map((method, idx) => (
                                    <div
                                        key={idx}
                                        className="playbook-method-option"
                                        onClick={() => addMethod(phaseIdx, time, method)}
                                    >
                                        {method}
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="playbook-methods-list">
                    {methods.map((method, idx) => (
                        <span key={idx} className="playbook-method-badge">{method}</span>
                    ))}
                </div>
            );
        }
    };

    const renderAlerts = (phase, phaseIdx) => {
        return (
            <div className="playbook-alerts-container">
                {Object.entries(phase.alerts).map(([time, methods], timeIdx) => (
                    <div key={timeIdx} className="playbook-alert-item">
                        {editMode ? (
                            <div className="playbook-time-selectors">
                                <select
                                    className="playbook-hour-select"
                                    value={time.split(':')[0]}
                                    onChange={(e) => {
                                        const newHour = e.target.value.padStart(2, '0');
                                        const newTime = `${newHour}:${time.split(':')[1]}`;
                                        updateAlertTime(phaseIdx, time, newTime);
                                    }}
                                >
                                    {Array.from({ length: 24 }, (_, i) => (
                                        <option key={i} value={i.toString().padStart(2, '0')}>
                                            {i.toString().padStart(2, '0')}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    className="playbook-minute-select"
                                    value={time.split(':')[1]}
                                    onChange={(e) => {
                                        const newMinute = e.target.value;
                                        const newTime = `${time.split(':')[0]}:${newMinute}`;
                                        updateAlertTime(phaseIdx, time, newTime);
                                    }}
                                >
                                    {['00', '15', '30', '45'].map((min) => (
                                        <option key={min} value={min}>
                                            {min}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="playbook-alert-time">{time}</div>
                        )}

                        {renderMethodsList(phaseIdx, time, methods)}
                    </div>
                ))}

                {editMode && (
                    <button
                        className="playbook-add-alert-btn"
                        onClick={() => addAlertTime(phaseIdx)}
                    >
                        + הוסף התראה
                    </button>
                )}
            </div>
        );
    };

    const renderPhases = () => {
        if (!formData || !formData.config || !formData.config.phases) return null;

        return formData.config.phases.map((phase, idx) => (
            <div key={idx} className="playbook-phase-card">
                <div className="playbook-phase-header">
                    <h3 className="playbook-phase-title">Phase {idx + 1}</h3>
                    {editMode && idx > 0 && (
                        <button
                            className="playbook-remove-phase-btn"
                            onClick={() => removePhase(idx)}
                        >
                            מחק פאזה
                        </button>
                    )}
                </div>

                <div className="playbook-phase-details">
                    <div className="playbook-phase-property">
                        <label className="playbook-property-label">Start Day:</label>
                        {editMode ? (
                            <input
                                type="number"
                                className="playbook-property-input"
                                value={phase.start_day}
                                onChange={(e) => updatePhaseProperty(idx, "start_day", e.target.value)}
                                min="0"
                            />
                        ) : (
                            <span className="playbook-property-value">{phase.start_day}</span>
                        )}
                    </div>

                    <div className="playbook-phase-property">
                        <label className="playbook-property-label">Repeat Interval:</label>
                        {editMode ? (
                            <select
                                className="playbook-property-select"
                                value={phase.repeat_interval === null ? "null" : phase.repeat_interval}
                                onChange={(e) => updatePhaseProperty(idx, "repeat_interval", e.target.value)}
                            >
                                <option value="null">One time only</option>
                                {[1, 2, 3, 5, 7, 14, 30].map(val => (
                                    <option key={val} value={val}>Every {val} day{val > 1 ? 's' : ''}</option>
                                ))}
                            </select>
                        ) : (
                            <span className="playbook-property-value">
                                {phase.repeat_interval === null
                                    ? "One time only"
                                    : `Every ${phase.repeat_interval} day${phase.repeat_interval > 1 ? 's' : ''}`}
                            </span>
                        )}
                    </div>
                </div>

                <div className="playbook-phase-alerts">
                    <h4 className="playbook-alerts-title">Alerts</h4>
                    {renderAlerts(phase, idx)}
                </div>
            </div>
        ));
    };

    // Render confirmation dialog
    const renderConfirmationDialog = () => {
        if (!showConfirmation) return null;

        return (
            <div className="playbook-confirmation-overlay">
                <div className="playbook-confirmation-dialog">
                    <h3 className="playbook-confirmation-title">Confirm Action</h3>
                    <p className="playbook-confirmation-message">{confirmMessage}</p>
                    <div className="playbook-confirmation-actions">
                        <button
                            className="playbook-confirm-btn"
                            onClick={executeConfirmedAction}
                        >
                            Confirm
                        </button>
                        <button
                            className="playbook-cancel-btn"
                            onClick={() => setShowConfirmation(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="playbook-loading-container">
                <div className="playbook-spinner"></div>
                <span>Loading playbook...</span>
            </div>
        );
    }

    if (!playbook || !formData) {
        return <div className="playbook-error-message">Failed to load playbook data</div>;
    }

    const target = playbook.document
        ? `Document: ${playbook.document.provider_doc_id}`
        : playbook.client
            ? `Client: ${playbook.client.name}`
            : `Company: ${playbook.company.name}`;

    return (
        <div className="playbook-container">
            <div className="playbook-playbook-header">
                <h2 className="playbook-playbook-title">  {target}  פלייבוק עבור </h2>
                {!editMode ? (
                    <button
                        className="playbook-edit-btn"
                        onClick={() => setEditMode(true)}
                    >
                        ערוך חוקיות התראות
                    </button>
                ) : (
                    <div className="playbook-editing-actions">
                        <button
                            className="playbook-save-btn"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? <><div className="playbook-spinner"></div>מעדכן...</> : 'שמור שינויים'}
                        </button>
                        <button
                            className="playbook-cancel-btn"
                            onClick={handleCancel}
                            disabled={saving}
                        >
                            הפסק עריכה
                        </button>
                    </div>
                )}
            </div>

            {error && <div className="playbook-error-message">{error}</div>}

            <div className="playbook-playbook-option">
                <label className="playbook-option-label">
                    התראות רק בימי עסקים:
                    {editMode ? (
                        <input
                            type="checkbox"
                            className="playbook-business-days-checkbox"
                            checked={formData.only_business_days}
                            onChange={(e) => setFormData({
                                ...formData,
                                only_business_days: e.target.checked,
                            })}
                        />
                    ) : (
                        <span className="playbook-option-value">{playbook.only_business_days ? "Yes" : "No"}</span>
                    )}
                </label>
            </div>

            <div className="playbook-phases-section">
                <div className="playbook-section-header">
                    <h3 className="playbook-section-title">הגדרת פלייבוק</h3>
                    {editMode && (
                        <button
                            className="playbook-add-phase-btn"
                            onClick={addPhase}
                        >
                            + הוסף פאזת התראות
                        </button>
                    )}
                </div>

                <div className="playbook-phases-container">
                    {renderPhases()}
                </div>
            </div>

            {renderConfirmationDialog()}
        </div>
    );
};

export default PlaybookPage;
