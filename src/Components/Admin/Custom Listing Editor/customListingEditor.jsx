// this component should contain a table populated with the custom listing rows. There should be the option to edit rows, delete rows, and add a new row at the bottom.
import React, { useState, useEffect } from 'react';
import { Container, Table, Spinner, Image, Button, Form, Alert, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function CustomListingEditor() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', image_link: '', starting_price: '' });
  const [newListing, setNewListing] = useState({ title: '', description: '', image_link: '', starting_price: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/listings/custom');
      
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
      setError('Error fetching listings');
      setTimeout(() => setError(''), 3000);
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

  const handleEditClick = (listing) => {
    setEditingId(listing.id);
    setEditForm({
      title: listing.title || '',
      description: listing.description || '',
      image_link: listing.image_link || '',
      starting_price: listing.starting_price || ''
    });
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ title: '', description: '', image_link: '', starting_price: '' });
  };

  const handleSaveEdit = async (id) => {
    if (!editForm.title || !editForm.starting_price) {
      setError('Title and starting price are required');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      const response = await fetch(`/api/listings/custom/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          image_link: editForm.image_link || null,
          starting_price: parseFloat(editForm.starting_price)
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
        setEditingId(null);
        fetchListings();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Error updating listing');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error updating listing:', error);
      setError(error.message || 'An error occurred while updating the listing');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;

    try {
      const response = await fetch(`/api/listings/custom/${deletingId}`, {
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
        setShowDeleteModal(false);
        setDeletingId(null);
        fetchListings();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Error deleting listing');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
      setError(error.message || 'An error occurred while deleting the listing');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleAddNew = async () => {
    if (!newListing.title || !newListing.starting_price) {
      setError('Title and starting price are required');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      const response = await fetch('/api/listings/custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newListing.title,
          description: newListing.description,
          image_link: newListing.image_link || null,
          starting_price: parseFloat(newListing.starting_price)
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
        setSuccess('Listing created successfully');
        setNewListing({ title: '', description: '', image_link: '', starting_price: '' });
        fetchListings();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Error creating listing');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      setError(error.message || 'An error occurred while creating the listing');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleInputChange = (e, isNew = false) => {
    const { name, value } = e.target;
    if (isNew) {
      setNewListing(prev => ({ ...prev, [name]: value }));
    } else {
      setEditForm(prev => ({ ...prev, [name]: value }));
    }
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
      
      <h2 className="mb-4">Edit Custom Listings</h2>
      
      {listings.length === 0 && !editingId ? (
        <p className="text-center text-muted">No custom listings available at this time.</p>
      ) : (
        <Table responsive striped bordered hover>
          <thead>
            <tr>
              <th style={{ width: '150px' }}>Image</th>
              <th>Title</th>
              <th>Description</th>
              <th style={{ width: '120px' }}>Starting Price</th>
              <th style={{ width: '150px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => (
              <tr key={listing.id}>
                <td className="text-center align-middle">
                  {editingId === listing.id ? (
                    <Form.Control
                      type="url"
                      name="image_link"
                      value={editForm.image_link}
                      onChange={handleInputChange}
                      placeholder="Image URL"
                      size="sm"
                    />
                  ) : (
                    <>
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
                    </>
                  )}
                </td>
                <td className="align-middle">
                  {editingId === listing.id ? (
                    <Form.Control
                      type="text"
                      name="title"
                      value={editForm.title}
                      onChange={handleInputChange}
                      required
                      size="sm"
                    />
                  ) : (
                    <strong>{listing.title || 'Untitled Listing'}</strong>
                  )}
                </td>
                <td className="align-middle">
                  {editingId === listing.id ? (
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="description"
                      value={editForm.description}
                      onChange={handleInputChange}
                      size="sm"
                    />
                  ) : (
                    listing.description || 'No description available.'
                  )}
                </td>
                <td className="align-middle text-end">
                  {editingId === listing.id ? (
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      name="starting_price"
                      value={editForm.starting_price}
                      onChange={handleInputChange}
                      required
                      size="sm"
                    />
                  ) : (
                    <strong className="text-primary">
                      {formatPrice(listing.starting_price)}
                    </strong>
                  )}
                </td>
                <td className="align-middle">
                  {editingId === listing.id ? (
                    <div className="d-flex gap-1">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleSaveEdit(listing.id)}
                      >
                        Save
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="d-flex gap-1">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleEditClick(listing)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteClick(listing.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            
            {/* Add New Row */}
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <td className="text-center align-middle">
                <Form.Control
                  type="url"
                  name="image_link"
                  value={newListing.image_link}
                  onChange={(e) => handleInputChange(e, true)}
                  placeholder="Image URL"
                  size="sm"
                />
              </td>
              <td className="align-middle">
                <Form.Control
                  type="text"
                  name="title"
                  value={newListing.title}
                  onChange={(e) => handleInputChange(e, true)}
                  placeholder="Title *"
                  required
                  size="sm"
                />
              </td>
              <td className="align-middle">
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="description"
                  value={newListing.description}
                  onChange={(e) => handleInputChange(e, true)}
                  placeholder="Description"
                  size="sm"
                />
              </td>
              <td className="align-middle text-end">
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  name="starting_price"
                  value={newListing.starting_price}
                  onChange={(e) => handleInputChange(e, true)}
                  placeholder="Price *"
                  required
                  size="sm"
                />
              </td>
              <td className="align-middle">
                <Button
                  variant="success"
                  size="sm"
                  onClick={handleAddNew}
                >
                  Add New
                </Button>
              </td>
            </tr>
          </tbody>
        </Table>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => { setShowDeleteModal(false); setDeletingId(null); }} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this listing? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowDeleteModal(false); setDeletingId(null); }}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default CustomListingEditor;
