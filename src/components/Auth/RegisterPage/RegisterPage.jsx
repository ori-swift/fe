import { useState } from "react";
import { register, requestEmailCode } from "../../../api/auth_api";
import GoogleLoginPage from "../GoogleAuth/GoogleLoginPage";

const RegisterPage = ({ goBack }) => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [emailCode, setEmailCode] = useState("");
    const [loading, setLoading] = useState(false);

    const handleEmailVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await requestEmailCode(email);
            setStep(2);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await register(username, email, password, emailCode);
            if (res) window.location.reload();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <h2 className="login-title">הרשמה</h2>            
            {step === 1 ? (
                <form className="login-form" onSubmit={handleEmailVerify}>
                    <input
                        type="email"
                        placeholder="אימייל - קוד אימות יישלח"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="login-input"
                    />
                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? "..." : "אמת אימייל"}
                    </button>
                    <p className="login-toggle" onClick={goBack}>חזור</p>
                </form>
            ) : (
                <form className="login-form" onSubmit={handleRegister}>
                    <input
                        type="text"
                        placeholder="שם מלא"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="login-input"
                    />
                    <input
                        type="password"
                        placeholder="סיסמה"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="login-input"
                    />
                    <input
                        type="email"
                        value={email}
                        disabled
                        className="login-input"
                    />
                    <input
                        type="text"
                        placeholder="קוד אימות"
                        value={emailCode}
                        onChange={(e) => setEmailCode(e.target.value)}
                        className="login-input"
                    />
                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? "..." : "הרשמה"}
                    </button>
                    <p className="login-toggle" onClick={goBack}>חזור</p>
                </form>
            )}
            <GoogleLoginPage />
        </div>
    );
};

export default RegisterPage;
