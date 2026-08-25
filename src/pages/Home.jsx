import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import ProductGrid from '../components/ProductGrid'
import Footer from '../components/Footer'

function Home() {
    return (
        <>
            <Navbar />
            <main>
                <Hero />
                <section className="products-section" id="menu">
                    <div className="section-heading">
                        <span>OUR MENU</span>
                        <h2>Choose Your Favorite</h2>
                        <p>Fresh drinks, bold flavors, and something for every mood.</p>
                    </div>
                    <ProductGrid activeFilter="All" />
                </section>
            </main>
            <Footer />
        </>
    )
}

export default Home
