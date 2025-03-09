import { useContext, useEffect, useState } from "react";
// import { register, login } from "../api/be";
import "./Auth.css";
import { login, register } from "../../api/auth_api";
import { AppContext } from "../../App";
import { useNavigate } from "react-router-dom";

const Auth = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);

    const nav = useNavigate();
    const { setIsLogged, isLogged } = useContext(AppContext)
    useEffect(() => {
        if (isLogged) {
            nav("/")
        }
    })
    const handleSubmit = async (e) => {
        e.preventDefault();
        const action = isRegistering ? register : login;
        const response = await action(username, password);

        if (response) {
            setIsLogged(true);
        }
    };

    return (
        <div className="login-container">

            <h2 className="login-title">{isRegistering ? "Register" : "Login"}</h2>
            <form className="login-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="login-input"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="login-input"
                />
                <button type="submit" className="login-button">
                    {isRegistering ? "Sign Up" : "Sign In"}
                </button>
            </form>
            <p className="login-toggle" onClick={() => setIsRegistering(!isRegistering)}>
                {isRegistering ? "Already have an account? Login" : "Don't have an account? Register"}
            </p>
        </div>
    );
};

export default Auth;
