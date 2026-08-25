import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useToast } from '../components/Toast'

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [message, setMessage] = useState(location.state?.message || "");
    const [messageType, setMessageType] = useState(location.state?.message ? "success" : "");
    const { showToast } = useToast()

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post(
                "http://localhost:3000/api/auth/login",
                formData
            );

            localStorage.setItem("token", res.data.token);
            localStorage.removeItem("role");
            showToast(res.data.message || 'Logged in successfully')

            if (res.data.role === "admin") {
                navigate("/admin", { replace: true });
            } else {
                navigate("/", { replace: true });
            }
        } catch (error) {
            setMessage(error.response?.data?.message || "Something went wrong");
            setMessageType("error");
            showToast(error.response?.data?.message || 'Something went wrong', 'error')
        }
    };

    return (
        <>
            <Navbar />

            <main className="auth-page">
                <div className="auth-card">

                    <div className="auth-header">
                        <span>WELCOME BACK</span>
                        <h1>Login</h1>
                        <p>
                            Login to continue ordering your favorite drinks.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="forgot-password">
                            <Link to="/login">Forgot password?</Link>
                        </div>

                        <button className="auth-btn" type="submit">
                            Login
                        </button>

                    </form>

                    {message && (
                        <p className={`auth-message ${messageType}`}>
                            {message}
                        </p>
                    )}

                    <p className="auth-footer">
                        Don't have an account?
                        <Link to="/signup"> Create one</Link>
                    </p>

                </div>
            </main>

            <Footer />
        </>
    );
}

export default Login; 
