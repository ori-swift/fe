import React from 'react'
import "./Home.css"

const Home = () => {
    return (
        <div className="home-container">
            <h1 className="home-title">ברוכים הבאים לסוויפט קולקט</h1>
            <p className="home-subtitle">
                המערכת האידיאלית לאיסוף וטיפול בדרישות תשלום של העסק שלך
            </p>
            <div className="home-features">
                <div className="home-feature-card">
                    <h2>אוטומציה חכמה</h2>
                    <p>ייעול תהליכים עסקיים עם מערכת מתקדמת לניהול תשלומים</p>
                </div>
                <div className="home-feature-card">
                    <h2>ניהול מרכזי</h2>
                    <p>כל המידע הפיננסי של העסק שלך במקום אחד</p>
                </div>
                <div className="home-feature-card">
                    <h2>אבטחה מתקדמת</h2>
                    <p>הגנה מלאה על הנתונים הפיננסיים שלך</p>
                </div>
            </div>
        </div>
    );
};




export default Home