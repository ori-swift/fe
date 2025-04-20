import React, { useContext, useState, useEffect } from 'react';
import { Modal, Button, Table, Form, Alert } from 'react-bootstrap';
import './TemplateModal.css';
import { addTemplate } from '../../../api/alerts_api';
import { AppContext } from '../../../App';
import ClientSelector from '../ClientSelector/ClientSelector';
import SmartTemplateEditor from '../SmartTemplateEditor/SmartTemplateEditor';

const SMS_CHARACTER_LIMIT = 198;

const AddTemplateModal = ({ show, onHide }) => {
    const [newTemplate, setNewTemplate] = useState({
        alert_method: '',        
        doc_type: '',        
        client_id: null,
        document_id: null,
        template_content: '',
        is_system: false
    });
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [characterCount, setCharacterCount] = useState(0);
    const { refetchUserDate, selectedCompany } = useContext(AppContext);

    useEffect(() => {
        // Update character count whenever template content changes
        setCharacterCount(newTemplate.template_content.length);
    }, [newTemplate.template_content]);
    
    // Effect to handle document_id and doc_type relationship
    useEffect(() => {
        if (newTemplate.document_id) {
            // If document is selected, doc_type becomes null
            setNewTemplate(prev => ({
                ...prev,
                doc_type: null
            }));
        }
    }, [newTemplate.document_id]);

    const handleInputChange = (field, value) => {
        setNewTemplate(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const validate = () => {
        if (!newTemplate.alert_method) {
            setErrorMessage('סוג התראה הינו שדה חובה');
            return false;
        }
        
        if (!newTemplate.document_id && !newTemplate.doc_type) {
            setErrorMessage('סוג מסמך הינו שדה חובה כאשר לא נבחר מסמך ספציפי');
            return false;
        }
        
        if (!newTemplate.template_content || newTemplate.template_content.trim() === '') {
            setErrorMessage('תוכן התבנית הינו שדה חובה');
            return false;
        }

        // Add SMS character limit validation
        if (newTemplate.alert_method === 'sms' && characterCount > SMS_CHARACTER_LIMIT) {
            setErrorMessage(`הודעת SMS מוגבלת ל-${SMS_CHARACTER_LIMIT} תווים. אנא קצר את התוכן`);
            return false;
        }

        setErrorMessage('');
        return true;
    };

    const handleSave = async () => {
        if (!validate()) return;

        setIsSaving(true);
        try {
            const payload = {
                ...newTemplate,
                company: selectedCompany.id
            };

            // Do not delete alert_method as it's now required
            
            // Only include doc_type if document_id is null
            if (payload.document_id !== null) {
                delete payload.doc_type;
            }

            await addTemplate(payload);
            await refetchUserDate();
            onHide();
        } catch (error) {
            let errMsg = 'אירעה שגיאה בשמירת התבנית';
            if (error.response?.data){
                errMsg = JSON.stringify(error.response?.data)
                if (errMsg.includes("An identical alert template already exists"))
                    errMsg = "כבר ישנה תבנית קיימת עם הגדרות אלו"                    
            }         
            setErrorMessage(errMsg);
        } finally {
            setIsSaving(false);
        }
    };

    // Determine if SMS warning should be shown
    const showSmsWarning = newTemplate.alert_method === 'sms';
    
    // Character count styling
    const characterCountStyle = {
        color: newTemplate.alert_method === 'sms' && characterCount > SMS_CHARACTER_LIMIT ? 'red' : 'inherit',
        fontWeight: newTemplate.alert_method === 'sms' && characterCount > SMS_CHARACTER_LIMIT ? 'bold' : 'normal'
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
                <Modal.Title id="add-alert-template-modal">הוספת תבנית התראה חדשה</Modal.Title>
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
                                        required
                                    >
                                        <option value="">בחר סוג התראה</option>
                                        <option value="sms">SMS</option>
                                        <option value="email">Email</option>
                                        <option value="whatsapp">WhatsApp</option>
                                    </Form.Select>
                                </td>
                            </tr>
                           
                            <tr>
                                <td className="template-modal-label">סוג מסמך</td>
                                <td>
                                    <Form.Select
                                        value={newTemplate.doc_type !== null ? newTemplate.doc_type : ''}
                                        onChange={(e) => handleInputChange('doc_type', e.target.value)}
                                        className="template-modal-input"
                                        style={{ textAlign: 'left' }}
                                        disabled={newTemplate.document_id !== null}
                                        required={newTemplate.document_id === null}
                                    >
                                        <option value="">בחר סוג מסמך</option>
                                        <option value="tax_invoice">חשבונית מס</option>
                                        <option value="proforma">דרישת תשלום</option>
                                    </Form.Select>
                                    {newTemplate.document_id !== null && (
                                        <div className="text-muted mt-1" style={{ fontSize: '0.8rem' }}>
                                            סוג מסמך לא רלוונטי כאשר נבחר מסמך ספציפי
                                        </div>
                                    )}
                                </td>
                            </tr>

                            <tr>
                                <td className="template-modal-label">מזהה לקוח</td>
                                <td>
                                    <ClientSelector
                                        value={newTemplate.client_id}
                                        onChange={(value) =>
                                            handleInputChange('client_id', value === '' ? null : value)
                                        }
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
                                        onChange={(e) =>
                                            handleInputChange('document_id', e.target.value === '' ? null : e.target.value)
                                        }
                                        className="template-modal-input"
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </Table>

                    <div className="template-modal-content-section">
                        <h5>
                            תוכן התבנית 
                            <span style={characterCountStyle} className="ms-2">
                                ({characterCount} / {newTemplate.alert_method === 'sms' ? SMS_CHARACTER_LIMIT : '∞'})
                            </span>
                        </h5>
                        
                        {showSmsWarning && (
                            <Alert variant="warning" className="mt-2 mb-2">
                                <strong>שים לב:</strong> הודעות SMS מוגבלות ל-{SMS_CHARACTER_LIMIT} תווים. 
                                אם התוכן הסופי (כולל משתנים שיוחלפו) יחרוג ממגבלה זו, רק {SMS_CHARACTER_LIMIT} התווים הראשונים יישלחו.
                            </Alert>
                        )}
                        
                        <div className="template-modal-content-container">
                            <SmartTemplateEditor
                                value={newTemplate.template_content}
                                onChange={(value) => handleInputChange('template_content', value)}
                            />
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
                <Button
                    variant="success"
                    onClick={handleSave}
                    disabled={isSaving || (newTemplate.alert_method === 'sms' && characterCount > SMS_CHARACTER_LIMIT)}
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