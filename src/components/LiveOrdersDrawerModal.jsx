import React from 'react';
import FenugreekLiveFoodOrdersKDS from './FenugreekLiveFoodOrdersKDS';

export default function LiveOrdersDrawerModal({
  isOpen,
  onClose,
  foodOrders = [],
  onUpdateOrderStatus,
  onBillToRoom
}) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(3, 7, 18, 0.88)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        background: '#070c18',
        border: '1.5px solid rgba(212, 175, 55, 0.5)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '1260px',
        maxHeight: '94vh',
        overflow: 'hidden',
        boxShadow: '0 25px 70px rgba(0, 0, 0, 0.85)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <FenugreekLiveFoodOrdersKDS
          onBillToRoom={onBillToRoom}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
