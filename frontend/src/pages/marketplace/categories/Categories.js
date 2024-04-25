import React, { useCallback, useEffect, useState } from 'react';
import { useCategory } from '../../../customHook/CategoryProvider';
import InfiniteScroll from 'react-infinite-scroll-component';
import CategoriesNav from '../../../components/Categories/CategoriesNav';
import ProductCard from '../../../components/ProductCard/ProductCard';
import { Col, Container, Row, Spinner } from 'react-bootstrap';
import productService from "../../../redux/features/product/ProductService";
import Search from '../../../components/search/Search';
import './Categories.css';
import Footer from '../../../components/footer/Footer';
import DualThumbRangeSlider from '../../../components/dualThumb/DualThumbRangeSlider';

function Categories() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 300 });
  const [maxPrice, setMaxPrice] = useState(0);
  const { category } = useCategory();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await (category === 'all'
          ? productService.getAllProducts()
          : productService.getProdcutsByCategory(category));
        
          console.log("res",res)
        const maxProductPrice = Math.max(...res.map((p) => p.price));
        setMaxPrice(maxProductPrice);

        const savedFilters = localStorage.getItem('priceRangeFilters');
        const savedPriceRange = savedFilters ? JSON.parse(savedFilters) : { min: 1, max: maxProductPrice };

        setPriceRange(savedPriceRange);
        setProducts(res);
        setFilteredProducts(res.filter(product =>
          product.price >= savedPriceRange.min && product.price <= savedPriceRange.max
        ));
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [category]);

  useEffect(() => {
    const seenIds = new Set();
    const filtered = products.filter(product => {
      const uniqueId = product.offer ? `${product._id}-${product.offer._id}` : product._id;
      if (!seenIds.has(uniqueId)) {
        seenIds.add(uniqueId);
        return product.name.toLowerCase().includes(search.toLowerCase()) &&
          product.price >= priceRange.min && product.price <= priceRange.max;
      }
      return false;
    });
    setFilteredProducts(filtered);
  }, [search, products, priceRange]);

  const handlePriceRangeChange = useCallback((values) => {
    const [minValue, maxValue] = values;
    const newRange = { min: minValue, max: maxValue };
    setPriceRange(newRange);
    localStorage.setItem('priceRangeFilters', JSON.stringify(newRange));

    const seenIds = new Set();
    const filtered = products.filter(product => {
      const uniqueId = product.offer ? `${product._id}-${product.offer._id}` : product._id;
      if (!seenIds.has(uniqueId)) {
        seenIds.add(uniqueId);
        return product.name.toLowerCase().includes(search.toLowerCase()) &&
          product.price >= minValue && product.price <= maxValue;
      }
      return false;
    });
    setFilteredProducts(filtered);
  }, [products, search]);

  const handleSearchChange = (value) => {
    setSearch(value);
  };

  return (
    <>
      <CategoriesNav />
      <Container fluid>
        <Row>
          <Col md={2} className="filter-sidebar">
            <div className="price-range-filter">
              <label style={{ marginBottom: '4.5rem' }}>
                Price Range: LKR {priceRange.min} - LKR {priceRange.max}
              </label>
              <DualThumbRangeSlider
                min={0}
                max={maxPrice}
                values={[priceRange.min, priceRange.max]}
                onChange={handlePriceRangeChange}
              />
            </div>
          </Col>
          <Col md={9}>
            <Row className="justify-content-center mb-4">
              <Col xs={12} lg={8}>
                <Search value={search} onChange={(e) => handleSearchChange(e.target.value)} />
              </Col>
            </Row>
            <Container style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
              {!loading ? (
                <InfiniteScroll
                  style={{ overflow: 'hidden' }}
                  dataLength={filteredProducts.length}
                  next={() => {}} // Implement the logic for loading more products here
                  hasMore={false} // Set this to true and implement logic if there are more items to load
                  loader={<Spinner animation="border" />}
                >
                  <Row>
                    {filteredProducts.map((product) => (
                      <Col xs={12} sm={6} md={4} lg={3} key={product._id}>
                        <ProductCard product={product} />
                      </Col>
                    ))}
                  </Row>
                </InfiniteScroll>
              ) : (
                <div className="spinner">
                  <Spinner animation="border" />
                </div>
              )}
            </Container>
            <Footer />
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Categories;
