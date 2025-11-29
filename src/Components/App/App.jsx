import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from '../Header/header';
import About from '../About/about';
import AdminPage from '../Admin/adminPage';
import useAuthStore from '../../store/authStore';
import PremadeList from '../Available/premade-list';
import Customs from '../Customs/customs';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div>
      <Header />
      {isAuthenticated ? <AdminPage /> : (
        <>
          <About />
          <PremadeList />
          <Customs />
        </>
      )}
    </div>
  );
}

export default App;