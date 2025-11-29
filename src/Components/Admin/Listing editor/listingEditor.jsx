// displays all current listings and allows the admin to edit them, delete them, and add new ones via the listing creator component.
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ButtonGroup, Spinner, Modal, Form, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import ListingCreator from '../Listing Creator/listingCreator';

function ListingEditor() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', price: '', image_link: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const handleEditClick = (listing) => {
    setEditingListing(listing);
    setEditForm({
      title: listing.title || '',
      description: listing.description || '',
      price: listing.price || '',
      image_link: listing.image_link || ''
    });
    setShowEditModal(true);
    setError('');
    setSuccess('');
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    try {
      const response = await fetch(`/api/listings/premade/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Expected JSON but got:', text.substring(0, 200));
        throw new Error('Response is not JSON. Server may need to be restarted.');
      }

      const data = await response.json();

      if (data.success) {
        setSuccess('Listing deleted successfully');
        fetchListings();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Error deleting listing');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
      setError(error.message || 'An error occurred while deleting the listing. Make sure the server is running and has been restarted.');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!editForm.title || !editForm.price) {
      setError('Title and price are required');
      return;
    }

    try {
      const response = await fetch(`/api/listings/premade/${editingListing.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          price: parseFloat(editForm.price),
          image_link: editForm.image_link || null
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Expected JSON but got:', text.substring(0, 200));
        throw new Error('Response is not JSON. Server may need to be restarted.');
      }

      const data = await response.json();

      if (data.success) {
        setSuccess('Listing updated successfully');
        setShowEditModal(false);
        fetchListings();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Error updating listing');
      }
    } catch (error) {
      console.error('Error updating listing:', error);
      setError(error.message || 'An error occurred while updating the listing. Make sure the server is running and has been restarted.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
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
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}
      
      {/* Sort Controls */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div className="d-flex align-items-center gap-2">
              <h2 className="mb-0">Edit Pre-made Listings</h2>
              <Button
                variant="success"
                onClick={() => setShowCreateModal(true)}
              >
                Create New Listing
              </Button>
            </div>
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
          <style>{`
            .premade-scroll-container::-webkit-scrollbar {
              height: 12px;
            }
            .premade-scroll-container::-webkit-scrollbar-track {
              background: #f1f1f1;
              border-radius: 6px;
            }
            .premade-scroll-container::-webkit-scrollbar-thumb {
              background: #888;
              border-radius: 6px;
            }
            .premade-scroll-container::-webkit-scrollbar-thumb:hover {
              background: #555;
            }
          `}</style>
          <div 
            className="d-flex flex-nowrap overflow-auto pb-3 premade-scroll-container"
            style={{ 
              scrollbarWidth: 'auto',
              msOverflowStyle: 'scrollbar',
              WebkitOverflowScrolling: 'touch',
              overflowX: 'scroll',
              overflowY: 'hidden'
            }}
          >
            {listings.length === 0 ? (
              <Col className="text-center text-muted py-5">
                <p>No listings available to edit at this time.</p>
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
                      <div className="d-flex justify-content-between align-items-end mt-auto pt-2 mb-2">
                        <small className="text-muted">
                          {formatDate(listing.date_listed)}
                        </small>
                        <strong className="text-primary">
                          {formatPrice(listing.price)}
                        </strong>
                      </div>
                      <div className="d-flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleEditClick(listing)}
                          className="flex-grow-1"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteClick(listing.id)}
                          className="flex-grow-1"
                        >
                          Delete
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              ))
            )}
          </div>
        </Col>
      </Row>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Listing</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Title *</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={editForm.title}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                value={editForm.description}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Price *</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                name="price"
                value={editForm.price}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                type="url"
                name="image_link"
                value={editForm.image_link}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />
              <Form.Text className="text-muted">
                Enter a URL for the product image. Leave empty to remove the image.
              </Form.Text>
            </Form.Group>

            {editForm.image_link && (
              <div className="mb-3">
                <Form.Label>Image Preview</Form.Label>
                <div style={{ 
                  width: '100%', 
                  height: '200px', 
                  backgroundColor: '#f8f9fa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  borderRadius: '0.25rem',
                  border: '1px solid #dee2e6'
                }}>
                  <img
                    src={editForm.image_link}
                    alt="Preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<small class="text-muted">Invalid image URL</small>';
                    }}
                  />
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Create New Listing Modal */}
      <ListingCreator
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onSuccess={() => {
          setSuccess('Listing created successfully');
          fetchListings();
          setTimeout(() => setSuccess(''), 3000);
        }}
      />
    </Container>
  );
}


export default ListingEditor;