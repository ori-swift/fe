const PhaseHeader = ({ phaseIdx, editMode, removePhase }) => {
    return (
        <div className="playbook-page-phase-header">
            <div className="playbook-page-phase-title-container">
                <div className="playbook-page-phase-badge">{phaseIdx + 1}</div>
                <h3 className="playbook-page-phase-title">תקופת תזכורות {phaseIdx + 1}</h3>
            </div>
            {editMode && phaseIdx > 0 && (
                <button
                    className="playbook-page-remove-phase-btn"
                    onClick={removePhase}
                    aria-label="הסר תקופה"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    הסר תקופה
                </button>
            )}
        </div>
    );
};

export default PhaseHeader