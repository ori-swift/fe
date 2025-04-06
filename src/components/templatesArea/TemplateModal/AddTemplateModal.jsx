import React, { useContext, useState } from 'react';
import { Modal, Button, Table, Form } from 'react-bootstrap';
import './TemplateModal.css';
import { addTemplate } from '../../../api/alerts_api';
import { AppContext } from '../../../App';
import ClientSelector from '../ClientSelector/ClientSelector'; // Adjust path as needed
import SmartTemplateEditor from '../SmartTemplateEditor/SmartTemplateEditor';

const AddTemplateModal = ({ show, onHide }) => {
    const [newTemplate, setNewTemplate] = useState({
        alert_method: 'email',
        is_aggregate: false,
        doc_type: 'proforma',
        phase_number: null,
        client_id: null,
        document_id: null,
        template_content: '',
        is_system: false
    });
    const [isSaving, setIsSaving] = useState(false);
    const { refetchUserDate, selectedCompany } = useContext(AppContext);

    const handleInputChange = (field, value) => {
        setNewTemplate(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await addTemplate({ ...newTemplate, company: selectedCompany.id });
            await refetchUserDate(); // Make sure this completes before closing the modal
            onHide(); // Only close the modal after fetching completes
        } catch (error) {
            console.error("שגיאה בשמירת התבנית החדשה:", error);
            alert("אירעה שגיאה בשמירת התבנית");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            aria-labelledby="add-alert-template-modal"
            centered
            backdrop="static"
            className="template-modal-container"
        >
            <Modal.Header closeButton className="template-modal-header">
                <Modal.Title id="add-alert-template-modal">
                    הוספת תבנית התראה חדשה
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="template-modal-body">
                <div className="template-modal-details">
                    <Table striped bordered hover responsive className="template-modal-table">
                        <tbody>
                            <tr>
                                <td className="template-modal-label">סוג התראה</td>
                                <td>
                                    <Form.Select
                                        value={newTemplate.alert_method}
                                        onChange={(e) => handleInputChange('alert_method', e.target.value)}
                                        className="template-modal-input"
                                        style={{ textAlign: 'left' }}
                                    >
                                        <option value="sms">SMS</option>
                                        <option value="email">Email</option>
                                        <option value="whatsapp">WhatsApp</option>
                                    </Form.Select>
                                </td>
                            </tr>
                            <tr>
                                <td className="template-modal-label">עבור קבוצת מסמכים</td>
                                <td>
                                    <Form.Check
                                        type="checkbox"
                                        checked={newTemplate.is_aggregate}
                                        onChange={(e) => handleInputChange('is_aggregate', e.target.checked)}
                                        className="template-modal-checkbox"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="template-modal-label">סוג מסמך</td>
                                <td>
                                    <Form.Select
                                        value={newTemplate.doc_type}
                                        onChange={(e) => handleInputChange('doc_type', e.target.value)}
                                        className="template-modal-input"
                                    >
                                        <option value="tax_invoice">חשבונית מס</option>
                                        <option value="proforma">דרישת תשלום</option>
                                    </Form.Select>
                                </td>
                            </tr>
                            <tr>
                                <td className="template-modal-label">מספר שלב</td>
                                <td>
                                    <Form.Control
                                        type="number"
                                        value={newTemplate.phase_number !== null ? newTemplate.phase_number : ''}
                                        onChange={(e) => handleInputChange('phase_number', e.target.value === '' ? null : parseInt(e.target.value))}
                                        className="template-modal-input"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="template-modal-label">מזהה לקוח</td>
                                <td>
                                    <ClientSelector
                                        value={newTemplate.client_id}
                                        onChange={(value) => handleInputChange('client_id', value === '' ? null : value)}
                                        className="template-modal-input"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="template-modal-label">מזהה מסמך</td>
                                <td>
                                    <Form.Control
                                        type="text"
                                        value={newTemplate.document_id !== null ? newTemplate.document_id : ''}
                                        onChange={(e) => handleInputChange('document_id', e.target.value === '' ? null : e.target.value)}
                                        className="template-modal-input"
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </Table>

                    <div className="template-modal-content-section">
                        <h5>תוכן התבנית</h5>
                        <div className="template-modal-content-container">
                            <SmartTemplateEditor
                                value={newTemplate.template_content}
                                onChange={(value) => handleInputChange('template_content', value)}
                            />
                        </div>
                        <div>
                            שים לב, הנתונים הנ"ל הינם דיפולטיביים, ועשויים להשתנות במידה והגדרת תבנית ההתראה ספציפית יותר
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className="template-modal-footer">
                <Button
                    variant="success"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="template-modal-save-btn"
                >
                    {isSaving ? 'שומר...' : 'שמור תבנית'}
                </Button>
                <Button
                    variant="outline-secondary"
                    onClick={onHide}
                    className="template-modal-cancel-btn"
                >
                    בטל
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AddTemplateModal;
