//header component
// this should be a header with the company name and a navigation bar with links to the other sections as well as an admin login.
import React, { useState } from 'react';
import { Navbar, Nav, Container, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from '../Admin/Login/login';
import useAuthStore from '../../store/authStore';

function Header() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const handleLoginClick = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      logout();
    } else {
      setShowLoginModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
  };

  return (
    <>
      <Navbar bg="light" expand="lg" sticky="top" className="shadow-sm">
        <Container>
          <Navbar.Brand href="/">
            <strong>Paws & Claws</strong>
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="/">Home</Nav.Link>
              <Nav.Link href="/about">About</Nav.Link>
              <Nav.Link href="/portfolio">Portfolio</Nav.Link>
              <Nav.Link href="/customs">Customs</Nav.Link>
              <Nav.Link href="/social">Social Feed</Nav.Link>
            </Nav>
            <Nav>
              <Nav.Link onClick={handleLoginClick}>
                {isAuthenticated ? 'Logout' : 'Admin Login'}
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Modal show={showLoginModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Admin Login</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Login onClose={handleCloseModal} />
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Header;