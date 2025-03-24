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

    useEffect(() => {
        // console.log("ProviderSettings userEffect");
        
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
            
            // alert("העדכון בוצע בהצלחה");
            alert(msg);
            setIsEditing(false);
        }
    };

    const handleRefreshData = async () => {
        const res = await refreshProviderData(ps.id);
        if (res) alert("עדכון הנתונים מתבצע כעת. תוכל לרענן את הדף בעוד מספר דקות");
    };

    return (
        <div>
            <button className='provider-settings-show-button' onClick={() => setShow(!show)}>
                {show ? "סגור" : "עדכן פרטים"}
            </button>

            {show && (
                <div className="provider-settings-container">
                    <h2 className="provider-settings-title">{ps.provider_name} הגדרות</h2>

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
                                    <input name={key} value={formData[key] || ""} onChange={handleChange} />
                                ) : (
                                    <span>{formData[key] || "—"}</span>
                                )}
                            </div>
                        </div>
                    ))}

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
                                <button className="btn btn-primary provider-settings-refresh" onClick={handleRefreshData}>
                                    רענן נתוני מסמכים ולקוחות
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

// const ProviderSettings = ({ ps }) => {

//     const [providers, setProviders] = useState({});
//     const [show, setShow] = useState(false);
//     const [isEditing, setIsEditing] = useState(false);
//     const [formData, setFormData] = useState({ ...ps.cred_json });
//     const [companyName, setCompanyName] = useState(ps.company_name)
//     const [error, setError] = useState("");
//     const [loading, setLoading] = useState(false);
//     const [requiredFields, setRequiredFields] = useState({});


//     console.log(ps);

    
//     useEffect(() => {

//         fetchProviders()
//             .then((data) => {
//                 console.log(data);
//                 ```
//                 printed:
//                 name: "Green Inovice",
//                 req_fields: id: {type: 'string', nickname: 'מפתח API'},
//                 secret: {type: 'string', nickname: 'סוד/Secret'},
//                 ```

//                 setProviders(data)
//             })
//             .catch(() => setError("שגיאה בטעינת רשימת ספקים"));


//         const fields = {};
//         setRequiredFields(
//             Object.entries(fields).reduce((acc, [key, value]) => {
//                 acc[key] = { type: value.type, nickname: value.nickname };
//                 return acc;
//             }, {})
//         );


//         // if (ps.req_fields) {
//         //     setRequiredFields(
//         //         Object.entries(ps.req_fields).reduce((acc, [key, value]) => {
//         //             acc[key] = { type: value.type, nickname: value.nickname };
//         //             return acc;
//         //         }, {})
//         //     );
//         // }
//     }, [ps.req_fields]);


//     const handleEdit = () => setIsEditing(true);

//     const handleCancel = () => {
//         setIsEditing(false);
//         setFormData({ ...ps.cred_json });
//         setError("");
//     };

//     const handleChange = (e) => {
//         setFormData({ ...formData, [e.target.name]: e.target.value });
//     };

//     const handleSave = async () => {
//         if (!formData.id.trim()) {
//             setError("ID cannot be empty");
//             return;
//         }
//         if (!formData.secret.trim()) {
//             setError("Secret cannot be empty");
//             return;
//         }

//         setLoading(true);
//         const res = await updateCompany(formData, ps.id, companyName);
//         setLoading(false);

//         if (res.status !== 'ok') {
//             alert("שגיאה בעדכון נתוני הספק" + res.errorMsg);
//         } else {
//             alert("העדכון בוצע בהצלחה");
//             setIsEditing(false);
//         }
//     };

//     const handleRefreshData = async () => {
//         let res = await refreshProviderData(ps.id);
//         if (res)
//             alert("עדכון הנתונים מתבצע כעת. תוכל לרענן את הדף בעוד מספר דקות")
//     }


//     return (
//         <div>
//             <button className='provider-settings-show-button' onClick={() => { setShow(!show) }}>
//                 {show ? "סגור" : "עדכן פרטים"}
//             </button>
//             {show && (
//                 <div className="provider-settings-container">
//                     <br />
//                     <h2 className="provider-settings-title">{ps.provider_name} הגדרות</h2>

//                     <div className="provider-settings-field">
//                         <label className="provider-settings-label">:ספק החשבוניות שלך</label>
//                         <div className="provider-settings-value">
//                             <span>{ps.provider_name}</span>
//                         </div>
//                     </div>

//                     <div className="provider-settings-field">
//                         <label className="provider-settings-label">:שם החברה</label>
//                         <div className="provider-settings-value">
//                             {isEditing ? (
//                                 <input name="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
//                             ) : (
//                                 <span>{companyName}</span>
//                             )}
//                         </div>
//                     </div>

//                     {/* Dynamically render required fields */}
//                     {Object.entries(requiredFields).map(([key, field]) => (
//                         <div key={key} className="provider-settings-field">
//                             <label className="provider-settings-label">:{field.nickname}</label>
//                             <div className="provider-settings-value">
//                                 {isEditing ? (
//                                     <input name={key} value={formData[key] || ""} onChange={handleChange} />
//                                 ) : (
//                                     <span>{formData[key] || "—"}</span>
//                                 )}
//                             </div>
//                         </div>
//                     ))}

//                     {error && <p className="provider-settings-error">{error}</p>}

//                     <div className="provider-settings-buttons">
//                         {isEditing ? (
//                             <>
//                                 <button className="provider-settings-save" onClick={handleSave} disabled={loading}>
//                                     {loading ? <span className="spinner"></span> : "שמור"}
//                                 </button>
//                                 <button className="provider-settings-cancel" onClick={handleCancel}>ביטול</button>
//                             </>
//                         ) : (
//                             <div>
//                                 <button className="provider-settings-edit" onClick={handleEdit}>ערוך</button>
//                                 <br />
//                                 <button className="btn btn-primary provider-settings-refresh" onClick={handleRefreshData}>
//                                     רענן נתוני מסמכים ולקוחות
//                                 </button>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             )}
//         </div>
//     );

//     // return (
//     //     <div>
//     //         <button className='provider-settings-show-button' onClick={() => { setShow(!show) }}>
//     //             {show ? "סגור" : "עדכן פרטים"}
//     //         </button>
//     //         {show ?
//     //             <div className="provider-settings-container">
//     //                 <br />
//     //                 <h2 className="provider-settings-title"> {ps.provider_name} הגדרות</h2>
//     //                 <div className="provider-settings-field">
//     //                     <label className="provider-settings-label">:ספק החשבוניות שלך</label>
//     //                     <div className="provider-settings-value">
//     //                         {/* {isEditing ? (
//     //                             <select name="provider_id" value={formData.provider_id} onChange={handleChange}>
//     //                                 <option value="1">חשבונית ירוקה</option>
//     //                                 <option value="2">משהו אחר</option>
//     //                             </select>
//     //                         ) : (
//     //                             <span>{ps.provider_name}</span>
//     //                         )} */}


//     //                         <span>{ps.provider_name}</span>

//     //                     </div>
//     //                 </div>
//     //                 <div className="provider-settings-field">
//     //                     <label className="provider-settings-label">:שם החברה</label>
//     //                     <div className="provider-settings-value">
//     //                         {isEditing ? (
//     //                             <input name="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
//     //                         ) : (
//     //                             <span>{companyName}</span>
//     //                         )}
//     //                     </div>
//     //                 </div>

//     //                 <div className="provider-settings-field">
//     //                     <label className="provider-settings-label">:מפתח API</label>
//     //                     <div className="provider-settings-value">
//     //                         {isEditing ? (
//     //                             <input name="id" value={formData.id} onChange={handleChange} autoFocus />
//     //                         ) : (
//     //                             <span>{formData.id}</span>
//     //                         )}
//     //                     </div>
//     //                 </div>
//     //                 <div className="provider-settings-field">
//     //                     <label className="provider-settings-label">סוד/Secret:</label>
//     //                     <div className="provider-settings-value">
//     //                         {isEditing ? (
//     //                             <input name="secret" value={formData.secret} onChange={handleChange} />
//     //                         ) : (
//     //                             <span>{maskedSecret}</span>
//     //                         )}
//     //                     </div>
//     //                 </div>
//     //                 {error && <p className="provider-settings-error">{error}</p>}
//     //                 <div className="provider-settings-buttons">
//     //                     {isEditing ? (
//     //                         <>

//     //                             <button className="provider-settings-save" onClick={handleSave} disabled={loading}>
//     //                                 {loading ? <span className="spinner"></span> : "שמור"}
//     //                             </button>

//     //                             <button className="provider-settings-cancel" onClick={handleCancel}>ביטול</button>
//     //                         </>
//     //                     ) : (
//     //                         <div>
//     //                             <button className="provider-settings-edit" onClick={handleEdit}>ערוך</button>
//     //                             <br />
//     //                             <button className="btn btn-primary provider-settings-refresh" onClick={handleRefreshData}> רענן נתוני מסמכים ולקוחות</button>
//     //                         </div>
//     //                     )}
//     //                 </div>
//     //             </div>
//     //             :
//     //             <></>}
//     //     </div>
//     // )
// }

// export default ProviderSettings