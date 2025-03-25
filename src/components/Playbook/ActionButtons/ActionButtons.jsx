const ActionButtons = ({ editMode, saving, playbook, onEdit, onSave, onCancel }) => {
    if (!editMode) {
        return (
            <div className="playbook-page-actions">
                {(playbook.document || playbook.client) && (
                    <button
                        className="playbook-page-remove-btn"
                        onClick={() => alert("הסרת פלייבוק אינה מיושמת עדיין")}
                    >
                        הסר פלייבוק
                    </button>
                )}
                <button
                    className="playbook-page-edit-btn"
                    onClick={onEdit}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                    </svg>
                    ערוך התראות
                </button>
            </div>
        );
    }

    // Create a fixed action button container for edit mode
    return (
        <div className="playbook-page-editing-actions-fixed">
            <button
                className="playbook-page-save-btn"
                onClick={onSave}
                disabled={saving}
            >
                {saving ? (
                    <>
                        <div className="playbook-page-spinner-small"></div>
                        שומר...
                    </>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                            <polyline points="17 21 17 13 7 13 7 21"></polyline>
                            <polyline points="7 3 7 8 15 8"></polyline>
                        </svg>
                        שמור שינויים
                    </>
                )}
            </button>
            <button
                className="playbook-page-cancel-btn"
                onClick={onCancel}
                disabled={saving}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                בטל
            </button>
        </div>
    );
};

export default ActionButtons