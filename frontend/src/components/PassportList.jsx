import React from 'react';
import { Link } from 'react-router-dom';

function PassportList({ passports, onUpdate }) {
  
  const extractCountry = (orderId) => {
    if (!orderId) return '-';
    const parts = orderId.split('-');
    if (parts.length >= 3) {
      return parts[1];
    }
    return '-';
  };

  if (!passports || passports.length === 0) {
    return <div style={{ color: 'var(--text-secondary)' }}>No orders strictly found.</div>;
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Applicant Name(s)</th>
            <th>Visa Country</th>
            <th>Passport No(s)</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {passports.map(p => {
            const passportArray = p.passports || [];
            const namesStr = passportArray.map(x => x.applicant_name).join(', ');
            const numsStr = passportArray.map(x => x.passport_number).join(', ');
            
            return (
              <tr key={p.id}>
                <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{p.order_id || '-'}</td>
                <td style={{ fontWeight: 500 }}>
                  {namesStr.length > 50 ? namesStr.substring(0, 50) + '...' : namesStr}
                  {passportArray.length > 1 && <span style={{ marginLeft: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>({passportArray.length})</span>}
                </td>
                <td>
                  <span style={{ background: '#edf2f7', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                    {extractCountry(p.order_id)}
                  </span>
                </td>
                <td style={{ fontFamily: 'monospace' }}>
                  {numsStr.length > 30 ? numsStr.substring(0, 30) + '...' : numsStr}
                </td>
                <td>
                  <span className={`status-badge status-${p.status.split(' ')[0]}`}>
                    {p.status}
                  </span>
                </td>
                <td>
                  <Link to={`/edit/${p.id}`} className="btn" style={{ padding: '0.4rem 1rem', fontSize: '0.875rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                    Update Tracking &rarr;
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default PassportList;
