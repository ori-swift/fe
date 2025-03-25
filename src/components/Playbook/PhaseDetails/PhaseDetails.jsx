const PhaseDetails = ({ phase, phaseIdx, editMode, updatePhaseProperty }) => {
    return (
        <div className="playbook-page-phase-details">
            <div className="playbook-page-phase-property">
                <label className="playbook-page-property-label">יום התחלה:</label>
                {editMode ? (
                    <input
                        type="number"
                        className="playbook-page-property-input"
                        value={phase.start_day}
                        onChange={(e) => updatePhaseProperty("start_day", e.target.value)}
                        onBlur={(e) => updatePhaseProperty("start_day", e.target.value)}
                        min="0"
                        aria-label="יום התחלה"
                    />
                ) : (
                    <span className="playbook-page-property-value">{phase.start_day}</span>
                )}
            </div>

            <div className="playbook-page-phase-property">
                <label className="playbook-page-property-label">חזרות:</label>
                {editMode ? (
                    <select
                        className="playbook-page-property-select"
                        value={phase.repeat_interval === null ? "null" : phase.repeat_interval}
                        onChange={(e) => updatePhaseProperty("repeat_interval", e.target.value)}
                        aria-label="מרווח חזרה"
                    >
                        <option value="null">חד פעמי</option>
                        {[1, 2, 3, 5, 7, 14, 30].map(val => (
                            <option key={val} value={val}>
                                כל {val} {val === 1 ? 'יום' : 'ימים'}
                            </option>
                        ))}
                    </select>
                ) : (
                    <span className="playbook-page-property-value">
                        {phase.repeat_interval === null
                            ? "חד פעמי"
                            : `כל ${phase.repeat_interval} ${phase.repeat_interval === 1 ? 'יום' : 'ימים'}`}
                    </span>
                )}
            </div>
        </div>
    );
};

export default PhaseDetails