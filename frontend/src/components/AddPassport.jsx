import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ProofUploader from './ProofUploader';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AddPassport() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    order_id: '',
    received_date: new Date().toISOString().split('T')[0],
    received_mode: '',
    received_by: '',
    receiving_proof: '',
  });

  const [passports, setPassports] = useState([
    { passport_number: '', applicant_name: '' }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleProofChange = (url) => {
    setFormData({...formData, receiving_proof: url});
  };

  const handlePassportChange = (index, field, value) => {
    const newPassports = [...passports];
    newPassports[index][field] = value;
    setPassports(newPassports);
  };

  const addPassportRow = () => {
    setPassports([...passports, { passport_number: '', applicant_name: '' }]);
  };

  const removePassportRow = (index) => {
    const newPassports = [...passports];
    newPassports.splice(index, 1);
    setPassports(newPassports);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        passports: passports
      };
      await axios.post(`${API_BASE}/passports`, payload);
      alert('Order Tracking initialized successfully!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Receive New Order</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Enter the initial details upon receiving passports under an Order ID.
      </p>

      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

      <form onSubmit={handleSubmit} className="form-card">
        
        <div className="form-group" style={{ marginBottom: '2rem' }}>
          <label>Order ID *</label>
          <input type="text" name="order_id" value={formData.order_id} onChange={handleChange} className="form-control" placeholder="e.g. SMV-CHN-1234" required />
        </div>

        <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>Passports Included</h3>
            <button type="button" onClick={addPassportRow} className="btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>
              + Add Another Passport
            </button>
          </div>

          {passports.map((p, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '1rem' }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label>Passport Number *</label>
                <input 
                  type="text" 
                  value={p.passport_number} 
                  onChange={(e) => handlePassportChange(idx, 'passport_number', e.target.value)} 
                  className="form-control" 
                  required 
                />
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label>Passport Holder Name *</label>
                <input 
                  type="text" 
                  value={p.applicant_name} 
                  onChange={(e) => handlePassportChange(idx, 'applicant_name', e.target.value)} 
                  className="form-control" 
                  required 
                />
              </div>
              {passports.length > 1 && (
                <button type="button" onClick={() => removePassportRow(idx)} className="btn" style={{ background: '#fc8181', padding: '0.6rem 1rem' }}>
                  X
                </button>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label>Received Date</label>
            <input type="date" name="received_date" value={formData.received_date} onChange={handleChange} className="form-control" />
          </div>
          <div className="form-group">
            <label>Received Mode</label>
            <input type="text" name="received_mode" value={formData.received_mode} onChange={handleChange} className="form-control" placeholder="e.g. Courier, In-Person" />
          </div>
          <div className="form-group">
            <label>Received By</label>
            <input type="text" name="received_by" value={formData.received_by} onChange={handleChange} className="form-control" />
          </div>
        </div>
        
        <ProofUploader 
          label="Receiving Proof" 
          value={formData.receiving_proof} 
          onChange={handleProofChange} 
        />
        
        <button type="submit" className="btn" disabled={loading} style={{width: '100%', marginTop: '1rem'}}>
          {loading ? 'Submitting...' : 'Mark as Received'}
        </button>
      </form>
    </div>
  );
}

export default AddPassport;
