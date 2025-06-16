import { useContext, useEffect, useState } from "react";
import "./Auth.css";
import { login, requestPasswordReset, resetPassword } from "../../api/auth_api";
// import { requestPasswordReset, resetPassword } from "../../api/auth_forgot_api"; // import these
import { AppContext } from "../../App";
import { useNavigate } from "react-router-dom";
import GoogleLoginPage from "./GoogleAuth/GoogleLoginPage";
import RegisterPage from "./RegisterPage/RegisterPage";

const Auth = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [code, setCode] = useState("");
    const [newPass, setNewPass] = useState("");
    const [step, setStep] = useState(0); // 0=login, 1=request-code, 2=enter-code
    const [isRegistering, setIsRegistering] = useState(false);

    const nav = useNavigate();
    const { setIsLogged, isLogged } = useContext(AppContext);

    useEffect(() => {
        if (isLogged) nav("/");
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await login(email, password);
        if (res) setIsLogged(true);
    };

    const sendCode = async () => {
        await requestPasswordReset(email);
        setStep(2);
    };

    const handleReset = async () => {
        await resetPassword({ email, code, newPassword: newPass });
        alert("Password updated, now login");
        setStep(0);
    };

    if (isRegistering) return <RegisterPage goBack={() => setIsRegistering(false)} />;

    return (
        <>
            <div className="login-container">
                <h2 className="login-title">התחברות</h2>
                {step === 0 && (
                    <form className="login-form" onSubmit={handleSubmit}>
                        <input
                            type="email"
                            placeholder="אימייל"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="login-input"
                        />
                        <input
                            type="password"
                            placeholder="סיסמה"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="login-input"
                        />
                        <button type="submit" className="login-button">
                            התחברות
                        </button>
                        <p className="login-toggle" onClick={() => setIsRegistering(true)}>
                            אין לך חשבון? הרשם עכשיו
                        </p>
                        <p className="login-toggle" onClick={() => setStep(1)}>
                            שכחת סיסמה?
                        </p>
                    </form>
                )}

                {step === 1 && (
                    <div className="login-form">
                        <input
                            type="email"
                            placeholder="אימייל"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="login-input"
                        />
                        <button onClick={sendCode} className="login-button">
                            שלח קוד איפוס
                        </button>
                        <p className="login-toggle" onClick={() => setStep(0)}>
                            חזרה להתחברות
                        </p>
                    </div>
                )}

                {step === 2 && (
                    <div className="login-form">
                        <input
                            placeholder="קוד שקיבלת"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="login-input"
                        />
                        <input
                            type="password"
                            placeholder="סיסמה חדשה"
                            value={newPass}
                            onChange={(e) => setNewPass(e.target.value)}
                            className="login-input"
                        />
                        <button onClick={handleReset} className="login-button">
                            אפס סיסמה
                        </button>
                        <p className="login-toggle" onClick={() => setStep(0)}>
                            חזרה להתחברות
                        </p>
                    </div>
                )}
            <GoogleLoginPage />
            </div>
        </>
    );
};

export default Auth;