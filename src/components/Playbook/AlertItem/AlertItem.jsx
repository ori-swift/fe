import MethodsList from "../MethodsList/MethodsList";
import TimeSelector from "../TimeSelector/TimeSelector";

const AlertItem = ({ time, methods, phaseIdx, editMode, updateAlertTime, updateFormData }) => {
    const handleMethod = (method, isAdding) => {
        updateFormData(currentFormData => {
            const updated = { ...currentFormData };
            const phase = updated.config.phases[phaseIdx];
            
            if (isAdding) {
                if (!phase.alerts[time].includes(method)) {
                    phase.alerts[time] = [...phase.alerts[time], method];
                }
            } else {
                phase.alerts[time] = phase.alerts[time].filter(m => m !== method);
            }
            
            return updated;
        });
    };

    return (
        <div className="playbook-page-alert-item">
            {editMode ? (
                <TimeSelector 
                    time={time} 
                    onChange={updateAlertTime} 
                />
            ) : (
                <div className="playbook-page-alert-time">{time}</div>
            )}

            <MethodsList 
                methods={methods}
                phaseIdx={phaseIdx}
                time={time}
                editMode={editMode}
                handleMethod={handleMethod}
            />
        </div>
    );
};

export default AlertItem