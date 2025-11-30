// this component should contain a table of custom products that we provide, including images, descriptions, and pricing.
// it should also be editable on the admin side.
import React, { useState, useEffect } from 'react';
import { Container, Table, Spinner, Image } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function Customs() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/listings/custom');
      
      // Check if response is ok and is JSON
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Expected JSON but got:', text.substring(0, 200));
        throw new Error('Response is not JSON');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setListings(data.listings);
      }
    } catch (error) {
      console.error('Error fetching custom listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
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
    <Container className="my-5" id='customsSection'>
      <h2 className="mb-4">Custom Listings</h2>
      {listings.length === 0 ? (
        <p className="text-center text-muted">No custom listings available at this time.</p>
      ) : (
        <Table responsive striped bordered hover>
          <thead>
            <tr>
              <th style={{ width: '150px' }}>Image</th>
              <th>Title</th>
              <th>Description</th>
              <th style={{ width: '120px' }}>Starting Price</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => (
              <tr key={listing.id}>
                <td className="text-center align-middle">
                  {listing.image_link && listing.image_link.trim && listing.image_link.trim() !== '' ? (
                    <Image
                      src={listing.image_link}
                      alt={listing.title || 'Custom listing'}
                      thumbnail
                      style={{
                        maxWidth: '120px',
                        maxHeight: '120px',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const placeholder = e.target.nextSibling;
                        if (placeholder) placeholder.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    style={{
                      display: (listing.image_link && listing.image_link.trim && listing.image_link.trim() !== '') ? 'none' : 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '120px',
                      height: '120px',
                      backgroundColor: '#f8f9fa',
                      color: '#6c757d',
                      padding: '0.5rem',
                      textAlign: 'center',
                      fontSize: '0.75rem',
                      border: '1px solid #dee2e6',
                      borderRadius: '0.25rem'
                    }}
                  >
                    <svg 
                      width="40" 
                      height="40" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="1"
                      className="mb-1"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <small>Image unavailable</small>
                  </div>
                </td>
                <td className="align-middle">
                  <strong>{listing.title || 'Untitled Listing'}</strong>
                </td>
                <td className="align-middle">
                  {listing.description || 'No description available.'}
                </td>
                <td className="align-middle text-end">
                  <strong className="text-primary">
                    {formatPrice(listing.starting_price)}
                  </strong>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default Customs;