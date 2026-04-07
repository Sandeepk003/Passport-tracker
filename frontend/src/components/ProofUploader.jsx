import React, { useState, useRef } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ProofUploader({ label, value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(`${API_BASE}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onChange(res.data.url);
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
      <label>{label}</label>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <input 
          type="text" 
          value={value || ''} 
          onChange={(e) => onChange(e.target.value)} 
          className="form-control" 
          placeholder="File URL or path..."
          style={{ flex: 1 }}
        />
        <button 
          type="button" 
          onClick={() => fileInputRef.current?.click()}
          className="btn" 
          disabled={uploading}
          style={{ background: 'var(--secondary)' }}
        >
          {uploading ? 'Uploading...' : '📷 Take Photo / Upload'}
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="image/*" 
          capture="environment"
          onChange={handleFileChange}
        />
      </div>
      {/* Thumbnail view */}
      {value && value.startsWith('/api/uploads/') && (
        <div style={{ marginTop: '0.5rem' }}>
          <img 
            src={`${API_BASE.replace('/api', '')}${value}`} 
            alt="Proof Thumbnail" 
            style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }} 
          />
        </div>
      )}
    </div>
  );
}
