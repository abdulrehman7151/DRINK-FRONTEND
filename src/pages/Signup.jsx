import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import { useToast } from '../components/Toast'

function Signup() {
    const navigate = useNavigate();
    const [message, setMessage] = useState("")
    const [messageType, setMessageType] = useState("")
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const { showToast } = useToast()
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post("https://drink-backend-two.vercel.app/api/auth/signup", {
                username: formData.name,
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword
            });

            showToast(response.data.message || 'Account created successfully')
            navigate("/login", {
                state: { message: response.data.message || "Account created successfully" }
            });
        } catch (error) {
            setMessage(error.response?.data?.message || "Something went wrong");
            setMessageType("error");
            showToast(error.response?.data?.message || 'Something went wrong', 'error')
        }
    }

    return (
        <>
            <Navbar />

            <main className="auth-page">
                <div className="auth-card">

                    <div className="auth-header">
                        <span>JOIN US</span>
                        <h1>Create Account</h1>
                        <p>
                            Create an account and start ordering delicious drinks.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>

                        <div className="form-group">
                            <label>Name</label>
                            <input
                                type="text"
                                placeholder="Enter your name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value
                                    })
                                }
                            />
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        email: e.target.value
                                    })
                                }
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        password: e.target.value
                                    })
                                }
                            />
                        </div>

                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        confirmPassword: e.target.value
                                    })
                                }
                            />
                        </div>

                        <button className="auth-btn" type="submit">
                            Create Account
                        </button>

                    </form>

                    {message && (
                        <p className={`auth-message ${messageType}`}>
                            {message}
                        </p>
                    )}

                    <p className="auth-footer">
                        Already have an account?
                        <Link to="/login"> Login</Link>
                    </p>

                </div>
            </main>

            <Footer />
        </>
    );
}

export default Signup;