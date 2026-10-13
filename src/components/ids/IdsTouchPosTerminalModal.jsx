import React, { useState, useEffect, useMemo, useRef } from 'react';
import QRCode from 'qrcode';
import { HOTEL_CONFIG, RESTAURANT_MENU } from '../../data/hotelData';
import { playSuccessChime, playOrderAlert } from '../../utils/soundAlert';
import { 
  getLiveKots, saveLiveKots, broadcastKotChannel, 
  normalizeKotOrder, KOT_STORAGE_KEY, KDS_CHANNEL_NAME,
  TABLE_SESSIONS_KEY, recordKotItemVoid,
  getStandardPosTableId, getRawTableNumber, findTableSession, mergeKotIntoTableSessions
} from '../../utils/kotDataSync';
import { saveKotToDexie, saveTableSessionToDexie, settleTableSessionInDexie } from '../../db/dexieDb';
import { recordLiveRestaurantSale } from '../../utils/idsUnifiedSyncBridge';
import IdsPosDiscountModal from './IdsPosDiscountModal';
import { getStewardsList } from '../../data/hotelStaffData';
import { subscribeToLiveSync } from '../../utils/liveSyncBridge';

// Standard IDS Next Void & Cancellation Reason Codes
export const KOT_VOID_REASONS = [
  'Guest Cancelled Before Cooking',
  'Food Quality / Taste Reject',
  'Wrong Table Punched by Steward',
  'Steward / Cashier Double Entry',
  'Kitchen Stock Depleted (86 item)',
  'Table Relocated / Order Shifted',
  'Other Reason (Enter Details Below)'
];

// Touch Screen Menu Groups configured from Official Hotel Elite Inn Menu Card
const TOUCH_GROUPS = [
  { id: 'ALL', name: 'ALL ITEMS', color: '#0A246A' },
  { id: 'BEVERAGE', name: 'BEVERAGES & SHAKES', color: '#008080' },
  { id: 'BREAKFAST', name: 'BREAKFAST & DOSAS', color: '#E65100' },
  { id: 'STARTERS', name: 'KEBABS & STARTERS', color: '#2E8B57' },
  { id: 'MAIN', name: 'MAIN COURSE CURRIES', color: '#B8860B' },
  { id: 'BREADS', name: 'INDIAN BREADS & ROTI', color: '#D2691E' },
  { id: 'RICE', name: 'BASMATI RICE & BIRYANI', color: '#4A148C' },
  { id: 'CONTINENTAL', name: 'PASTA & SIZZLERS', color: '#1B5E20' },
  { id: 'DESSERTS', name: 'SWEET MEMORIES', color: '#C71585' }
];

// Touch Catalog Items configured directly from Official Hotel Elite Inn Menu Card
const TOUCH_ITEMS = [
  // Beverages & Mocktails
  { code: 'BEV-01', name: 'Tea', group: 'BEVERAGE', price: 25.00, kitchen: 'Pantry' },
  { code: 'BEV-02', name: 'Black Tea', group: 'BEVERAGE', price: 20.00, kitchen: 'Pantry' },
  { code: 'BEV-03', name: 'Lemon Tea', group: 'BEVERAGE', price: 25.00, kitchen: 'Pantry' },
  { code: 'BEV-04', name: 'Green Tea', group: 'BEVERAGE', price: 30.00, kitchen: 'Pantry' },
  { code: 'BEV-05', name: 'Coffee', group: 'BEVERAGE', price: 35.00, kitchen: 'Pantry' },
  { code: 'BEV-06', name: 'Black Coffee', group: 'BEVERAGE', price: 40.00, kitchen: 'Pantry' },
  { code: 'BEV-07', name: 'Hot & Cold Milk', group: 'BEVERAGE', price: 60.00, kitchen: 'Pantry' },
  { code: 'BEV-08', name: 'Choice of Lassi', group: 'BEVERAGE', price: 60.00, kitchen: 'Pantry' },
  { code: 'BEV-09', name: 'Cold Coffee with Ice Cream', group: 'BEVERAGE', price: 90.00, kitchen: 'Pantry' },
  { code: 'BEV-10', name: 'Butter Milk', group: 'BEVERAGE', price: 50.00, kitchen: 'Pantry' },
  { code: 'BEV-11', name: 'Fresh Lime Water / Soda', group: 'BEVERAGE', price: 40.00, kitchen: 'Pantry' },
  { code: 'MOCK-01', name: 'Pina Colada', group: 'BEVERAGE', price: 80.00, kitchen: 'Pantry' },
  { code: 'MOCK-02', name: 'Virgin Mojito', group: 'BEVERAGE', price: 100.00, kitchen: 'Pantry' },
  { code: 'MOCK-03', name: 'Blue Lagoon', group: 'BEVERAGE', price: 120.00, kitchen: 'Pantry' },
  { code: 'MOCK-04', name: 'Choice of Shake', group: 'BEVERAGE', price: 130.00, kitchen: 'Pantry' },

  // Breakfast & Dosas
  { code: 'BF-01', name: 'Special Maggi', group: 'BREAKFAST', price: 100.00, kitchen: 'Main Kitchen' },
  { code: 'BF-02', name: 'Idly with Sambhar Chutney', group: 'BREAKFAST', price: 80.00, kitchen: 'Main Kitchen' },
  { code: 'BF-03', name: 'Sambhar Vada', group: 'BREAKFAST', price: 80.00, kitchen: 'Main Kitchen' },
  { code: 'BF-04', name: 'Plain Dosa', group: 'BREAKFAST', price: 80.00, kitchen: 'Main Kitchen' },
  { code: 'BF-05', name: 'Masala Dosa', group: 'BREAKFAST', price: 100.00, kitchen: 'Main Kitchen' },
  { code: 'BF-06', name: 'Gini Dosa', group: 'BREAKFAST', price: 120.00, kitchen: 'Main Kitchen' },
  { code: 'BF-07', name: 'Mysore Masala Dosa', group: 'BREAKFAST', price: 150.00, kitchen: 'Main Kitchen' },
  { code: 'BF-08', name: 'Ghee Podi Masala Dosa', group: 'BREAKFAST', price: 150.00, kitchen: 'Main Kitchen' },
  { code: 'BF-09', name: 'Upma', group: 'BREAKFAST', price: 60.00, kitchen: 'Main Kitchen' },
  { code: 'BF-10', name: 'Uttapam', group: 'BREAKFAST', price: 80.00, kitchen: 'Main Kitchen' },
  { code: 'BF-11', name: 'Rawa Masala Dosa', group: 'BREAKFAST', price: 120.00, kitchen: 'Main Kitchen' },
  { code: 'BF-12', name: 'Special Poha', group: 'BREAKFAST', price: 120.00, kitchen: 'Main Kitchen' },
  { code: 'BF-13', name: 'Poori Bhaji', group: 'BREAKFAST', price: 140.00, kitchen: 'Main Kitchen' },
  { code: 'BF-14', name: 'Chholey Bhature', group: 'BREAKFAST', price: 100.00, kitchen: 'Main Kitchen' },
  { code: 'BF-15', name: 'Aloo Paratha with Curd', group: 'BREAKFAST', price: 110.00, kitchen: 'Main Kitchen' },
  { code: 'BF-16', name: 'Paneer Paratha with Curd', group: 'BREAKFAST', price: 150.00, kitchen: 'Main Kitchen' },
  { code: 'BF-17', name: 'Veg Grilled Sandwich', group: 'BREAKFAST', price: 100.00, kitchen: 'Main Kitchen' },
  { code: 'BF-18', name: 'Bread Omelette', group: 'BREAKFAST', price: 110.00, kitchen: 'Main Kitchen' },
  { code: 'BF-19', name: 'Chicken Sandwich', group: 'BREAKFAST', price: 200.00, kitchen: 'Main Kitchen' },

  // Starters & Kebabs
  { code: 'ST-01', name: 'Hara Bhara Kebab', group: 'STARTERS', price: 200.00, kitchen: 'Main Kitchen' },
  { code: 'ST-02', name: 'Paneer Pakoda', group: 'STARTERS', price: 200.00, kitchen: 'Main Kitchen' },
  { code: 'ST-03', name: 'Paneer Tikka', group: 'STARTERS', price: 250.00, kitchen: 'Main Kitchen' },
  { code: 'ST-04', name: 'Paneer Hariyali Tikka', group: 'STARTERS', price: 250.00, kitchen: 'Main Kitchen' },
  { code: 'ST-05', name: 'Chana Roast', group: 'STARTERS', price: 150.00, kitchen: 'Main Kitchen' },
  { code: 'ST-06', name: 'Finger Chips', group: 'STARTERS', price: 120.00, kitchen: 'Main Kitchen' },
  { code: 'ST-07', name: 'Mushroom Pakoda', group: 'STARTERS', price: 180.00, kitchen: 'Main Kitchen' },
  { code: 'ST-08', name: 'Tandoori Platter (Veg)', group: 'STARTERS', price: 650.00, kitchen: 'Main Kitchen' },
  { code: 'NST-01', name: 'Chicken Pakoda', group: 'STARTERS', price: 220.00, kitchen: 'Main Kitchen' },
  { code: 'NST-02', name: 'Chicken Amritsari (Fry)', group: 'STARTERS', price: 250.00, kitchen: 'Main Kitchen' },
  { code: 'NST-03', name: 'Chicken Tikka', group: 'STARTERS', price: 300.00, kitchen: 'Main Kitchen' },
  { code: 'NST-04', name: 'Chicken Banjara Tikka', group: 'STARTERS', price: 300.00, kitchen: 'Main Kitchen' },
  { code: 'NST-05', name: 'Chicken Malai Tikka', group: 'STARTERS', price: 350.00, kitchen: 'Main Kitchen' },
  { code: 'NST-06', name: 'Chicken Afghani Tikka', group: 'STARTERS', price: 350.00, kitchen: 'Main Kitchen' },
  { code: 'NST-07', name: 'Chicken Reshmi Kebab', group: 'STARTERS', price: 300.00, kitchen: 'Main Kitchen' },
  { code: 'NST-08', name: 'Chicken Tangdi Kebab', group: 'STARTERS', price: 300.00, kitchen: 'Main Kitchen' },

  // Main Course Curries
  { code: 'MC-01', name: 'Chicken Masala', group: 'MAIN', price: 280.00, kitchen: 'Main Kitchen' },
  { code: 'MC-02', name: 'Chicken Kadai', group: 'MAIN', price: 280.00, kitchen: 'Main Kitchen' },
  { code: 'MC-03', name: 'Chicken Hyderabadi', group: 'MAIN', price: 290.00, kitchen: 'Main Kitchen' },
  { code: 'MC-04', name: 'Chicken Rara', group: 'MAIN', price: 320.00, kitchen: 'Main Kitchen' },
  { code: 'MC-05', name: 'Chicken Bharta', group: 'MAIN', price: 320.00, kitchen: 'Main Kitchen' },
  { code: 'MC-06', name: 'Chicken Butter Masala', group: 'MAIN', price: 320.00, kitchen: 'Main Kitchen' },
  { code: 'MC-07', name: 'Chicken Tikka Masala', group: 'MAIN', price: 350.00, kitchen: 'Main Kitchen' },
  { code: 'MC-08', name: 'Butter Chicken Boneless', group: 'MAIN', price: 350.00, kitchen: 'Main Kitchen' },
  { code: 'MC-09', name: 'Murg Mussallam (Half)', group: 'MAIN', price: 350.00, kitchen: 'Main Kitchen' },
  { code: 'MC-10', name: 'Fish Curry (B/L)', group: 'MAIN', price: 270.00, kitchen: 'Main Kitchen' },
  { code: 'MC-11', name: 'Prawns Masala', group: 'MAIN', price: 350.00, kitchen: 'Main Kitchen' },
  { code: 'MC-12', name: 'Mutton Curry', group: 'MAIN', price: 380.00, kitchen: 'Main Kitchen' },
  { code: 'MC-13', name: 'Mutton Rogan Josh', group: 'MAIN', price: 380.00, kitchen: 'Main Kitchen' },
  { code: 'MC-14', name: 'Champaran Meat', group: 'MAIN', price: 500.00, kitchen: 'Main Kitchen' },
  { code: 'MC-15', name: 'Dal Fry', group: 'MAIN', price: 130.00, kitchen: 'Main Kitchen' },
  { code: 'MC-16', name: 'Dal Tadka', group: 'MAIN', price: 140.00, kitchen: 'Main Kitchen' },

  // Indian Breads
  { code: 'BRD-01', name: 'Tawa Roti', group: 'BREADS', price: 25.00, kitchen: 'Main Kitchen' },
  { code: 'BRD-02', name: 'Butter Tawa Roti', group: 'BREADS', price: 25.00, kitchen: 'Main Kitchen' },
  { code: 'BRD-03', name: 'Tandoori Roti', group: 'BREADS', price: 30.00, kitchen: 'Main Kitchen' },
  { code: 'BRD-04', name: 'Butter Tandoori Roti', group: 'BREADS', price: 35.00, kitchen: 'Main Kitchen' },
  { code: 'BRD-05', name: 'Rumali Roti', group: 'BREADS', price: 40.00, kitchen: 'Main Kitchen' },
  { code: 'BRD-06', name: 'Plain Naan', group: 'BREADS', price: 40.00, kitchen: 'Main Kitchen' },
  { code: 'BRD-07', name: 'Butter Naan', group: 'BREADS', price: 45.00, kitchen: 'Main Kitchen' },
  { code: 'BRD-08', name: 'Garlic Naan', group: 'BREADS', price: 55.00, kitchen: 'Main Kitchen' },
  { code: 'BRD-09', name: 'Masala Kulcha', group: 'BREADS', price: 55.00, kitchen: 'Main Kitchen' },
  { code: 'BRD-10', name: 'Paneer Kulcha', group: 'BREADS', price: 70.00, kitchen: 'Main Kitchen' },
  { code: 'BRD-11', name: 'Roti Basket', group: 'BREADS', price: 350.00, kitchen: 'Main Kitchen' },

  // Basmati Rice & Biryani
  { code: 'RC-01', name: 'Plain Rice (Basmati)', group: 'RICE', price: 100.00, kitchen: 'Main Kitchen' },
  { code: 'RC-02', name: 'Jeera Rice', group: 'RICE', price: 120.00, kitchen: 'Main Kitchen' },
  { code: 'RC-03', name: 'Veg Biryani', group: 'RICE', price: 210.00, kitchen: 'Main Kitchen' },
  { code: 'RC-04', name: 'Veg Pulao', group: 'RICE', price: 210.00, kitchen: 'Main Kitchen' },
  { code: 'RC-05', name: 'Curd Rice', group: 'RICE', price: 150.00, kitchen: 'Main Kitchen' },
  { code: 'RC-06', name: 'Egg Biryani', group: 'RICE', price: 180.00, kitchen: 'Main Kitchen' },
  { code: 'RC-07', name: 'Chicken Dum Biryani', group: 'RICE', price: 250.00, kitchen: 'Main Kitchen' },
  { code: 'RC-08', name: 'Chicken Hyderabadi Biryani', group: 'RICE', price: 270.00, kitchen: 'Main Kitchen' },
  { code: 'RC-09', name: 'Chicken Tikka Biryani', group: 'RICE', price: 300.00, kitchen: 'Main Kitchen' },
  { code: 'RC-10', name: 'Mutton Biryani', group: 'RICE', price: 350.00, kitchen: 'Main Kitchen' },
  { code: 'RC-11', name: 'Mutton Handi Biryani', group: 'RICE', price: 400.00, kitchen: 'Main Kitchen' },

  // Continental & Pastas
  { code: 'CT-01', name: 'White Sauce Pasta Veg', group: 'CONTINENTAL', price: 200.00, kitchen: 'Main Kitchen' },
  { code: 'CT-02', name: 'Red Sauce Pasta Veg', group: 'CONTINENTAL', price: 200.00, kitchen: 'Main Kitchen' },
  { code: 'CT-03', name: 'White Sauce Chicken Pasta', group: 'CONTINENTAL', price: 280.00, kitchen: 'Main Kitchen' },
  { code: 'CT-04', name: 'Veg Mix Grilled Sizzler', group: 'CONTINENTAL', price: 200.00, kitchen: 'Main Kitchen' },
  { code: 'CT-05', name: 'Chicken Tikka Sizzler', group: 'CONTINENTAL', price: 400.00, kitchen: 'Main Kitchen' },

  // Sweet Memories (Desserts)
  { code: 'DES-01', name: 'Fresh Fruit Platter', group: 'DESSERTS', price: 200.00, kitchen: 'Pantry' },
  { code: 'DES-02', name: 'Hot Gulab Jamun', group: 'DESSERTS', price: 110.00, kitchen: 'Pantry' },
  { code: 'DES-03', name: 'Rice Kheer', group: 'DESSERTS', price: 90.00, kitchen: 'Pantry' },
  { code: 'DES-04', name: 'Hot Gulab Jamun with Ice-Cream', group: 'DESSERTS', price: 150.00, kitchen: 'Pantry' },
  { code: 'DES-05', name: 'Vanilla Ice-Cream', group: 'DESSERTS', price: 80.00, kitchen: 'Pantry' },
  { code: 'DES-06', name: 'Vanilla with Hot Chocolate Sauce', group: 'DESSERTS', price: 150.00, kitchen: 'Pantry' },
  { code: 'DES-07', name: 'Kesar Pista', group: 'DESSERTS', price: 100.00, kitchen: 'Pantry' },
  { code: 'DES-08', name: 'Butter Scotch', group: 'DESSERTS', price: 110.00, kitchen: 'Pantry' },
  { code: 'DES-09', name: 'Chocolate Ice-Cream', group: 'DESSERTS', price: 110.00, kitchen: 'Pantry' }
];

export const ALL_POS_TABLES = [
  'T-01', 'T-02', 'T-03', 'T-04', 'T-05', 'T-06', 
  'T-07', 'T-08', 'T-09', 'T-10', 'T-11', 'T-12'
];

export default function IdsTouchPosTerminalModal({
  isOpen,
  onClose,
  accountingDate = '11-OCT-2026',
  currentUser = 'CASHIER',
  onKotPunched,
  onBillSettled,
  initialMode = 'pos'
}) {
  // Window State: Default to maximized for immersive POS touch screen experience
  const [isMaximized, setIsMaximized] = useState(true);

  // Navigation & Table Selection
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [selectedTable, setSelectedTable] = useState('T-01');
  const [selectedServer, setSelectedServer] = useState('Sadananda');
  const [covers, setCovers] = useState(2);
  const [activeOutlet, setActiveOutlet] = useState('RESTAURANT');
  const [activeSession, setActiveSession] = useState('Lunch');

  // Draft items in current cart (Unprinted items waiting for Kitchen Punch)
  const [draftCart, setDraftCart] = useState([]);

  // Running Table Sessions (Synced across Steward Mobiles, KDS & Desktop POS)
  const [tableSessions, setTableSessions] = useState(() => {
    try {
      const saved = localStorage.getItem(TABLE_SESSIONS_KEY);
      let sessions = saved ? JSON.parse(saved) : {};
      // Reconcile with any live KOT orders in storage
      const liveKots = getLiveKots();
      if (Array.isArray(liveKots) && liveKots.length > 0) {
        liveKots.forEach(k => {
          if (k.status !== 'Settled') {
            sessions = mergeKotIntoTableSessions(sessions, k);
          }
        });
      }
      return sessions;
    } catch (e) {
      return {};
    }
  });

  // Modal Dialogs
  const [thermalKotModalOpen, setThermalKotModalOpen] = useState(false);
  const [activeKotSlip, setActiveKotSlip] = useState(null); // The KOT slip being previewed/printed
  const [mergeTableModalOpen, setMergeTableModalOpen] = useState(false);
  const [mergeSourceTable, setMergeSourceTable] = useState('T-02');
  const [printBillModalOpen, setPrintBillModalOpen] = useState(false);
  const [settlementModalOpen, setSettlementModalOpen] = useState(false);
  const [settlePayMode, setSettlePayMode] = useState('CASH'); // CASH | UPI | CARD | ROOM
  const [settleRoomNo, setSettleRoomNo] = useState('101');
  const [upiQrDataUrl, setUpiQrDataUrl] = useState('');
  const [messagePrompt, setMessagePrompt] = useState(null);

  // KOT Voiding & Anti-Theft Security Dialog State (Videos 05 & 06, Audio 4)
  const [voidModalOpen, setVoidModalOpen] = useState(false);
  const [targetVoidItem, setTargetVoidItem] = useState(null);
  const [voidQty, setVoidQty] = useState(1);
  const [voidReason, setVoidReason] = useState(KOT_VOID_REASONS[0]);
  const [voidRemarks, setVoidRemarks] = useState('');
  const [managerPin, setManagerPin] = useState('');
  const [voidError, setVoidError] = useState('');
  const [showPinMask, setShowPinMask] = useState(true);

  // Bill Discount & Allowance State (V6.5.002.1 - Screenshot & 5% rule)
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [tableDiscounts, setTableDiscounts] = useState({});

  // Real-Time Incoming Mobile KOT Alert Banner State
  const [incomingKotNotice, setIncomingKotNotice] = useState(null);

  // Sync with storage, BroadcastChannel and Cloud FastAPI in real-time
  useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem(TABLE_SESSIONS_KEY);
        if (saved) setTableSessions(JSON.parse(saved));
      } catch (e) {}
    };
    window.addEventListener('storage', handleStorage);

    let channel = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel(KDS_CHANNEL_NAME);
      channel.onmessage = (event) => {
        const { type, tableSessions: newSessions, settledTable } = event.data || {};
        if (type === 'TABLE_SESSIONS_UPDATE' && newSessions) {
          setTableSessions(newSessions);
        } else if (type === 'TABLE_SETTLED' && settledTable) {
          setTableSessions(prev => {
            const next = { ...prev };
            delete next[settledTable];
            return next;
          });
        }
      };
    }

    // Live Multi-Device Cloud & Local Bridge Subscription
    const unsubscribeLiveSync = subscribeToLiveSync((event) => {
      if (event.type === 'NEW_KOT_ORDER' && event.order) {
        const ord = event.order;
        playOrderAlert();
        setIncomingKotNotice({
          kotId: ord.id || ord.kotId,
          kotNumber: ord.kotNumber || ord.runningKotIndex || '1',
          tableNumber: ord.tableNumber || (ord.roomNumber ? `Room ${ord.roomNumber}` : 'T-01'),
          steward: ord.steward || 'Floor Steward',
          totalAmount: ord.totalAmount || 0,
          itemsCount: (ord.items || []).length,
          receivedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        });

        // Automatically ingest incoming food items into table sessions and local storage
        setTableSessions(prev => {
          const baseSessions = event.tableSessions || prev || {};
          const merged = mergeKotIntoTableSessions(baseSessions, ord);
          try {
            localStorage.setItem(TABLE_SESSIONS_KEY, JSON.stringify(merged));
          } catch (e) {}
          return merged;
        });
      }
    });

    return () => {
      window.removeEventListener('storage', handleStorage);
      if (channel) channel.close();
      unsubscribeLiveSync();
    };
  }, []);

  // Standardize table numbers (support both '1' and 'T-01')
  const currentSession = useMemo(() => {
    return findTableSession(tableSessions, selectedTable);
  }, [tableSessions, selectedTable]);

  // Dispatched items from all prior KOT batches on this table
  const dispatchedKots = useMemo(() => {
    return currentSession?.kots || [];
  }, [currentSession]);

  // Flattened dispatched line items for high-density Win32 grid
  const dispatchedLineItems = useMemo(() => {
    const lines = [];
    dispatchedKots.forEach((kot, kotIdx) => {
      const kotLabel = `KOT #${kot.runningKotIndex || kot.kotNumber || kotIdx + 1}`;
      (kot.items || []).forEach((item, itemIdx) => {
        lines.push({
          kotId: kot.id || kot.kotId,
          kotNumber: kotLabel,
          itemKey: `${kot.id || kotIdx}-${itemIdx}`,
          itemCode: item.itemCode || item.code || '-',
          name: item.name,
          quantity: item.quantity || item.qty || 1,
          rate: item.rate || item.price || 0,
          amount: (item.quantity || item.qty || 1) * (item.rate || item.price || 0),
          status: kot.status || 'Dispatched',
          timestamp: kot.timeFormatted || (kot.timestamp ? new Date(kot.timestamp).toLocaleTimeString() : '13:00'),
          steward: kot.steward || currentSession?.captain || 'Sadananda'
        });
      });
    });
    return lines;
  }, [dispatchedKots, currentSession]);

  // Financial Calculations: Combined Dispatched + Draft Items & Active Discount
  const financials = useMemo(() => {
    const dispatchedTotal = dispatchedLineItems.reduce((acc, it) => acc + it.amount, 0);
    const draftTotal = draftCart.reduce((acc, it) => acc + (it.price * it.qty), 0);
    const grossTotal = dispatchedTotal + draftTotal;

    // Check if table has an active discount applied
    const discountInfo = tableDiscounts[selectedTable] || currentSession?.discount || null;
    const discountAmount = discountInfo?.discountAmount ? Math.min(grossTotal, Number(discountInfo.discountAmount)) : 0;
    const discountPercent = discountInfo?.discountPercent ? Number(discountInfo.discountPercent) : (grossTotal > 0 ? (discountAmount / grossTotal) * 100 : 0);
    const taxableAmount = Math.max(0, grossTotal - discountAmount);

    const cgst = Math.round(taxableAmount * 0.025 * 100) / 100;
    const sgst = Math.round(taxableAmount * 0.025 * 100) / 100;
    const grandTotal = Math.round(taxableAmount + cgst + sgst);
    const roundOff = Math.round((grandTotal - (taxableAmount + cgst + sgst)) * 100) / 100;

    return {
      dispatchedTotal,
      draftTotal,
      subtotal: grossTotal, // Gross food subtotal
      grossTotal,
      discountAmount,
      discountPercent,
      discountReason: discountInfo?.reason || '',
      discountRemarks: discountInfo?.remarks || '',
      discountAuthBy: discountInfo?.authBy || '',
      isDiscountApplied: discountAmount > 0,
      taxableAmount,
      cgst,
      sgst,
      roundOff,
      grandTotal,
      totalItemCount: dispatchedLineItems.reduce((acc, it) => acc + it.quantity, 0) + draftCart.reduce((acc, it) => acc + it.qty, 0)
    };
  }, [dispatchedLineItems, draftCart, tableDiscounts, selectedTable, currentSession]);

  // Item catalog filters
  const filteredItems = useMemo(() => {
    return selectedGroup === 'ALL'
      ? TOUCH_ITEMS
      : TOUCH_ITEMS.filter(item => item.group === selectedGroup);
  }, [selectedGroup]);

  // Generate UPI QR Code on Demand
  useEffect(() => {
    if (settlementModalOpen && settlePayMode === 'UPI') {
      const upiUrl = `upi://pay?pa=hoteleliteinn@icici&pn=Hotel%20Elite%20Inn&am=${financials.grandTotal}&cu=INR&tn=Table%20${selectedTable}%20POS%20Bill`;
      QRCode.toDataURL(upiUrl, { width: 220, margin: 1 })
        .then(url => setUpiQrDataUrl(url))
        .catch(err => console.error('QR code error:', err));
    }
  }, [settlementModalOpen, settlePayMode, financials.grandTotal, selectedTable]);

  // Handle initialMode when modal opens from IDS Desktop Shell submenus
  useEffect(() => {
    if (!isOpen) return;
    if (initialMode === 'void-kot') {
      if (dispatchedLineItems.length > 0) {
        handleInitiateVoid(dispatchedLineItems[0]);
      } else {
        setMessagePrompt(`⚠️ Void Mode: No dispatched items on ${selectedTable}. Select an occupied table or punch items first.`);
      }
    } else if (initialMode === 'table-transfer' || initialMode === 'table-merge') {
      setMergeTableModalOpen(true);
    } else if (initialMode === 'kot-reprint') {
      handleViewLatestKotSlip();
    } else if (initialMode === 'discount' || initialMode === 'pos-discount') {
      setDiscountModalOpen(true);
    }
  }, [isOpen, initialMode]);

  // Global Win32 Shortcut Keys
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (discountModalOpen || voidModalOpen || thermalKotModalOpen || mergeTableModalOpen || printBillModalOpen || settlementModalOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          if (discountModalOpen) setDiscountModalOpen(false);
          else if (voidModalOpen) setVoidModalOpen(false);
          else if (thermalKotModalOpen) setThermalKotModalOpen(false);
          else if (mergeTableModalOpen) setMergeTableModalOpen(false);
          else if (printBillModalOpen) setPrintBillModalOpen(false);
          else if (settlementModalOpen) setSettlementModalOpen(false);
        }
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
      } else if (e.key === 'F1') {
        e.preventDefault();
        setSelectedGroup('ALL');
      } else if (e.key === 'F2') {
        e.preventDefault();
        handlePunchDeltaKot();
      } else if (e.key === 'F3') {
        e.preventDefault();
        handleViewLatestKotSlip();
      } else if (e.key === 'F4') {
        e.preventDefault();
        setDiscountModalOpen(true);
      } else if (e.key === 'F5') {
        e.preventDefault();
        setMergeTableModalOpen(true);
      } else if (e.key === 'F6') {
        e.preventDefault();
        if (dispatchedLineItems.length > 0) {
          handleInitiateVoid(dispatchedLineItems[0]);
        } else {
          setMessagePrompt(`No dispatched items on ${selectedTable} to void.`);
        }
      } else if (e.key === 'F7') {
        e.preventDefault();
        setPrintBillModalOpen(true);
      } else if (e.key === 'F8') {
        e.preventDefault();
        setSettlementModalOpen(true);
      } else if (e.key === 'F9') {
        e.preventDefault();
        setDraftCart([]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, draftCart, thermalKotModalOpen, mergeTableModalOpen, printBillModalOpen, settlementModalOpen, voidModalOpen, discountModalOpen, dispatchedLineItems, selectedTable, selectedServer, covers]);

  // Bill Discount & Allowance Handlers (5% Cashier Limit, > 5% Manager PIN)
  const handleApplyDiscount = (disc) => {
    setTableDiscounts(prev => ({
      ...prev,
      [selectedTable]: disc
    }));

    // Update running table session
    const updatedSessions = { ...tableSessions };
    const stdTableKey = getStandardPosTableId(selectedTable);
    const rawTableKey = getRawTableNumber(selectedTable);
    const sess = findTableSession(updatedSessions, selectedTable);
    if (sess) {
      sess.discount = disc;
      updatedSessions[selectedTable] = sess;
      updatedSessions[stdTableKey] = sess;
      updatedSessions[rawTableKey] = sess;
      setTableSessions(updatedSessions);
      try {
        localStorage.setItem(TABLE_SESSIONS_KEY, JSON.stringify(updatedSessions));
      } catch (e) {}
      saveTableSessionToDexie(selectedTable, sess).catch(() => {});
    }

    setDiscountModalOpen(false);
    playSuccessChime();
    setMessagePrompt(`🏷️ Discount of ₹${disc.discountAmount.toFixed(2)} (${disc.discountPercent.toFixed(1)}%) applied to Table ${selectedTable}. Reason: ${disc.reason}. Auth: ${disc.authBy}`);
  };

  const handleRemoveDiscount = () => {
    const stdTableKey = getStandardPosTableId(selectedTable);
    const rawTableKey = getRawTableNumber(selectedTable);
    setTableDiscounts(prev => {
      const copy = { ...prev };
      delete copy[selectedTable];
      delete copy[stdTableKey];
      delete copy[rawTableKey];
      return copy;
    });

    const updatedSessions = { ...tableSessions };
    const sess = findTableSession(updatedSessions, selectedTable);
    if (sess && sess.discount) {
      delete sess.discount;
      updatedSessions[selectedTable] = sess;
      updatedSessions[stdTableKey] = sess;
      updatedSessions[rawTableKey] = sess;
      setTableSessions(updatedSessions);
      try {
        localStorage.setItem(TABLE_SESSIONS_KEY, JSON.stringify(updatedSessions));
      } catch (e) {}
      saveTableSessionToDexie(selectedTable, sess).catch(() => {});
    }

    setMessagePrompt(`🏷️ Discount removed for Table ${selectedTable}. Full gross bill restored.`);
  };

  // Void Handler Functions
  const handleInitiateVoid = (row) => {
    setTargetVoidItem(row);
    setVoidQty(row.quantity || 1);
    setVoidReason(KOT_VOID_REASONS[0]);
    setVoidRemarks('');
    setManagerPin('');
    setVoidError('');
    setVoidModalOpen(true);
  };

  const handlePinKeypadPress = (val) => {
    setVoidError('');
    if (val === 'CLEAR') {
      setManagerPin('');
    } else if (val === 'BACKSPACE') {
      setManagerPin(prev => prev.slice(0, -1));
    } else {
      if (managerPin.length < 6) {
        setManagerPin(prev => prev + val);
      }
    }
  };

  const handleConfirmVoidItem = () => {
    if (managerPin !== '1234') {
      setVoidError('❌ ACCESS DENIED: Invalid Manager PIN! Authorized Duty Manager PIN (1234) is required.');
      return;
    }
    if (!voidReason) {
      setVoidError('Please select a mandatory void reason to prevent pilferage.');
      return;
    }
    if (voidReason.startsWith('Other') && !voidRemarks.trim()) {
      setVoidError('Remarks are mandatory when "Other Reason" is selected.');
      return;
    }
    if (!targetVoidItem) return;

    const voidQtyNum = Number(voidQty) || 1;
    if (voidQtyNum <= 0 || voidQtyNum > targetVoidItem.quantity) {
      setVoidError(`Void quantity must be between 1 and ${targetVoidItem.quantity}.`);
      return;
    }

    // 1. Immutable audit record in hei_kot_void_audit_ledger
    const auditRecord = recordKotItemVoid({
      tableNo: selectedTable,
      kotNumber: targetVoidItem.kotNumber,
      itemCode: targetVoidItem.itemCode,
      itemName: targetVoidItem.name,
      voidQty: voidQtyNum,
      rate: targetVoidItem.rate,
      reason: voidReason,
      remarks: voidRemarks || `Void authorized by Manager PIN for Table ${selectedTable}`,
      authorizedBy: 'DUTY MANAGER (PIN:1234)',
      cashier: currentUser || 'CASHIER',
      steward: targetVoidItem.steward || selectedServer,
      accountingDate
    });

    // 2. Deduct or remove item from running tableSession
    const updatedSessions = { ...tableSessions };
    const stdTableKey = getStandardPosTableId(selectedTable);
    const rawTableKey = getRawTableNumber(selectedTable);
    const sess = findTableSession(updatedSessions, selectedTable);

    if (sess && sess.kots) {
      let itemUpdated = false;
      sess.kots = sess.kots.map(kot => {
        const kotLabel = `KOT #${kot.runningKotIndex || kot.kotNumber || 1}`;
        if (kot.id === targetVoidItem.kotId || kotLabel === targetVoidItem.kotNumber) {
          const updatedItems = [];
          (kot.items || []).forEach(it => {
            const itCode = it.itemCode || it.code || '-';
            if (!itemUpdated && (it.name === targetVoidItem.name || itCode === targetVoidItem.itemCode)) {
              itemUpdated = true;
              if (it.quantity > voidQtyNum) {
                updatedItems.push({
                  ...it,
                  quantity: it.quantity - voidQtyNum
                });
              }
            } else {
              updatedItems.push(it);
            }
          });
          return {
            ...kot,
            items: updatedItems
          };
        }
        return kot;
      }).filter(kot => kot.items && kot.items.length > 0);

      const allItems = sess.kots.flatMap(k => k.items || []);
      const newGross = allItems.reduce((acc, it) => acc + (it.quantity * (it.rate || it.price || 0)), 0);
      sess.cumulativeItems = allItems;
      sess.subtotal = newGross;
      sess.netTotal = Math.round(newGross * 1.05);

      if (sess.kots.length === 0) {
        sess.status = 'VACANT';
      }

      updatedSessions[selectedTable] = sess;
      updatedSessions[stdTableKey] = sess;
      updatedSessions[rawTableKey] = sess;

      setTableSessions(updatedSessions);
      try {
        localStorage.setItem(TABLE_SESSIONS_KEY, JSON.stringify(updatedSessions));
      } catch (e) {}

      saveTableSessionToDexie(selectedTable, sess).catch(() => {});

      broadcastKotChannel({
        type: 'TABLE_SESSIONS_UPDATE',
        tableSessions: updatedSessions
      });
    }

    playOrderAlert();
    setVoidModalOpen(false);
    setMessagePrompt(`⚠️ VOID LOGGED: Voucher #${auditRecord.voucherNo} (${targetVoidItem.name} x${voidQtyNum}) voided by Manager. Reason: ${voidReason}. Audit updated.`);
  };

  // Add Item to Draft Cart
  const handleAddItemToDraft = (item) => {
    setDraftCart(prev => {
      const idx = prev.findIndex(p => p.code === item.code);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx].qty += 1;
        return copy;
      }
      return [...prev, { ...item, qty: 1, modifier: '' }];
    });
  };

  const handleUpdateDraftQty = (code, delta) => {
    setDraftCart(prev => {
      return prev.map(p => {
        if (p.code === code) {
          const newQty = p.qty + delta;
          return newQty > 0 ? { ...p, qty: newQty } : null;
        }
        return p;
      }).filter(Boolean);
    });
  };

  // ==========================================================================
  // ACTION 1: [F2 - PUNCH KOT] (DELTA-ONLY KITCHEN TICKET)
  // Grabs ONLY the newly added items, assigns next sequential KOT #, 
  // chimes the kitchen KDS, and displays the 80mm thermal slip.
  // ==========================================================================
  const handlePunchDeltaKot = async () => {
    if (draftCart.length === 0) {
      setMessagePrompt("No draft items to punch! Click items from the catalog on the left to add.");
      return;
    }

    const nextKotIdx = dispatchedKots.length + 1;
    const kotId = `KOT-${Date.now().toString().slice(-6)}`;
    const kotTimeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // 1. Create the Delta KOT Batch (Strictly the new items only)
    const deltaKotBatch = {
      id: kotId,
      kotId: kotId,
      kotNumber: nextKotIdx,
      runningKotIndex: nextKotIdx,
      tableNumber: selectedTable,
      orderType: 'dining',
      steward: selectedServer,
      captain: selectedServer,
      timestamp: new Date().toISOString(),
      timeFormatted: kotTimeStr,
      status: 'Preparing',
      items: draftCart.map(c => ({
        id: c.code,
        itemCode: c.code,
        name: c.name,
        quantity: c.qty,
        rate: c.price,
        price: c.price,
        kitchen: c.kitchen || 'Main Kitchen',
        modifier: c.modifier || ''
      })),
      totalAmount: draftCart.reduce((sum, it) => sum + (it.price * it.qty), 0)
    };

    // 2. Update Table Session in Storage & Dexie
    const updatedSessions = { ...tableSessions };
    const stdTableKey = getStandardPosTableId(selectedTable);
    const rawTableKey = getRawTableNumber(selectedTable);
    const currentTab = findTableSession(updatedSessions, selectedTable) || {
      sessionId: `SES-${stdTableKey}-${Date.now().toString().slice(-4)}`,
      tableNumber: stdTableKey,
      outlet: activeOutlet,
      status: 'OCCUPIED',
      firstKotTime: kotTimeStr,
      captain: selectedServer,
      kots: [],
      cumulativeItems: []
    };

    currentTab.status = 'OCCUPIED';
    currentTab.captain = selectedServer;
    currentTab.kots = [...(currentTab.kots || []), deltaKotBatch];

    // Cumulative items map
    const cumMap = {};
    (currentTab.cumulativeItems || []).forEach(it => {
      cumMap[it.name] = { ...it, quantity: Number(it.quantity) || 1 };
    });
    deltaKotBatch.items.forEach(it => {
      if (cumMap[it.name]) {
        cumMap[it.name].quantity += it.quantity;
      } else {
        cumMap[it.name] = { name: it.name, quantity: it.quantity, price: it.rate, itemCode: it.itemCode };
      }
    });
    currentTab.cumulativeItems = Object.values(cumMap);

    const gross = currentTab.cumulativeItems.reduce((acc, it) => acc + (it.quantity * it.price), 0);
    currentTab.subtotal = gross;
    currentTab.netTotal = Math.round(gross * 1.05);

    updatedSessions[selectedTable] = currentTab;
    updatedSessions[stdTableKey] = currentTab;
    updatedSessions[rawTableKey] = currentTab;
    setTableSessions(updatedSessions);

    try {
      localStorage.setItem(TABLE_SESSIONS_KEY, JSON.stringify(updatedSessions));
    } catch (e) {}
    saveTableSessionToDexie(selectedTable, currentTab).catch(() => {});

    // 3. Save to live KOTs queue & Dexie
    const existingKots = getLiveKots();
    const updatedKots = [normalizeKotOrder(deltaKotBatch), ...existingKots.filter(k => k.id !== kotId)];
    saveLiveKots(updatedKots);
    saveKotToDexie(normalizeKotOrder(deltaKotBatch)).catch(() => {});

    // 4. Broadcast to Kitchen KDS (Kitchen sirens sound with delta ticket)
    broadcastKotChannel({
      type: 'NEW_KOT_ORDER',
      order: normalizeKotOrder(deltaKotBatch),
      tableSessions: updatedSessions
    });

    if (onKotPunched) {
      onKotPunched(deltaKotBatch);
    }

    playSuccessChime();

    // 5. Open Thermal KOT Delta Slip Preview
    setActiveKotSlip({
      ...deltaKotBatch,
      tableNo: selectedTable,
      covers,
      outlet: activeOutlet
    });
    setThermalKotModalOpen(true);

    // 6. Clear Draft Cart
    setDraftCart([]);
    setMessagePrompt(`✅ KOT #${nextKotIdx} dispatched to Kitchen for ${selectedTable} (${deltaKotBatch.items.length} items)!`);
  };

  // ==========================================================================
  // ACTION 2: [F3 - VIEW KOT SLIP]
  // ==========================================================================
  const handleViewLatestKotSlip = () => {
    if (dispatchedKots.length === 0 && draftCart.length === 0) {
      setMessagePrompt("No KOTs available for Table " + selectedTable);
      return;
    }
    const latest = dispatchedKots[dispatchedKots.length - 1];
    if (latest) {
      setActiveKotSlip({
        ...latest,
        tableNo: selectedTable,
        covers,
        outlet: activeOutlet
      });
      setThermalKotModalOpen(true);
    }
  };

  // ==========================================================================
  // ACTION 3: [F5 - MERGE / SHIFT TABLE]
  // ==========================================================================
  const handleExecuteTableMerge = () => {
    if (!mergeSourceTable || mergeSourceTable === selectedTable) {
      setMessagePrompt("Source and Target tables must be different!");
      return;
    }

    const sourceSession = findTableSession(tableSessions, mergeSourceTable);

    if (!sourceSession || !sourceSession.kots || sourceSession.kots.length === 0) {
      setMessagePrompt(`Table ${mergeSourceTable} has no active KOTs to merge!`);
      return;
    }

    const updatedSessions = { ...tableSessions };
    const stdTarget = getStandardPosTableId(selectedTable);
    const rawTarget = getRawTableNumber(selectedTable);
    const targetTab = findTableSession(updatedSessions, selectedTable) || {
      sessionId: `SES-${stdTarget}-${Date.now().toString().slice(-4)}`,
      tableNumber: stdTarget,
      outlet: activeOutlet,
      status: 'OCCUPIED',
      firstKotTime: new Date().toLocaleTimeString(),
      captain: selectedServer,
      kots: [],
      cumulativeItems: []
    };

    // Combine KOTs from Source into Target
    targetTab.status = 'OCCUPIED';
    targetTab.kots = [...(targetTab.kots || []), ...(sourceSession.kots || [])];

    // Recombine cumulative items
    const cumMap = {};
    (targetTab.cumulativeItems || []).forEach(it => {
      cumMap[it.name] = { ...it, quantity: Number(it.quantity) || 1 };
    });
    (sourceSession.kots || []).forEach(kot => {
      (kot.items || []).forEach(it => {
        const qty = it.quantity || it.qty || 1;
        const rate = it.rate || it.price || 0;
        if (cumMap[it.name]) {
          cumMap[it.name].quantity += qty;
        } else {
          cumMap[it.name] = { name: it.name, quantity: qty, price: rate, itemCode: it.itemCode };
        }
      });
    });
    targetTab.cumulativeItems = Object.values(cumMap);
    const gross = targetTab.cumulativeItems.reduce((acc, it) => acc + (it.quantity * it.price), 0);
    targetTab.subtotal = gross;
    targetTab.netTotal = Math.round(gross * 1.05);

    updatedSessions[selectedTable] = targetTab;
    updatedSessions[stdTarget] = targetTab;
    updatedSessions[rawTarget] = targetTab;

    delete updatedSessions[mergeSourceTable];
    delete updatedSessions[getStandardPosTableId(mergeSourceTable)];
    delete updatedSessions[getRawTableNumber(mergeSourceTable)];

    setTableSessions(updatedSessions);
    try {
      localStorage.setItem(TABLE_SESSIONS_KEY, JSON.stringify(updatedSessions));
    } catch (e) {}

    // Free source table in Dexie
    settleTableSessionInDexie(mergeSourceTable).catch(() => {});
    saveTableSessionToDexie(selectedTable, targetTab).catch(() => {});

    // Broadcast across tabs
    broadcastKotChannel({
      type: 'TABLE_SESSIONS_UPDATE',
      tableSessions: updatedSessions
    });

    playOrderAlert();
    setMergeTableModalOpen(false);
    setMessagePrompt(`🔀 Successfully merged Table ${mergeSourceTable} into ${selectedTable}! Total KOTs: ${targetTab.kots.length}`);
  };

  // ==========================================================================
  // ACTION 4: [F8 - SETTLE BILL & RELEASE TABLE]
  // ==========================================================================
  const handleExecuteSettlement = () => {
    if (dispatchedLineItems.length === 0 && draftCart.length === 0) {
      setMessagePrompt("Cannot settle: Table has no items!");
      return;
    }

    const billId = `POS-${Date.now().toString().slice(-4)}`;
    const settlementData = {
      billNo: billId,
      tableNo: selectedTable,
      covers,
      steward: selectedServer,
      paymentMode: settlePayMode,
      roomNo: settlePayMode === 'ROOM' ? settleRoomNo : null,
      subtotal: financials.subtotal,
      discountAmount: financials.discountAmount,
      discountPercent: financials.discountPercent,
      discountReason: financials.discountReason,
      taxableAmount: financials.taxableAmount,
      cgst: financials.cgst,
      sgst: financials.sgst,
      roundOff: financials.roundOff,
      grandTotal: financials.grandTotal,
      items: dispatchedLineItems,
      timestamp: new Date().toISOString()
    };

    // 1. Release Table Session
    const updatedSessions = { ...tableSessions };
    const stdKey = getStandardPosTableId(selectedTable);
    const rawKey = getRawTableNumber(selectedTable);
    delete updatedSessions[selectedTable];
    delete updatedSessions[stdKey];
    delete updatedSessions[rawKey];

    setTableSessions(updatedSessions);
    try {
      localStorage.setItem(TABLE_SESSIONS_KEY, JSON.stringify(updatedSessions));
    } catch (e) {}

    settleTableSessionInDexie(selectedTable).catch(() => {});
    settleTableSessionInDexie(stdKey).catch(() => {});
    settleTableSessionInDexie(rawKey).catch(() => {});

    // Clear discount for settled table
    setTableDiscounts(prev => {
      const copy = { ...prev };
      delete copy[selectedTable];
      delete copy[stdKey];
      delete copy[rawKey];
      return copy;
    });

    // 2. Record in Financial Register Bridge
    try {
      const activeDisc = tableDiscounts[selectedTable];
      recordLiveRestaurantSale({
        billNo: billId,
        date: accountingDate,
        tableNo: selectedTable,
        steward: selectedServer,
        paymentMode: settlePayMode,
        foodTotal: financials.taxableAmount,
        discount: financials.discountAmount,
        discountPercent: financials.discountPercent,
        discountReason: activeDisc?.reason || '',
        discountAuthBy: activeDisc?.authBy || '',
        cgst: financials.cgst,
        sgst: financials.sgst,
        roundOff: financials.roundOff,
        netPayable: financials.grandTotal,
        outlet: activeOutlet
      });
    } catch (e) {}

    // 3. Broadcast Table Release to KDS & Stewards
    broadcastKotChannel({
      type: 'TABLE_SETTLED',
      settledTable: selectedTable,
      tableSessions: updatedSessions
    });

    if (onBillSettled) {
      onBillSettled(settlementData);
    }

    playSuccessChime();
    setSettlementModalOpen(false);
    setDraftCart([]);
    setMessagePrompt(`💳 Bill #${billId} SETTLED (₹${financials.grandTotal.toFixed(2)} via ${settlePayMode}${financials.discountAmount > 0 ? ` [Discount: ₹${financials.discountAmount.toFixed(2)}]` : ''}). Table ${selectedTable} is now VACANT!`);
  };

  // Determine Table Badge Status
  const getTableOccupancyBadge = (tbl) => {
    const sess = findTableSession(tableSessions, tbl);
    if (sess && sess.status === 'OCCUPIED' && sess.kots?.length > 0) {
      return { text: `OCCUPIED (${sess.kots.length} KOTs)`, color: '#A02020', isOccupied: true };
    }
    return { text: 'VACANT', color: '#2E8B57', isOccupied: false };
  };

  const currentTableBadge = getTableOccupancyBadge(selectedTable);

  if (!isOpen) return null;

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div 
        className={`ids-dialog-window ids-touch-pos-window ${isMaximized ? 'maximized' : ''}`}
        style={isMaximized ? {
          position: 'fixed',
          top: '1vh',
          left: '1vw',
          width: '98vw',
          height: '98vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#D4D0C8',
          zIndex: 1101,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          overflow: 'hidden'
        } : {
          width: '1200px',
          maxWidth: '96vw',
          height: '840px',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#D4D0C8',
          position: 'relative',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          overflow: 'hidden'
        }}
      >
        {/* ================================================================= */}
        {/* REAL-TIME INCOMING STEWARD KOT NOTIFICATION MODAL POPUP           */}
        {/* ================================================================= */}
        {incomingKotNotice && (
          <div 
            style={{
              position: 'absolute',
              top: '36px',
              right: '16px',
              zIndex: 9999,
              width: '380px',
              background: '#FFFBEB',
              border: '2px solid #D97706',
              boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
              borderRadius: '4px',
              padding: '10px 12px',
              fontFamily: 'Tahoma, Arial, sans-serif'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #FCD34D', paddingBottom: '4px', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: '#92400E', fontSize: '12px' }}>
                <span style={{ fontSize: '16px' }}>🔔</span>
                <span>NEW STEWARD KOT PUNCHED!</span>
              </div>
              <button 
                onClick={() => setIncomingKotNotice(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#78350F', fontWeight: 'bold' }}
              >✕</button>
            </div>
            <div style={{ fontSize: '11.5px', color: '#1F2937', lineHeight: '1.5' }}>
              <div><strong>KOT Reference:</strong> #{incomingKotNotice.kotNumber}</div>
              <div><strong>Table:</strong> <span style={{ color: '#B91C1C', fontWeight: 'bold', fontSize: '12px' }}>{incomingKotNotice.tableNumber}</span> &nbsp;|&nbsp; <strong>Steward:</strong> {incomingKotNotice.steward}</div>
              <div><strong>Items:</strong> {incomingKotNotice.itemsCount} &nbsp;|&nbsp; <strong>Amount:</strong> ₹{incomingKotNotice.totalAmount} &nbsp;|&nbsp; <span style={{ color: '#6B7280', fontSize: '10.5px' }}>{incomingKotNotice.receivedAt}</span></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '8px' }}>
              <button 
                onClick={() => {
                  if (incomingKotNotice.tableNumber) {
                    const stdTable = getStandardPosTableId(incomingKotNotice.tableNumber);
                    setSelectedTable(stdTable);
                  }
                  setIncomingKotNotice(null);
                }}
                style={{
                  background: '#0A246A',
                  color: '#FFFFFF',
                  border: '1px solid #000',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  borderRadius: '2px'
                }}
              >
                Open Table {incomingKotNotice.tableNumber}
              </button>
              <button 
                onClick={() => setIncomingKotNotice(null)}
                style={{
                  background: '#E5E7EB',
                  color: '#374151',
                  border: '1px solid #9CA3AF',
                  padding: '3px 8px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  borderRadius: '2px'
                }}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* WIN32 DIALOG TITLE BAR                                            */}
        {/* ================================================================= */}
        <div 
          className="ids-dialog-titlebar" 
          style={{ 
            background: 'linear-gradient(180deg, #0A246A 0%, #A6CAF0 100%)',
            color: '#FFFFFF',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '4px 8px',
            fontSize: '12px',
            fontWeight: 700,
            userSelect: 'none',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: '#A02020', color: '#FFF', padding: '2px 6px', fontSize: '10.5px', borderRadius: '2px', fontWeight: 800, letterSpacing: '0.5px' }}>IDS NEXT</span>
            <span style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.5)' }}>Touch Screen POS Terminal V7.0 — {HOTEL_CONFIG.name} [{activeOutlet}]</span>
          </div>
          <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
            <button 
              className="ids-win-btn" 
              title="Minimize to normal size"
              onClick={() => setIsMaximized(false)}
              style={{ background: '#ECE9D8', fontWeight: 900, width: '22px', height: '20px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              _
            </button>
            <button 
              className="ids-win-btn" 
              title={isMaximized ? "Restore window" : "Maximize full screen"}
              onClick={() => setIsMaximized(!isMaximized)}
              style={{ background: '#ECE9D8', fontWeight: 900, width: '22px', height: '20px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {isMaximized ? '❐' : '□'}
            </button>
            <button 
              className="ids-win-btn close" 
              title="Close POS Terminal (Esc)"
              onClick={onClose} 
              style={{ background: '#A02020', color: '#FFFFFF', fontWeight: 900, width: '22px', height: '20px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* TOP STATUS & TABLE SELECTOR BAR                                   */}
        {/* ================================================================= */}
        <div 
          className="ids-touch-pos-topbar"
          style={{ 
            padding: '4px 12px', 
            background: '#ECE9D8', 
            borderBottom: '2px solid #716F64', 
            display: 'flex', 
            gap: '14px', 
            alignItems: 'center', 
            fontSize: '11.5px', 
            flexWrap: 'nowrap',
            flex: '0 0 auto',
            flexShrink: 0,
            height: '42px',
            minHeight: '42px',
            maxHeight: '42px',
            overflowX: 'auto',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <strong style={{ color: '#000080' }}>Outlet:</strong>
            <select className="ids-select" value={activeOutlet} onChange={e => setActiveOutlet(e.target.value)} style={{ padding: '2px 6px', fontWeight: 600 }}>
              <option value="RESTAURANT">RESTAURANT (Cannon Kitchen)</option>
              <option value="ROOM SERVICE">ROOM SERVICE (POS 5)</option>
              <option value="DROP IN BAR">DROP IN BAR</option>
              <option value="TERRACE">TERRACE DINING</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <strong style={{ color: '#000080' }}>Table No.:</strong>
            <select 
              className="ids-select" 
              value={selectedTable} 
              onChange={e => setSelectedTable(e.target.value)}
              style={{ fontWeight: 700, color: currentTableBadge.isOccupied ? '#A02020' : '#000080', padding: '2px 6px' }}
            >
              {ALL_POS_TABLES.map(t => {
                const badge = getTableOccupancyBadge(t);
                return (
                  <option key={t} value={t}>
                    {t} — {badge.text}
                  </option>
                );
              })}
            </select>
            <span 
              style={{ 
                padding: '2px 8px', 
                fontSize: '10.5px', 
                fontWeight: 700, 
                color: '#FFF', 
                background: currentTableBadge.color,
                borderRadius: '2px',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)'
              }}
            >
              {currentTableBadge.text}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <strong style={{ color: '#000080' }}>Steward:</strong>
            <select className="ids-select" value={selectedServer} onChange={e => setSelectedServer(e.target.value)} style={{ padding: '2px 6px' }}>
              {getStewardsList().map(s => (
                <option key={s.id} value={s.shortName}>
                  [{s.serverCode}] {s.shortName} ({s.role})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <strong style={{ color: '#000080' }}>Covers:</strong>
            <input 
              type="number" 
              className="ids-input" 
              value={covers} 
              onChange={e => setCovers(Math.max(1, parseInt(e.target.value) || 1))}
              style={{ width: '46px', textAlign: 'center', fontWeight: 700 }} 
            />
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', whiteSpace: 'nowrap' }}>
            <span style={{ background: '#D4D0C8', padding: '3px 8px', border: '1px inset #FFF', fontWeight: 600 }}>
              Session: <strong style={{ color: '#0A246A' }}>{activeSession}</strong>
            </span>
            <span style={{ background: '#D4D0C8', padding: '3px 8px', border: '1px inset #FFF', fontWeight: 600 }}>
              Date: <strong style={{ color: '#0A246A' }}>{accountingDate}</strong>
            </span>
            <span style={{ background: '#0A246A', color: '#FFF', padding: '3px 8px', borderRadius: '2px', fontWeight: 700 }}>
              Cashier: {currentUser}
            </span>
          </div>
        </div>

        {/* ================================================================= */}
        {/* MAIN SPLIT WORKSPACE (50% TOUCH MENU | 50% ORDERS & BILLING)      */}
        {/* ================================================================= */}
        <div 
          className="ids-touch-pos-body"
          style={{ 
            flex: '1 1 auto', 
            display: 'flex', 
            overflow: 'hidden', 
            minHeight: 0,
            height: 'auto',
            background: '#F0EFEA'
          }}
        >
          
          {/* ------------------------------------------------------------- */}
          {/* LEFT 50%: TOUCH MENU TILES & GROUPS                           */}
          {/* ------------------------------------------------------------- */}
          <div style={{ flex: '0 0 50%', display: 'flex', flexDirection: 'column', borderRight: '2px solid #716F64', background: '#F0EFEA', minHeight: 0 }}>
            
            {/* Menu Group Filter Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '6px 8px', background: '#D4D0C8', borderBottom: '2px solid #716F64', flexShrink: 0 }}>
              {TOUCH_GROUPS.map(g => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGroup(g.id)}
                  style={{
                    background: selectedGroup === g.id ? g.color : '#ECE9D8',
                    color: selectedGroup === g.id ? '#FFF' : '#000',
                    fontWeight: 700,
                    fontSize: '11px',
                    padding: '6px 10px',
                    border: '1px solid #716F64',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    boxShadow: selectedGroup === g.id ? 'inset 0 2px 4px rgba(0,0,0,0.3)' : '1px 1px 0 #FFF',
                    letterSpacing: '0.3px'
                  }}
                >
                  {g.name}
                </button>
              ))}
            </div>

            {/* Menu Food Tile Grid */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '6px', alignContent: 'start' }}>
              {filteredItems.map(item => (
                <div
                  key={item.code}
                  onClick={() => handleAddItemToDraft(item)}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #999',
                    borderRadius: '3px',
                    padding: '8px 8px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '72px',
                    boxShadow: '1px 1px 3px rgba(0,0,0,0.12)',
                    userSelect: 'none',
                    transition: 'all 0.08s ease'
                  }}
                  onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                  onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div>
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#111', lineHeight: '1.25' }}>{item.name}</div>
                    <div style={{ fontSize: '9.5px', color: '#666', marginTop: '2px' }}>{item.kitchen}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', borderTop: '1px dashed #EEE', paddingTop: '4px' }}>
                    <span style={{ fontSize: '10px', color: '#777', fontWeight: 600 }}>{item.code}</span>
                    <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#B8860B' }}>₹{item.price.toFixed(0)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* RIGHT 50%: WIN32 TABULAR ORDER GRIDS (DISPATCHED + DRAFT)      */}
          {/* ------------------------------------------------------------- */}
          <div style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', background: '#FFF', minHeight: 0 }}>
            
            {/* PANE 1: PREVIOUSLY DISPATCHED KOTS (SUNKEN WIN32 GRID) */}
            <div style={{ background: '#000080', color: '#FFF', padding: '5px 10px', fontSize: '11.5px', fontWeight: 700, display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
              <span>ACTIVE DISPATCHED KOTS — {selectedTable} ({dispatchedKots.length} BATCHES)</span>
              <span>SUBTOTAL: ₹{financials.dispatchedTotal.toFixed(2)}</span>
            </div>

            <div style={{ flex: '1 1 50%', minHeight: 0, overflowY: 'auto', borderBottom: '2px solid #716F64', border: '2px inset #FFF' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead style={{ background: '#ECE9D8', borderBottom: '1px solid #716F64', position: 'sticky', top: 0, zIndex: 2 }}>
                  <tr>
                    <th style={{ padding: '4px 6px', textAlign: 'left', width: '60px' }}>KOT #</th>
                    <th style={{ padding: '4px 6px', textAlign: 'left' }}>Item Description</th>
                    <th style={{ padding: '4px 6px', textAlign: 'center', width: '40px' }}>Qty</th>
                    <th style={{ padding: '4px 6px', textAlign: 'right', width: '60px' }}>Rate</th>
                    <th style={{ padding: '4px 6px', textAlign: 'right', width: '70px' }}>Amount</th>
                    <th style={{ padding: '4px 6px', textAlign: 'center', width: '75px' }}>Status</th>
                    <th style={{ padding: '4px 6px', textAlign: 'center', width: '60px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {dispatchedLineItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '28px 10px', color: '#888', fontStyle: 'italic' }}>
                        No dispatched KOTs on {selectedTable}. Click menu items on the left to queue draft items.
                      </td>
                    </tr>
                  ) : (
                    dispatchedLineItems.map(row => (
                      <tr key={row.itemKey} style={{ borderBottom: '1px solid #EEE', background: '#FAFAFA' }}>
                        <td style={{ padding: '4px 6px', fontWeight: 700, color: '#A02020' }}>{row.kotNumber}</td>
                        <td style={{ padding: '4px 6px', fontWeight: 600 }}>{row.name}</td>
                        <td style={{ padding: '4px 6px', textAlign: 'center', fontWeight: 700 }}>{row.quantity}</td>
                        <td style={{ padding: '4px 6px', textAlign: 'right', color: '#555' }}>{row.rate.toFixed(2)}</td>
                        <td style={{ padding: '4px 6px', textAlign: 'right', fontWeight: 700 }}>{row.amount.toFixed(2)}</td>
                        <td style={{ padding: '4px 6px', textAlign: 'center' }}>
                          <span style={{ fontSize: '9.5px', background: '#E6F4EA', color: '#137333', padding: '1px 5px', borderRadius: '2px', fontWeight: 700 }}>
                            {row.status}
                          </span>
                        </td>
                        <td style={{ padding: '3px 6px', textAlign: 'center' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInitiateVoid(row);
                            }}
                            className="ids-btn-classic"
                            style={{
                              background: '#8B0000',
                              color: '#FFF',
                              padding: '2px 6px',
                              fontSize: '10px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              border: '1px solid #500',
                              borderRadius: '2px',
                              lineHeight: '1.2'
                            }}
                            title="Void this kitchen dish (Requires Manager PIN & Mandatory Reason)"
                          >
                            ✕ Void
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* PANE 2: UNPRINTED DRAFT DELTA ITEMS (WAITING FOR KITCHEN PUNCH) */}
            <div style={{ background: '#475569', color: '#FFF', padding: '4px 10px', fontSize: '11.5px', fontWeight: 700, display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
              <span>DRAFT TO PUNCH (DELTA KOT #{dispatchedKots.length + 1})</span>
              <span>{draftCart.length} ITEMS WAITING</span>
            </div>

            <div style={{ flex: '1 1 50%', minHeight: 0, overflowY: 'auto', border: '2px inset #FFF' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead style={{ background: '#ECE9D8', borderBottom: '1px solid #716F64', position: 'sticky', top: 0, zIndex: 2 }}>
                  <tr>
                    <th style={{ padding: '4px 6px', textAlign: 'left' }}>Item Description</th>
                    <th style={{ padding: '4px 6px', textAlign: 'center', width: '80px' }}>Qty (+/-)</th>
                    <th style={{ padding: '4px 6px', textAlign: 'right', width: '60px' }}>Rate</th>
                    <th style={{ padding: '4px 6px', textAlign: 'right', width: '70px' }}>Amount</th>
                    <th style={{ padding: '4px 6px', textAlign: 'center', width: '40px' }}>✕</th>
                  </tr>
                </thead>
                <tbody>
                  {draftCart.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '28px 10px', color: '#888', fontStyle: 'italic' }}>
                        Draft is empty. Click any item on the left to queue for next KOT.
                      </td>
                    </tr>
                  ) : (
                    draftCart.map(item => (
                      <tr key={item.code} style={{ borderBottom: '1px solid #FFE4B5', background: '#FFFFF0' }}>
                        <td style={{ padding: '4px 6px' }}>
                          <div style={{ fontWeight: 700, color: '#B8860B' }}>{item.name}</div>
                          <div style={{ fontSize: '9.5px', color: '#888' }}>{item.code} • {item.kitchen}</div>
                        </td>
                        <td style={{ padding: '4px 6px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                            <button 
                              onClick={() => handleUpdateDraftQty(item.code, -1)}
                              style={{ width: '20px', height: '20px', padding: 0, fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                              -
                            </button>
                            <span style={{ fontWeight: 800, minWidth: '18px', textAlign: 'center' }}>{item.qty}</span>
                            <button 
                              onClick={() => handleUpdateDraftQty(item.code, 1)}
                              style={{ width: '20px', height: '20px', padding: 0, fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td style={{ padding: '4px 6px', textAlign: 'right', color: '#555' }}>{item.price.toFixed(2)}</td>
                        <td style={{ padding: '4px 6px', textAlign: 'right', fontWeight: 800 }}>{(item.price * item.qty).toFixed(2)}</td>
                        <td style={{ padding: '4px 6px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleUpdateDraftQty(item.code, -item.qty)}
                            style={{ background: 'none', border: 'none', color: '#991B1B', fontWeight: 900, cursor: 'pointer', fontSize: '12px' }}
                            title="Remove item from draft"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* FINANCIAL TOTALS SUMMARY BAR */}
            <div style={{ padding: '8px 12px', background: '#ECE9D8', borderTop: '2px solid #716F64', fontSize: '11.5px', flexShrink: 0, flex: '0 0 auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span>Dispatched Total:</span>
                    <span style={{ fontWeight: 600 }}>₹{financials.dispatchedTotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', color: '#B8860B' }}>
                    <span>Unprinted Draft Total:</span>
                    <span style={{ fontWeight: 600 }}>₹{financials.draftTotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                    <span>Gross Subtotal:</span>
                    <span>₹{financials.grossTotal.toFixed(2)}</span>
                  </div>
                  {financials.isDiscountApplied ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#B00', fontWeight: 700, marginTop: '2px', alignItems: 'center' }}>
                      <span>Discount ({financials.discountPercent.toFixed(1)}%):</span>
                      <span>
                        - ₹{financials.discountAmount.toFixed(2)}
                        <button
                          onClick={handleRemoveDiscount}
                          title="Remove discount"
                          style={{ marginLeft: '4px', border: 'none', background: 'transparent', color: '#B00', cursor: 'pointer', fontWeight: 900, fontSize: '11px' }}
                        >
                          ✕
                        </button>
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0A246A', marginTop: '2px', fontSize: '11px' }}>
                      <span>Bill Discount:</span>
                      <button
                        onClick={() => setDiscountModalOpen(true)}
                        style={{ border: 'none', background: 'transparent', color: '#0A246A', textDecoration: 'underline', cursor: 'pointer', fontWeight: 700, padding: 0 }}
                      >
                        + Add Discount [F4]
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  {financials.isDiscountApplied && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', fontWeight: 600 }}>
                      <span>Taxable Amount:</span>
                      <span>₹{financials.taxableAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', color: '#555' }}>
                    <span>CGST (2.5%):</span>
                    <span>₹{financials.cgst.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', color: '#555' }}>
                    <span>SGST (2.5%):</span>
                    <span>₹{financials.sgst.toFixed(2)}</span>
                  </div>
                  {financials.roundOff !== 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', color: '#777' }}>
                      <span>Round Off:</span>
                      <span>{financials.roundOff >= 0 ? `+₹${financials.roundOff.toFixed(2)}` : `-₹${Math.abs(financials.roundOff).toFixed(2)}`}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '14px', color: '#0A246A', borderTop: '2px solid #716F64', paddingTop: '3px' }}>
                    <span>GRAND TOTAL:</span>
                    <span>₹{financials.grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ================================================================= */}
        {/* WIN32 BEVEL COMMAND TOOLBAR (FULL WIDTH SPAN ACROSS MODAL BOTTOM)  */}
        {/* ================================================================= */}
        <div 
          className="ids-touch-pos-bottombar"
          style={{ 
            padding: '5px 10px', 
            background: '#D4D0C8', 
            borderTop: '2px solid #716F64', 
            display: 'grid', 
            gridTemplateColumns: 'repeat(8, 1fr)', 
            gap: '6px',
            flex: '0 0 auto',
            flexShrink: 0,
            height: '50px',
            minHeight: '50px',
            maxHeight: '50px',
            boxSizing: 'border-box',
            alignItems: 'center'
          }}
        >
          <button 
            onClick={() => setSelectedGroup('ALL')}
            className="ids-btn-classic" 
            style={{ background: '#334155', color: '#FFF', fontWeight: 700, padding: '0 4px', fontSize: '11px', cursor: 'pointer', height: '38px', minHeight: '38px', maxHeight: '38px', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="F1: Reset menu to ALL ITEMS category"
          >
            [F1] ALL MENU
          </button>

          <button 
            onClick={handlePunchDeltaKot}
            className="ids-btn-classic" 
            style={{ background: '#166534', color: '#FFF', fontWeight: 700, padding: '0 4px', fontSize: '11px', cursor: 'pointer', height: '38px', minHeight: '38px', maxHeight: '38px', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="F2: Dispatches ONLY draft items with new KOT # to kitchen"
          >
            [F2] PUNCH KOT
          </button>

          <button 
            onClick={handleViewLatestKotSlip}
            className="ids-btn-classic" 
            style={{ background: '#475569', color: '#FFF', fontWeight: 700, padding: '0 4px', fontSize: '11px', cursor: 'pointer', height: '38px', minHeight: '38px', maxHeight: '38px', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="F3: View or reprint 80mm thermal KOT slip"
          >
            [F3] VIEW KOT
          </button>

          <button 
            onClick={() => setDiscountModalOpen(true)}
            className="ids-btn-classic" 
            style={{ background: financials.isDiscountApplied ? '#B45309' : '#1D4ED8', color: '#FFF', fontWeight: 700, padding: '0 4px', fontSize: '11px', cursor: 'pointer', height: '38px', minHeight: '38px', maxHeight: '38px', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="F4: Apply food bill discount (≤ 5% Cashier, > 5% Manager PIN)"
          >
            {financials.isDiscountApplied ? `[F4] DISC ${financials.discountPercent.toFixed(0)}%` : '[F4] DISCOUNT'}
          </button>

          <button 
            onClick={() => setMergeTableModalOpen(true)}
            className="ids-btn-classic" 
            style={{ background: '#6B21A8', color: '#FFF', fontWeight: 700, padding: '0 4px', fontSize: '11px', cursor: 'pointer', height: '38px', minHeight: '38px', maxHeight: '38px', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="F5: Merge running KOTs from another table into this one"
          >
            [F5] MERGE
          </button>

          <button 
            onClick={() => {
              if (dispatchedLineItems.length > 0) {
                handleInitiateVoid(dispatchedLineItems[0]);
              } else {
                setMessagePrompt(`No dispatched items on ${selectedTable} to void.`);
              }
            }}
            className="ids-btn-classic" 
            style={{ background: '#991B1B', color: '#FFF', fontWeight: 700, padding: '0 4px', fontSize: '11px', cursor: 'pointer', height: '38px', minHeight: '38px', maxHeight: '38px', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="F6: Void kitchen dish with Manager PIN & mandatory reason"
          >
            [F6] VOID
          </button>

          <button 
            onClick={() => setPrintBillModalOpen(true)}
            className="ids-btn-classic" 
            style={{ background: '#0A246A', color: '#FFF', fontWeight: 700, padding: '0 4px', fontSize: '11px', cursor: 'pointer', height: '38px', minHeight: '38px', maxHeight: '38px', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="F7: Print consolidated GST Tax Invoice for guest"
          >
            [F7] PRINT BILL
          </button>

          <button 
            onClick={() => setSettlementModalOpen(true)}
            className="ids-btn-classic" 
            style={{ background: '#B45309', color: '#FFF', fontWeight: 700, padding: '0 4px', fontSize: '11px', cursor: 'pointer', height: '38px', minHeight: '38px', maxHeight: '38px', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="F8: Settle payment (Cash, UPI QR, Card, Room Folio) and free table"
          >
            [F8] SETTLE
          </button>
        </div>

        {/* ================================================================= */}
        {/* BOTTOM MESSAGE PROMPT STATUS BAR                                  */}
        {/* ================================================================= */}
        {messagePrompt && (
          <div style={{ padding: '4px 10px', background: '#FFF7CC', borderTop: '1px solid #E6B800', fontSize: '11px', fontWeight: 700, color: '#333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <span>{messagePrompt}</span>
            <button 
              onClick={() => setMessagePrompt(null)}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 900 }}
            >
              ✕
            </button>
          </div>
        )}

      </div>

      {/* =================================================================== */}
      {/* MODAL 1: AUTHENTIC 80MM THERMAL KOT DELTA SLIP (WIN32 MODAL)        */}
      {/* Shows strictly the delta items punched in this batch                */}
      {/* =================================================================== */}
      {thermalKotModalOpen && activeKotSlip && (
        <div className="ids-modal-overlay" style={{ zIndex: 1200 }}>
          <div className="ids-dialog-window" style={{ width: '380px', background: '#D4D0C8' }}>
            <div className="ids-dialog-titlebar" style={{ background: '#0A246A', color: '#FFF', display: 'flex', justifyContent: 'space-between' }}>
              <span>Kitchen Order Ticket (KOT Delta Slip)</span>
              <button className="ids-win-btn close" onClick={() => setThermalKotModalOpen(false)}>✕</button>
            </div>

            <div style={{ padding: '12px' }}>
              {/* Monospace Dot-Matrix Print Preview */}
              <div 
                style={{ 
                  background: '#FFF', 
                  border: '1px solid #999', 
                  padding: '12px', 
                  fontFamily: 'monospace', 
                  fontSize: '11px', 
                  color: '#000',
                  lineHeight: '1.4',
                  boxShadow: 'inset 0 0 4px rgba(0,0,0,0.2)'
                }}
              >
                <div style={{ textAlign: 'center', fontWeight: 'bold' }}>================================</div>
                <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '12px' }}>KITCHEN ORDER TICKET (KOT)</div>
                <div style={{ textAlign: 'center' }}>{HOTEL_CONFIG.name}</div>
                <div style={{ textAlign: 'center' }}>================================</div>
                <div>TABLE NO : <strong>{activeKotSlip.tableNo || selectedTable}</strong></div>
                <div>KOT NO   : <strong>KOT #{activeKotSlip.runningKotIndex || activeKotSlip.kotNumber || 1}</strong></div>
                <div>DATE/TIME: {activeKotSlip.timeFormatted || new Date().toLocaleTimeString()}</div>
                <div>STEWARD  : {activeKotSlip.steward || selectedServer}</div>
                <div>OUTLET   : {activeKotSlip.outlet || activeOutlet}</div>
                <div>--------------------------------</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span>ITEM DESCRIPTION</span>
                  <span>QTY</span>
                </div>
                <div>--------------------------------</div>
                {(activeKotSlip.items || []).map((it, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', margin: '3px 0' }}>
                    <span>{it.name}</span>
                    <span style={{ fontWeight: 'bold' }}>{it.quantity || it.qty}</span>
                  </div>
                ))}
                <div>--------------------------------</div>
                <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '10px' }}>
                  * DELTA DISPATCH ONLY *
                </div>
                <div style={{ textAlign: 'center', fontSize: '10px', color: '#666' }}>
                  Previous items not listed
                </div>
                <div style={{ textAlign: 'center', fontWeight: 'bold' }}>================================</div>
              </div>

              <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                <button 
                  onClick={() => {
                    window.print();
                    setThermalKotModalOpen(false);
                  }}
                  className="ids-btn-classic print success"
                  style={{ fontWeight: 700 }}
                >
                  Print to Thermal Printer
                </button>
                <button 
                  onClick={() => setThermalKotModalOpen(false)}
                  className="ids-btn-classic exit danger"
                >
                  Close [Esc]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: WIN32 TABLE MERGE / SHIFT DIALOG                           */}
      {/* Merges all KOTs from Source Table into Target Table                  */}
      {/* =================================================================== */}
      {mergeTableModalOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1200 }}>
          <div className="ids-dialog-window" style={{ width: '440px', background: '#D4D0C8' }}>
            <div className="ids-dialog-titlebar" style={{ background: '#7B1FA2', color: '#FFF', display: 'flex', justifyContent: 'space-between' }}>
              <span>Table Merge / Shift Utility [F5]</span>
              <button className="ids-win-btn close" onClick={() => setMergeTableModalOpen(false)}>✕</button>
            </div>

            <div style={{ padding: '14px', fontSize: '11px' }}>
              <div style={{ marginBottom: '12px', background: '#FFF', padding: '8px', border: '1px solid #716F64' }}>
                <div style={{ fontWeight: 700, marginBottom: '6px', color: '#0A246A' }}>
                  Merge Another Table into Current Active Table:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '6px', alignItems: 'center' }}>
                  <label><strong>Source Table:</strong></label>
                  <select 
                    className="ids-select" 
                    value={mergeSourceTable} 
                    onChange={e => setMergeSourceTable(e.target.value)}
                  >
                    {ALL_POS_TABLES.filter(t => t !== selectedTable).map(t => {
                      const badge = getTableOccupancyBadge(t);
                      return (
                        <option key={t} value={t}>
                          {t} — {badge.text}
                        </option>
                      );
                    })}
                  </select>

                  <label><strong>Target Table:</strong></label>
                  <div style={{ fontWeight: 700, color: '#A02020' }}>
                    {selectedTable} (Active)
                  </div>
                </div>
              </div>

              <div style={{ color: '#555', fontSize: '10.5px', marginBottom: '12px' }}>
                • All dispatched KOTs and cumulative items from Source Table will be combined into {selectedTable}.<br />
                • Source Table will be released and marked <strong>VACANT</strong>.<br />
                • Total bill will automatically recalculate for consolidated single guest receipt.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                <button 
                  onClick={handleExecuteTableMerge}
                  className="ids-btn-classic success confirm" 
                  style={{ fontWeight: 700 }}
                >
                  Execute Table Merge
                </button>
                <button 
                  onClick={() => setMergeTableModalOpen(false)}
                  className="ids-btn-classic cancel danger"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: WIN32 CONSOLIDATED GUEST TAX INVOICE (CUMULATIVE BILL)      */}
      {/* Combines ALL KOT batches into a single GST receipt                  */}
      {/* =================================================================== */}
      {printBillModalOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1200 }}>
          <div className="ids-dialog-window" style={{ width: '420px', background: '#D4D0C8' }}>
            <div className="ids-dialog-titlebar" style={{ background: '#0A246A', color: '#FFF', display: 'flex', justifyContent: 'space-between' }}>
              <span>Tax Invoice / Consolidated Guest Bill</span>
              <button className="ids-win-btn close" onClick={() => setPrintBillModalOpen(false)}>✕</button>
            </div>

            <div style={{ padding: '12px' }}>
              <div 
                style={{ 
                  background: '#FFF', 
                  border: '1px solid #999', 
                  padding: '12px', 
                  fontFamily: 'monospace', 
                  fontSize: '11px', 
                  color: '#000',
                  lineHeight: '1.4'
                }}
              >
                <div style={{ textAlign: 'center', fontWeight: 'bold' }}>================================</div>
                <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '12px' }}>HOTEL ELITE INN & RESTAURANT</div>
                <div style={{ textAlign: 'center', fontSize: '10px' }}>VIP Road, Puri, Odisha - 752001</div>
                <div style={{ textAlign: 'center', fontSize: '10px' }}>GSTIN: 21ABCDE1234F1Z5 | SAC: 996331</div>
                <div style={{ textAlign: 'center', fontWeight: 'bold' }}>================================</div>
                <div style={{ textAlign: 'center', fontWeight: 'bold' }}>TAX INVOICE / GUEST BILL</div>
                <div>BILL NO  : POS-{Date.now().toString().slice(-4)}</div>
                <div>TABLE NO : {selectedTable} | COVERS: {covers}</div>
                <div>DATE/TIME: {accountingDate} {new Date().toLocaleTimeString()}</div>
                <div>STEWARD  : {selectedServer}</div>
                <div>OUTLET   : {activeOutlet}</div>
                <div>--------------------------------</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span>ITEM [KOT #]</span>
                  <span>QTY  RATE   AMOUNT</span>
                </div>
                <div>--------------------------------</div>
                {dispatchedLineItems.map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
                    <span style={{ maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {it.name} [{it.kotNumber.replace('KOT #', 'K')}]
                    </span>
                    <span>
                      {it.quantity} x {it.rate.toFixed(0)} = {it.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
                <div>--------------------------------</div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>FOOD GROSS:</span>
                  <span>₹{financials.grossTotal.toFixed(2)}</span>
                </div>
                {financials.isDiscountApplied && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#B00' }}>
                    <span>DISCOUNT ({financials.discountPercent.toFixed(1)}%):</span>
                    <span>-₹{financials.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {financials.isDiscountApplied && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                    <span>TAXABLE VALUE:</span>
                    <span>₹{financials.taxableAmount.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                  <span>CGST (2.5%):</span>
                  <span>₹{financials.cgst.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                  <span>SGST (2.5%):</span>
                  <span>₹{financials.sgst.toFixed(2)}</span>
                </div>
                {financials.roundOff !== 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>ROUND OFF:</span>
                    <span>{financials.roundOff >= 0 ? `+₹${financials.roundOff.toFixed(2)}` : `-₹${Math.abs(financials.roundOff).toFixed(2)}`}</span>
                  </div>
                )}
                <div>--------------------------------</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '13px' }}>
                  <span>GRAND TOTAL:</span>
                  <span>₹{financials.grandTotal.toFixed(2)}</span>
                </div>
                <div style={{ textAlign: 'center', fontWeight: 'bold' }}>================================</div>
                <div style={{ textAlign: 'center', fontSize: '10px' }}>Thank you! Visit again.</div>
              </div>

              <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                <button 
                  onClick={() => {
                    window.print();
                    setPrintBillModalOpen(false);
                  }}
                  className="ids-btn-classic print info"
                  style={{ fontWeight: 700 }}
                >
                  Print Bill
                </button>
                <button 
                  onClick={() => setPrintBillModalOpen(false)}
                  className="ids-btn-classic exit danger"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 4: WIN32 BILL SETTLEMENT & CASHIERING DIALOG                  */}
      {/* Settle via Cash, UPI QR, Card, or Post to Room Folio                */}
      {/* =================================================================== */}
      {settlementModalOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1200 }}>
          <div className="ids-dialog-window" style={{ width: '480px', background: '#D4D0C8' }}>
            <div className="ids-dialog-titlebar" style={{ background: '#B8860B', color: '#FFF', display: 'flex', justifyContent: 'space-between' }}>
              <span>Bill Settlement & Cash Out [F8] — {selectedTable}</span>
              <button className="ids-win-btn close" onClick={() => setSettlementModalOpen(false)}>✕</button>
            </div>

            <div style={{ padding: '14px', fontSize: '11px' }}>
              {/* Grand Total Display */}
              <div style={{ background: '#0A246A', color: '#FFF', padding: '10px', textAlign: 'center', marginBottom: '12px', borderRadius: '2px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase' }}>Net Settling Amount</div>
                <div style={{ fontSize: '24px', fontWeight: 900 }}>₹{financials.grandTotal.toFixed(2)}</div>
                <div style={{ fontSize: '10px', color: '#DDD' }}>Table: {selectedTable} • {financials.totalItemCount} Total Items</div>
                {financials.discountAmount > 0 ? (
                  <div style={{ marginTop: '4px', fontSize: '10px', color: '#A5D6A7', fontWeight: 700 }}>
                    Discount Deducted: ₹{financials.discountAmount.toFixed(2)} ({financials.discountPercent.toFixed(1)}%) • {tableDiscounts[selectedTable]?.reason || 'Allowed'}
                  </div>
                ) : (
                  <div style={{ marginTop: '4px', fontSize: '10px', color: '#BBB' }}>
                    Gross: ₹{financials.foodGross.toFixed(2)} (No Bill Discount Applied)
                  </div>
                )}
                <div style={{ marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSettlementModalOpen(false);
                      setDiscountModalOpen(true);
                    }}
                    className="ids-btn-classic"
                    style={{ fontSize: '10px', padding: '3px 8px', background: '#ECE9D8', color: '#000', cursor: 'pointer', fontWeight: 600 }}
                  >
                    🏷️ {financials.discountAmount > 0 ? 'Modify / Remove Discount [F4]' : 'Apply Bill Discount [F4]'}
                  </button>
                </div>
              </div>

              {/* Payment Mode Selector */}
              <div style={{ marginBottom: '12px' }}>
                <label><strong>Select Payment Method:</strong></label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginTop: '4px' }}>
                  {['CASH', 'UPI', 'CARD', 'ROOM'].map(mode => (
                    <button
                      key={mode}
                      onClick={() => setSettlePayMode(mode)}
                      className="ids-btn-classic"
                      style={{
                        padding: '8px 0',
                        fontWeight: 700,
                        background: settlePayMode === mode ? '#0A246A' : '#ECE9D8',
                        color: settlePayMode === mode ? '#FFF' : '#000'
                      }}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Payment Details */}
              {settlePayMode === 'UPI' && (
                <div style={{ textAlign: 'center', background: '#FFF', padding: '10px', border: '1px solid #999', marginBottom: '12px' }}>
                  <div style={{ fontWeight: 700, marginBottom: '6px' }}>Scan with Any UPI App (GPay / PhonePe / Paytm)</div>
                  {upiQrDataUrl ? (
                    <img src={upiQrDataUrl} alt="UPI QR" style={{ width: '150px', height: '150px', margin: '0 auto', display: 'block' }} />
                  ) : (
                    <div>Generating UPI QR Code...</div>
                  )}
                  <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>UPI ID: hoteleliteinn@icici</div>
                </div>
              )}

              {settlePayMode === 'ROOM' && (
                <div style={{ background: '#FFF', padding: '10px', border: '1px solid #999', marginBottom: '12px' }}>
                  <label><strong>Select Room Number to Charge:</strong></label>
                  <select 
                    className="ids-select" 
                    value={settleRoomNo} 
                    onChange={e => setSettleRoomNo(e.target.value)}
                    style={{ width: '100%', marginTop: '4px' }}
                  >
                    {['101', '102', '103', '201', '202', '203', '204', '301', '302', '305'].map(r => (
                      <option key={r} value={r}>Room {r} (Occupied In-House Guest)</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                <button 
                  onClick={handleExecuteSettlement}
                  className="ids-btn-classic success confirm" 
                  style={{ fontWeight: 700, padding: '7px 16px' }}
                >
                  Confirm Settlement & Release Table
                </button>
                <button 
                  onClick={() => setSettlementModalOpen(false)}
                  className="ids-btn-classic cancel"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 5: WIN32 KOT DISH VOID & SECURITY AUTHORIZATION DIALOG        */}
      {/* Requires Supervisor/Manager PIN (1234) & Mandatory Reason to Void   */}
      {/* =================================================================== */}
      {voidModalOpen && targetVoidItem && (
        <div className="ids-modal-overlay" style={{ zIndex: 1300 }}>
          <div className="ids-dialog-window" style={{ width: '470px', background: '#ECE9D8', border: '2px solid #FFF', borderRightColor: '#716F64', borderBottomColor: '#716F64', boxShadow: '3px 3px 10px rgba(0,0,0,0.5)' }}>
            
            {/* Titlebar with Wine Red Security Gradient */}
            <div className="ids-dialog-titlebar" style={{ background: '#8B0000', color: '#FFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '12px' }}>
                <span>🔒</span>
                <span>KOT Item Void & Cancellation — Manager Security Control</span>
              </div>
              <button className="ids-win-btn close" onClick={() => setVoidModalOpen(false)} style={{ color: '#000' }}>✕</button>
            </div>

            <div style={{ padding: '12px', fontSize: '11px' }}>
              
              {/* Statutory Anti-Theft Protocol Warning Box */}
              <div style={{ background: '#FFF5F5', border: '1px solid #FFCDD2', padding: '6px 10px', marginBottom: '10px', borderRadius: '2px' }}>
                <div style={{ fontWeight: 700, color: '#C62828', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>🛡️ Anti-Pilferage Control Notice:</span>
                </div>
                <div style={{ color: '#444', fontSize: '10.5px', marginTop: '2px' }}>
                  Dispatched dishes cannot be deleted by Cashiers/Stewards. Voiding requires a verified <strong>Supervisor PIN (Default: 1234)</strong> and a mandatory statutory reason. All actions are logged to the audit ledger.
                </div>
              </div>

              {/* Target Item Details Card */}
              <div style={{ background: '#FFF', border: '1px solid #716F64', padding: '8px 10px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Table: <strong style={{ color: '#0A246A' }}>{selectedTable}</strong></span>
                  <span>Batch: <strong style={{ color: '#8B0000' }}>{targetVoidItem.kotNumber}</strong></span>
                  <span>Steward: <strong>{targetVoidItem.steward || selectedServer}</strong></span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#000', margin: '4px 0' }}>
                  {targetVoidItem.name}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#666', borderTop: '1px dashed #CCC', paddingTop: '4px' }}>
                  <span>Code: {targetVoidItem.itemCode}</span>
                  <span>Dispatched Qty: <strong>{targetVoidItem.quantity}</strong></span>
                  <span>Rate: ₹{targetVoidItem.rate.toFixed(2)}</span>
                </div>
              </div>

              {/* Void Quantity & Loss Value */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                <div style={{ background: '#FFF', padding: '6px 8px', border: '1px solid #999' }}>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '3px' }}>Qty to Void / Cancel:</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setVoidQty(prev => Math.max(1, prev - 1))}
                      style={{ width: '26px', height: '24px', fontWeight: 900, cursor: 'pointer', background: '#ECE9D8', border: '1px solid #716F64' }}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={targetVoidItem.quantity}
                      value={voidQty}
                      onChange={e => {
                        const val = parseInt(e.target.value) || 1;
                        setVoidQty(Math.min(targetVoidItem.quantity, Math.max(1, val)));
                      }}
                      style={{ width: '50px', textAlign: 'center', fontWeight: 700, fontSize: '12px', padding: '2px', border: '1px solid #7F9DB9' }}
                    />
                    <button
                      type="button"
                      onClick={() => setVoidQty(prev => Math.min(targetVoidItem.quantity, prev + 1))}
                      style={{ width: '26px', height: '24px', fontWeight: 900, cursor: 'pointer', background: '#ECE9D8', border: '1px solid #716F64' }}
                    >
                      +
                    </button>
                    <span style={{ fontSize: '10px', color: '#666' }}>of {targetVoidItem.quantity}</span>
                  </div>
                </div>

                <div style={{ background: '#FFF', padding: '6px 8px', border: '1px solid #999', textAlign: 'right' }}>
                  <label style={{ display: 'block', fontWeight: 700, color: '#666', marginBottom: '2px' }}>Audit Loss Valuation:</label>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#C62828' }}>
                    ₹{(Number(voidQty) * targetVoidItem.rate).toFixed(2)}
                  </div>
                  <div style={{ fontSize: '9.5px', color: '#888' }}>Debited to F&B Void Loss</div>
                </div>
              </div>

              {/* Mandatory Reason Dropdown */}
              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '2px', color: '#000' }}>
                  Mandatory Void Reason <span style={{ color: '#C62828' }}>*</span>:
                </label>
                <select
                  value={voidReason}
                  onChange={e => setVoidReason(e.target.value)}
                  style={{ width: '100%', padding: '4px', border: '1px solid #7F9DB9', background: '#FFF', fontSize: '11px', fontWeight: 600 }}
                >
                  {KOT_VOID_REASONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Remarks Text Box */}
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '2px', color: '#000' }}>
                  Remarks / Guest Feedback {voidReason.startsWith('Other') && <span style={{ color: '#C62828' }}>*</span>}:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Guest cancelled before kitchen started wok / Wrong item selected"
                  value={voidRemarks}
                  onChange={e => setVoidRemarks(e.target.value)}
                  style={{ width: '100%', padding: '4px 6px', border: '1px solid #7F9DB9', background: '#FFF', fontSize: '11px', boxSizing: 'border-box' }}
                />
              </div>

              {/* Touchscreen Manager Security PIN Section */}
              <div style={{ background: '#F0ECE1', border: '1px solid #B0A898', padding: '8px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontWeight: 700, color: '#0A246A', fontSize: '11px' }}>
                    🔑 Supervisor / Manager PIN:
                  </label>
                  <span style={{ fontSize: '10px', color: '#666' }}>(Default: <strong>1234</strong>)</span>
                </div>

                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                  <input
                    type={showPinMask ? 'password' : 'text'}
                    maxLength={6}
                    placeholder="Enter PIN"
                    value={managerPin}
                    onChange={e => setManagerPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    style={{ flex: 1, padding: '6px 8px', fontSize: '16px', fontWeight: 800, letterSpacing: '4px', textAlign: 'center', border: '2px inset #FFF', background: '#FFF' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPinMask(prev => !prev)}
                    className="ids-btn-classic"
                    style={{ padding: '0 8px', fontSize: '11px', cursor: 'pointer' }}
                    title="Toggle PIN Visibility"
                  >
                    {showPinMask ? '👁️ Show' : '🔒 Hide'}
                  </button>
                </div>

                {/* On-Screen Touch Keypad for Touch Terminals */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', maxWidth: '240px', margin: '0 auto' }}>
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLEAR', '0', 'BACKSPACE'].map(keyVal => (
                    <button
                      key={keyVal}
                      type="button"
                      onClick={() => handlePinKeypadPress(keyVal)}
                      className="ids-btn-classic"
                      style={{
                        padding: '8px 4px',
                        fontSize: keyVal.length > 1 ? '10px' : '14px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: keyVal === 'CLEAR' ? '#FFF0F0' : keyVal === 'BACKSPACE' ? '#FFF8E7' : '#ECE9D8',
                        color: keyVal === 'CLEAR' ? '#C62828' : '#000'
                      }}
                    >
                      {keyVal === 'CLEAR' ? 'CLR' : keyVal === 'BACKSPACE' ? '⌫' : keyVal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message Box */}
              {voidError && (
                <div style={{ background: '#FFEBEE', color: '#C62828', border: '1px solid #EF9A9A', padding: '6px 8px', marginBottom: '10px', fontWeight: 700, fontSize: '11px', borderRadius: '2px' }}>
                  {voidError}
                </div>
              )}

              {/* Dialog Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', borderTop: '1px solid #B0A898', paddingTop: '8px' }}>
                <button
                  type="button"
                  onClick={handleConfirmVoidItem}
                  className="ids-btn-classic danger void"
                  style={{ fontWeight: 700, padding: '6px 14px', fontSize: '11px', cursor: 'pointer' }}
                >
                  ✓ Authorize & Void Item
                </button>
                <button
                  type="button"
                  onClick={() => setVoidModalOpen(false)}
                  className="ids-btn-classic cancel danger"
                  style={{ padding: '6px 14px', fontSize: '11px', cursor: 'pointer' }}
                >
                  Cancel [Esc]
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 6: WIN32 BILL DISCOUNT & ALLOWANCE DIALOG (5% CASHIER THRESHOLD) */}
      {/* =================================================================== */}
      <IdsPosDiscountModal
        isOpen={discountModalOpen}
        onClose={() => setDiscountModalOpen(false)}
        billNo={`RES-B-${selectedTable.replace(/[^0-9]/g, '').padStart(5, '0') || '00101'}`}
        tableNo={selectedTable}
        grossTotal={financials.foodGross}
        taxRate={5.0}
        currentUser="CASHIER"
        currentDiscount={tableDiscounts[selectedTable] || null}
        onApplyDiscount={handleApplyDiscount}
        onRemoveDiscount={handleRemoveDiscount}
      />

    </div>
  );
}
