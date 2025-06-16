import React, { useState } from 'react';
import "./OnBoarding.css"
import { onBoardingProfile } from '../../api/general_be_api';
import { useNavigate } from 'react-router-dom';

const OnBoarding = () => {
    const [formData, setFormData] = useState({
        scope: '',
        role: '',
        phone: '',
        num_employees: '',
        fname: '',
        lname: '',
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const nav = useNavigate()
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            await onBoardingProfile(formData);
            nav('/settings');
        } catch (error) {
            console.error(error);
            setMessage('שגיאה בעדכון הפרופיל.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="onboarding-container">
            <div className="onboarding-header">
                <h1 className="onboarding-title">השלמת פרטי הפרופיל</h1>
                <p className="onboarding-subtitle">יש להשלים את הפרטים האישיים כדי להמשיך</p>
            </div>
            
            <form onSubmit={handleSubmit} className="onboarding-form">
                <div className="form-group">
                    <input 
                        name="fname" 
                        value={formData.fname} 
                        onChange={handleChange} 
                        placeholder="שם פרטי" 
                        required
                    />
                </div>
                
                <div className="form-group">
                    <input 
                        name="lname" 
                        value={formData.lname} 
                        onChange={handleChange} 
                        placeholder="שם משפחה" 
                        required
                    />
                </div>
                
                <div className="form-group">
                    <input 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        placeholder="טלפון (לדוגמה: +972501234567)" 
                        type="tel"
                        required
                    />
                </div>
                
                <div className="form-group">
                    <input 
                        name="scope" 
                        value={formData.scope} 
                        onChange={handleChange} 
                        placeholder="תחום (לדוגמה: סטארט-אפ)" 
                        required
                    />
                </div>
                
                <div className="form-group">
                    <input 
                        name="role" 
                        value={formData.role} 
                        onChange={handleChange} 
                        placeholder="תפקיד (לדוגמה: מנכ״ל)" 
                        required
                    />
                </div>
                
                <div className="form-group">
                    <input
                        name="num_employees"
                        value={formData.num_employees}
                        onChange={handleChange}
                        placeholder="מספר עובדים"
                        type="number"
                        min="0"
                        required
                    />
                </div>

                <button type="submit" disabled={loading} className="submit-button">
                    {loading ? 'שומר...' : 'שמור פרופיל'}
                </button>

                {message && <div className="form-message">{message}</div>}
            </form>
        </div>
    );
};

export default OnBoarding;