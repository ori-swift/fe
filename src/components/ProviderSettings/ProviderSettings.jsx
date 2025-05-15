import React, { useEffect, useState } from 'react'
import "./ProviderSettings.css"
import { updateCompany } from '../../api/cred_api';
import { refreshProviderData, fetchProviders } from '../../api/general_be_api';


const ProviderSettings = ({ ps }) => {
    const [providers, setProviders] = useState({});
    const [requiredFields, setRequiredFields] = useState({});
    const [formData, setFormData] = useState({});
    const [companyName, setCompanyName] = useState(ps.company_name);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(false);
    const [refreshing, setRefreshing] = useState(false);


    useEffect(() => {
        fetchProviders()
            .then((data) => {
                setProviders(data);
                const provider = Object.values(data).find(p => p.name === ps.provider_name);
                if (provider) {
                    setRequiredFields(provider.req_fields || {});
                    setFormData(prev => ({
                        ...prev,
                        ...Object.keys(provider.req_fields || {}).reduce((acc, key) => {
                            acc[key] = ps.cred_json?.[key] || "";
                            return acc;
                        }, {}),
                        language: ps.language,
                        email: ps.email || "",
                    }));
                }
            })
            .catch(() => setError("שגיאה בטעינת רשימת ספקים"));
    }, [ps.provider_name]);

    const handleEdit = () => setIsEditing(true);

    const handleCancel = () => {
        setIsEditing(false);
        setError("");
        setFormData(ps.cred_json || {});
        setCompanyName(ps.company_name);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        for (const key of Object.keys(requiredFields)) {
            if (!formData[key]?.trim()) {
                setError(`${requiredFields[key].nickname} לא יכול להיות ריק`);
                return;
            }
        }

        setLoading(true);
        const res = await updateCompany(formData, ps.id, companyName);
        setLoading(false);

        console.log(res);

        if (res.status !== 'ok') {
            alert("שגיאה בעדכון נתוני הספק: " + res.errorMsg);
        } else {
            const msg = "העדכון בוצע בהצלחה. הנתונים יתעדכנו בעוד מספר רגעים. תוכל לרענן את הדף"

            alert(msg);
            setIsEditing(false);
        }
    };

    const handleRefreshData = async () => {
        try {
            setRefreshing(true);
            const res = await refreshProviderData(ps.id);
            setRefreshing(false);
        } catch (error) {
            console.log(error);
            alert("שגיאה אירעה במהלך העדכון. אנא פנה לתמיכה")
        }

    };

    return (
        <div>
            <button className='provider-settings-show-button' onClick={() => setShow(!show)}>
                {show ? "סגור" : "עדכן פרטים"}
            </button>

            {show && (
                <div className="provider-settings-container">
                    <h2 className="provider-settings-title">הגדרות {companyName} </h2>

                    <div className="provider-settings-field">
                        <label className="provider-settings-label">ספק החשבוניות שלך:</label>
                        <span className="provider-settings-value">{ps.provider_name}</span>
                    </div>

                    <div className="provider-settings-field">
                        <label className="provider-settings-label">שם החברה:</label>
                        <div className="provider-settings-value">
                            {isEditing ? (
                                <input name="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                            ) : (
                                <span>{companyName}</span>
                            )}
                        </div>
                    </div>

                    {Object.entries(requiredFields).map(([key, field]) => (
                        <div key={key} className="provider-settings-field">
                            <label className="provider-settings-label">{field.nickname}:</label>
                            <div className="provider-settings-value">
                                {isEditing ? (
                                    // <input name={key} value={formData[key] + "*************"|| ""} onChange={handleChange} />
                                    <input name={key} value={formData[key]} onChange={handleChange} />
                                ) : (
                                    <span>{formData[key].substring(0, 2) + "*****************" || "—"}</span>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Language selector */}
                    <div className="provider-settings-field">
                        <label className="provider-settings-label">שפה:</label>
                        <div className="provider-settings-value">
                            {isEditing ? (
                                <select name="language" value={formData.language} onChange={handleChange}>
                                    <option value="he">עברית</option>
                                    <option value="en">English</option>
                                    <option value="fr">Français</option>
                                    <option value="ru">Русский</option>
                                    <option value="ar">العربية</option>
                                </select>
                            ) : (
                                <span>{formData.language}</span>
                            )}
                        </div>
                    </div>

                    {/* Default email field */}
                    <div className="provider-settings-field">
                        <label className="provider-settings-label">אימייל ברירת מחדל:</label>
                        <div className="provider-settings-value">
                            {isEditing ? (
                                <input name="email" value={formData.email} onChange={handleChange} />
                            ) : (
                                <span>{formData.email || "—"}</span>
                            )}
                        </div>
                    </div>


                    {error && <p className="provider-settings-error">{error}</p>}

                    <div className="provider-settings-buttons">
                        {isEditing ? (
                            <>
                                <button className="provider-settings-save" onClick={handleSave} disabled={loading}>
                                    {loading ? <span className="spinner"></span> : "שמור"}
                                </button>
                                <button className="provider-settings-cancel" onClick={handleCancel}>ביטול</button>
                            </>
                        ) : (
                            <>
                                <button className="provider-settings-edit" onClick={handleEdit}>ערוך</button>
                                <button className="btn btn-primary provider-settings-refresh" onClick={handleRefreshData} disabled={refreshing}>
                                    {refreshing ? <span className="spinner"></span> : "רענן נתוני מסמכים ולקוחות"}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProviderSettings;
