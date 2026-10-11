import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, ShieldAlert, Wifi, Smartphone, 
  MapPin, RefreshCw, AlertTriangle, Key, CheckCircle2 
} from 'lucide-react';
import { 
  verifyHotelGeofence, 
  watchNetworkTransitionGeofence, 
  HOTEL_GEOFENCE_CONFIG 
} from '../utils/geofenceSecurity';
import { getShiftRemainingTime } from '../utils/staffAuthSession';

export default function GeofenceSecurityBanner({ portal = 'steward', onGeofenceStatusChange }) {
  const [geofenceStatus, setGeofenceStatus] = useState({
    checked: false,
    isInside: true,
    distanceMeters: null,
    error: null,
    networkType: 'wifi'
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overridePin, setOverridePin] = useState('');
  const [overrideError, setOverrideError] = useState('');
  const [shiftTime, setShiftTime] = useState(() => getShiftRemainingTime(portal));

  // Run initial check and set up network switch watcher
  useEffect(() => {
    runGeofenceVerification();

    // Listen to network transitions between Wi-Fi and Cellular mobile data
    const unwatch = watchNetworkTransitionGeofence((result) => {
      setGeofenceStatus({
        checked: true,
        isInside: result.isInside,
        distanceMeters: result.distanceMeters,
        error: result.error,
        networkType: result.networkType || 'cellular'
      });
      if (onGeofenceStatusChange) {
        onGeofenceStatusChange(result);
      }
    });

    // Update shift remaining countdown every minute
    const timer = setInterval(() => {
      setShiftTime(getShiftRemainingTime(portal));
    }, 60000);

    return () => {
      unwatch();
      clearInterval(timer);
    };
  }, [portal]);

  const runGeofenceVerification = async () => {
    setIsVerifying(true);
    const conn = typeof navigator !== 'undefined' ? navigator.connection : null;
    const currentNet = conn ? (conn.type || conn.effectiveType || 'wifi') : 'wifi';

    const result = await verifyHotelGeofence();
    setGeofenceStatus({
      checked: true,
      isInside: result.isInside,
      distanceMeters: result.distanceMeters,
      error: result.error,
      networkType: currentNet
    });
    setIsVerifying(false);

    if (onGeofenceStatusChange) {
      onGeofenceStatusChange(result);
    }
  };

  const handleApplyOverride = () => {
    if (overridePin === '4321' || overridePin === '7650') {
      localStorage.setItem('hei_geofence_bypass', 'true');
      setShowOverrideModal(false);
      setOverridePin('');
      setOverrideError('');
      runGeofenceVerification();
    } else {
      setOverrideError('Invalid Manager Security PIN');
    }
  };

  const isWifi = geofenceStatus.networkType?.toLowerCase().includes('wifi');

  return (
    <>
      <div 
        style={{
          background: geofenceStatus.isInside 
            ? 'linear-gradient(90deg, #064E3B 0%, #065F46 100%)' 
            : 'linear-gradient(90deg, #7F1D1D 0%, #991B1B 100%)',
          color: '#FFFFFF',
          padding: '6px 12px',
          fontSize: '11.5px',
          fontFamily: 'Inter, system-ui, sans-serif',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: geofenceStatus.isInside ? '1px solid #10B981' : '1px solid #EF4444',
          boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
          zIndex: 100
        }}
      >
        {/* Left: Security Status & Network */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {geofenceStatus.isInside ? (
            <ShieldCheck size={15} color="#34D399" />
          ) : (
            <ShieldAlert size={15} color="#F87171" />
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 600 }}>
              {geofenceStatus.isInside ? 'SECURITY: ON-PREMISES' : 'SECURITY ALERT: OUTSIDE BOUNDARY'}
            </span>
            <span style={{ opacity: 0.7 }}>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.9 }}>
              {isWifi ? <Wifi size={12} /> : <Smartphone size={12} />}
              {isWifi ? 'Hotel Wi-Fi' : 'Mobile Data (Geofence)'}
            </span>
            {geofenceStatus.distanceMeters !== null && (
              <span style={{ opacity: 0.85, fontSize: '11px' }}>
                ({geofenceStatus.distanceMeters}m from property)
              </span>
            )}
          </div>
        </div>

        {/* Right: Shift Countdown & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {shiftTime && (
            <span style={{ background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: '4px', fontSize: '10.5px' }}>
              ⏱️ Shift: {shiftTime.formatted}
            </span>
          )}

          <button
            onClick={runGeofenceVerification}
            disabled={isVerifying}
            title="Re-verify Location & Network"
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '4px',
              color: '#FFF',
              padding: '3px 8px',
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <RefreshCw size={11} className={isVerifying ? 'animate-spin' : ''} />
            <span>{isVerifying ? 'Verifying...' : 'Check'}</span>
          </button>

          {!geofenceStatus.isInside && (
            <button
              onClick={() => setShowOverrideModal(true)}
              style={{
                background: '#F59E0B',
                color: '#000',
                fontWeight: 700,
                border: 'none',
                borderRadius: '4px',
                padding: '3px 8px',
                fontSize: '10.5px',
                cursor: 'pointer'
              }}
            >
              Manager PIN
            </button>
          )}
        </div>
      </div>

      {/* Geofence Security Restriction Modal if Outside Boundary */}
      {!geofenceStatus.isInside && geofenceStatus.checked && !showOverrideModal && (
        <div 
          style={{
            background: '#FEF2F2',
            borderBottom: '2px solid #DC2626',
            color: '#991B1B',
            padding: '8px 12px',
            fontSize: '11.5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} color="#DC2626" />
            <span>
              <strong>Perimeter Restriction:</strong> {geofenceStatus.error || 'You must be within 250m of Hotel Elite Inn to operate this staff terminal.'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button 
              onClick={runGeofenceVerification}
              style={{ background: '#DC2626', color: '#FFF', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}
            >
              Retry GPS
            </button>
            <button 
              onClick={() => setShowOverrideModal(true)}
              style={{ background: '#E5E7EB', color: '#374151', border: '1px solid #D1D5DB', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
            >
              Manager Override
            </button>
          </div>
        </div>
      )}

      {/* Manager Override Modal */}
      {showOverrideModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#FFF',
            borderRadius: '8px',
            maxWidth: '360px',
            width: '100%',
            padding: '20px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0A246A', marginBottom: '12px' }}>
              <Key size={20} />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Manager Security Override</h3>
            </div>
            <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 14px' }}>
              Enter Hotel Elite Inn Manager PIN to grant off-premises or weak indoor GPS access for this terminal:
            </p>
            <input
              type="password"
              placeholder="Enter 4-Digit PIN"
              maxLength={6}
              value={overridePin}
              onChange={(e) => setOverridePin(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                boxSizing: 'border-box',
                letterSpacing: '4px',
                textAlign: 'center',
                marginBottom: '8px'
              }}
            />
            {overrideError && (
              <div style={{ color: '#DC2626', fontSize: '11px', marginBottom: '8px', textAlign: 'center' }}>
                {overrideError}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
              <button
                onClick={() => { setShowOverrideModal(false); setOverrideError(''); }}
                style={{ padding: '6px 12px', background: '#F3F4F6', border: '1px solid #D1D5DB', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleApplyOverride}
                style={{ padding: '6px 14px', background: '#0A246A', color: '#FFF', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
              >
                Authorize
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
