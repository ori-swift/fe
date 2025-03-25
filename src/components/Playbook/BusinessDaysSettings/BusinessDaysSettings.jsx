const BusinessDaysSettings = ({ formData, editMode, updateFormData }) => {
    return (
        <div className="playbook-page-settings-section">
            <div className="playbook-page-business-days">
                <label className="playbook-page-option-label">
                    התראות רק בימי עסקים:
                </label>
                {editMode ? (
                    <label className="playbook-page-toggle">
                        <input
                            type="checkbox"
                            checked={formData.only_business_days}
                            onChange={(e) => updateFormData(current => ({
                                ...current,
                                only_business_days: e.target.checked,
                            }))}
                        />
                        <span className="playbook-page-toggle-slider"></span>
                    </label>
                ) : (
                    <span className="playbook-page-option-value">
                        {formData.only_business_days ? "כן" : "לא"}
                    </span>
                )}
            </div>
        </div>
    );
};

export default BusinessDaysSettings