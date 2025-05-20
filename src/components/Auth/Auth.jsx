import { useContext, useEffect, useState } from "react";
import "./Auth.css";
import { login } from "../../api/auth_api";
import { AppContext } from "../../App";
import { useNavigate } from "react-router-dom";
import GoogleLoginPage from "./GoogleAuth/GoogleLoginPage";
import RegisterPage from "./RegisterPage/RegisterPage";


const Auth = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);

    const nav = useNavigate();
    const { setIsLogged, isLogged } = useContext(AppContext)

    useEffect(() => {
        if (isLogged) nav("/");
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await login(email, password);
        if (res) setIsLogged(true);
    };

    return isRegistering ? (
        <RegisterPage goBack={() => setIsRegistering(false)} />
    ) : (
        <>
            <div className="login-container">
                <h2 className="login-title">התחברות</h2>
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
                </form>
                <p className="login-toggle" onClick={() => setIsRegistering(true)}>
                    אין לך חשבון? הרשם עכשיו
                </p>
            </div>
            <GoogleLoginPage />
        </>
    );
};

export default Auth;

// import { useContext, useEffect, useState } from "react";
// import "./Auth.css";
// import { login, register } from "../../api/auth_api";
// import { AppContext } from "../../App";
// import { useNavigate } from "react-router-dom";
// import GoogleLoginPage from "./GoogleAuth/GoogleLoginPage";

// const Auth = () => {
//     const [username, setUsername] = useState("");
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [isRegistering, setIsRegistering] = useState(false);

//     const nav = useNavigate();
//     const { setIsLogged, isLogged } = useContext(AppContext)
//     useEffect(() => {
//         if (isLogged) {
//             nav("/")
//         }
//     })
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         let res;
//         if (isRegistering)
//             res = await register(username, email, password);
//         else 
//             res = await login(username, password);        

//         console.log(res);
        
//         if (res) {
//             setIsLogged(true);
//         }
//     };

//     return (
//         <>
//             <div className="login-container">
//                 <h2 className="login-title">{isRegistering ? "הרשמה" : "התחברות"}</h2>
//                 <form className="login-form" onSubmit={handleSubmit}>
//                     {isRegistering && <input
//                         type="text"
//                         placeholder="שם מלא"
//                         value={username}
//                         onChange={(e) => setUsername(e.target.value)}
//                         className="login-input"
//                     />}
                    
//                     <input
//                         type="email"
//                         placeholder={isRegistering ? "אימייל - קוד אימות יישלח": "אימייל" }
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         className="login-input"
//                     />
                    
//                     <input
//                         type="password"
//                         placeholder="סיסמה"
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         className="login-input"
//                     />
//                     <button type="submit" className="login-button">
//                         {isRegistering ? "הרשמה" : "התחברות"}
//                     </button>
//                 </form>
//                 <p className="login-toggle" onClick={() => setIsRegistering(!isRegistering)}>
//                     {isRegistering ? "חשבון קיים? התחבר" : "אין לך חשבון? הרשם עכשיו"}
//                 </p>

//             </div>
//             <GoogleLoginPage />
//         </>
//     );
// };

// export default Auth;
