import PhaseAlerts from "../PhaseAlerts/PhaseAlerts";
import PhaseDetails from "../PhaseDetails/PhaseDetails";
import PhaseHeader from "../PhaseHeader/PhaseHeader";

const PhaseCard = ({ phase, phaseIdx, editMode, updatePhaseProperty, removePhase, updateFormData, newMode }) => {
    const addAlertTime = () => {
        updateFormData(currentFormData => {
            const updated = { ...currentFormData };
            const phase = updated.config.phases[phaseIdx];
            
            const times = Object.keys(phase.alerts).sort();
            let newTime = "09:00";
            
            if (times.length > 0) {
                const lastTime = times[times.length - 1];
                const [hours, minutes] = lastTime.split(':').map(Number);
                
                if (hours < 23) {
                    newTime = `${String(hours + 1).padStart(2, '0')}:00`;
                } else {
                    // If we already have a 23:xx time, don't add more
                    return updated;
                }
            }
            
            if (!phase.alerts[newTime]) {
                phase.alerts[newTime] = ["email"];
            }
            
            return updated;
        });
    };
    
    return (
        <div className="playbook-page-phase-card">
            <PhaseHeader 
                phaseIdx={phaseIdx} 
                editMode={editMode} 
                removePhase={removePhase} 
            />
            
            <PhaseDetails
                phase={phase}
                phaseIdx={phaseIdx}
                editMode={editMode}
                updatePhaseProperty={updatePhaseProperty}
            />
            
            <PhaseAlerts 
                phase={phase}
                phaseIdx={phaseIdx}
                editMode={editMode}
                updateFormData={updateFormData}
                addAlertTime={addAlertTime}
                newMode={newMode}
            />
        </div>
    );
};

export default PhaseCard