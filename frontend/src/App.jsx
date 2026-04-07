import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Search, Plane } from 'lucide-react';
import Dashboard from './components/Dashboard';
import AddPassport from './components/AddPassport';
import EditPassport from './components/EditPassport';

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="brand">
            <Plane size={28} color="var(--primary)" />
            StampMyVisa
          </div>
          
          <nav className="nav-links">
            <NavLink to="/" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
              <LayoutDashboard size={20} />
              Dashboard
            </NavLink>
            <NavLink to="/add" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
              <PlusCircle size={20} />
              Add Passport
            </NavLink>
          </nav>
        </div>

        {/* Main Content */}
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add" element={<AddPassport />} />
            <Route path="/edit/:id" element={<EditPassport />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
