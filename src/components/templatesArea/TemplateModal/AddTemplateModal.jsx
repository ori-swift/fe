import React, { useContext, useState } from 'react';
import { Modal, Button, Table, Form } from 'react-bootstrap';
import './TemplateModal.css';
import { addTemplate } from '../../../api/alerts_api';
import { AppContext } from '../../../App';
import SmartTemplateEditor from '../SmartTemplateEditor/SmartTemplateEditor';

const AddTemplateModal = ({ show, onHide }) => {
  const { selectedCompany, refetchUserDate } = useContext(AppContext);
  const [newTemplate, setNewTemplate] = useState({ name: '', subject: '', template_content: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (field, value) => {
    setNewTemplate(prev => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const validate = () => {
    if (!newTemplate.name.trim()) {
      setErrorMessage('שם התבנית הינו שדה חובה');
      return false;
    }
    if (!newTemplate.template_content.trim()) {
      setErrorMessage('תוכן התבנית הינו שדה חובה');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      await addTemplate({ ...newTemplate, company: selectedCompany.id });
      await refetchUserDate();
      onHide();
    } catch (error) {
      let errMsg = 'אירעה שגיאה בשמירת התבנית';
      if (error.response?.data) {
        errMsg = JSON.stringify(error.response.data);
      }
      setErrorMessage(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      backdrop="static"
      className="template-modal-container"
    >
      <Modal.Header closeButton>
        <Modal.Title>תבנית חדשה</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table>
          <tbody>
            <tr>
              <td>שם</td>
              <td>
                <Form.Control
                  value={newTemplate.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </td>
            </tr>
            <tr>
              <td>נושא (לאימייל)</td>
              <td>
                <Form.Control
                  value={newTemplate.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                />
              </td>
            </tr>
          </tbody>
        </Table>

        <div className="template-modal-content-section">
          <h5>תוכן</h5>
          <SmartTemplateEditor
            value={newTemplate.template_content}
            onChange={(val) => handleInputChange('template_content', val)}
          />
        </div>

        {errorMessage && <div className="text-danger mt-3">{errorMessage}</div>}
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="success"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'שומר...' : 'שמור תבנית'}
        </Button>
        <Button variant="outline-secondary" onClick={onHide}>
          ביטול
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddTemplateModal;
