import React, { useState } from 'react';
import { Search, Building, Check, X } from 'lucide-react';

export const IDS_COMPANY_DIRECTORY = [
  { code: 'COM0001', name: 'Balmer Lawrie & Co Ltd.', blackListed: 'No', status: 'Active', area: 'Noida', city: 'Delhi', country: 'IN' },
  { code: 'COM0002', name: 'KPMG', blackListed: 'No', status: 'Active', area: 'Gurgaon', city: 'Gurgaon', country: 'IN' },
  { code: 'COM0003', name: 'Varun Beverages Ltd (Mr. Arobin Das)', blackListed: 'No', status: 'Active', area: 'Rani (Palgaon)', city: 'Guwahati', country: 'IN' },
  { code: 'COM0004', name: 'R D AUTOMOBILE', blackListed: 'No', status: 'Active', area: 'DIBRUGARH', city: 'DIBRUGARH', country: 'IN' },
  { code: 'COM0005', name: 'RELIANCE BP MOBILITY LIMITED', blackListed: 'No', status: 'Active', area: 'GUWAHATI', city: 'Guwahati', country: 'IN' },
  { code: 'COM0006', name: 'M/S. ALKEM LABS. LTD.', blackListed: 'No', status: 'Active', area: 'KAMRUP METROPOL', city: 'Guwahati', country: 'IN' },
  { code: 'COM0007', name: 'Mahindra & Mahindra Limited', blackListed: 'No', status: 'Active', area: 'Guwahati', city: 'Guwahati', country: 'IN' },
  { code: 'COM0008', name: 'Sarovar Hotels & Resorts', blackListed: 'No', status: 'Active', area: 'Central', city: 'Mumbai', country: 'IN' },
  { code: 'COM0009', name: 'QUALITY PHARMA PRODUCTS', blackListed: 'No', status: 'Active', area: 'Industrial Area', city: 'Guwahati', country: 'IN' }
];

export default function IdsCompanyProfileModal({ 
  isOpen, 
  onClose, 
  onSelectCompany 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(IDS_COMPANY_DIRECTORY[6]); // Mahindra default

  if (!isOpen) return null;

  const filteredCompanies = IDS_COMPANY_DIRECTORY.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = () => {
    if (selectedCompany && onSelectCompany) {
      onSelectCompany(selectedCompany);
      onClose();
    }
  };

  return (
    <div className="ids-modal-overlay">
      <div className="ids-dialog-window" style={{ width: '740px', maxWidth: '98vw' }}>
        {/* Title bar */}
        <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700 }}>Company Profile V6.5.002.1</span>
          <button className="ids-win-btn close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '12px 14px' }}>
          {/* Search Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ fontWeight: 600 }}>Name</span>
            <input 
              className="ids-input" 
              style={{ width: '220px' }} 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              placeholder="Search company..."
            />
            <button className="ids-btn-classic" style={{ fontSize: '10px' }}>Company Profile</button>
          </div>

          {/* Table Grid (Frame 006 of Video 3) */}
          <div style={{ height: '240px', overflowY: 'auto', border: '1px solid #716F64', background: '#FFF' }}>
            <table className="ids-grid-table">
              <thead>
                <tr>
                  <th style={{ width: '75px' }}>Company Code</th>
                  <th>Name</th>
                  <th style={{ width: '75px' }}>Black Listed</th>
                  <th style={{ width: '55px' }}>Status</th>
                  <th style={{ width: '110px' }}>Area</th>
                  <th style={{ width: '90px' }}>City</th>
                  <th style={{ width: '50px' }}>Country</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map((c) => {
                  const isSelected = selectedCompany?.code === c.code;
                  return (
                    <tr 
                      key={c.code}
                      onClick={() => setSelectedCompany(c)}
                      onDoubleClick={handleSelect}
                      style={{ 
                        background: isSelected ? '#316AC5' : 'transparent',
                        color: isSelected ? '#FFFFFF' : '#000000',
                        cursor: 'pointer'
                      }}
                    >
                      <td style={{ fontWeight: 700 }}>{c.code}</td>
                      <td style={{ fontWeight: 600 }}>{c.name}</td>
                      <td>{c.blackListed}</td>
                      <td>{c.status}</td>
                      <td>{c.area}</td>
                      <td>{c.city}</td>
                      <td>{c.country}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Action Buttons Row */}
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button className="ids-btn-classic">Next</button>
            <button className="ids-btn-classic" style={{ fontWeight: 700, color: '#0A246A' }} onClick={handleSelect}>
              Select
            </button>
            <button className="ids-btn-classic" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
