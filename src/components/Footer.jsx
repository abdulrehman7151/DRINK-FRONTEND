import { Link } from 'react-router-dom'

function Footer() {
    return (
        <footer className="footer" id="contact">
            <div className="container footer-content">
                <div id="about"><Link className="logo footer-logo" to="/"><span>DRINK</span><strong>LY</strong></Link><p>Fresh drinks. Good vibes.<br />Every single day.</p></div>
                <div><h4>Explore</h4><Link to="/">Home</Link><Link to="/products">Menu</Link><Link to="/#about">About</Link></div>
                <div><h4>Contact</h4><p>Contact details will appear here.</p></div>
            </div>
            <div className="footer-bottom">Drinkly storefront</div>
        </footer>
    )
}

export default Footer