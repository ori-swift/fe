import "./ConfirmationDialog.css";

const ConfirmationDialog = ({ message, onConfirm, onCancel, yesMsg, noMsg }) => {
    return (
        <div className="playbook-page-confirmation-overlay">
            <div className="playbook-page-confirmation-dialog">
                <h3 className="playbook-page-confirmation-title">אישור פעולה</h3>
                <p className="playbook-page-confirmation-message">{message}</p>
                <div className="playbook-page-confirmation-actions">
                    <button className="playbook-page-confirm-btn" onClick={onConfirm}>
                        {yesMsg ? yesMsg : אישור}
                    </button>
                    <button className="playbook-page-cancel-btn" onClick={onCancel}>
                        {noMsg ? noMsg : ביטול}

                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationDialog