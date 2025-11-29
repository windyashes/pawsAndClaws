// description of the company and it's founders. include photos.
import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function About() {
  return (
    <Container className="my-5">
      <Row className="g-4">
        {/* Image Section */}
        <Col xs={12} md={6}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex align-items-center justify-content-center" style={{ minHeight: '400px', backgroundColor: '#f8f9fa' }}>
              <div className="text-center text-muted">
                <svg 
                  width="150" 
                  height="150" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1" 
                  className="mb-3"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <p className="mb-0">Placeholder Image</p>
                <small>Add company/founder photos here</small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Text Area Section */}
        <Col xs={12} md={6}>
          <Card className="h-100 shadow-sm">
            <Card.Header>
              <h2 className="mb-0">About Paws & Claws</h2>
            </Card.Header>
            <Card.Body>
              { <p
                style={{ 
                  resize: 'vertical',
                  minHeight: '350px',
                  fontSize: '1rem',
                  lineHeight: '1.6'
                }}
                >
                  Ashlyn and Laney founded Paws & Claws fursuit co. after they found a passion for fursuit making in 2025.
                </p> }
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default About;