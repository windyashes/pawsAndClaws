// simple pipeline to track customer and order information, interactions, and purchases
/* pipeline sections include:
    - Intake (customer is interested in a custom or pre-made product)
    - Payment (customer has paid for a custom or pre-made product)
    - Production (product is being made. Can add notes and images to track progress)
    - Shipping (product is being shipped to the customer)
    - Delivery (product has been delivered to the customer)
    - Completed (customer has received their product and is happy)
    - Cancelled (customer has cancelled their order)
*/
// should have a form with fields for name, email, phone, and message.
// it should also have a submit button.
import React, { useState, useEffect } from 'react';
import { Container, Button, Card, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import 'bootstrap/dist/css/bootstrap.min.css';

function CustomerCard({ customer, stages, onEdit, onMove, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: customer.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  // Find current stage index - handle null pipeline_id and type comparison
  const currentStageIndex = customer.pipeline_id 
    ? stages.findIndex(s => {
        // Handle both string and number comparisons
        const stageId = typeof s.id === 'string' ? parseInt(s.id) : s.id;
        const customerPipelineId = typeof customer.pipeline_id === 'string' 
          ? parseInt(customer.pipeline_id) 
          : customer.pipeline_id;
        return stageId === customerPipelineId;
      })
    : -1;
  
  const canMoveLeft = currentStageIndex > 0;
  const canMoveRight = currentStageIndex >= 0 && currentStageIndex < stages.length - 1;

  const handleButtonClick = (e, callback) => {
    e.preventDefault();
    e.stopPropagation();
    if (callback) callback();
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="mb-2 shadow-sm"
      {...attributes}
    >
      <Card.Body>
        {/* Drag handle area - only this area is draggable */}
        <div 
          {...listeners}
          style={{ 
            cursor: 'grab',
            padding: '0.5rem',
            margin: '-0.5rem -0.5rem 0.5rem -0.5rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '0.25rem 0.25rem 0 0',
            userSelect: 'none'
          }}
          onMouseDown={(e) => {
            // Prevent drag if clicking on interactive elements
            if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input')) {
              e.stopPropagation();
              e.preventDefault();
            }
          }}
        >
          <div className="d-flex justify-content-between align-items-start">
            <div className="flex-grow-1">
              <Card.Title className="h6 mb-1">{customer.name}</Card.Title>
              {customer.contact_info && (
                <Card.Text className="text-muted small mb-1">
                  {customer.contact_info}
                </Card.Text>
              )}
              {customer.notes && (
                <Card.Text className="small text-muted">
                  {customer.notes.substring(0, 100)}
                  {customer.notes.length > 100 ? '...' : ''}
                </Card.Text>
              )}
            </div>
          </div>
        </div>
        <div className="d-flex gap-1 justify-content-end" style={{ marginTop: '0.5rem' }}>
          <Button
            variant="outline-primary"
            size="sm"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => handleButtonClick(e, () => onEdit(customer))}
          >
            Edit
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            disabled={!canMoveLeft}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              handleButtonClick(e, () => {
                if (canMoveLeft && currentStageIndex > 0) {
                  const targetStage = stages[currentStageIndex - 1];
                  onMove(customer.id, targetStage.id);
                }
              });
            }}
            title="Move left"
          >
            ←
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            disabled={!canMoveRight}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              handleButtonClick(e, () => {
                if (canMoveRight && currentStageIndex >= 0 && currentStageIndex < stages.length - 1) {
                  const targetStage = stages[currentStageIndex + 1];
                  onMove(customer.id, targetStage.id);
                }
              });
            }}
            title="Move right"
          >
            →
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => handleButtonClick(e, () => onDelete(customer.id))}
          >
            Delete
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

function PipelineColumn({ stage, customers, stages, onEdit, onMove, onDelete }) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id.toString()
  });

  return (
    <div
      ref={setNodeRef}
      className="pipeline-column"
      style={{
        minWidth: '280px',
        backgroundColor: isOver ? '#e9ecef' : '#f8f9fa',
        borderRadius: '8px',
        padding: '1rem',
        margin: '0 0.5rem',
        minHeight: '400px',
        border: isOver ? '2px dashed #007bff' : '1px solid #dee2e6'
      }}
    >
      <h5 className="mb-3 text-center">{stage.section_name}</h5>
      <SortableContext items={customers.map(c => c.id)} strategy={verticalListSortingStrategy}>
        {customers.map(customer => (
          <CustomerCard
            key={customer.id}
            customer={customer}
            stages={stages}
            onEdit={onEdit}
            onMove={onMove}
            onDelete={onDelete}
          />
        ))}
      </SortableContext>
      {customers.length === 0 && (
        <div className="text-center text-muted py-4">
          <small>No customers</small>
        </div>
      )}
    </div>
  );
}

function CustomerPipeline() {
  const [customers, setCustomers] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    contact_info: '',
    pipeline_id: null
  });

  const [editForm, setEditForm] = useState({
    name: '',
    contact_info: '',
    notes: ''
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [customersRes, stagesRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/customers/pipeline')
      ]);

      const customersData = await customersRes.json();
      const stagesData = await stagesRes.json();

      if (customersData.success && stagesData.success) {
        setCustomers(customersData.customers);
        setStages(stagesData.stages);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error loading pipeline data');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) {
      return;
    }

    const customer = customers.find(c => c.id === active.id);
    if (!customer) return;

    // Check if dropped on a stage (column)
    const targetStage = stages.find(s => s.id.toString() === over.id.toString());
    if (targetStage) {
      // Only move if it's a different stage
      if (customer.pipeline_id !== targetStage.id) {
        await moveCustomer(customer.id, targetStage.id);
      }
      return;
    }

    // Check if dropped on another customer (reorder within same stage)
    const targetCustomer = customers.find(c => c.id === over.id);
    if (targetCustomer && customer.pipeline_id === targetCustomer.pipeline_id) {
      // Same stage, no need to move
      return;
    }
  };

  const moveCustomer = async (customerId, pipelineId) => {
    try {
      // Ensure pipelineId is a number
      const targetPipelineId = typeof pipelineId === 'string' ? parseInt(pipelineId) : pipelineId;
      
      const response = await fetch(`/api/customers/${customerId}/pipeline`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ pipeline_id: targetPipelineId })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setSuccess('Customer moved successfully');
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Error moving customer');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error moving customer:', error);
      setError('An error occurred while moving the customer');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    if (!newCustomer.name) {
      setError('Name is required');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newCustomer.name,
          contact_info: newCustomer.contact_info,
          pipeline_id: newCustomer.pipeline_id || stages[0]?.id || null
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setSuccess('Customer added successfully');
        setNewCustomer({ name: '', contact_info: '', pipeline_id: null });
        setShowAddModal(false);
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Error adding customer');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      setError('An error occurred while adding the customer');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleEditClick = (customer) => {
    setEditingCustomer(customer);
    setEditForm({
      name: customer.name || '',
      contact_info: customer.contact_info || '',
      notes: customer.notes || ''
    });
    setShowEditModal(true);
    setError('');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.name) {
      setError('Name is required');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      const response = await fetch(`/api/customers/${editingCustomer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setSuccess('Customer updated successfully');
        setShowEditModal(false);
        setEditingCustomer(null);
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Error updating customer');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      setError('An error occurred while updating the customer');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (customerId) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) {
      return;
    }

    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setSuccess('Customer deleted successfully');
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Error deleting customer');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      setError('An error occurred while deleting the customer');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getCustomersForStage = (stageId) => {
    return customers.filter(c => c.pipeline_id === stageId);
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

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Customer Pipeline</h2>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          Add Customer
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="d-flex overflow-auto pb-3" style={{ minHeight: '500px' }}>
          {stages.map(stage => (
            <PipelineColumn
              key={stage.id}
              stage={stage}
              customers={getCustomersForStage(stage.id)}
              stages={stages}
              onEdit={handleEditClick}
              onMove={moveCustomer}
              onDelete={handleDelete}
            />
          ))}
        </div>
        <DragOverlay>
          {activeId ? (
            <Card className="shadow-lg" style={{ width: '250px', opacity: 0.8 }}>
              <Card.Body>
                <Card.Title className="h6">
                  {customers.find(c => c.id === activeId)?.name || 'Customer'}
                </Card.Title>
              </Card.Body>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Add Customer Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Customer</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddCustomer}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Name *</Form.Label>
              <Form.Control
                type="text"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contact Info</Form.Label>
              <Form.Control
                type="text"
                value={newCustomer.contact_info}
                onChange={(e) => setNewCustomer({ ...newCustomer, contact_info: e.target.value })}
                placeholder="Email, phone, etc."
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Initial Stage</Form.Label>
              <Form.Select
                value={newCustomer.pipeline_id || stages[0]?.id || ''}
                onChange={(e) => setNewCustomer({ ...newCustomer, pipeline_id: parseInt(e.target.value) || null })}
              >
                {stages.map(stage => (
                  <option key={stage.id} value={stage.id}>{stage.section_name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Add Customer
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Customer Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Customer</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveEdit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Name *</Form.Label>
              <Form.Control
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contact Info</Form.Label>
              <Form.Control
                type="text"
                value={editForm.contact_info}
                onChange={(e) => setEditForm({ ...editForm, contact_info: e.target.value })}
                placeholder="Email, phone, etc."
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="Add notes about the customer and their order..."
              />
            </Form.Group>
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
    </Container>
  );
}

export default CustomerPipeline;
