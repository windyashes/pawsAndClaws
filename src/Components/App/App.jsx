import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from '../Header/header';
import About from '../About/about';
import AdminPage from '../Admin/adminPage';
import useAuthStore from '../../store/authStore';
import PremadeList from '../Available/premade-list';
import Customs from '../Customs/customs';
import SocialFeed from '../Social Feed/socialFeed';
import Portfolio from '../Previous Works/portfolio';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div>
      <Header/>
      {isAuthenticated ? <AdminPage /> : (
        <>
          <PremadeList/>
          <Customs/>
          <About/>
          <SocialFeed/>
          <Portfolio/>
        </>
      )}
    </div>
  );
}

export default App;