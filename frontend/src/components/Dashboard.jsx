import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PassportList from './PassportList';
import { Search } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';
const STATUSES = ['All', 'Received', 'Submitted to AVA', 'Collected from AVA', 'In Transit', 'Out for Delivery', 'Delivered'];

function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    in_transit: 0,
    delivered: 0,
    pending: 0
  });
  
  // Dashboard List
  const [recentPassports, setRecentPassports] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchRecent();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/dashboard/stats`);
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  const fetchRecent = async () => {
    try {
      const res = await axios.get(`${API_BASE}/passports`);
      setRecentPassports(res.data);
    } catch (err) {
      console.error('Failed to fetch passports', err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    setIsSearchModalOpen(true);
    
    try {
      const res = await axios.get(`${API_BASE}/passports/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error('Search failed', err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleStatusUpdate = () => {
    fetchStats();
    fetchRecent();
    
    // refresh search if open
    if (isSearchModalOpen && searchQuery) {
      handleSearch({preventDefault: () => {}});
    }
  };

  const filteredPassports = filterStatus === 'All' 
    ? recentPassports 
    : recentPassports.filter(p => p.status === filterStatus);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1>Dashboard Overview</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track and manage your visa processing workflows.</p>
        </div>
        
        {/* Search Bar inside Dashboard */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', width: '350px' }}>
          <input 
            type="text" 
            placeholder="Search Order ID, Name, Passport No..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            style={{ width: '100%', maxWidth: 'none' }}
          />
          <button type="submit" className="btn" style={{ padding: '0.75rem' }}>
            <Search size={18} />
          </button>
        </form>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-title">Total Passports</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">New (Received)</span>
          <span className="stat-value" style={{color: '#4299e1'}}>{stats.pending}</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">In Progress</span>
          <span className="stat-value" style={{color: '#9f7aea'}}>{stats.in_transit}</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Delivered</span>
          <span className="stat-value" style={{color: '#48bb78'}}>{stats.delivered}</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', marginTop: '2rem' }}>
        <h2>Passport Records</h2>
        
        {/* Filter Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Filter Status:</span>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-control"
            style={{ width: 'auto', minWidth: '180px' }}
          >
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      
      <PassportList passports={filteredPassports} onUpdate={handleStatusUpdate} />

      {/* Search Results Modal */}
      {isSearchModalOpen && (
        <div className="modal-overlay" onClick={() => setIsSearchModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsSearchModalOpen(false)}>&times;</button>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Search size={22} color="var(--primary)" /> 
              Search Results for "{searchQuery}"
            </h2>
            
            {searchLoading ? (
              <p>Searching...</p>
            ) : searchResults.length > 0 ? (
              <PassportList passports={searchResults} onUpdate={handleStatusUpdate} />
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>No passports found matching your criteria.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
