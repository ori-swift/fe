import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../../App';
import "./ClientPage.css";
import { addContactInfo, createPlaybooksForClient, getClient, updateClientSettings } from '../../../api/general_be_api';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment-timezone';
import TimezoneSelector from '../TimezoneSelector/TimezoneSelector';



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
            setPhones(selectedClient.phones || []);
            setSelectedTimezone(selectedClient.timezone || '');
            setPendingTimezone(selectedClient.timezone || '');
            setPendingRunAlerts(selectedClient.run_alerts);

        } else if (id) {
            getClient(id, selectedCompany.id).then((res) => {
                setClientData(res)
                setEmails(res.emails || []);
                setPhones(res.phones || []);
                setSelectedTimezone(res.timezone || '');
                setSelectedClient(res)
                setPendingTimezone(res.timezone || '');
                setPendingRunAlerts(res.run_alerts);
            });

        }
        else {
            nav("/clients")
        }
    }, [selectedCompany]);

    const filterTimezones = (search) => {
        return timezones.filter(tz => tz.toLowerCase().includes(search.toLowerCase()));
    };

    const handleCreateClientPlaybook = async () => {
        const res = await createPlaybooksForClient(clientData.id);
        const cacheKey = `clients_${selectedCompany.id}`;
        localStorage.removeItem(cacheKey);
        const playbooks = res.reduce((acc, pb) => {
            acc[pb.doc_type] = pb.id;
            return acc;
        }, {});
        setClientData({ ...clientData, playbooks });

    }
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

                    {clientData.playbooks && Object.keys(clientData.playbooks).length > 0 &&
                        <>
                            <button onClick={() => nav("/playbook/" + clientData.playbooks.tax_invoice)}
                                className='doc-modal-playbook-btn' > עדכן פלייבוק לחשבוניות מס </button>
                            <button onClick={() => nav("/playbook/" + clientData.playbooks.proforma)}
                                className='doc-modal-playbook-btn' > עדכן פלייבוק לדרישות תשלום </button>
                        </>
                    }

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



                    {!clientData.playbooks || Object.keys(clientData.playbooks).length === 0 &&
                        <button onClick={handleCreateClientPlaybook}
                            className='doc-modal-playbook-btn' > צור פלייבוק </button>}
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