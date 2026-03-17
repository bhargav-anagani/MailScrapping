import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * /auth/callback?token=<JWT>
 * After Google OAuth redirect, this page grabs the token from URL
 * and stores it in localStorage, then redirects to /dashboard.
 */
const AuthCallback = () => {
    const navigate = useNavigate();
    const { setUser } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (token) {
            localStorage.setItem("scrmail_token", token);
            // Fetch user and redirect
            import("../api/axios").then(({ default: api }) => {
                api
                    .get("/api/auth/me")
                    .then(({ data }) => {
                        setUser(data);
                        navigate("/dashboard", { replace: true });
                    })
                    .catch(() => {
                        localStorage.removeItem("scrmail_token");
                        navigate("/", { replace: true });
                    });
            });
        } else {
            navigate("/", { replace: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-600 font-medium text-lg">Signing you in…</p>
            </div>
        </div>
    );
};

export default AuthCallback;
