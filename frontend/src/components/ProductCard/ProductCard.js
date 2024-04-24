import React, { useEffect, useState } from 'react';
import { Button, Card } from 'react-bootstrap';
import Moment from 'react-moment';
import { Link, useNavigate } from 'react-router-dom';
import './ProductCard.css';
import productService from '../../redux/features/product/ProductService';
import authService from '../../services/authService';

function ProductCard({ product }) {
    const navigate = useNavigate();
    const [isHovering, setIsHovering] = useState(false);
    const imagePath = product?.image?.filePath;
    const productPrice = parseFloat(product?.price).toFixed(2);
    const [productOwner, setProductOwner] = useState(null);
    const [error, setError] = useState('');

    // Handle the preview action here
    const handlePreview = () => {
        navigate(`/product/${product?._id}`);
    };

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const fetchedProduct = await productService.getProduct(product._id);

                if (fetchedProduct.user) {
                    const owner = await authService.getUserById(fetchedProduct.user);
                    setProductOwner(owner);
                }
            } catch (err) {
                setError(err.message || 'Failed to fetch product');
            }
        };
        fetchProductDetails();
    }, [product._id]);

    return (
        <Card
            className={`my-3 p-3 custom-rounded product-card ${product.quantity <= 0 ? 'out-of-stock' : ''}`}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {imagePath && (
                <Link to={`/product/${product?._id}`}>
                    <Card.Img src={imagePath} variant="top" />
                </Link>
            )}
            <Card.Body>
                <Link to={`/product/${product?._id}`}>
                    <Card.Title as="div">
                        <strong className="hover-green">{product?.name}</strong>
                    </Card.Title>
                </Link>
                {!product.offer && ( <Card.Text as="h3">${productPrice}</Card.Text>)}
                {product.offer && (<dive className="price-offer"><Card.Text as="h4">  <span style={{ textDecoration: 'line-through' }}>
        ${productPrice}
      </span>$</Card.Text>    <Card.Text as="h4">  price: ${productPrice-product.offer.discount}</Card.Text></dive>)}
                <Card.Text as="div">
                    <small className="text-muted">
                        <Moment format="DD/MM/YYYY">{product?.createdAt}</Moment>
                    </small>
                </Card.Text>
                {product.offer && (
                    <span className="offer-details">
                        <div className="offer-container">
                            <Card.Text as="div" className="offer-text">
                                Offer: Discount ${product.offer.discount}
                            </Card.Text>
                            <Card.Text as="div" className="offer-text">
                                Start Date:{' '}
                                <Moment format="DD/MM/YYYY">{product.offer.startDate}</Moment>
                            </Card.Text>
                            <Card.Text as="div" className="offer-text">
                                End Date:{' '}
                                <Moment format="DD/MM/YYYY">{product.offer.endDate}</Moment>
                            </Card.Text>
                        </div>
                    </span>
                )}

                {product.quantity <= 0 ? (
                    <div className="out-of-stock-message">Out of stock</div>
                ) : (
                    isHovering && (
                        <Button variant="primary" className="see-preview-btn" onClick={handlePreview}>
                            See Preview
                        </Button>
                    )
                )}
            <span>{productOwner?.firstName}</span>
            </Card.Body>
        </Card>
    );
}

export default ProductCard;
