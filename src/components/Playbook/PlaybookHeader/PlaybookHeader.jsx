import ErrorMessage from "../../../utils/ErrorMessage";
import ActionButtons from "../ActionButtons/ActionButtons";
import TargetInfo from "../TargetInfo/TargetInfo";

const PlaybookHeader = ({ playbook, editMode, error, saving, onEdit, onSave, onCancel }) => {
    return (
        <div className="playbook-page-header">
            <div className="playbook-page-header-content">
                <div className="playbook-page-title-section">
                    <h1 className="playbook-page-title">{playbook.title}</h1>                                        
                </div>

                <ActionButtons
                    editMode={editMode}
                    saving={saving}
                    playbook={playbook}
                    onEdit={onEdit}
                    onSave={onSave}
                    onCancel={onCancel}
                />
            </div>

            {error && <ErrorMessage message={error} />}
        </div>
    );
};

export default PlaybookHeader