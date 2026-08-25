import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function About() {
    return (
        <>
            <Navbar />
            <main className="about-page">
                <div className="container">

                    {/* Hero */}
                    <div className="page-header">
                        <span>OUR STORY</span>
                        <h1>About Drinkly</h1>
                        <p>We're on a mission to make every sip extraordinary.</p>
                    </div>

                    {/* Story Section */}
                    <section className="about-section about-story">
                        <div className="about-story-text">
                            <h2>How it started</h2>
                            <p>
                                Drinkly was born out of a simple love for fresh, bold flavors. We
                                started in a small kitchen experimenting with fruits, spices, and
                                everything in between — and we haven't stopped since.
                            </p>
                            <p>
                                Every drink on our menu is crafted with care, using only the
                                freshest ingredients. No artificial flavors, no shortcuts — just
                                pure, delicious taste in every cup.
                            </p>
                        </div>
                        <div className="about-story-visual">
                            <div className="about-big-emoji">🥤</div>
                        </div>
                    </section>

                    {/* Values */}
                    <section className="about-values">
                        <h2>What we stand for</h2>
                        <div className="about-values-grid">
                            <div className="about-value-card">
                                <span>🌿</span>
                                <h3>Fresh Ingredients</h3>
                                <p>Every drink starts with real, fresh produce sourced locally whenever possible.</p>
                            </div>
                            <div className="about-value-card">
                                <span>🎨</span>
                                <h3>Bold Flavors</h3>
                                <p>We don't do bland. Each recipe is taste-tested until it's absolutely perfect.</p>
                            </div>
                            <div className="about-value-card">
                                <span>💚</span>
                                <h3>Made with Love</h3>
                                <p>Every cup is prepared with care and passion for the craft of great drinks.</p>
                            </div>
                            <div className="about-value-card">
                                <span>⚡</span>
                                <h3>Always Evolving</h3>
                                <p>We're always experimenting and adding new seasonal flavors to our menu.</p>
                            </div>
                        </div>
                    </section>

                </div>
            </main>
            <Footer />
        </>
    )
}

export default About
