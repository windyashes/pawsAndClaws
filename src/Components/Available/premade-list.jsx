// This component should display all current premade listings in a row that you can scroll through side to side with the option to sort by newest or by price.
// a single listing component should contain an image, the name, a space for the description, and spots in the bottom corners for date listed and price.
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ButtonGroup, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function PremadeList() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchListings();
  }, [sortBy]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/listings/premade?sort=${sortBy}`);
      const data = await response.json();
      
      if (data.success) {
        setListings(data.listings);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      {/* Sort Controls */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <h2>Available Pre-Made Listings</h2>
            <ButtonGroup>
              <Button
                variant={sortBy === 'newest' ? 'primary' : 'outline-primary'}
                onClick={() => setSortBy('newest')}
              >
                Newest
              </Button>
              <Button
                variant={sortBy === 'price' ? 'primary' : 'outline-primary'}
                onClick={() => setSortBy('price')}
              >
                Price
              </Button>
            </ButtonGroup>
          </div>
        </Col>
      </Row>

      {/* Scrollable Listings Row */}
      <Row>
        <Col>
          <div 
            className="d-flex flex-nowrap overflow-auto pb-3"
            style={{ 
              scrollbarWidth: 'thin',
              msOverflowStyle: 'auto',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {listings.length === 0 ? (
              <Col className="text-center text-muted py-5">
                <p>No listings available at this time.</p>
              </Col>
            ) : (
              listings.map((listing) => (
                <div
                  key={listing.id}
                  className="flex-shrink-0 me-3"
                  style={{ 
                    width: 'clamp(280px, calc(100vw - 4rem), 320px)',
                    minWidth: '280px'
                  }}
                >
                  <Card className="h-100 shadow-sm">
                    <div 
                      style={{ 
                        height: '250px', 
                        backgroundColor: '#f8f9fa',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}
                    >
                      {listing.image_link ? (
                        <img
                          src={listing.image_link}
                          alt={listing.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        style={{
                          display: listing.image_link ? 'none' : 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                          width: '100%',
                          color: '#6c757d',
                          padding: '1rem',
                          textAlign: 'center'
                        }}
                      >
                        <svg 
                          width="80" 
                          height="80" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="1"
                          className="mb-2"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <small>Image unavailable for this product</small>
                      </div>
                    </div>
                    <Card.Body className="d-flex flex-column">
                      <Card.Title className="h5 mb-2">{listing.title || 'Untitled Listing'}</Card.Title>
                      <Card.Text 
                        className="flex-grow-1 text-muted"
                        style={{
                          fontSize: '0.9rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {listing.description || 'No description available.'}
                      </Card.Text>
                      <div className="d-flex justify-content-between align-items-end mt-auto pt-2">
                        <small className="text-muted">
                          {formatDate(listing.date_listed)}
                        </small>
                        <strong className="text-primary">
                          {formatPrice(listing.price)}
                        </strong>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              ))
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default PremadeList;
