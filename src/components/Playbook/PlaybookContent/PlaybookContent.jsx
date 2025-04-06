import BusinessDaysSettings from "../BusinessDaysSettings/BusinessDaysSettings";
import PhaseCard from "../PhaseCard/PhaseCard";

const PlaybookContent = ({ formData, editMode, updateFormData, addPhase, validateAndUpdateProperty, removePhase, newMode }) => {
    return (
        <div className="playbook-page-content">
            <BusinessDaysSettings 
                formData={formData}
                editMode={editMode}
                updateFormData={updateFormData}
            />
            
            <div className="playbook-page-phases-section">
                <div className="playbook-page-section-header">
                    <h2 className="playbook-page-section-title">הגדרת התראות</h2>
                </div>
                
                <div className="playbook-page-phases-container">
                    {formData.config.phases.map((phase, idx) => (
                        <PhaseCard 
                            key={idx}
                            phase={phase}
                            phaseIdx={idx}
                            editMode={editMode}
                            updatePhaseProperty={(property, value, shouldValidate) => validateAndUpdateProperty(idx, property, value, shouldValidate)}
                            removePhase={() => removePhase(idx)}
                            updateFormData={updateFormData}
                            newMode={newMode}
                        />
                    ))}
                </div>
                
                {editMode && (
                    <button className="playbook-page-add-phase-btn" onClick={addPhase}>
                        <span className="playbook-page-add-icon">+</span> הוסף תקופה חדשה
                    </button>
                )}
            </div>
        </div>
    );
};

export default PlaybookContent