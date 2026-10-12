// Hotel Elite Inn - Staff Auth & Shift Session Utility

export const PORTAL_NAMES = {
  steward: {
    title: 'Cannon Kitchen Steward Pad',
    icon: '🍽️',
    roleTag: 'STEWARD',
    badge: 'F&B Floor Service'
  },
  kds: {
    title: 'Kitchen Display System (KDS)',
    icon: '👨‍🍳',
    roleTag: 'KITCHEN_KDS',
    badge: 'Cannon Kitchen Production'
  },
  housekeeping: {
    title: 'Housekeeping Operations Portal',
    icon: '🧹',
    roleTag: 'HOUSEKEEPING',
    badge: 'Rooms & Linen Care'
  }
};

// Exact 8-Hour Shift Window for Staff Authentication (Security Policy)
export const SHIFT_WINDOW_HOURS = 8;

export function getCurrentShiftByTime() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 14) return 'Morning';
  if (hour >= 14 && hour < 22) return 'Evening';
  return 'Night';
}

export function getStaffSession(portal = 'steward') {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`hei_staff_session_${portal}`);
    if (!raw) return null;
    const session = JSON.parse(raw);
    
    // Strict 8-hour shift token invalidation: staff must log in again with PIN next day
    if (session && session.loginTime) {
      const loginMs = new Date(session.loginTime).getTime();
      const ageHours = (Date.now() - loginMs) / (1000 * 60 * 60);
      if (ageHours >= SHIFT_WINDOW_HOURS) {
        localStorage.removeItem(`hei_staff_session_${portal}`);
        localStorage.removeItem(`hei_staff_token_${portal}`);
        return null;
      }
    }
    return session;
  } catch (e) {
    return null;
  }
}

export function getStaffJwtToken(portal = 'steward') {
  if (typeof window === 'undefined') return null;
  // If session is expired, clean token
  if (!getStaffSession(portal)) return null;
  return localStorage.getItem(`hei_staff_token_${portal}`) || null;
}

export function getShiftRemainingTime(portal = 'steward') {
  const session = getStaffSession(portal);
  if (!session || !session.loginTime) return null;
  const loginMs = new Date(session.loginTime).getTime();
  const elapsedMs = Date.now() - loginMs;
  const remainingMs = Math.max(0, (SHIFT_WINDOW_HOURS * 3600 * 1000) - elapsedMs);
  const hours = Math.floor(remainingMs / (3600 * 1000));
  const minutes = Math.floor((remainingMs % (3600 * 1000)) / (60 * 1000));
  return {
    hours,
    minutes,
    totalMinutes: Math.floor(remainingMs / (60 * 1000)),
    formatted: `${hours}h ${minutes}m remaining`
  };
}

export function saveStaffSession(portal, session, jwtToken = null) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`hei_staff_session_${portal}`, JSON.stringify(session));
    if (jwtToken) {
      localStorage.setItem(`hei_staff_token_${portal}`, jwtToken);
    }
  } catch (e) {
    console.warn('Error saving staff session:', e);
  }
}

/**
 * Logs in staff with security PIN against FastAPI backend, obtaining an 8-hour JWT
 */
export async function loginStaffViaBackend(portal, staffId, pin, staffName = '', role = '') {
  const apiUrl = 'https://hotel-elite-inn-backend-api-production-0dc9.up.railway.app';
  try {
    const res = await fetch(`${apiUrl}/api/auth/staff-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        staff_id: staffId,
        pin: pin,
        portal: portal,
        staff_name: staffName,
        role: role,
        shift: getCurrentShiftByTime()
      })
    });
    
    if (res.ok) {
      const data = await res.json();
      const sessionObj = {
        staffId: data.staff_id,
        staffName: data.staff_name,
        role: data.role,
        shift: data.shift,
        loginTime: new Date().toISOString(),
        expiresAt: data.expires_at,
        token: data.access_token
      };
      saveStaffSession(portal, sessionObj, data.access_token);
      return { success: true, session: sessionObj, token: data.access_token };
    }
  } catch (err) {
    console.warn('Backend login fallback to offline session:', err);
  }

  // Graceful offline fallback
  const fallbackSession = {
    staffId: staffId,
    staffName: staffName || `Staff ${staffId}`,
    role: role || 'STEWARD',
    shift: getCurrentShiftByTime(),
    loginTime: new Date().toISOString()
  };
  saveStaffSession(portal, fallbackSession);
  return { success: true, session: fallbackSession, token: null };
}

export async function endStaffShiftSession(portal, session) {
  if (!session) return;
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`hei_staff_session_${portal}`);
      localStorage.removeItem(`hei_staff_token_${portal}`);
    }
  } catch (e) {
    console.warn('Shift logout error:', e);
  }
}
