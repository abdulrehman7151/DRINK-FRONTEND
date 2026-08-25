import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function Contact() {
    return (
        <>
            <Navbar />
            <main className="contact-page">
                <div className="container">

                    <div className="page-header">
                        <span>GET IN TOUCH</span>
                        <h1>Contact Us</h1>
                        <p>Have a question or suggestion? Find us through any of the channels below.</p>
                    </div>

                    <div className="contact-info-grid">
                        <div className="contact-info-card">
                            <span>📍</span>
                            <div>
                                <h3>Visit Us</h3>
                                <p>123 Drinkly Street, Beverage City, BC 45678</p>
                            </div>
                        </div>
                        <div className="contact-info-card">
                            <span>📞</span>
                            <div>
                                <h3>Call Us</h3>
                                <p>+92 300 1234567</p>
                            </div>
                        </div>
                        <div className="contact-info-card">
                            <span>📧</span>
                            <div>
                                <h3>Email Us</h3>
                                <p>hello@drinkly.com</p>
                            </div>
                        </div>
                        <div className="contact-info-card">
                            <span>🕐</span>
                            <div>
                                <h3>Opening Hours</h3>
                                <p>Mon – Sat: 8am – 10pm<br />Sunday: 10am – 8pm</p>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
            <Footer />
        </>
    )
}

export default Contact
