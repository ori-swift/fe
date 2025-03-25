import { useState } from "react";
import MethodDropdown from "../MethodDropdown/MethodDropdown";

const MethodsList = ({ methods, phaseIdx, time, editMode, handleMethod }) => {
    const [activeDropdown, setActiveDropdown] = useState(false);
    const methodOptions = {
        email: "אימייל",
        sms: "SMS",
        whatsapp: "וואטסאפ"
    };

    if (editMode) {
        return (
            <div className="playbook-page-method-selector">
                <div className="playbook-page-method-chips">
                    {methods.map((method, idx) => (
                        <div key={idx} className="playbook-page-method-chip">
                            <span className="playbook-page-method-name">{methodOptions[method] || method}</span>
                            <button
                                className="playbook-page-method-remove"
                                onClick={() => handleMethod(method, false)}
                                aria-label="הסר שיטת התראה"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>

                {methods.length < Object.keys(methodOptions).length && (
                    <MethodDropdown 
                        methods={methods}
                        methodOptions={methodOptions}
                        onSelect={(method) => handleMethod(method, true)}
                        isOpen={activeDropdown}
                        toggle={() => setActiveDropdown(!activeDropdown)}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="playbook-page-methods-list">
            {methods.map((method, idx) => (
                <span key={idx} className="playbook-page-method-badge">
                    {methodOptions[method] || method}
                </span>
            ))}
        </div>
    );
};

export default MethodsList