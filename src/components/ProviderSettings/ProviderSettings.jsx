import React, { useState } from 'react'
import "./ProviderSettings.css"
import { updateUserCred } from '../../api/cred_api';
import { useNavigate } from 'react-router-dom';
import { refreshProviderData } from '../../api/general_be_api';


const ProviderSettings = ({ ps }) => {

    const [show, setShow] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ ...ps.cred_json });
    const [error, setError] = useState("");

    const nav = useNavigate()

    const maskedSecret = formData.secret?.slice(0, 4) + "***";

    const handleEdit = () => setIsEditing(true);

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({ ...ps.cred_json });
        setError("");
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        if (!formData.id.trim()) {
            setError("ID cannot be empty");
            return;
        }
        if (!formData.secret.trim()) {
            setError("Secret cannot be empty");
            return;
        }

        await updateUserCred(formData, ps.id);
        setIsEditing(false);
    };

    const handleRefreshData = async ()=>{
       console.log("start");
       await refreshProviderData(ps.id);
       console.log("end");
       
        
    }
    
    return (
        <div>
            <button className='provider-settings-show-buttons' onClick={()=>{setShow(!show)}}> הגדרת {ps.provider_name} </button>
            {show ? 
            <div className="provider-settings-container">
                <button onClick={handleRefreshData}> רענן נתוני מסמכים ולקוחות</button>
                <h2 className="provider-settings-title"> {ps.provider_name} הגדרות</h2>
                <div className="provider-settings-field">
                    <label className="provider-settings-label">ספק החשבוניות שלך:</label>
                    <div className="provider-settings-value">
                        {isEditing ? (
                            <select name="provider_id" value={formData.provider_id} onChange={handleChange}>
                                <option value="1">חשבונית ירוקה</option>
                                <option value="2">משהו אחר</option>
                            </select>
                        ) : (
                            <span>{ps.provider_name}</span>
                        )}
                    </div>
                </div>
                <div className="provider-settings-field">
                    <label className="provider-settings-label">מפתח API:</label>
                    <div className="provider-settings-value">
                        {isEditing ? (
                            <input name="id" value={formData.id} onChange={handleChange} autoFocus />
                        ) : (
                            <span>{formData.id}</span>
                        )}
                    </div>
                </div>
                <div className="provider-settings-field">
                    <label className="provider-settings-label">סוד/Secret:</label>
                    <div className="provider-settings-value">
                        {isEditing ? (
                            <input name="secret" value={formData.secret} onChange={handleChange} />
                        ) : (
                            <span>{maskedSecret}</span>
                        )}
                    </div>
                </div>
                {error && <p className="provider-settings-error">{error}</p>}
                <div className="provider-settings-buttons">
                    {isEditing ? (
                        <>
                            <button className="provider-settings-save" onClick={handleSave}>שמור</button>
                            <button className="provider-settings-cancel" onClick={handleCancel}>ביטול</button>
                        </>
                    ) : (
                        <button className="provider-settings-edit" onClick={handleEdit}>ערוך</button>
                    )}
                </div>
            </div>
            : 
            <></>}
        </div>
    )
}

export default ProviderSettings