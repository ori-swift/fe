import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../../App';
import "./ClientPage.css";
import {addContactInfo} from '../../../api/general_be_api';
import { useNavigate } from 'react-router-dom';

const ClientPage = () => {
    const { selectedClient } = useContext(AppContext);
    const [emails, setEmails] = useState([]);
    const [phones, setPhones] = useState([]);
    const [newEmail, setNewEmail] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [emailsEditMode, setEmailsEditMode] = useState(false);
    const [phonesEditMode, setPhonesEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [phoneError, setPhoneError] = useState('');

    const nav = useNavigate();

    useEffect(() => {
        console.log(selectedClient);

        if (selectedClient.name) {
            setEmails(selectedClient.emails || []);
            setPhones(selectedClient.phones || []);
        } else {
            nav("/clients")
        }
    }, []);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone) => {
        const phoneRegex = /^\d{8,12}$/;
        return phoneRegex.test(phone);
    };

    const handleAddEmail = () => {
        if (!newEmail.trim()) {
            setEmailError('נא להזין כתובת אימייל');
            return;
        }

        if (!validateEmail(newEmail)) {
            setEmailError('נא להזין כתובת אימייל תקינה');
            return;
        }

        if (emails.includes(newEmail)) {
            setEmailError('כתובת האימייל כבר קיימת');
            return;
        }

        setEmails([...emails, newEmail]);
        setNewEmail('');
        setEmailError('');
    };

    const handleRemoveEmail = (emailToRemove) => {
        if (window.confirm('שים לב: אם האימייל קיים במערכת הנהלת החשבונות, ייתכן שהוא יתווסף מחדש באופן אוטומטי. האם ברצונך להמשיך?')) {
            setEmails(emails.filter(email => email !== emailToRemove));
        }
    };

    const handleAddPhone = () => {
        if (!newPhone.trim()) {
            setPhoneError('נא להזין מספר טלפון');
            return;
        }

        if (!validatePhone(newPhone)) {
            setPhoneError('מספר טלפון חייב להכיל 8-12 ספרות בלבד');
            return;
        }

        let formattedPhone = newPhone;
        if (phones.includes(formattedPhone)) {
            setPhoneError('מספר הטלפון כבר קיים');
            return;
        }

        // if phone start with 0, remove it.
        // Add prefix 972 to the phone
        if (formattedPhone.indexOf(0) === 0) formattedPhone = formattedPhone.slice(1);
        formattedPhone = "972" + formattedPhone;

        setPhones([...phones, formattedPhone]);
        setNewPhone('');
        setPhoneError('');
    };

    const handleRemovePhone = (phoneToRemove) => {
        if (window.confirm('שים לב: אם מספר הטלפון קיים במערכת הנהלת החשבונות, ייתכן שהוא יתווסף מחדש באופן אוטומטי. האם ברצונך להמשיך?')) {
            setPhones(phones.filter(phone => phone !== phoneToRemove));
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            await addContactInfo(selectedClient.id, emails, phones);
            setEmailsEditMode(false);
            setPhonesEditMode(false);

            // remove localstorage cache:
            localStorage.removeItem(`clients_${selectedClient.provider}`);

        } catch (error) {
            console.error('שגיאה בעדכון פרטי הלקוח:', error);
            alert('אירעה שגיאה בעדכון פרטי הלקוח. נא לנסות שוב.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!selectedClient) return <div className="client-page-container">לא נבחר לקוח</div>;

    return (
        <div className="client-page-container">
            <div className="client-page-card">
                <div className="client-page-header">
                    <h1 className="client-page-title">{selectedClient.name}</h1>
                    <div className="client-page-id">מס' לקוח: {selectedClient.id}</div>
                </div>

                <div className="client-page-section">
                    <div className="client-page-section-header">
                        <h2>פרטי קשר</h2>
                    </div>

                    <div className="client-page-info-row">
                        <div className="client-page-info-label">איש קשר:</div>
                        <div className="client-page-info-value">
                            {selectedClient.contact_person_name || 'לא הוגדר'}
                        </div>
                    </div>

                    <div className="client-page-notice">
                        <p>שים לב: עריכת שדות כתובת ואיש קשר אפשרית רק דרך ספק החשבוניות.</p>
                        <p>ביצירת יומן תזכורות על מסמכים ניתן להגדיר באופן ייחודי אנשי קשר וכתובות</p>
                    </div>
                </div>

                <div className="client-page-section">
                    <div className="client-page-section-header">
                        <h2>כתובות אימייל</h2>
                        <button
                            className="client-page-edit-button"
                            onClick={() => setEmailsEditMode(!emailsEditMode)}
                        >
                            {emailsEditMode ? 'סגור' : 'ערוך'}
                        </button>
                    </div>

                    <div className="client-page-contacts-list">
                        {emails.length > 0 ? (
                            emails.map((email, index) => (
                                <div key={`email-${index}`} className="client-page-contact-item">
                                    <span>{email}</span>
                                    {emailsEditMode && (
                                        <button
                                            className="client-page-remove-button"
                                            onClick={() => handleRemoveEmail(email)}
                                        >
                                            הסר
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="client-page-no-data">לא נמצאו כתובות אימייל</div>
                        )}
                    </div>

                    {emailsEditMode && (
                        <div className="client-page-add-form">
                            <div className="client-page-input-group">
                                <input
                                    type="email"
                                    className={`client-page-input ${emailError ? 'client-page-input-error' : ''}`}
                                    placeholder="הזן כתובת אימייל חדשה"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                />
                                <button
                                    className="client-page-add-button"
                                    onClick={handleAddEmail}
                                >
                                    הוסף
                                </button>
                            </div>
                            {emailError && <div className="client-page-error-message">{emailError}</div>}
                        </div>
                    )}
                </div>

                <div className="client-page-section">
                    <div className="client-page-section-header">
                        <h2>מספרי טלפון</h2>
                        <button
                            className="client-page-edit-button"
                            onClick={() => setPhonesEditMode(!phonesEditMode)}
                        >
                            {phonesEditMode ? 'סגור' : 'ערוך'}
                        </button>
                    </div>

                    <div className="client-page-contacts-list">
                        {phones.length > 0 ? (
                            phones.map((phone, index) => (
                                <div key={`phone-${index}`} className="client-page-contact-item">
                                    <span>{phone} </span>
                                    {phonesEditMode && (
                                        <button
                                            className="client-page-remove-button"
                                            onClick={() => handleRemovePhone(phone)}
                                        >
                                            הסר
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="client-page-no-data">לא נמצאו מספרי טלפון</div>
                        )}
                    </div>

                    {phonesEditMode && (
                        <div className="client-page-add-form">
                            <div className="client-page-input-group client-page-phone-input-group">
                                <input
                                    type="text"
                                    dir='ltr'
                                    className={`client-page-input ${phoneError ? 'client-page-input-error' : ''}`}
                                    placeholder="הזן מספר טלפון חדש"
                                    value={newPhone}
                                    onChange={(e) => {
                                        // Allow only digits
                                        const value = e.target.value.replace(/\D/g, '');
                                        setNewPhone(value);
                                    }}
                                />
                                <div className="client-page-phone-prefix">972+</div>
                                <button
                                    className="client-page-add-button"
                                    onClick={handleAddPhone}
                                >
                                    הוסף
                                </button>
                            </div>
                            {phoneError && <div className="client-page-error-message">{phoneError}</div>}
                        </div>
                    )}
                </div>

                {(emailsEditMode || phonesEditMode) && (
                    <div className="client-page-actions">
                        <button
                            className="client-page-update-button"
                            onClick={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="client-page-spinner"></div>
                            ) : (
                                'עדכן פרטי לקוח'
                            )}
                        </button>
                    </div>
                )}

                <div className="client-page-stats">
                    <div className="client-page-stat-item" onClick={()=>{nav("/documents")}}>
                        <div className="client-page-stat-label">מסמכים פתוחים:</div>
                        <div className="client-page-stat-value">{selectedClient.open_docs_count}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientPage;