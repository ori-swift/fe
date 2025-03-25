import AlertItem from "../AlertItem/AlertItem";

const PhaseAlerts = ({ phase, phaseIdx, editMode, updateFormData, addAlertTime }) => {
    const updateAlertTime = (oldTime, newTime) => {
        updateFormData(currentFormData => {
            const updated = { ...currentFormData };
            const phase = updated.config.phases[phaseIdx];
            
            if (oldTime !== newTime && !phase.alerts[newTime]) {
                const methods = phase.alerts[oldTime];
                phase.alerts[newTime] = [...methods];
                delete phase.alerts[oldTime];
            }
            
            return updated;
        });
    };

    return (
        <div className="playbook-page-phase-alerts">
            <h4 className="playbook-page-alerts-title">זמני התראות</h4>
            <div className="playbook-page-alerts-container">
                {Object.entries(phase.alerts)
                    .sort(([timeA], [timeB]) => timeA.localeCompare(timeB))
                    .map(([time, methods], timeIdx) => (
                        <AlertItem 
                            key={timeIdx}
                            time={time}
                            methods={methods}
                            phaseIdx={phaseIdx}
                            editMode={editMode}
                            updateAlertTime={(newTime) => updateAlertTime(time, newTime)}
                            updateFormData={updateFormData}
                        />
                    ))}

                {editMode && (
                    <button
                        className="playbook-page-add-alert-btn"
                        onClick={addAlertTime}
                        disabled={Object.keys(phase.alerts).some(time => time >= "23:00")}
                    >
                        <span className="playbook-page-add-icon">+</span> הוסף זמן התראה
                    </button>
                )}
            </div>
        </div>
    );
};

export default PhaseAlerts