import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, ListGroup, Alert } from 'react-bootstrap';
import { createCompanyShare, getCompanyShares, removeCompanyShare } from '../../api/company_api';

const CompanyShareModal = ({ show, setShow, companyId }) => {
    const [shares, setShares] = useState([]);
    const [newEmail, setNewEmail] = useState('');
    const [permission, setPermission] = useState('viewer');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const loadShares = async () => {
        try {
            const data = await getCompanyShares(companyId);
            setShares(data);
        } catch (err) {
            setError("שגיאה בטעינת השיתופים");
        }
    };

    useEffect(() => {
        if (show) loadShares();
        setError('');
    }, [show]);

    const handleAddShare = async () => {
        if (!newEmail) {
            setError("יש להזין אימייל");
            return;
        }
        setLoading(true);
        try {
            await createCompanyShare({ companyId, userEmail: newEmail, permission });
            setNewEmail('');
            setPermission('viewer');
            setError('');
            await loadShares();
        } catch (err) {
            console.log(err.response.data);
            
            setError(JSON.stringify(err?.response?.data));
        }
        setLoading(false);
    };

    const handleRemove = async (shareId) => {
        if (!window.confirm("למחוק את השיתוף הזה?")) return;
        try {
            await removeCompanyShare(companyId, shareId);
            await loadShares();
        } catch (err) {
            setError("שגיאה במחיקת השיתוף");
        }
    };

    const handleClose = () => setShow(false);

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>שיתופים</Modal.Title>
            </Modal.Header>
            
            <Modal.Body>
                <Form className="mb-4">
                    <Form.Group className="mb-3">
                        <Form.Label>אימייל משתמש</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="אימייל משתמש"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                        />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                        <Form.Label>הרשאה</Form.Label>
                        <Form.Select
                            value={permission}
                            onChange={(e) => setPermission(e.target.value)}
                        >
                            <option value="viewer">צפייה בלבד</option>
                            <option value="editor">עריכה</option>
                        </Form.Select>
                    </Form.Group>
                    
                    <Button
                        variant="primary"
                        onClick={handleAddShare}
                        disabled={loading}
                    >
                        {loading ? "מוסיף..." : "הוסף"}
                    </Button>
                </Form>

                {error && (
                    <Alert variant="danger" className="mb-3">
                        {error}
                    </Alert>
                )}

                <h6 className="mb-3">שיתופים קיימים:</h6>
                <ListGroup>
                    {shares.map((share) => (
                        <ListGroup.Item 
                            key={share.id} 
                            className="d-flex justify-content-between align-items-center"
                        >
                            <div>
                                <span>{share.user_email}</span>
                                <span className="text-muted ms-2">— </span>
                                <strong>{share.permission}</strong>
                            </div>
                            <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleRemove(share.id)}
                            >
                                הסר
                            </Button>
                        </ListGroup.Item>
                    ))}
                    {shares.length === 0 && (
                        <ListGroup.Item className="text-center text-muted">
                            אין שיתופים עדיין
                        </ListGroup.Item>
                    )}
                </ListGroup>
            </Modal.Body>
            
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    סגור
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CompanyShareModal;