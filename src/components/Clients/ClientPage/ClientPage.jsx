import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../../App';
import "./ClientPage.css";
import { addContactInfo, createPlaybooksForClient, getClient, updateClientSettings } from '../../../api/general_be_api';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment-timezone';
import TimezoneSelector from '../TimezoneSelector/TimezoneSelector';
import { clearLocalStorageExcept } from '../../../utils/helpers';

const ClientPage = () => {
    const { id } = useParams();
    const { selectedClient, selectedCompany, setSelectedClient } = useContext(AppContext);
    const [clientData, setClientData] = useState({})
    const [emails, setEmails] = useState([]);
    const [phones, setPhones] = useState([]);
    const [newEmail, setNewEmail] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [emailsEditMode, setEmailsEditMode] = useState(false);
    const [phonesEditMode, setPhonesEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [selectedTimezone, setSelectedTimezone] = useState('');
    const [pendingTimezone, setPendingTimezone] = useState('');
    const [pendingRunAlerts, setPendingRunAlerts] = useState(null);
    const [timezoneSearch, setTimezoneSearch] = useState('');

    const nav = useNavigate();

    const timezones = moment.tz.names().filter(tz =>
        ["Asia", "Europe", "America", "Africa"].some(zone => tz.startsWith(zone))
    );

    useEffect(() => {
        if (!selectedCompany) {
            return;
        }
        if (selectedClient.name) {            
            setClientData(selectedClient);
            setEmails(selectedClient.emails || []);
            
            // Convert phones to the right format if they're still strings
            if (selectedClient.phones && selectedClient.phones.length > 0) {
                if (typeof selectedClient.phones[0] === 'string') {
                    // Old format - convert strings to objects
                    setPhones(selectedClient.phones.map(phone => ({ 
                        number: phone, 
                        has_whatsapp: false 
                    })));
                } else {
                    // New format - already objects
                    setPhones(selectedClient.phones || []);
                }
            } else {
                setPhones([]);
            }
            
            setSelectedTimezone(selectedClient.timezone || '');
            setPendingTimezone(selectedClient.timezone || '');
            setPendingRunAlerts(selectedClient.run_alerts);

        } else if (id) {
            getClient(id, selectedCompany.id).then((res) => {
                setClientData(res)
                setEmails(res.emails || []);
                
                // Convert phones to the right format if they're still strings
                if (res.phones && res.phones.length > 0) {
                    if (typeof res.phones[0] === 'string') {
                        // Old format - convert strings to objects
                        setPhones(res.phones.map(phone => ({ 
                            number: phone, 
                            has_whatsapp: false 
                        })));
                    } else {
                        // New format - already objects
                        setPhones(res.phones || []);
                    }
                } else {
                    setPhones([]);
                }
                
                setSelectedTimezone(res.timezone || '');
                setSelectedClient(res)
                setPendingTimezone(res.timezone || '');
                setPendingRunAlerts(res.run_alerts);
            });

        }
        else {
            nav("/clients")
        }
        console.log(clientData);

    }, [selectedCompany]);


    const handleCreateClientPlaybook = async (docType) => {

        clearLocalStorageExcept();

        const res = await createPlaybooksForClient(clientData.id, docType);
        // const cacheKey = `clients_${selectedCompany.id}`;
        // localStorage.removeItem(cacheKey);

        // Update the client data with the new playbook
        const updatedPlaybooks = { ...(clientData.playbooks || {}) };
        updatedPlaybooks[docType] = res.id;
        setClientData({ ...clientData, playbooks: updatedPlaybooks });
    };
    
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
        
        // Check if this phone already exists
        if (phones.some(p => p.number === formattedPhone || p.number === `972${formattedPhone.replace(/^0/, '')}`)) {
            setPhoneError('מספר הטלפון כבר קיים');
            return;
        }

        // Format the phone number
        if (formattedPhone.startsWith('0')) formattedPhone = formattedPhone.slice(1);
        formattedPhone = "972" + formattedPhone;

        // Add the new phone object with default WhatsApp status as false
        setPhones([...phones, { number: formattedPhone, has_whatsapp: false }]);
        setNewPhone('');
        setPhoneError('');
    };

    const handleRemovePhone = (phoneToRemove) => {
        if (window.confirm('שים לב: אם מספר הטלפון קיים במערכת הנהלת החשבונות, ייתכן שהוא יתווסף מחדש באופן אוטומטי. האם ברצונך להמשיך?')) {
            setPhones(phones.filter(phone => phone.number !== phoneToRemove));
        }
    };

    // Add a new function to toggle WhatsApp status
    const toggleWhatsApp = (phoneNumber) => {
        setPhones(phones.map(phone => 
            phone.number === phoneNumber 
                ? { ...phone, has_whatsapp: !phone.has_whatsapp } 
                : phone
        ));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            await addContactInfo(clientData.id, emails, phones);
            setEmailsEditMode(false);
            setPhonesEditMode(false);

            // remove localstorage cache:
            localStorage.removeItem(`clients_${clientData.provider}`);

        } catch (error) {
            console.error('שגיאה בעדכון פרטי הלקוח:', error);
            alert('אירעה שגיאה בעדכון פרטי הלקוח. נא לנסות שוב.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!clientData) return <div className="client-page-container">לא נבחר לקוח</div>;


    return (
        <div className="client-page-container">
            <div className="client-page-card">
                <div className="client-page-header">
                    <h1 className="client-page-title">{clientData.name}</h1>
                    <div className="client-page-id">מס' לקוח: {clientData.id}</div>

                    {/* Playbook Buttons Section */}
                    <div className="client-page-playbooks">
                        {clientData.playbooks && Object.keys(clientData.playbooks).length > 0 ? (
                            <>
                                {clientData.playbooks.tax_invoice ? (
                                    <button
                                        onClick={() => nav("/playbook/" + clientData.playbooks.tax_invoice)}
                                        className='doc-modal-playbook-btn update-btn'
                                    >
                                        עדכן פלייבוק לחשבוניות מס
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleCreateClientPlaybook('tax_invoice')}
                                        className='doc-modal-playbook-btn create-btn'
                                    >
                                        צור פלייבוק לחשבוניות מס
                                    </button>
                                )}

                                {clientData.playbooks.proforma ? (
                                    <button
                                        onClick={() => nav("/playbook/" + clientData.playbooks.proforma)}
                                        className='doc-modal-playbook-btn update-btn'
                                    >
                                        עדכן פלייבוק לדרישות תשלום
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleCreateClientPlaybook('proforma')}
                                        className='doc-modal-playbook-btn create-btn'
                                    >
                                        צור פלייבוק לדרישות תשלום
                                    </button>
                                )}
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => handleCreateClientPlaybook('tax_invoice')}
                                    className='doc-modal-playbook-btn create-btn'
                                >
                                    צור פלייבוק לחשבוניות מס
                                </button>
                                <button
                                    onClick={() => handleCreateClientPlaybook('proforma')}
                                    className='doc-modal-playbook-btn create-btn'
                                >
                                    צור פלייבוק לדרישות תשלום
                                </button>
                            </>
                        )}
                    </div>

                    <div className="client-page-switch-row">
                        <label className="client-page-switch-label">
                            {pendingRunAlerts ? "התראות פעילות" : "התראות כבויות"}
                        </label>
                        <div className="client-page-switch-container">
                            <input
                                type="checkbox"
                                className="client-page-switch-checkbox"
                                checked={pendingRunAlerts}
                                onChange={() => setPendingRunAlerts(!pendingRunAlerts)}
                            />
                            {pendingRunAlerts !== clientData.run_alerts && (
                                <button
                                    className="client-page-update-button"
                                    onClick={async () => {
                                        setIsLoading(true);
                                        try {
                                            await updateClientSettings(clientData.id, { run_alerts: pendingRunAlerts });
                                            setClientData({ ...clientData, run_alerts: pendingRunAlerts });
                                            localStorage.removeItem(`clients_${selectedCompany.id}`);
                                        } catch (e) {
                                            alert("שגיאה בעדכון סטטוס ההתראות");
                                        } finally {
                                            setIsLoading(false);
                                        }
                                    }}
                                >
                                    שמור
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="client-page-info-row">
                        <div className="client-page-info-label">בחר אזור זמן:</div>
                        <TimezoneSelector
                            selectedTimezone={pendingTimezone}
                            onTimezoneChange={setPendingTimezone}
                            clientTimezone={clientData.timezone}
                            onSave={async () => {
                                setIsLoading(true);
                                try {
                                    await updateClientSettings(clientData.id, { timezone: pendingTimezone });
                                    setClientData({ ...clientData, timezone: pendingTimezone });
                                    localStorage.removeItem(`clients_${selectedCompany.id}`);
                                } catch {
                                    alert("שגיאה בעדכון אזור הזמן");
                                } finally {
                                    setIsLoading(false);
                                }
                            }}
                        />
                    </div>


                </div>
                <div className="client-page-section">
                    <div className="client-page-section-header">
                        <h2>פרטי קשר</h2>
                    </div>

                    <div className="client-page-info-row">
                        <div className="client-page-info-label">איש קשר:</div>
                        <div className="client-page-info-value">
                            {clientData.contact_person_name || 'לא הוגדר'}
                        </div>
                    </div>

                    <div className="client-page-notice">
                        <p>שים לב:  כתובת ואיש קשר מוצגים כפי שהם שהם מופיעים בספק החשבוניות שלך.</p>
                        <p>ניתן להגדיר דרכינו (תחת הגדרות הפלייבוק) דרכי התקשרות נוספים</p>
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
                                    <span className="phone-display">
                                        {phone.number}
                                        {phone.has_whatsapp && (
                                            <svg className="whatsapp-icon" viewBox="0 0 448 512" width="16" height="16">
                                                <path fill="#25D366" d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-7-.2-10.7-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                                            </svg>
                                        )}
                                    </span>
                                    {phonesEditMode && (
                                        <div className="client-page-phone-actions">
                                            {/* Add WhatsApp checkbox */}
                                            <label className="client-page-whatsapp-label">
                                                <input
                                                    type="checkbox"
                                                    checked={phone.has_whatsapp}
                                                    onChange={() => toggleWhatsApp(phone.number)}
                                                />
                                                WhatsApp
                                            </label>
                                            <button
                                                className="client-page-remove-button"
                                                onClick={() => handleRemovePhone(phone.number)}
                                            >
                                                הסר
                                            </button>
                                        </div>
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
                    <div
                        className={`client-page-stat-item ${parseInt(clientData.open_docs_count) > 0 ? "clickable-stat" : ""}`}
                        onClick={() => {
                            if (parseInt(clientData.open_docs_count) > 0) {
                                nav("/documents");
                            }
                        }}
                    >
                        <div className="client-page-stat-label">מסמכים פתוחים:</div>
                        <div className="client-page-stat-value">{clientData.open_docs_count}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientPage;