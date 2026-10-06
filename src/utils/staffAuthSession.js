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
    // Optional check: sessions older than 18 hours auto-expire
    if (session && session.loginTime) {
      const loginMs = new Date(session.loginTime).getTime();
      const ageHours = (Date.now() - loginMs) / (1000 * 60 * 60);
      if (ageHours > 18) {
        localStorage.removeItem(`hei_staff_session_${portal}`);
        return null;
      }
    }
    return session;
  } catch (e) {
    return null;
  }
}

export function saveStaffSession(portal, session) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`hei_staff_session_${portal}`, JSON.stringify(session));
  } catch (e) {
    console.warn('Error saving staff session:', e);
  }
}

export async function endStaffShiftSession(portal, session) {
  if (!session) return;
  try {
    // Notify Cloudflare D1 immediately
    await fetch('/api/staff-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'logout',
        sessionId: session.sessionId,
        staffId: session.staffId
      })
    }).catch(err => {
      // Fallback via /api/sync
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'staff_logout',
          payload: { sessionId: session.sessionId, staffId: session.staffId }
        })
      }).catch(() => {});
    });
  } catch (e) {
    console.warn('Shift logout sync error:', e);
  } finally {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`hei_staff_session_${portal}`);
    }
  }
}
