// Small modal shown when a logged-out user tries to interact

import { useNavigate } from "react-router-dom";
import "./LoginPrompt.css";

function LoginPrompt({ message = "Sign in to continue", onClose }) {
    const navigate = useNavigate();

    return (
        <div className="login-prompt-backdrop" onClick={onClose}>
            <div className="login-prompt" onClick={(e) => e.stopPropagation()}>
                <p className="login-prompt__message">{message}</p>
                <div className="login-prompt__actions">
                    <button className="btn btn-primary btn--sm" onClick={() => navigate("/login")}>
                        Log in
                    </button>
                    <button className="btn btn-outline btn--sm" onClick={() => navigate("/register")}>
                        Sign up
                    </button>
                </div>
                <button className="login-prompt__close" onClick={onClose} aria-label="Close">✕</button>
            </div>
        </div>
    );
}

export default LoginPrompt;
