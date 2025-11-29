// listing creator component on admin page
// this should have a form with fields for the listing title, description, price, and image.
// it should also have a submit button.
import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function ListingCreator({ show, onHide, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    image_link: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.title || !formData.price) {
      setError('Title and price are required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/listings/premade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          image_link: formData.image_link || null
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
        // Reset form
        setFormData({
          title: '',
          description: '',
          price: '',
          image_link: ''
        });
        if (onSuccess) {
          onSuccess();
        }
        onHide();
      } else {
        setError(data.message || 'Error creating listing');
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      setError(error.message || 'An error occurred while creating the listing. Make sure the server is running and has been restarted.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      image_link: ''
    });
    setError('');
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Create New Listing</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form.Group className="mb-3">
            <Form.Label>Title *</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
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
              value={formData.description}
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
              value={formData.price}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Image URL</Form.Label>
            <Form.Control
              type="url"
              name="image_link"
              value={formData.image_link}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
            />
            <Form.Text className="text-muted">
              Enter a URL for the product image.
            </Form.Text>
          </Form.Group>

          {formData.image_link && (
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
                  src={formData.image_link}
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
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Listing'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default ListingCreator;