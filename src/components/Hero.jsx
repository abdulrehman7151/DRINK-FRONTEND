import { Link } from 'react-router-dom'
import heroCoffee from '../assets/hero-coffee.png'

function Hero() {
    return (
        <section className="hero" id="top">
            <div className="container hero-content">
                <div className="hero-text">
                    <span className="hero-tag">FRESH <b>•</b> COLD <b>•</b> DELICIOUS</span>
                    <h1>Your Daily Dose<br />of <span>Happiness</span></h1>
                    <p>Discover refreshing drinks made with premium ingredients and flavors you&apos;ll want again and again.</p>
                    <div className="hero-buttons">
                        <Link className="primary-btn" to="/products">Explore Drinks <span>↗</span></Link>
                        <Link className="secondary-btn" to="/#about">Our Story</Link>
                    </div>
                </div>
                <div className="hero-image" aria-label="A refreshing coffee drink">
                    <div className="drink-circle"></div>
                    <img className="drink" src={heroCoffee} alt="Fresh coffee drink" />
                    <div className="floating-card"><span>✦</span><div><strong>Drinkly menu</strong><small>Coming soon</small></div></div>
                    <div className="sparkle sparkle-one">✦</div>
                    <div className="sparkle sparkle-two">✦</div>
                </div>
            </div>
        </section>
    )
}

export default Hero