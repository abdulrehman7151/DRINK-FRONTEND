import { useState } from 'react'
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductGrid from "../components/ProductGrid";

function Products() {
    const token = localStorage.getItem("token");
    const [activeFilter, setActiveFilter] = useState('All')
    const [searchQuery, setSearchQuery] = useState('')
    const categories = ['All', 'Milkshakes', 'Smoothies', 'Coffee', 'Juices']

    const filters = token ? [...categories, 'Liked'] : categories
    return (
        <>
            <Navbar />

            <main className="products-page">

                <section className="page-header">
                    <div className="container">
                        <span>OUR MENU</span>
                        <h1>All Drinks</h1>
                        <p>
                            Find your favorite drink from our delicious collection.
                        </p>
                    </div>
                </section>

                <section className="products-section">
                    <div className="container">

                        <label className="product-search">
                            <span className="sr-only">Search drinks</span>
                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="Search drinks..."
                            />
                        </label>

                        <div className="filter-bar">
                            {filters.map((filter) => (
                                <button
                                    key={filter}
                                    className={activeFilter === filter ? 'filter-active' : ''}
                                    type="button"
                                    aria-pressed={activeFilter === filter}
                                    onClick={() => setActiveFilter(filter)}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>

                        <ProductGrid activeFilter={activeFilter} searchQuery={searchQuery} />

                    </div>
                </section>

            </main>

            <Footer />
        </>
    );
}

export default Products;
