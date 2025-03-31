import React from "react";

const PlaybookTypeSelector = ({ playbooks, onSelect }) => {
    if (!playbooks || playbooks.length <= 1) return null;
    
    return (
        <div className="playbook-type-selector">
            <h2 className="playbook-type-title">בחר סוג פלייבוק</h2>
            <div className="playbook-type-options">
                {playbooks.map((playbook) => (
                    <button
                        key={playbook.id}
                        className="playbook-type-option"
                        onClick={() => onSelect(playbook)}
                    >
                        {playbook.doc_type === "tax_invoice" ? "חשבונית מס" : "חשבונית עסקה"}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PlaybookTypeSelector;