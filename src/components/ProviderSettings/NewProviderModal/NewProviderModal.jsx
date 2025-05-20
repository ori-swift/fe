

import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import { fetchProviders } from "../../../api/general_be_api";
import "./NewProviderModal.css"
import { addNewCompany } from "../../../api/company_api";

const NewProviderModal = ({ show, setShow }) => {
    const [providers, setProviders] = useState({});
    const [companyName, setCompanyName] = useState("");
    const [selectedProvider, setSelectedProvider] = useState("");
    const [requiredFields, setRequiredFields] = useState({});
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (show) {
            fetchProviders()
                .then((data) => setProviders(data))
                .catch(() => setError("שגיאה בטעינת רשימת ספקים"));
        }
    }, [show]);

    // useEffect(() => {
    //     if (selectedProvider) {
    //         const fields = providers[selectedProvider]?.req_fields || {};
    //         setRequiredFields(fields);
    //         setFormData(Object.keys(fields).reduce((acc, key) => ({ ...acc, [key]: "" }), {}));
    //     }
    // }, [selectedProvider, providers]);

    useEffect(() => {
        if (selectedProvider) {
            const fields = providers[selectedProvider]?.req_fields || {};
            setRequiredFields(
                Object.entries(fields).reduce((acc, [key, value]) => {
                    acc[key] = { type: value.type, nickname: value.nickname };
                    return acc;
                }, {})
            );
            setFormData(
                Object.keys(fields).reduce((acc, key) => ({ ...acc, [key]: "" }), {})
            );
        }
    }, [selectedProvider, providers]);



    const handleHide = () => {
        setError("");
        setShow(false);
    }

    const handleProviderChange = (e) => {
        setSelectedProvider(e.target.value);
        setRequiredFields({});
        setFormData({});
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        const isValid = Object.keys(requiredFields).every((key) => formData[key] && formData[key].trim() !== "");

        if (!isValid || !companyName) {
            setError("נא למלא את כל השדות");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const result = await addNewCompany(selectedProvider, companyName, formData);


            if (!result) {
                setError("תקלה בהוספת ספק חדש");
            } else {
                setSuccess(true);
                setTimeout(() => {
                    handleHide(false);
                    setSuccess(false);
                }, 2000);
            }
        } catch (err) {
            setError("אירעה שגיאה בעת הוספת ספק חדש\n" + err.errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={() => handleHide(false)} centered >
            <div className="new-ps-container">
                <Modal.Header closeButton>
                    <Modal.Title className="new-ps-title">הוספת חברה חדשה</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {success ? (
                        <Alert variant="success" className="new-ps-alert">
                            הספק נוסף בהצלחה!
                        </Alert>
                    ) : (
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="new-ps-form-group">
                                <Form.Label className="new-ps-label">שם חברה:</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="companyName"
                                    value={companyName}
                                    onChange={(e) => { setCompanyName(e.target.value) }}
                                    className="new-ps-input"
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="new-ps-form-group">
                                <Form.Label className="new-ps-label">בחר ספק:</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={selectedProvider}
                                    onChange={handleProviderChange}
                                    className="new-ps-input"
                                    required
                                >
                                    <option value="">-- בחר ספק --</option>
                                    {Object.entries(providers).map(([id, provider]) => (
                                        <option key={id} value={id}>
                                            {provider.name}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group>

                            {selectedProvider &&
                                Object.entries(requiredFields).map(([key, field]) => (
                                    <Form.Group key={key} className="new-ps-form-group">
                                        <Form.Label className="new-ps-label">:{field.nickname}</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name={key}
                                            value={formData[key] || ""}
                                            onChange={handleChange}
                                            className="new-ps-input"
                                            required
                                        />
                                    </Form.Group>
                                ))}
                       
                            {error && <div className="new-ps-error">{error}</div>}

                            <div className="new-ps-button-container">
                                <Button type="submit" disabled={loading || !selectedProvider} className="new-ps-submit-button">
                                    {loading ? (
                                        <>
                                            <Spinner animation="border" size="sm" />
                                            <span className="new-ps-spinner-text">מוסיף...</span>
                                        </>
                                    ) : (
                                        "הוסף חברה"
                                    )}
                                </Button>
                                <Button variant="secondary" onClick={() => handleHide(false)} disabled={loading} className="new-ps-cancel-button">
                                    ביטול
                                </Button>
                            </div>
                        </Form>
                    )}
                </Modal.Body>
            </div>
        </Modal>
    );
};

export default NewProviderModal;
