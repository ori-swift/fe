import React, { useContext, useState, useEffect } from 'react';
import { Modal, Button, Table, Form } from 'react-bootstrap';
import { useConfirmation } from "../../../utils/ConfirmationContext";
import './TemplateModal.css';
import { deleteTemplate, updateTemplate } from '../../../api/alerts_api';
import { AppContext } from '../../../App';
import ClientSelector from '../ClientSelector/ClientSelector';
import SmartTemplateEditor from '../SmartTemplateEditor/SmartTemplateEditor';

const TemplateModal = ({ show, onHide, template }) => {
  const [editMode, setEditMode] = useState(false);
  const [editedTemplate, setEditedTemplate] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { confirmAction } = useConfirmation();
  const { refetchUserDate, selectedCompany } = useContext(AppContext);

  // Initialize edited template when the modal is shown or template changes
  useEffect(() => {
    if (template) {
      setEditedTemplate({ ...template });
      setErrorMessage(''); // Reset error message when template changes
    }
  }, [template]);

  // Effect to handle document_id and doc_type relationship
  useEffect(() => {
    if (editedTemplate?.document_id) {
      // If document is selected, doc_type becomes null
      setEditedTemplate(prev => ({
        ...prev,
        doc_type: null
      }));
    }
  }, [editedTemplate?.document_id]);

  const handleEditClick = () => {
    setEditMode(true);
    setErrorMessage(''); // Reset error message when entering edit mode
  };

  const handleCancelEdit = (closeModal = false) => {
    setEditMode(false);
    setEditedTemplate({ ...template });
    setErrorMessage(''); // Reset error message when canceling
    if (closeModal) {
      onHide();
    }
  };

  const validate = () => {
    if (!editedTemplate.template_content || editedTemplate.template_content.trim() === '') {
      setErrorMessage('תוכן התבנית הינו שדה חובה');
      return false;
    }
    
    if (!editedTemplate.document_id && !editedTemplate.doc_type) {
      setErrorMessage('סוג מסמך הינו שדה חובה כאשר לא נבחר מסמך ספציפי');
      return false;
    }
    
    setErrorMessage('');
    return true;
  };

  const handleSaveEdit = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      const payload = { ...editedTemplate };

      // Process payload before sending to API
      if (payload.alert_method === 'any') {
        payload.alert_method = null;
      }

      // Only include doc_type if document_id is null
      if (payload.document_id !== null) {
        delete payload.doc_type;
      } else if (payload.doc_type === 'any') {
        payload.doc_type = null;
      }

      await updateTemplate(template.id, payload);
      await refetchUserDate(); // Make sure this completes before continuing
      setEditMode(false);
      onHide();
    } catch (error) {
      let errMsg = 'אירעה שגיאה בשמירת התבנית';
      if (error.response?.data) {
        errMsg = JSON.stringify(error.response?.data);
        if (errMsg.includes("An identical alert template already exists"))
          errMsg = "כבר ישנה תבנית קיימת עם הגדרות אלו";
      }
      setErrorMessage(errMsg);
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
          await refetchUserDate(); // Make sure this completes before continuing
          handleCancelEdit(true);
        } catch (error) {
          console.error("שגיאה במחיקת התבנית:", error);
          setErrorMessage("אירעה שגיאה במחיקת התבנית");
        }
      },
      {
        yesMsg: "כן, מחק",
        noMsg: "חזור"
      }
    );
  };

  const handleInputChange = (field, value) => {
    setEditedTemplate(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user makes changes
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  // Add a dropdown for alert method selection
  const renderAlertMethodDropdown = () => {
    return (
      <Form.Select
        value={editedTemplate.alert_method || 'any'}
        onChange={(e) => handleInputChange('alert_method', e.target.value)}
        className="template-modal-input"
        style={{ textAlign: 'left' }}
      >
        <option value="any">כל הסוגים</option>
        <option value="sms">SMS</option>
        <option value="email">Email</option>
        <option value="whatsapp">WhatsApp</option>
      </Form.Select>
    );
  };

  // Add a dropdown for document type selection
  const renderDocTypeDropdown = () => {
    return (
      <Form.Select
        value={editedTemplate.doc_type || 'any'}
        onChange={(e) => handleInputChange('doc_type', e.target.value)}
        className="template-modal-input"
        style={{ textAlign: 'left' }}
        disabled={editedTemplate.document_id !== null}
      >
        <option value="any">כל הסוגים</option>
        <option value="tax_invoice">חשבונית מס</option>
        <option value="proforma">דרישת תשלום</option>
      </Form.Select>
    );
  };

  if (!template || !editedTemplate) return null;

  return (
    <Modal
      show={show}
      onHide={() => { handleCancelEdit(true) }}
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
                <td className="template-modal-label">סוג התראה</td>
                <td>
                  {editMode && !template.is_system ? (
                    renderAlertMethodDropdown()
                  ) : (
                    editedTemplate.alert_method || 'כל הסוגים'
                  )}
                </td>
              </tr>

              <tr>
                <td className="template-modal-label">סוג מסמך</td>
                <td>
                  {editMode && !template.is_system ? (
                    renderDocTypeDropdown()
                  ) : (
                    <div>
                      {editedTemplate.document_id !== null ? (
                        <span className="text-muted">לא רלוונטי (נבחר מסמך ספציפי)</span>
                      ) : editedTemplate.doc_type === "proforma" ? (
                        "דרישת תשלום"
                      ) : editedTemplate.doc_type === "tax_invoice" ? (
                        "חשבונית מס"
                      ) : (
                        "כל הסוגים"
                      )}
                    </div>
                  )}
                  {editMode && editedTemplate.document_id !== null && (
                    <div className="text-muted mt-1" style={{ fontSize: '0.8rem' }}>
                      סוג מסמך לא רלוונטי כאשר נבחר מסמך ספציפי
                    </div>
                  )}
                </td>
              </tr>

              <tr>
                <td className="template-modal-label">מזהה לקוח</td>
                <td>
                  {editMode && !template.is_system ? (
                    <ClientSelector
                      value={editedTemplate.client_id}
                      onChange={(value) => handleInputChange('client_id', value === '' ? null : value)}
                      className="template-modal-input"
                    />
                  ) : (
                    editedTemplate.client_id !== null ? editedTemplate.client_id : 'לא מוגדר'
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
                    editedTemplate.document_id !== null ? editedTemplate.document_id : 'לא מוגדר'
                  )}
                </td>
              </tr>
            </tbody>
          </Table>

          <div className="template-modal-content-section">
            <h5>תוכן התבנית</h5>
            <div className="template-modal-content-container">
              {editMode && !template.is_system ? (
                <SmartTemplateEditor
                  value={editedTemplate.template_content}
                  onChange={(value) => handleInputChange('template_content', value)}
                />
              ) : (
                <SmartTemplateEditor
                  value={template.template_content}
                  readOnly={true}
                />
              )}
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="template-modal-footer">
        {errorMessage && (
          <div className="template-modal-error-msg">
            {errorMessage}
          </div>
        )}
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
              onClick={() => { handleCancelEdit(true) }}
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