import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import ProofUploader from './ProofUploader';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const STATUSES = ['Received', 'Submitted to AVA', 'Collected from AVA', 'In Transit', 'Out for Delivery', 'Delivered'];

function EditPassport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [passports, setPassports] = useState([]);
  const [initialStatus, setInitialStatus] = useState('Received');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPassport();
  }, [id]);

  const fetchPassport = async () => {
    try {
      const res = await axios.get(`${API_BASE}/passports/${id}`);
      const data = res.data;
      Object.keys(data).forEach(key => {
        if (data[key] === null) data[key] = '';
      });
      setFormData(data);
      setPassports(data.passports || []);
      setInitialStatus(data.status);
    } catch (err) {
      setError('Failed to fetch passport details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleProofChange = (field, currentVal) => {
    setFormData({...formData, [field]: currentVal});
  };

  const handlePassportChange = (index, field, value) => {
    const newPassports = [...passports];
    newPassports[index][field] = value;
    setPassports(newPassports);
  };

  const validateFields = () => {
    const targetIdx = STATUSES.indexOf(formData.status);
    
    if (targetIdx >= 1) {
      if (!formData.ava_name_location || !formData.submission_date) {
        alert("Please fill 'AVA Name & Location' and 'Submission Date' before advancing strictly to Submitted to AVA.");
        return false;
      }
    }
    
    if (targetIdx >= 2) {
      if (!formData.passport_collected_from_ava_by || !formData.collection_date) {
        alert("Please fill 'Collected From AVA By' and 'Collection Date' before advancing to Collected from AVA.");
        return false;
      }
    }
    
    if (targetIdx >= 3) {
      if (!formData.delivery_mode) {
        alert("Please fill 'Delivery Mode' before advancing to In Transit or later.");
        return false;
      }
    }
    if (targetIdx === 5) {
      if (!formData.passport_delivered_date) {
        alert("Please fill 'Passport Delivered Date' to mark as Delivered.");
        return false;
      }
    }

    if (passports.length === 0) {
      alert("Please add at least one passport to this order.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const currentIdx = STATUSES.indexOf(initialStatus);
    const targetIdx = STATUSES.indexOf(formData.status);
    
    if (targetIdx > currentIdx + 1) {
      alert(`Cannot jump form status '${initialStatus}' directly to '${formData.status}'. You must update step-by-step.`);
      return;
    }

    if (!validateFields()) {
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        passports: passports
      };
      await axios.put(`${API_BASE}/passports/${id}`, payload);
      alert('Order tracking updated successfully!');
      navigate('/');
    } catch (err) {
      alert('Failed to update: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{color: 'red'}}>{error}</div>;

  const currentIdx = STATUSES.indexOf(initialStatus);
  const allowedStatuses = STATUSES.slice(0, currentIdx + 2);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Update Order Tracking: {formData.order_id || 'Unnamed Order'}</h1>
        <div>
          <label style={{ marginRight: '1rem', fontWeight: 600 }}>Current Stage / Status:</label>
          <select 
            name="status" 
            value={formData.status} 
            onChange={handleChange} 
            className="form-control" 
            style={{ width: 'auto', display: 'inline-block', fontWeight: 600, color: 'var(--primary)', borderColor: 'var(--primary)' }}
          >
            {allowedStatuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        <em>Note: You can only advance the status by exactly <strong>one step</strong> at a time after completing the stage fields.</em>
      </p>

      <form onSubmit={handleSubmit}>
        
        {/* GROUP 1 */}
        <div className="form-card" style={{ marginBottom: '2rem', maxWidth: 'none', borderLeft: initialStatus === 'Received' ? '4px solid var(--primary)' : 'none' }}>
          <h2>1. Order Received Data</h2>
          
          <div className="form-group"><label>Order ID *</label><input type="text" name="order_id" value={formData.order_id} onChange={handleChange} className="form-control" required /></div>
          
          {/* Multiple Passports Section */}
          <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', background: 'var(--background)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Passports Included</h3>
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
                  <label>Holder Name *</label>
                  <input 
                    type="text" 
                    value={p.applicant_name} 
                    onChange={(e) => handlePassportChange(idx, 'applicant_name', e.target.value)} 
                    className="form-control" 
                    required 
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)', gap: '1rem' }}>
            <div className="form-group"><label>Received Date</label><input type="date" name="received_date" value={formData.received_date} onChange={handleChange} className="form-control" /></div>
            <div className="form-group"><label>Received Mode</label><input type="text" name="received_mode" value={formData.received_mode} onChange={handleChange} className="form-control" /></div>
            <div className="form-group"><label>Received By</label><input type="text" name="received_by" value={formData.received_by} onChange={handleChange} className="form-control" /></div>
            <ProofUploader label="Receiving Proof" value={formData.receiving_proof} onChange={(val) => handleProofChange('receiving_proof', val)} />
          </div>
        </div>

        {/* GROUP 2 */}
        {currentIdx >= 0 && (
          <div className="form-card" style={{ marginBottom: '2rem', maxWidth: 'none', borderLeft: initialStatus === 'Submitted to AVA' ? '4px solid var(--primary)' : 'none' }}>
            <h2>2. AVA Submission Data</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)', gap: '1rem' }}>
              <div className="form-group"><label>AVA Name & Location *</label><input type="text" name="ava_name_location" value={formData.ava_name_location} onChange={handleChange} className="form-control" /></div>
              <div className="form-group"><label>Submission Date *</label><input type="date" name="submission_date" value={formData.submission_date} onChange={handleChange} className="form-control" /></div>
              <div className="form-group"><label>Submitted to AVA By</label><input type="text" name="submitted_to_ava_by" value={formData.submitted_to_ava_by} onChange={handleChange} className="form-control" /></div>
              <div className="form-group"><label>AVA Received By</label><input type="text" name="ava_received_by" value={formData.ava_received_by} onChange={handleChange} className="form-control" /></div>
              <div className="form-group"><label>CNR Number</label><input type="text" name="cnr_number" value={formData.cnr_number} onChange={handleChange} className="form-control" /></div>
              <ProofUploader label="AVA Receiving Proof" value={formData.ava_receiving_proof} onChange={(val) => handleProofChange('ava_receiving_proof', val)} />
            </div>
          </div>
        )}

        {/* GROUP 3 */}
        {currentIdx >= 1 && (
          <div className="form-card" style={{ marginBottom: '2rem', maxWidth: 'none', borderLeft: initialStatus === 'Collected from AVA' ? '4px solid var(--primary)' : 'none' }}>
            <h2>3. Passport Collection Data</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group"><label>Collected From AVA By *</label><input type="text" name="passport_collected_from_ava_by" value={formData.passport_collected_from_ava_by} onChange={handleChange} className="form-control" /></div>
              <div className="form-group"><label>Collection Date *</label><input type="date" name="collection_date" value={formData.collection_date} onChange={handleChange} className="form-control" /></div>
            </div>
          </div>
        )}

        {/* GROUP 4 */}
        {currentIdx >= 2 && (
          <div className="form-card" style={{ marginBottom: '2rem', maxWidth: 'none', borderLeft: ['In Transit', 'Out for Delivery'].includes(initialStatus) ? '4px solid var(--primary)' : 'none' }}>
            <h2>4. Delivery to Customer/CA (In Transit & Delivery)</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group"><label>Delivery Mode *</label><input type="text" name="delivery_mode" value={formData.delivery_mode} onChange={handleChange} className="form-control" /></div>
              <div className="form-group"><label>Delivery Tracking ID</label><input type="text" name="delivery_tracking_id" value={formData.delivery_tracking_id} onChange={handleChange} className="form-control" /></div>
              <div className="form-group"><label>Passport Delivered Date</label><input type="date" name="passport_delivered_date" value={formData.passport_delivered_date} onChange={handleChange} className="form-control" /></div>
              <ProofUploader label="Delivery Proof" value={formData.delivery_proof} onChange={(val) => handleProofChange('delivery_proof', val)} />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginBottom: '3rem' }}>
          <button type="button" onClick={() => navigate(-1)} className="btn" style={{ background: 'var(--border)', color: 'var(--text-primary)' }}>Cancel</button>
          <button type="submit" className="btn" disabled={saving}>{saving ? 'Saving...' : 'Save Workflow Changes'}</button>
        </div>

      </form>
    </div>
  );
}

export default EditPassport;
