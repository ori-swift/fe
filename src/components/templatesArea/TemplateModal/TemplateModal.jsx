import React, { useContext, useState } from 'react';
import { Modal, Button, Table, Form } from 'react-bootstrap';
import { useConfirmation } from "../../../utils/ConfirmationContext";
import './TemplateModal.css';
import { updateTemplate } from '../../../api/alerts_api';
import { checkToken } from '../../../api/auth_api';
import { AppContext } from '../../../App';

const TemplateModal = ({ show, onHide, template, updateAlertTemplate, deleteTemplate }) => {
  const [editMode, setEditMode] = useState(false);
  const [editedTemplate, setEditedTemplate] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const { confirmAction } = useConfirmation();

  const {refetchUserDate} = useContext(AppContext)
  // Initialize edited template when the modal is shown or template changes
  React.useEffect(() => {
    if (template) {
      setEditedTemplate({ ...template });
    }
  }, [template]);

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleCancelEdit = (closeModal=false) => {
    setEditMode(false);    
    setEditedTemplate({ ...template });
    if (closeModal){
      onHide()
    }
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      await updateTemplate(template.id, editedTemplate);      
      refetchUserDate();
      setEditMode(false);      
    } catch (error) {
      console.error("שגיאה בשמירת התבנית:", error);
      alert("אירעה שגיאה בשמירת התבנית");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = () => {
    confirmAction(
      "האם אתה בטוח שברצונך למחוק את תבנית ההתראה? פעולה זו אינה ניתנת לביטול.",
      async () => {
        try {
          await deleteTemplate(template.id);
          refetchUserDate();
          handleCancelEdit(true);
        } catch (error) {
          console.error("שגיאה במחיקת התבנית:", error);
          alert("אירעה שגיאה במחיקת התבנית");
        }
      }
    );
  };

  const handleInputChange = (field, value) => {
    setEditedTemplate(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!template || !editedTemplate) return null;

  return (
    <Modal
      show={show}
      onHide={()=>{handleCancelEdit(true)}}
      size="lg"
      aria-labelledby="alert-template-modal"
      centered
      backdrop="static"
      className="template-modal-container"
    >
      <Modal.Header closeButton className="template-modal-header">
        <Modal.Title id="alert-template-modal">
          פרטי תבנית התראה
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="template-modal-body">
        <div className="template-modal-details">
          <Table striped bordered hover responsive className="template-modal-table">
            <tbody>              
              <tr>
                <td className="template-modal-label">הוגדר על ידי</td>
                <td>{template.is_system ? "המערכת" : "החברה"}</td>
              </tr>
              <tr>
                <td className="template-modal-label">סוג התראה</td>
                <td>
                  {editMode && !template.is_system ? (
                    <Form.Select
                      value={editedTemplate.alert_method}
                      onChange={(e) => handleInputChange('alert_method', e.target.value)}
                      className="template-modal-input"
                      style={{textAlign: 'left'}}
                    >
                      <option value="sms">SMS</option>
                      <option value="email">Email</option>
                      <option value="whatsapp">WhatsApp</option>
                    </Form.Select>
                  ) : (
                    template.alert_method
                  )}
                </td>
              </tr>
              <tr>
                <td className="template-modal-label">עבור קבוצת מסמכים</td>
                <td>
                  {editMode && !template.is_system ? (
                    <Form.Check
                      type="checkbox"
                      checked={editedTemplate.is_aggregate}
                      onChange={(e) => handleInputChange('is_aggregate', e.target.checked)}
                      className="template-modal-checkbox"
                    />
                  ) : (
                    template.is_aggregate ? 'כן' : 'לא'
                  )}
                </td>
              </tr>
              <tr>
                <td className="template-modal-label">סוג מסמך</td>
                <td>
                  {editMode && !template.is_system ? (
                    <Form.Control
                      type="text"
                      value={editedTemplate.doc_type}
                      onChange={(e) => handleInputChange('doc_type', e.target.value)}
                      className="template-modal-input"
                    />
                  ) : (
                    <div>
                      {(template.doc_type === "proforma") ? "דרישת תשלום": "חשבונית מס"}
                    </div>
                  )}
                </td>
              </tr>
              <tr>
                <td className="template-modal-label">מספר שלב</td>
                <td>
                  {editMode && !template.is_system ? (
                    <Form.Control
                      type="number"
                      value={editedTemplate.phase_number !== null ? editedTemplate.phase_number : ''}
                      onChange={(e) => handleInputChange('phase_number', e.target.value === '' ? null : parseInt(e.target.value))}
                      className="template-modal-input"
                    />
                  ) : (
                    template.phase_number !== null ? template.phase_number : 'לא מוגדר'
                  )}
                </td>
              </tr>
              <tr>
                <td className="template-modal-label">מזהה לקוח</td>
                <td>
                  {editMode && !template.is_system ? (
                    <Form.Control
                      type="text"
                      value={editedTemplate.client_id !== null ? editedTemplate.client_id : ''}
                      onChange={(e) => handleInputChange('client_id', e.target.value === '' ? null : e.target.value)}
                      className="template-modal-input"
                    />
                  ) : (
                    template.client_id !== null ? template.client_id : 'לא מוגדר'
                  )}
                </td>
              </tr>
              <tr>
                <td className="template-modal-label">מזהה מסמך</td>
                <td>
                  {editMode && !template.is_system ? (
                    <Form.Control
                      type="text"
                      value={editedTemplate.document_id !== null ? editedTemplate.document_id : ''}
                      onChange={(e) => handleInputChange('document_id', e.target.value === '' ? null : e.target.value)}
                      className="template-modal-input"
                    />
                  ) : (
                    template.document_id !== null ? template.document_id : 'לא מוגדר'
                  )}
                </td>
              </tr>
            </tbody>
          </Table>

          <div className="template-modal-content-section">
            <h5>תוכן התבנית</h5>
            <div className="template-modal-content-container">
              {editMode && !template.is_system ? (
                <Form.Control
                  as="textarea"
                  rows={6}
                  value={editedTemplate.template_content}
                  onChange={(e) => handleInputChange('template_content', e.target.value)}
                  className="template-modal-textarea"
                />
              ) : (
                <div className="template-modal-content-box">
                  {template.template_content}
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="template-modal-footer">
        {!editMode ? (
          <>
            {!template.is_system && (
              <>
                <Button 
                  variant="danger" 
                  onClick={handleDeleteClick}
                  className="template-modal-delete-btn"
                >
                  מחק תבנית
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleEditClick}
                  className="template-modal-edit-btn"
                >
                  ערוך תבנית
                </Button>
              </>
            )}
            <Button 
              variant="secondary" 
              onClick={()=>{handleCancelEdit(true)}}
              className="template-modal-close-btn"
            >
              סגור
            </Button>
          </>
        ) : (
          <>
            <Button 
              variant="success" 
              onClick={handleSaveEdit}
              disabled={isSaving}
              className="template-modal-save-btn"
            >
              {isSaving ? 'שומר...' : 'שמור שינויים'}
            </Button>
            <Button 
              variant="outline-secondary" 
              onClick={handleCancelEdit}
              className="template-modal-cancel-btn"
            >
              בטל
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default TemplateModal;