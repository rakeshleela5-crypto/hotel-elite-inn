import React, { useState, useMemo, useEffect } from 'react';
import './idsFortuneNext.css';
import { 
  Printer, Edit3, ArrowRightLeft, Users, BookOpen, Scissors, 
  Trash2, XOctagon, ToggleLeft, ToggleRight, Building, HelpCircle, 
  RotateCcw, Check, X, Search, ChevronRight, CornerDownLeft, CreditCard, FileText,
  SlidersHorizontal, Archive, LogOut
} from 'lucide-react';
import { RESTAURANT_MENU } from '../../data/hotelData';
import { 
  getLiveKots, saveLiveKots, broadcastKotChannel, 
  normalizeKotOrder, KOT_STORAGE_KEY, KDS_CHANNEL_NAME 
} from '../../utils/kotDataSync';
import IdsPosBillModal from './IdsPosBillModal';
import IdsPosBillSettlementModal from './IdsPosBillSettlementModal';
import IdsMenuGroupsModal, { getStoredMenuGroups } from './IdsMenuGroupsModal';
import IdsTouchScreenGroupsModal, { getStoredTouchScreenGroups } from './IdsTouchScreenGroupsModal';
import IdsRestaurantTableMasterModal, { getStoredRestaurantTables } from './IdsRestaurantTableMasterModal';
import IdsServersModal, { getStoredServers } from './IdsServersModal';
import IdsMenuMasterModal, { getStoredMenuItems } from './IdsMenuMasterModal';
import IdsSalesPromotionMasterModal, { getStoredPromotions } from './IdsSalesPromotionMasterModal';

// Authentic NC Department Cost Centers (Video 07 Frame 016)
export const POS_NC_DEPARTMENTS = [
  'Admin & General',
  'Complimentary',
  'Director',
  'Managers',
  'Room Guest',
  'Sales & Marketing',
  'Staff Cafeteria',
  'F&B Production'
];

// Authentic Supplying Outlets (Video 11 Frame 021 & Frame 023)
export const POS_SUPPLYING_OUTLETS = [
  { code: 'CAR', name: 'LIQUOR BAR', label: 'LIQUOR BAR', type: 'BAR' },
  { code: 'RES', name: 'RESTAURANT', label: 'RESTAURANT', type: 'RESTAURANT' },
  { code: 'RS', name: 'ROOM SERVICE', label: 'ROOM SERVICE', type: 'ROOM SERVICE' },
  { code: 'BNQ', name: 'BANQUET', label: 'BANQUET', type: 'BANQUET' }
];

// Authentic Menu Database from Videos 01, 02, 07, 10, 11 and Hotel Elite Inn
export const POS_MENU_ITEMS = [
  { code: '1', name: 'CLASSIC RUSSIAN SALAD', category: 'SALAD', outlet: 'RES', outletName: 'RESTAURANT', rate: 199.00 },
  { code: '2', name: 'RED BEANS PEANUT & DRY FRUIT', category: 'SALAD', outlet: 'RES', outletName: 'RESTAURANT', rate: 199.00 },
  { code: '3', name: 'SPROUTED MOONG PEANUT DRY', category: 'SALAD', outlet: 'RES', outletName: 'RESTAURANT', rate: 199.00 },
  { code: '4', name: 'CAESAR SALAD (VEG)', category: 'SALAD', outlet: 'RES', outletName: 'RESTAURANT', rate: 245.00 },
  { code: '5', name: 'CAESAR SALAD (CHICKEN)', category: 'SALAD', outlet: 'RES', outletName: 'RESTAURANT', rate: 295.00 },
  { code: '189', name: 'MILK SHAKE WITH ICE CREAM(SB)', category: 'BEVERAGE', outlet: 'RES', outletName: 'RESTAURANT', rate: 150.00 },
  { code: '155', name: 'BLUEBERRY COLD CHEESE CAKE(MC)', category: 'DESSERT', outlet: 'RES', outletName: 'RESTAURANT', rate: 165.00 },
  { code: '82', name: 'STEAMED RICE', category: 'RICE', outlet: 'RES', outletName: 'RESTAURANT', rate: 145.00 },
  { code: '54', name: 'DAL MAHARANI', category: 'MAIN COURSE', outlet: 'RES', outletName: 'RESTAURANT', rate: 200.00 },
  { code: '175', name: 'CHICKEN SHAWARMA', category: 'SNACKS', outlet: 'RES', outletName: 'RESTAURANT', rate: 150.00 },
  { code: '186', name: 'MINERAL WATER(58)', category: 'BEVERAGE', outlet: 'RES', outletName: 'RESTAURANT', rate: 120.00 },
  { code: '87', name: 'PAPAD (2 PIECE ROASTED OR FRIE', category: 'APPETIZER', outlet: 'RES', outletName: 'RESTAURANT', rate: 40.00 },
  { code: '93', name: 'KOLIWADA FISH CURRY WITH MINI', category: 'SEAFOOD', outlet: 'RES', outletName: 'RESTAURANT', rate: 320.00 },
  { code: '149', name: 'CHICKEN FRIED RICE/NOODLES', category: 'CHINESE', outlet: 'RES', outletName: 'RESTAURANT', rate: 210.00 },
  { code: '146', name: 'EGG FRIED RICE', category: 'CHINESE', outlet: 'RES', outletName: 'RESTAURANT', rate: 180.00 },
  { code: '83', name: 'JEERA RICE', category: 'RICE', outlet: 'RES', outletName: 'RESTAURANT', rate: 160.00 },
  { code: '147', name: 'MIX FRIED RICE/NOODLES (CHICKE', category: 'CHINESE', outlet: 'RES', outletName: 'RESTAURANT', rate: 240.00 },
  { code: '148', name: 'PRAWN FRIED RICE/NOODLES', category: 'CHINESE', outlet: 'RES', outletName: 'RESTAURANT', rate: 260.00 },
  { code: '145', name: 'VEGETABLE FRIED RICE/NOODLES', category: 'CHINESE', outlet: 'RES', outletName: 'RESTAURANT', rate: 170.00 },
  { code: '150', name: 'BAKED GULAB JAMUN PISTACHIO', category: 'DESSERT', outlet: 'RES', outletName: 'RESTAURANT', rate: 130.00 },
  { code: '169', name: 'BUTTER CHICKEN BURGER', category: 'SNACKS', outlet: 'RES', outletName: 'RESTAURANT', rate: 190.00 },
  { code: '125', name: 'CHICKEN A LA KING(OINV)', category: 'CONTINENTAL', outlet: 'RES', outletName: 'RESTAURANT', rate: 280.00 },
  { code: '140', name: 'CHICKEN CHILLI (BONE/BONELESS)', category: 'CHINESE', outlet: 'RES', outletName: 'RESTAURANT', rate: 230.00 },
  { code: '132', name: 'CHICKEN DIM SUM (FRIED/STEAMED', category: 'CHINESE', outlet: 'RES', outletName: 'RESTAURANT', rate: 195.00 },
  { code: '60', name: 'CHICKEN MAJEDAR BHARTA', category: 'MAIN COURSE', outlet: 'RES', outletName: 'RESTAURANT', rate: 250.00 },
  { code: '120', name: 'CHICKEN SHASHLIK(OINV)', category: 'CONTINENTAL', outlet: 'RES', outletName: 'RESTAURANT', rate: 275.00 },
  
  // Video 11 Authentic Bar Items (LIQUOR BAR, Outlet Code CAR / BAR - Frame 028, 033)
  { code: '601', name: 'BLENDERS PRIDE ...', fullName: 'BLENDERS PRIDE (60ML)', category: 'LIQUOR', outlet: 'CAR', outletName: 'LIQUOR BAR', rate: 135.00 },
  { code: '592', name: 'JW BLACK LABEL ...', fullName: 'JW BLACK LABEL (60ML)', category: 'LIQUOR', outlet: 'CAR', outletName: 'LIQUOR BAR', rate: 480.00 },
  { code: '599', name: 'BLENDERS PRIDE RESERVE', fullName: 'BLENDERS PRIDE RESERVE (60ML)', category: 'LIQUOR', outlet: 'CAR', outletName: 'LIQUOR BAR', rate: 150.00 },
  { code: '597', name: 'TEACHERS HIGHLAND CREAM', fullName: 'TEACHERS HIGHLAND CREAM (60ML)', category: 'LIQUOR', outlet: 'CAR', outletName: 'LIQUOR BAR', rate: 220.00 },
  { code: '585', name: 'KINGFISHER PREMIUM (650ML)', fullName: 'KINGFISHER PREMIUM BEER', category: 'BEER', outlet: 'CAR', outletName: 'LIQUOR BAR', rate: 180.00 },
  { code: '586', name: 'CORONA EXTRA (330ML)', fullName: 'CORONA EXTRA BEER', category: 'BEER', outlet: 'CAR', outletName: 'LIQUOR BAR', rate: 280.00 },
  { code: '590', name: 'BACARDI WHITE RUM (60ML)', fullName: 'BACARDI SUPERIOR WHITE RUM', category: 'LIQUOR', outlet: 'CAR', outletName: 'LIQUOR BAR', rate: 140.00 },
  { code: '594', name: 'CHIVAS REGAL 12 YRS (60ML)', fullName: 'CHIVAS REGAL 12 YEARS', category: 'LIQUOR', outlet: 'CAR', outletName: 'LIQUOR BAR', rate: 420.00 },
  { code: '595', name: 'GLENFIDDICH 12 YRS (60ML)', fullName: 'GLENFIDDICH 12 YRS SINGLE MALT', category: 'LIQUOR', outlet: 'CAR', outletName: 'LIQUOR BAR', rate: 550.00 },
  { code: '605', name: 'SMIRNOFF VODKA (60ML)', fullName: 'SMIRNOFF TRIPLE DISTILLED', category: 'LIQUOR', outlet: 'CAR', outletName: 'LIQUOR BAR', rate: 130.00 },
  { code: '610', name: 'SULA SAUVIGNON BLANC (GLASS)', fullName: 'SULA WHITE WINE GLASS', category: 'WINE', outlet: 'CAR', outletName: 'LIQUOR BAR', rate: 290.00 },

  // Merge in the Elite Inn 204 item catalog
  ...RESTAURANT_MENU.map(m => ({
    code: m.itemCode || String(m.id).replace('m-', ''),
    name: m.name,
    category: m.category || 'GENERAL',
    outlet: 'RES',
    outletName: 'RESTAURANT',
    rate: Number(m.dineInPrice || m.price || 100)
  }))
];

export const POS_STEWARDS = [
  'Kaushik',
  'Ajay',
  'Bijay',
  'Rahul',
  'Biren',
  'Manash',
  'Pulak',
  'Pranamika',
  'Kangkana',
  'Jalibabu'
];

export const POS_TABLES = [
  '10', '100', '11', '12', 
  '14', '15', '20', '21', 
  '22', '23', '24', '25', 
  '30', '31', '32', '33', 
  '34', '35', '40', '41'
];

// Authentic Statutory KOT Item Deletion / Void Reasons (Video 05 Frame 30 & 32)
export const POS_DELETION_REASONS = [
  'Guest Requested',
  'Cancelled by Guest',
  'Double Entry',
  'Wrongly Made',
  'Food Quality Issue',
  'Long Waiting Time',
  'Complimentary',
  'Corporate Discount',
  'GM Guest',
  'MD Guest',
  'MIXER WITH VODKA',
  'REF MR.DEEP CHANGMAI',
  'MD IPSHITA MAAM,',
  'RD FILLING STATION',
  'RD 119',
  'STAFF TAKE AWAY DISCOUNT',
  'PARTHA SIR',
  'CERTICY GUEST',
  'REF GM SIR',
  'ROOM GUEST DICOUNT',
  'KFC Tax Exemption',
  'More Order',
  'Staff Discount',
  'Travel Agnt Discount',
  'Travel Agnt Spl rate'
];

// Authentic Item Modifiers Catalog (Video 13 Frame 119 & 124)
export const POS_STANDARD_MODIFIERS = [
  { code: '99', name: 'OPEN MODIFIER', charge: 0.00 },
  { code: '01', name: 'spicy', charge: 0.00 },
  { code: '02', name: 'less spicy', charge: 0.00 },
  { code: '03', name: 'no onion no garlic', charge: 0.00 },
  { code: '04', name: 'extra cheese', charge: 30.00 },
  { code: '05', name: 'separate gravy', charge: 0.00 },
  { code: '06', name: 'well done / crispy', charge: 0.00 },
  { code: '07', name: 'jain preparation', charge: 0.00 },
  { code: '08', name: 'without sugar / sweet', charge: 0.00 }
];

export default function IdsOrderEntryModal({
  isOpen,
  onClose,
  accountingDate = '03-FEB-2022',
  onKOTCreated,
  onOpenCrystalReport
}) {
  // Outlet selection state (Video 01 Frame 010)
  const [outletConfirmed, setOutletConfirmed] = useState(false);
  const [selectedOutlet, setSelectedOutlet] = useState('RESTAURANT');
  const [selectedSession, setSelectedSession] = useState('General');

  // Order Header state (Video 01 Frame 015 & 025)
  const [currency, setCurrency] = useState('INR');
  const [tableNo, setTableNo] = useState('10');
  const [kotNo, setKotNo] = useState('AUTO');
  const [covers, setCovers] = useState('2');
  const [server, setServer] = useState('Manash');
  const [guestName, setGuestName] = useState('');
  const [ncDept, setNcDept] = useState('');
  const [ncType, setNcType] = useState('');
  const [isNcMode, setIsNcMode] = useState(false);

  // Active Grid Line Items (Video 01 Frame 025 & 038)
  const [lineItems, setLineItems] = useState([
    { res: 'RES', code: '82', name: 'STEAMED RICE', quantity: 1.0, rate: 145.0, modifier: '' },
    { res: 'RES', code: '54', name: 'DAL MAHARANI', quantity: 1.0, rate: 200.0, modifier: '' },
    { res: 'RES', code: '175', name: 'CHICKEN SHAWARMA', quantity: 1.0, rate: 150.0, modifier: '' },
    { res: 'RES', code: '186', name: 'MINERAL WATER(58)', quantity: 1.0, rate: 120.0, modifier: '' },
    { res: 'RES', code: '87', name: 'PAPAD (2 PIECE ROASTED OR FRIE', quantity: 1.0, rate: 40.0, modifier: '' }
  ]);

  // Dialog states matching Video 01
  const [tableHelpOpen, setTableHelpOpen] = useState(false);
  const [itemHelpOpen, setItemHelpOpen] = useState(false);
  const [itemSearchText, setItemSearchText] = useState('');
  const [activeRowIdx, setActiveRowIdx] = useState(null);
  const [pendingKotOpen, setPendingKotOpen] = useState(false);
  const [tableStatusOpen, setTableStatusOpen] = useState(false);
  const [tableDetailsOpen, setTableDetailsOpen] = useState(false);
  const [selectedTableForDetails, setSelectedTableForDetails] = useState('10');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(null);

  // KOT Modification, Line Deletion & Entire KOT Deletion State (Videos 02, 05 & Video 06)
  const [editingKotNo, setEditingKotNo] = useState(null);
  const [stagedKotToModify, setStagedKotToModify] = useState(null);
  const [originalKotSnapshot, setOriginalKotSnapshot] = useState(null);
  const [updateConfirmModalOpen, setUpdateConfirmModalOpen] = useState(false);
  const [deleteKotConfirmOpen, setDeleteKotConfirmOpen] = useState(false);
  const [selectedRowIdx, setSelectedRowIdx] = useState(null);
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [reasonModalAction, setReasonModalAction] = useState('SAVE_KOT'); // 'SAVE_KOT' | 'DELETE_KOT'
  const [selectedReason, setSelectedReason] = useState('Double Entry');
  const [integrityCheckOpen, setIntegrityCheckOpen] = useState(false);

  // Video 10: Shift + F11 Item Renaming in Order Entry Grid (Frames 021–047)
  const [renamingRowIdx, setRenamingRowIdx] = useState(null);

  // Video 11: Supplying Restaurant / Other Outlets Modal & Item Import (Shift+F11 on Code - Frame 019 & 021)
  const [supRestaurantModalOpen, setSupRestaurantModalOpen] = useState(false);
  const [selectedSupOutletIndex, setSelectedSupOutletIndex] = useState(0); // 0 = LIQUOR BAR (CAR)
  const [supTargetRowIdx, setSupTargetRowIdx] = useState(null);
  const [itemHelpFilterOutlet, setItemHelpFilterOutlet] = useState('ALL');
  const [focusedColumn, setFocusedColumn] = useState('code'); // 'code' | 'quantity' | 'name'

  // NC KOT State (Video 07 Frame 016 & Frame 020)
  const [ncModalOpen, setNcModalOpen] = useState(false);
  const [selectedNcDept, setSelectedNcDept] = useState('Managers');
  const [ncGuestNameInput, setNcGuestNameInput] = useState('MANAGER.IT');

  // Video 08: Options & NC Bill Print Suite (Frames 011–026)
  const [optionsModalOpen, setOptionsModalOpen] = useState(false);
  const [ncBillPrintModalOpen, setNcBillPrintModalOpen] = useState(false);
  const [ncPrintTable, setNcPrintTable] = useState('10');
  const [pendingNcTablesModalOpen, setPendingNcTablesModalOpen] = useState(false);
  const [selectedPendingNcTableIdx, setSelectedPendingNcTableIdx] = useState(0);
  const [posPrintBillModalOpen, setPosPrintBillModalOpen] = useState(false);
  const [printingRecordsModalOpen, setPrintingRecordsModalOpen] = useState(false);
  const [ncPrintReportDesc, setNcPrintReportDesc] = useState('RES/NC');
  const [ncPrintReportPrinter, setNcPrintReportPrinter] = useState('Microsoft Print to PDF');

  // Video 12: Table Transfer V6.5.002.1 State (Frames 026–042)
  const [tableTransferOpen, setTableTransferOpen] = useState(false);
  const [transferSourceTable, setTransferSourceTable] = useState('10');
  const [transferTargetTable, setTransferTargetTable] = useState('14');
  const [transferSourceOutlet, setTransferSourceOutlet] = useState('RES');
  const [transferTargetOutlet, setTransferTargetOutlet] = useState('RES');
  const [transferSession, setTransferSession] = useState('GN');
  const [transferGridItems, setTransferGridItems] = useState([]);
  const [transferOutletsModalOpen, setTransferOutletsModalOpen] = useState(false);
  const [transferNotice, setTransferNotice] = useState(null);

  // Video 13: Master Shortcut Keys & Toolbars State (Shift+F1 to Shift+F10, F1 @ Qty, Reprint)
  const [sessionTransferOpen, setSessionTransferOpen] = useState(false);
  const [sessionSourceSession, setSessionSourceSession] = useState('General');
  const [sessionNewSession, setSessionNewSession] = useState('Breakfast');
  const [sessionTransferDate, setSessionTransferDate] = useState('08-FEB-2022');
  const [sessionGridItems, setSessionGridItems] = useState([]);
  const [sessionNotice, setSessionNotice] = useState(null);

  const [tableLinkOpen, setTableLinkOpen] = useState(false);
  const [linkSourceTable, setLinkSourceTable] = useState('T-1');
  const [availableLinkTables] = useState(['T-10', 'T-11', 'T-2', 'T-3', 'T-4', 'T-5', 'T-6', 'T-7', 'T-8', 'T-9']);
  const [selectedLinkTables, setSelectedLinkTables] = useState(['T-10', 'T-11', 'T-2']);
  const [tableLinks, setTableLinks] = useState({ 'T-1': ['T-10', 'T-11', 'T-2'] });

  const [multiOutletOpen, setMultiOutletOpen] = useState(false);
  const [multiOutletChoice, setMultiOutletChoice] = useState('LIQUOR BAR');

  const [kotReprintOpen, setKotReprintOpen] = useState(false);
  const [reprintGridItems, setReprintGridItems] = useState([]);
  const [reprintNotice, setReprintNotice] = useState(null);

  const [itemModifierOpen, setItemModifierOpen] = useState(false);
  const [modifierTargetRowIdx, setModifierTargetRowIdx] = useState(null);
  const [modifierCode, setModifierCode] = useState('99');
  const [modifierName, setModifierName] = useState('OPEN MODIFIER');
  const [modifierRate, setModifierRate] = useState('0.00');
  const [hotKeyHelpOpen, setHotKeyHelpOpen] = useState(false);
  const [menuGroupsOpen, setMenuGroupsOpen] = useState(false);
  const [touchScreenGroupsOpen, setTouchScreenGroupsOpen] = useState(false);
  const [restaurantTableMasterOpen, setRestaurantTableMasterOpen] = useState(false);
  const [serversMasterOpen, setServersMasterOpen] = useState(false);
  const [menuMasterModalOpen, setMenuMasterModalOpen] = useState(false);
  const [selectOutletModalOpen, setSelectOutletModalOpen] = useState(false);
  const [selectOutletRestaurant, setSelectOutletRestaurant] = useState('RESTAURANT');
  const [selectOutletAccountingDate, setSelectOutletAccountingDate] = useState('22-FEB-2022');
  const [selectOutletSession, setSelectOutletSession] = useState('General');
  const [salesPromotionModalOpen, setSalesPromotionModalOpen] = useState(false);
  const [eatAsULikeModalOpen, setEatAsULikeModalOpen] = useState(false);
  const [activeEatPromoIdx, setActiveEatPromoIdx] = useState(0);

  // POS Bill Printing & Settlement State (Videos 03 & 04)
  const [posBillModalOpen, setPosBillModalOpen] = useState(false);
  const [posBillSettlementModalOpen, setPosBillSettlementModalOpen] = useState(false);
  const [billedTables, setBilledTables] = useState([]);
  const [settledTables, setSettledTables] = useState([]);

  // Live Saved KOTs Registry (Videos 01, 02, 07, 08, 10, 11 & Video 12 Frames 010–020)
  const [savedKots, setSavedKots] = useState([
    {
      kotNo: '1313',
      accountingDate: '03-FEB-2022',
      tableNo: '10',
      server: 'Biren',
      outlet: 'RESTAURANT',
      session: 'GN',
      items: [
        { res: 'RES', code: '1', kotNo: '1313', name: 'CLASSIC RUSSIAN SALAD ...', type: 'Food', group: 'SALAD BAR', quantity: 2.0, rate: 199.0, value: 398.0 },
        { res: 'RES', code: '2', kotNo: '1313', name: 'RED BEANS PEANUT & DRY FRUIT S', type: 'Food', group: 'SALAD BAR', quantity: 1.0, rate: 199.0, value: 199.0 },
        { res: 'RES', code: '3', kotNo: '1313', name: 'SPROUTED MOONG PEANUT DRY FR', type: 'Food', group: 'SALAD BAR', quantity: 1.0, rate: 199.0, value: 199.0 },
        { res: 'RES', code: '4', kotNo: '1313', name: 'CAESAR SALAD (VEG) ...', type: 'Food', group: 'SALAD BAR', quantity: 1.0, rate: 245.0, value: 245.0 }
      ],
      totalAmount: 1041.0,
      cgst: 26.04,
      sgst: 26.04,
      nettAmount: 1093.0
    },
    {
      kotNo: '107',
      accountingDate: '03-FEB-2022',
      tableNo: '100',
      server: 'Biren',
      outlet: 'RESTAURANT',
      isNc: true,
      ncDept: 'Managers',
      ncDeptCode: 'MGR',
      guestName: 'MANAGER.IT',
      items: [
        { code: '189', name: 'MILK SHAKE WITH ICE CREAM', quantity: 1.0, rate: 150.0, costRate: 45.0, value: 45.0, department: 'MGR' },
        { code: '155', name: 'BLUEBERRY COLD CHEESE CAKE', quantity: 1.0, rate: 165.0, costRate: 49.5, value: 49.5, department: 'MGR' }
      ],
      totalAmount: 94.50,
      cgst: 0,
      sgst: 0,
      nettAmount: 94.50,
      ncBillPrinted: false
    },
    {
      kotNo: '1315',
      accountingDate: '03-FEB-2022',
      tableNo: '11',
      server: 'Biren',
      outlet: 'RESTAURANT',
      items: [
        { code: '1', kotNo: '1315', name: 'Russian Salad', originalName: 'CLASSIC RUSSIAN SALAD', type: 'Food', group: 'SALAD BAR', quantity: 1.0, rate: 199.0, value: 199.0, isRenamed: true },
        { code: '2', kotNo: '1315', name: 'Peanut', originalName: 'RED BEANS PEANUT & DRY FRUIT', type: 'Food', group: 'SALAD BAR', quantity: 1.0, rate: 199.0, value: 199.0, isRenamed: true }
      ],
      totalAmount: 398.0,
      cgst: 9.96,
      sgst: 9.96,
      nettAmount: 418.0
    },
    {
      kotNo: '1316',
      accountingDate: '03-FEB-2022',
      tableNo: '12',
      server: 'Biren',
      outlet: 'RESTAURANT',
      items: [
        { code: '1', name: 'CLASSIC RUSSIAN SALAD', quantity: 1.0, rate: 199.0, value: 199.0 },
        { code: '2', name: 'RED BEANS PEANUT & DRY FRUIT', quantity: 1.0, rate: 199.0, value: 199.0 },
        { code: '3', name: 'SPROUTED MOONG PEANUT DRY', quantity: 1.0, rate: 199.0, value: 199.0 },
        { code: '4', name: 'CAESAR SALAD VEG', quantity: 1.0, rate: 245.0, value: 245.0 },
        { code: '5', name: 'CAESAR SALAD CHICKEN', quantity: 1.0, rate: 295.0, value: 295.0 }
      ],
      totalAmount: 1137.0,
      cgst: 28.43,
      sgst: 28.43,
      nettAmount: 1194.0
    },
    {
      kotNo: '1311',
      accountingDate: '03-FEB-2022',
      tableNo: '15',
      server: 'Manash',
      outlet: 'RESTAURANT',
      items: [
        { code: '82', name: 'STEAMED RICE', quantity: 1.0, rate: 145.0, value: 145.0 },
        { code: '54', name: 'DAL MAHARANI', quantity: 1.0, rate: 200.0, value: 200.0 },
        { code: '175', name: 'CHICKEN SHAWARMA', quantity: 1.0, rate: 150.0, value: 150.0 },
        { code: '186', name: 'MINERAL WATER(58)', quantity: 1.0, rate: 120.0, value: 120.0 },
        { code: '87', name: 'PAPAD (2 PIECE ROASTED OR FRIE', quantity: 1.0, rate: 40.0, value: 40.0 }
      ],
      totalAmount: 655.0,
      cgst: 16.38,
      sgst: 16.38,
      nettAmount: 688.0
    }
  ]);

  // Video 13: Global Hotkey Listener for Master POS Shortcut Keys (Shift+F1 to Shift+F10, F1 @ Qty, F5)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.shiftKey) {
        if (e.key === 'F1' || e.code === 'F1') {
          // Shift + F1: Print Bill (Video 13 Frame 011)
          e.preventDefault();
          setPosBillModalOpen(true);
        } else if (e.key === 'F2' || e.code === 'F2') {
          // Shift + F2: Bill Settlement (Video 13 Frame 016)
          e.preventDefault();
          setPosBillSettlementModalOpen(true);
        } else if (e.key === 'F3' || e.code === 'F3') {
          // Shift + F3: Table Status (Video 13 Frame 021)
          e.preventDefault();
          setTableStatusOpen(true);
        } else if (e.key === 'F4' || e.code === 'F4') {
          if (e.ctrlKey) {
            // Ctrl + Shift + F4: EAT AS U LIKE Package Item Selector (Video 21 Frame 045)
            e.preventDefault();
            setEatAsULikeModalOpen(true);
            return;
          }
          // Shift + F4: Table Transfer (Video 13 Frame 031)
          e.preventDefault();
          setTableTransferOpen(true);
          handleLoadSourceTable(transferSourceTable || '10');
        } else if (e.key === 'F5' || e.code === 'F5') {
          // Shift + F5: Session Transfer (Video 13 Frame 046)
          e.preventDefault();
          setSessionTransferOpen(true);
          handleLoadSessionTransfer();
        } else if (e.key === 'F6' || e.code === 'F6') {
          // Shift + F6: Table Link (Video 13 Frame 055)
          e.preventDefault();
          setTableLinkOpen(true);
        } else if (e.key === 'F7' || e.code === 'F7') {
          // Shift + F7: Multi-Restaurant (Video 13 Frame 064)
          e.preventDefault();
          setMultiOutletOpen(true);
        } else if (e.key === 'F8' || e.code === 'F8') {
          // Shift + F8: NC KOT (Video 13 Frame 076)
          e.preventDefault();
          setIsNcMode(prev => !prev);
          setSaveSuccessMsg(`Shift+F8: Toggled NC KOT mode (${!isNcMode ? 'ON' : 'OFF'}).`);
          setTimeout(() => setSaveSuccessMsg(null), 3000);
        } else if (e.key === 'F9' || e.code === 'F9') {
          // Shift + F9: Bill and Settle (Video 13 Frame 088)
          e.preventDefault();
          handleOneClickBillAndSettle();
        } else if (e.key === 'F10' || e.code === 'F10') {
          // Shift + F10: Options (Video 13 Frame 093)
          e.preventDefault();
          setOptionsModalOpen(true);
        } else if (e.key === 'F11' || e.code === 'F11') {
          // Shift + F11: Rename Item (@ Qty) / Import Items (@ Code) (Videos 10 & 11)
          e.preventDefault();
          if (focusedColumn === 'quantity') {
            const targetIdx = selectedRowIdx !== null ? selectedRowIdx : (activeRowIdx !== null ? activeRowIdx : 0);
            if (lineItems[targetIdx]) {
              setSelectedRowIdx(targetIdx);
              setRenamingRowIdx(targetIdx);
              setSaveSuccessMsg(`Shift+F11: Renaming Item "${lineItems[targetIdx].name}". Type custom name and press Enter.`);
              setTimeout(() => setSaveSuccessMsg(null), 3500);
            }
          } else {
            const targetIdx = selectedRowIdx !== null ? selectedRowIdx : lineItems.length;
            handleOpenSupRestaurant(targetIdx);
          }
        }
      } else if (e.key === 'F1' || e.code === 'F1') {
        // <F1> @ Qty for Modifier (Video 13 Frame 109 & Frame 115)
        e.preventDefault();
        const targetIdx = selectedRowIdx !== null ? selectedRowIdx : (activeRowIdx !== null ? activeRowIdx : 0);
        handleOpenItemModifier(targetIdx);
      } else if (e.key === 'F5' || e.code === 'F5') {
        if (selectedRowIdx !== null && lineItems[selectedRowIdx]) {
          e.preventDefault();
          handleDeleteRow(selectedRowIdx);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedRowIdx, activeRowIdx, lineItems, focusedColumn, isNcMode, transferSourceTable, sessionSourceSession]);

  // Video 08: Computed Pending NC Tables for lookup modal (Video 08 Frame 016)
  const pendingNcTables = useMemo(() => {
    const list = savedKots
      .filter(k => k.isNc && !k.ncBillPrinted)
      .map(k => ({
        tableNo: k.tableNo,
        serverMember: `${k.server || 'Biren'} - ${k.guestName || 'MANAGER.IT'}`
      }));
    if (!list.some(p => p.tableNo === '10')) {
      list.unshift({ tableNo: '10', serverMember: 'Biren - MANAGER.IT' });
    }
    return list;
  }, [savedKots]);

  // Video 08: Computed Active NC KOT for NC Bill Print grid (Video 08 Frame 018)
  const activeNcKotForPrint = useMemo(() => {
    if (!ncPrintTable) return null;
    const found = savedKots.find(k => k.tableNo === String(ncPrintTable).trim() && k.isNc && !k.ncBillPrinted);
    if (found) {
      return {
        ...found,
        items: found.items.map((it, idx) => ({
          type: '2',
          kotNo: found.kotNo || '107',
          name: it.name,
          quantity: it.quantity || 1.0,
          value: Number(it.costRate || it.value || 45.0),
          department: found.ncDeptCode || (found.ncDept === 'Managers' ? 'MGR' : 'GEN')
        }))
      };
    }
    if (String(ncPrintTable).trim() === '10') {
      return {
        kotNo: '107',
        tableNo: '10',
        server: 'Biren',
        guestName: 'MANAGER.IT',
        department: 'Managers',
        ncDeptCode: 'MGR',
        items: [
          { type: '2', kotNo: '107', name: 'MILK SHAKE WITH ICE CREAM', quantity: 1.0, value: 45.00, department: 'MGR' },
          { type: '2', kotNo: '107', name: 'BLUEBERRY COLD CHEESE CAKE', quantity: 1.0, value: 49.50, department: 'MGR' }
        ]
      };
    }
    return null;
  }, [ncPrintTable, savedKots]);

  // Video 08 Frame 014: Cash Drawer Kick-out hardware emulation
  const handleDrawerKickOut = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(740, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1480, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (e) {
      // Audio fallback silent
    }
    setSaveSuccessMsg("Cash Drawer Kick Out Pulse Sent (EPSON TM-T88V Pin 2/5 24V Solenoid)!");
    setTimeout(() => setSaveSuccessMsg(null), 3500);
    setOptionsModalOpen(false);
  };

  // Video 08 Frame 024: Execute NC Bill Print, Spooler records progress & Table Release
  const handleExecuteNcBillPrint = () => {
    setPosPrintBillModalOpen(false);
    setPrintingRecordsModalOpen(true);

    setTimeout(() => {
      setPrintingRecordsModalOpen(false);
      setNcBillPrintModalOpen(false);

      const targetTable = ncPrintTable || '10';
      setSavedKots(prev => prev.map(k => {
        if (k.tableNo === targetTable && k.isNc) {
          return { ...k, ncBillPrinted: true, settled: true, settledAt: new Date().toISOString() };
        }
        return k;
      }));

      // Release Table in Table Status matrix from Occupied/Billed to Vacant (Green)
      setBilledTables(prev => prev.filter(t => t !== targetTable));
      setSettledTables(prev => [...prev, targetTable]);

      // Launch Crystal Report Viewer for pos-nc-bill
      if (onOpenCrystalReport) {
        onOpenCrystalReport({
          reportType: 'pos-nc-bill',
          data: {
            voucherNo: activeNcKotForPrint?.kotNo ? `NC-${activeNcKotForPrint.kotNo}` : 'NC-107',
            tableNo: targetTable,
            server: activeNcKotForPrint?.server || server || 'Biren',
            guestName: activeNcKotForPrint?.guestName || 'MANAGER.IT',
            department: activeNcKotForPrint?.department || 'Managers (MGR)',
            deptCode: activeNcKotForPrint?.ncDeptCode || 'MGR',
            accountingDate: accountingDate || '03-FEB-2022',
            outlet: selectedOutlet || 'RESTAURANT',
            session: selectedSession || 'General',
            printer: ncPrintReportPrinter,
            items: activeNcKotForPrint?.items || [
              { name: 'MILK SHAKE WITH ICE CREAM', quantity: 1, rate: 150.0, costRate: 45.0, value: 45.0 },
              { name: 'BLUEBERRY COLD CHEESE CAKE', quantity: 1, rate: 165.0, costRate: 49.5, value: 49.5 }
            ],
            totalCost: 94.50,
            menuTotal: 315.00
          }
        });
      }

      setSaveSuccessMsg(`NC Bill Printed Successfully for Table ${targetTable} (KOT #${activeNcKotForPrint?.kotNo || '107'})! Table ${targetTable} Released to Vacant.`);
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    }, 800);
  };

  // Video 12: Load source table items into transfer grid (Frames 028–033)
  const handleLoadSourceTable = (srcTbl = null) => {
    const tbl = String(srcTbl || transferSourceTable || '10').trim();
    if (!tbl) {
      setTransferNotice('Enter Occupied Table Number Which is going to be transferred.');
      setTimeout(() => setTransferNotice(null), 3000);
      return;
    }
    const matchingKots = savedKots.filter(k => k.tableNo === tbl && !k.settled);
    if (matchingKots.length > 0) {
      const items = matchingKots.flatMap(k => (k.items || []).map(it => ({
        kotNo: it.kotNo || k.kotNo || '1313',
        code: it.code || '1',
        name: it.name || it.fullName || 'Item',
        quantity: typeof it.quantity === 'number' ? it.quantity.toFixed(3) : String(it.quantity || '1.000'),
        rate: it.rate || 0,
        value: it.value || ((Number(it.quantity) || 1) * (it.rate || 0)),
        selected: true,
        sourceKotNo: k.kotNo
      })));
      setTransferGridItems(items);
      setTransferNotice(`Loaded ${items.length} item(s) from Table ${tbl}.`);
      setTimeout(() => setTransferNotice(null), 2500);
    } else if (tbl === '10') {
      // Fallback matching Video 12 Frame 033
      const defaultT10Items = [
        { kotNo: '1313', code: '1', name: 'CLASSIC RUSSIAN SALAD ...', quantity: '2.000', rate: 199.00, value: 398.00, selected: true },
        { kotNo: '1313', code: '2', name: 'RED BEANS PEANUT & DRY FRUIT S', quantity: '1.000', rate: 199.00, value: 199.00, selected: true },
        { kotNo: '1313', code: '3', name: 'SPROUTED MOONG PEANUT DRY FR', quantity: '1.000', rate: 199.00, value: 199.00, selected: true },
        { kotNo: '1313', code: '4', name: 'CAESAR SALAD (VEG) ...', quantity: '1.000', rate: 245.00, value: 245.00, selected: true }
      ];
      setTransferGridItems(defaultT10Items);
      setTransferNotice(`Loaded 4 item(s) from Table 10.`);
      setTimeout(() => setTransferNotice(null), 2500);
    } else {
      setTransferGridItems([]);
      setTransferNotice(`No active running KOTs found on Table ${tbl}.`);
      setTimeout(() => setTransferNotice(null), 3000);
    }
  };

  // Video 12: Invert/Toggle selection of all loaded items (Frame 028 & 033)
  const handleToggleTransferSelection = () => {
    setTransferGridItems(prev => prev.map(it => ({ ...it, selected: !it.selected })));
  };

  // Video 12: Toggle single item selection
  const handleToggleSingleItemSelection = (idx) => {
    setTransferGridItems(prev => prev.map((it, i) => i === idx ? { ...it, selected: !it.selected } : it));
  };

  // Video 12: Execute Table Transfer routine (Frames 034–042)
  const handleExecuteTableTransfer = () => {
    const srcTbl = String(transferSourceTable).trim();
    const tgtTbl = String(transferTargetTable).trim();

    if (!srcTbl) {
      alert('Please enter Source Table Number.');
      return;
    }
    if (!tgtTbl) {
      alert('Enter Vaccant Target Table Number.');
      return;
    }
    if (srcTbl === tgtTbl) {
      alert('Source Table and Target Table cannot be the same!');
      return;
    }
    const selectedItems = transferGridItems.filter(it => it.selected);
    if (selectedItems.length === 0) {
      alert('Please select at least one item to transfer (Selected = YES).');
      return;
    }

    setSavedKots(prev => {
      const sourceKots = prev.filter(k => k.tableNo === srcTbl && !k.settled);
      const otherKots = prev.filter(k => k.tableNo !== srcTbl);

      // Transferred line items (KOT # 1314 on target table as shown in Frame 040)
      const transferredLineItems = selectedItems.map(it => ({
        res: transferTargetOutlet || 'RES',
        code: it.code,
        kotNo: '1314',
        name: it.name,
        quantity: Number(it.quantity) || 1,
        rate: it.rate,
        value: it.value
      }));

      const transferredTotal = transferredLineItems.reduce((acc, it) => acc + it.value, 0);
      const transferredCgst = Number((transferredTotal * 0.025).toFixed(2));
      const transferredSgst = Number((transferredTotal * 0.025).toFixed(2));
      const transferredNett = Math.round(transferredTotal + transferredCgst + transferredSgst);

      // Check if unselected items remain on source table
      const remainingItems = transferGridItems.filter(it => !it.selected);
      let updatedSourceKots = [];

      if (remainingItems.length > 0) {
        const remLineItems = remainingItems.map(it => ({
          res: transferSourceOutlet || 'RES',
          code: it.code,
          kotNo: it.kotNo,
          name: it.name,
          quantity: Number(it.quantity) || 1,
          rate: it.rate,
          value: it.value
        }));
        const remTotal = remLineItems.reduce((acc, it) => acc + it.value, 0);
        const remCgst = Number((remTotal * 0.025).toFixed(2));
        const remSgst = Number((remTotal * 0.025).toFixed(2));
        const remNett = Math.round(remTotal + remCgst + remSgst);

        updatedSourceKots = [{
          kotNo: sourceKots[0]?.kotNo || '1313',
          accountingDate,
          tableNo: srcTbl,
          server: sourceKots[0]?.server || 'Biren',
          outlet: transferSourceOutlet || 'RESTAURANT',
          session: transferSession,
          items: remLineItems,
          totalAmount: remTotal,
          cgst: remCgst,
          sgst: remSgst,
          nettAmount: remNett
        }];
      }

      // Add to target table
      const existingTargetKot = otherKots.find(k => k.tableNo === tgtTbl && !k.settled);
      let updatedOtherKots = otherKots;

      if (existingTargetKot) {
        updatedOtherKots = otherKots.map(k => {
          if (k.tableNo === tgtTbl && !k.settled) {
            const merged = [...(k.items || []), ...transferredLineItems];
            const mTotal = merged.reduce((acc, it) => acc + (it.value || (it.quantity * it.rate)), 0);
            const mCgst = Number((mTotal * 0.025).toFixed(2));
            const mSgst = Number((mTotal * 0.025).toFixed(2));
            return {
              ...k,
              items: merged,
              totalAmount: mTotal,
              cgst: mCgst,
              sgst: mSgst,
              nettAmount: Math.round(mTotal + mCgst + mSgst)
            };
          }
          return k;
        });
      } else {
        const newTargetKot = {
          kotNo: '1314',
          accountingDate,
          tableNo: tgtTbl,
          server: sourceKots[0]?.server || 'Biren',
          outlet: transferTargetOutlet || 'RESTAURANT',
          session: transferSession,
          items: transferredLineItems,
          totalAmount: transferredTotal,
          cgst: transferredCgst,
          sgst: transferredSgst,
          nettAmount: transferredNett
        };
        updatedOtherKots = [...otherKots, newTargetKot];
      }

      return [...updatedOtherKots, ...updatedSourceKots];
    });

    // Clean up settled/billed lists
    setSettledTables(prev => prev.filter(t => t !== tgtTbl));
    setBilledTables(prev => prev.filter(t => t !== srcTbl && t !== tgtTbl));

    // Clear dialog inputs and grid (matching Frame 036)
    setTransferSourceTable('');
    setTransferTargetTable('');
    setTransferGridItems([]);

    setTransferNotice(`Table ${srcTbl} successfully transferred to Table ${tgtTbl}! Table ${srcTbl} is now Vacant, Table ${tgtTbl} is Occupied.`);
    setSaveSuccessMsg(`Table Transfer V6.5.002.1 Complete: Table ${srcTbl} -> Table ${tgtTbl} (${selectedItems.length} items moved).`);
    setTimeout(() => {
      setTransferNotice(null);
      setSaveSuccessMsg(null);
    }, 4500);

    broadcastKotChannel({
      type: 'TABLE_TRANSFER',
      sourceTable: srcTbl,
      targetTable: tgtTbl,
      itemCount: selectedItems.length,
      timestamp: new Date().toISOString()
    });
  };

  // Video 12 Preset: Initial Occupancy on Table 10 and Vacant on Table 14
  const handleLoadVideo12Demo = () => {
    const v12T10Kot = {
      kotNo: '1313',
      accountingDate: '03-FEB-2022',
      tableNo: '10',
      server: 'Biren',
      outlet: 'RESTAURANT',
      session: 'GN',
      items: [
        { res: 'RES', code: '1', kotNo: '1313', name: 'CLASSIC RUSSIAN SALAD ...', type: 'Food', group: 'SALAD BAR', quantity: 2.0, rate: 199.0, value: 398.0 },
        { res: 'RES', code: '2', kotNo: '1313', name: 'RED BEANS PEANUT & DRY FRUIT S', type: 'Food', group: 'SALAD BAR', quantity: 1.0, rate: 199.0, value: 199.0 },
        { res: 'RES', code: '3', kotNo: '1313', name: 'SPROUTED MOONG PEANUT DRY FR', type: 'Food', group: 'SALAD BAR', quantity: 1.0, rate: 199.0, value: 199.0 },
        { res: 'RES', code: '4', kotNo: '1313', name: 'CAESAR SALAD (VEG) ...', type: 'Food', group: 'SALAD BAR', quantity: 1.0, rate: 245.0, value: 245.0 }
      ],
      totalAmount: 1041.0,
      cgst: 26.04,
      sgst: 26.04,
      nettAmount: 1093.0
    };

    setSavedKots(prev => [
      ...prev.filter(k => k.tableNo !== '10' && k.tableNo !== '14'),
      v12T10Kot
    ]);
    setSettledTables(prev => prev.filter(t => t !== '10' && t !== '14'));
    setBilledTables(prev => prev.filter(t => t !== '10' && t !== '14'));
    setTransferSourceTable('10');
    setTransferTargetTable('14');
    setTransferSourceOutlet('RES');
    setTransferTargetOutlet('RES');
    setTransferSession('GN');
    setTransferGridItems([
      { kotNo: '1313', code: '1', name: 'CLASSIC RUSSIAN SALAD ...', quantity: '2.000', rate: 199.00, value: 398.00, selected: true },
      { kotNo: '1313', code: '2', name: 'RED BEANS PEANUT & DRY FRUIT S', quantity: '1.000', rate: 199.00, value: 199.00, selected: true },
      { kotNo: '1313', code: '3', name: 'SPROUTED MOONG PEANUT DRY FR', quantity: '1.000', rate: 199.00, value: 199.00, selected: true },
      { kotNo: '1313', code: '4', name: 'CAESAR SALAD (VEG) ...', quantity: '1.000', rate: 245.00, value: 245.00, selected: true }
    ]);
    setTableTransferOpen(true);
    setSaveSuccessMsg('Video 12 Initial State Loaded: Table 10 Occupied (KOT 1313), Table 14 Vacant. Ready to Transfer!');
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Video 13: Item Modifiers Handlers (Frames 109–126)
  const handleOpenItemModifier = (idx) => {
    const target = idx !== undefined && idx !== null ? idx : (selectedRowIdx !== null ? selectedRowIdx : 0);
    if (!lineItems[target]) return;
    setModifierTargetRowIdx(target);
    const curMod = lineItems[target].modifier;
    if (curMod && typeof curMod === 'object') {
      setModifierCode(curMod.code || '99');
      setModifierName(curMod.name || 'spicy');
      setModifierRate(String(curMod.charge !== undefined ? curMod.charge : '0.00'));
    } else if (typeof curMod === 'string' && curMod.trim()) {
      setModifierCode('99');
      setModifierName(curMod);
      setModifierRate('0.00');
    } else {
      setModifierCode('99');
      setModifierName('spicy');
      setModifierRate('0.00');
    }
    setItemModifierOpen(true);
  };

  const handleSaveItemModifier = () => {
    if (modifierTargetRowIdx === null || !lineItems[modifierTargetRowIdx]) return;
    const modObj = {
      code: modifierCode || '99',
      name: modifierName || 'OPEN MODIFIER',
      charge: parseFloat(modifierRate) || 0
    };
    setLineItems(prev => {
      const copy = [...prev];
      copy[modifierTargetRowIdx] = {
        ...copy[modifierTargetRowIdx],
        modifier: modObj
      };
      return copy;
    });
    setSaveSuccessMsg(`Modifier "${modObj.name}" attached to ${lineItems[modifierTargetRowIdx].name}.`);
    setItemModifierOpen(false);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleDeleteItemModifier = () => {
    if (modifierTargetRowIdx === null || !lineItems[modifierTargetRowIdx]) return;
    setLineItems(prev => {
      const copy = [...prev];
      copy[modifierTargetRowIdx] = {
        ...copy[modifierTargetRowIdx],
        modifier: null
      };
      return copy;
    });
    setSaveSuccessMsg(`Modifier removed from ${lineItems[modifierTargetRowIdx].name}.`);
    setItemModifierOpen(false);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Video 13: Session Transfer Handlers (Frames 046–054)
  const handleLoadSessionTransfer = () => {
    const loaded = [];
    savedKots.forEach(k => {
      k.items?.forEach(it => {
        loaded.push({
          kotNo: k.kotNo,
          name: it.name,
          quantity: typeof it.quantity === 'number' ? it.quantity.toFixed(3) : String(it.quantity || 1),
          server: k.server || 'Biren',
          selected: true
        });
      });
    });
    if (loaded.length === 0) {
      loaded.push(
        { kotNo: '1314', name: 'CLASSIC RUSSIAN SALAD ...', quantity: '2.000', server: 'Biren', selected: true },
        { kotNo: '1314', name: 'RED BEANS PEANUT & DRY FRUIT S', quantity: '1.000', server: 'Biren', selected: true },
        { kotNo: '1318', name: 'BLENDERS PRIDE ...', quantity: '1.000', server: 'Biren', selected: true },
        { kotNo: '1319', name: 'CREAM OF TOMATO ...', quantity: '1.000', server: 'Manash', selected: true }
      );
    }
    setSessionGridItems(loaded);
    setSessionNotice(`Loaded ${loaded.length} item(s) from Source Session: ${sessionSourceSession}.`);
    setTimeout(() => setSessionNotice(null), 3000);
  };

  const handleExecuteSessionTransfer = () => {
    if (!sessionNewSession) {
      alert('Please select a New Session.');
      return;
    }
    setSavedKots(prev => prev.map(k => ({ ...k, session: sessionNewSession })));
    setSelectedSession(sessionNewSession);
    setSaveSuccessMsg(`Session Transfer Complete: Session changed from ${sessionSourceSession} to ${sessionNewSession}.`);
    setSessionTransferOpen(false);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Video 13: Table Link Handlers (Frames 055–063)
  const handleSaveTableLink = () => {
    setTableLinks(prev => ({ ...prev, [linkSourceTable]: selectedLinkTables }));
    setSaveSuccessMsg(`Table Link: ${linkSourceTable} linked with ${selectedLinkTables.join(', ')} for consolidated billing.`);
    setTableLinkOpen(false);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const handleToggleLinkTable = (tbl) => {
    setSelectedLinkTables(prev => 
      prev.includes(tbl) ? prev.filter(t => t !== tbl) : [...prev, tbl]
    );
  };

  // Video 13: Multi-Restaurant Switcher Handler (Frames 064–075)
  const handleApplyMultiOutlet = (outletName) => {
    setSelectedOutlet(outletName);
    const code = outletName === 'LIQUOR BAR' ? 'BAR' : 'RES';
    setLineItems(prev => prev.map(it => ({ ...it, res: code })));
    setSaveSuccessMsg(`Outlet switched to ${outletName}. Default item outlet set to ${code}.`);
    setMultiOutletOpen(false);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Video 13: One-Click Bill and Settle (Shift+F9 - Frames 088–092)
  const handleOneClickBillAndSettle = () => {
    const itemsToSettle = lineItems.length > 0 ? lineItems : [
      { res: 'BAR', code: '585', name: 'KINGFISHER PREMIUM (650ML)', quantity: 1.0, rate: 180.00, modifier: '' },
      { res: 'BAR', code: '186', name: 'MINERAL WATER(58)', quantity: 1.0, rate: 120.00, modifier: '' }
    ];
    const total = itemsToSettle.reduce((acc, it) => acc + (it.quantity * it.rate), 0);
    const cgst = Number((total * 0.025).toFixed(2));
    const sgst = Number((total * 0.025).toFixed(2));
    const nett = Math.round(total + cgst + sgst);
    const newKotNo = String(Math.floor(1320 + Math.random() * 80));
    const newBillNo = String(Math.floor(20 + Math.random() * 80));

    handleDrawerKickOut();

    setBilledTables(prev => prev.filter(t => t !== tableNo));
    setSettledTables(prev => Array.from(new Set([...prev, tableNo])));
    setLineItems([]);
    setSaveSuccessMsg(`Shift+F9 [Bill and Settle]: Mini Bar KOT #${newKotNo} Punched, Bill #${newBillNo} (₹${nett}) Settled in 1-Click! Table ${tableNo} Cleared.`);
    setTimeout(() => setSaveSuccessMsg(null), 5000);
  };

  // Video 13: KOT Reprint Handlers (Frames 099–108)
  const handleOpenKotReprint = () => {
    const demoReprintList = [
      { tableNo: '14', kotNo: '1314', kotTime: '13:09', name: 'CLASSIC RUSSIAN SALAD ...', quantity: '2', selected: false },
      { tableNo: '14', kotNo: '1314', kotTime: '13:09', name: 'RED BEANS PEANUT & DRY FRUIT S', quantity: '1', selected: false },
      { tableNo: '14', kotNo: '1314', kotTime: '13:09', name: 'SPROUTED MOONG PEANUT DRY FR', quantity: '1', selected: false },
      { tableNo: '14', kotNo: '1314', kotTime: '13:09', name: 'CAESAR SALAD (VEG) ...', quantity: '1', selected: false },
      { tableNo: '14', kotNo: '1318', kotTime: '13:33', name: 'CLASSIC RUSSIAN SALAD ...', quantity: '1', selected: false },
      { tableNo: '14', kotNo: '1318', kotTime: '13:33', name: 'RED BEANS PEANUT & DRY FRUIT S', quantity: '1', selected: false },
      { tableNo: '14', kotNo: '1318', kotTime: '13:33', name: 'BLENDERS PRIDE ...', quantity: '1', selected: false },
      { tableNo: '14', kotNo: '1318', kotTime: '13:33', name: 'JW BLACK LABEL ...', quantity: '1', selected: false },
      { tableNo: 'T-1', kotNo: '1321', kotTime: '13:29', name: 'CLASSIC RUSSIAN SALAD ...', quantity: '1', selected: false },
      { tableNo: 'T-1', kotNo: '1321', kotTime: '13:29', name: 'RED BEANS PEANUT & DRY FRUIT S', quantity: '1', selected: false },
      { tableNo: 'T-10', kotNo: '1319', kotTime: '09:43', name: 'CREAM OF TOMATO ...', quantity: '1', selected: false }
    ];
    setReprintGridItems(demoReprintList);
    setKotReprintOpen(true);
  };

  const handleToggleReprintRow = (idx) => {
    setReprintGridItems(prev => prev.map((it, i) => i === idx ? { ...it, selected: !it.selected } : it));
  };

  const handleDblClickReprintTable = (tblNo) => {
    setReprintGridItems(prev => prev.map(it => it.tableNo === tblNo ? { ...it, selected: true } : it));
  };

  const handleDblClickReprintKot = (kNo) => {
    setReprintGridItems(prev => prev.map(it => it.kotNo === kNo ? { ...it, selected: true } : it));
  };

  const handleExecuteKotReprint = () => {
    const selectedCount = reprintGridItems.filter(it => it.selected).length;
    if (selectedCount === 0) {
      alert('Please select at least one item to reprint (Select = Y).');
      return;
    }
    handleDrawerKickOut();
    setSaveSuccessMsg(`KOT Reprint V6.5.002.1: ${selectedCount} item(s) re-sent to Kitchen Printer.`);
    setKotReprintOpen(false);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Video 21 Frames 045–055: Punch Sales Promotion / EAT AS U LIKE package
  const handlePunchPromotion = (promo) => {
    if (!promo) return;
    const pkgItem = {
      res: promo.restaurant === 'LIQUOR BAR' ? 'BAR' : (resOutlet || 'RES'),
      code: promo.promotionCode || '1',
      name: promo.promotionName || 'Buy 2 Get 1 Free',
      quantity: 1.0,
      rate: Number(promo.promotionValue) || 280.0,
      isPromoPackage: true
    };

    const constituentItems = [];
    if (Array.isArray(promo.mainItems)) {
      promo.mainItems.forEach(item => {
        constituentItems.push({
          res: promo.restaurant === 'LIQUOR BAR' ? 'BAR' : (resOutlet || 'RES'),
          code: item.itemCode || '1',
          name: item.itemName,
          quantity: Number(item.quantity) || 1.0,
          rate: Number(item.rate) || 0.0,
          isPromoConstituent: true
        });
      });
    }
    if (Array.isArray(promo.complimentaryItems)) {
      promo.complimentaryItems.forEach(item => {
        constituentItems.push({
          res: promo.restaurant === 'LIQUOR BAR' ? 'BAR' : (resOutlet || 'RES'),
          code: item.itemCode || '1',
          name: item.itemName,
          quantity: Number(item.quantity) || 1.0,
          rate: 0.0,
          isPromoConstituent: true
        });
      });
    }

    setLineItems(prev => [...prev, pkgItem, ...constituentItems]);
    setEatAsULikeModalOpen(false);
    setSaveSuccessMsg(`Punched Package: "${promo.promotionName}" (Value: INR ${promo.promotionValue}) with ${constituentItems.length} items!`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Financial calculations matching Video 01 Frame 025, Video 07 Frame 030, Video 21 Frame 055
  const calculations = useMemo(() => {
    const totalAmount = lineItems.reduce((acc, it) => {
      if (it.isPromoConstituent) return acc;
      return acc + (it.quantity * it.rate);
    }, 0);
    const cgst = Number((totalAmount * 0.025).toFixed(2));
    const sgst = Number((totalAmount * 0.025).toFixed(2));
    const nettAmount = Math.round(totalAmount + cgst + sgst);
    return { totalAmount, cgst, sgst, nettAmount };
  }, [lineItems]);

  // Filtered menu search list for Item Help dialog (Video 01 Frame 021, Video 11 Frame 025-027, Video 20 Frame 120)
  const filteredMenuItems = useMemo(() => {
    const storedMaster = getStoredMenuItems().map(m => {
      const defP = (m.portions && m.portions[0]) ? m.portions[0] : null;
      return {
        code: m.itemCode,
        name: m.name.toUpperCase(),
        fullName: m.name,
        category: m.classificationName || 'FOOD',
        outlet: m.outletName === 'LIQUOR BAR' ? 'CAR' : 'RES',
        outletName: m.outletName || 'RESTAURANT',
        rate: defP ? Number(defP.rate) : 100.00,
        portions: m.portions,
        taxStructure: m.taxStructure
      };
    });
    const masterCodes = new Set(storedMaster.map(m => m.code));
    let list = [...storedMaster, ...POS_MENU_ITEMS.filter(it => !masterCodes.has(it.code))];

    if (itemHelpFilterOutlet && itemHelpFilterOutlet !== 'ALL') {
      list = list.filter(m => (m.outlet || 'RES') === itemHelpFilterOutlet);
    }
    if (!itemSearchText.trim()) return list.slice(0, 50);
    const q = itemSearchText.toLowerCase();
    return list.filter(m => 
      m.name.toLowerCase().includes(q) || 
      (m.fullName && m.fullName.toLowerCase().includes(q)) ||
      m.code.includes(q) ||
      (m.category && m.category.toLowerCase().includes(q))
    );
  }, [itemSearchText, itemHelpFilterOutlet, menuMasterModalOpen]);

  // Video 11: Supplying Restaurant / Other Outlets Handler (Frames 019–024)
  const handleOpenSupRestaurant = (targetIdx = null) => {
    const idx = targetIdx !== null ? targetIdx : (selectedRowIdx !== null ? selectedRowIdx : lineItems.length);
    setSupTargetRowIdx(idx);
    setSelectedSupOutletIndex(0); // 0 = LIQUOR BAR (CAR)
    setSupRestaurantModalOpen(true);
  };

  const handleConfirmSupRestaurant = () => {
    const chosenOutlet = POS_SUPPLYING_OUTLETS[selectedSupOutletIndex] || POS_SUPPLYING_OUTLETS[0];
    const targetIdx = supTargetRowIdx !== null ? supTargetRowIdx : lineItems.length;

    if (targetIdx < lineItems.length) {
      setLineItems(prev => {
        const copy = [...prev];
        copy[targetIdx] = {
          ...copy[targetIdx],
          res: chosenOutlet.code
        };
        return copy;
      });
      setSelectedRowIdx(targetIdx);
      setActiveRowIdx(targetIdx);
    } else {
      // Append new empty row with chosen supplying outlet
      setLineItems(prev => [
        ...prev,
        {
          res: chosenOutlet.code,
          code: '',
          name: '',
          quantity: 1.0,
          rate: 0.0,
          modifier: ''
        }
      ]);
      setSelectedRowIdx(lineItems.length);
      setActiveRowIdx(lineItems.length);
    }

    setSupRestaurantModalOpen(false);
    setSaveSuccessMsg(`Here you can see Bar outlet code is showing (${chosenOutlet.code}). Select item from ${chosenOutlet.name}.`);
    setTimeout(() => setSaveSuccessMsg(null), 3500);

    // Open Item Help filtered to this supplying outlet
    setItemHelpFilterOutlet(chosenOutlet.code);
    setItemHelpOpen(true);
  };

  // Handler to add item from Item Help dialog
  const handleSelectItem = (item) => {
    const targetIdx = activeRowIdx !== null ? activeRowIdx : (selectedRowIdx !== null ? selectedRowIdx : lineItems.length);
    if (targetIdx < lineItems.length) {
      setLineItems(prev => {
        const copy = [...prev];
        copy[targetIdx] = {
          ...copy[targetIdx],
          res: copy[targetIdx].res || item.outlet || 'RES',
          code: item.code,
          name: item.name,
          rate: item.rate,
          quantity: copy[targetIdx].quantity || 1.0
        };
        return copy;
      });
      setSelectedRowIdx(targetIdx);
    } else {
      setLineItems(prev => [
        ...prev,
        {
          res: item.outlet || 'RES',
          code: item.code,
          name: item.name,
          quantity: 1.0,
          rate: item.rate,
          modifier: ''
        }
      ]);
      setSelectedRowIdx(lineItems.length);
    }
    setItemHelpOpen(false);
    setItemSearchText('');
  };

  // Delete item row via <F5> or Delete button (Video 05 Frame 20-22)
  const handleDeleteRow = (targetIdx = selectedRowIdx) => {
    let indexToDelete = targetIdx;
    if (indexToDelete === null || indexToDelete === undefined) {
      if (lineItems.length > 0) {
        indexToDelete = lineItems.length - 1;
      } else {
        return;
      }
    }
    if (indexToDelete >= 0 && indexToDelete < lineItems.length) {
      const removedItem = lineItems[indexToDelete];
      setLineItems(prev => prev.filter((_, idx) => idx !== indexToDelete));
      setSelectedRowIdx(null);
      setSaveSuccessMsg(`Item '${removedItem.name}' removed (<F5>). Click Save to log statutory reason.`);
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    }
  };

  // Win32 Keyboard shortcuts matching Video 05: <F5> Deletes selected item row
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'F5') {
        e.preventDefault();
        e.stopPropagation();
        handleDeleteRow();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedRowIdx, lineItems]);

  // Handler to Save or Update KOT (Video 01 Frame 038 & Video 05 Frame 30 -> Frame 33)
  const handleSaveKOT = (forcedReason = null) => {
    if (lineItems.length === 0) return;
    const isUpdate = Boolean(editingKotNo);

    // Video 05 Check: Did we delete or reduce items from an already printed KOT?
    if (isUpdate && originalKotSnapshot && !forcedReason) {
      const originalCodes = originalKotSnapshot.items.map(it => it.code);
      const currentCodes = lineItems.map(it => it.code);
      const itemDeleted = originalCodes.some(c => !currentCodes.includes(c));
      
      const qtyReduced = originalKotSnapshot.items.some(orig => {
        const cur = lineItems.find(it => it.code === orig.code);
        return cur && cur.quantity < orig.quantity;
      });

      const totalQtyReduced = lineItems.reduce((acc, it) => acc + it.quantity, 0) < originalKotSnapshot.totalQty;

      if (itemDeleted || qtyReduced || totalQtyReduced) {
        // Must prompt Win32 Statutory Reason dialog (Video 05 Frame 30 & 32)
        setReasonModalOpen(true);
        return;
      }
    }

    const appliedReason = forcedReason || (editingKotNo ? 'Modified' : 'New Order');
    const targetKotNo = isUpdate ? editingKotNo : (kotNo === 'AUTO' ? `13${Math.floor(10 + Math.random() * 89)}` : kotNo);

    const updatedKotRecord = {
      kotNo: targetKotNo,
      accountingDate: accountingDate,
      tableNo: tableNo || (isNcMode ? '10' : '10'),
      server: server,
      outlet: selectedOutlet,
      isNc: isNcMode,
      ncType: isNcMode ? (ncType || 'NC Kot') : '',
      ncDept: isNcMode ? (ncDept || 'Managers') : '',
      guestName: guestName || (isNcMode ? 'MANAGER IT' : 'Walk-In Guest'),
      deletionReason: appliedReason,
      items: lineItems.map(it => ({
        ...it,
        value: it.quantity * it.rate
      })),
      totalAmount: calculations.totalAmount,
      cgst: calculations.cgst,
      sgst: calculations.sgst,
      nettAmount: calculations.nettAmount
    };

    if (isUpdate) {
      setSavedKots(prev => prev.map(k => k.kotNo === targetKotNo ? updatedKotRecord : k));
      setSaveSuccessMsg(`KOT #${targetKotNo} on Table ${tableNo} Updated! [Reason: ${appliedReason}]`);
    } else {
      setSavedKots(prev => [updatedKotRecord, ...prev]);
      if (isNcMode) {
        setSaveSuccessMsg(`NC KOT #${targetKotNo} Generated for [${ncDept || 'Managers'}] (Guest: ${guestName || 'MANAGER IT'})!`);
      } else {
        setSaveSuccessMsg(`KOT #${targetKotNo} Generated Successfully on Table ${tableNo}!`);
      }
    }

    // Broadcast into global KDS sync bus
    const syncKot = normalizeKotOrder({
      id: `IDS-${targetKotNo}`,
      tableNumber: tableNo || (isNcMode ? '10' : '10'),
      steward: server,
      outlet: selectedOutlet,
      totalAmount: isNcMode ? 0 : calculations.nettAmount,
      isNc: isNcMode,
      ncDept: ncDept,
      specialInstructions: isNcMode ? `[NC - ${ncDept || 'Managers'}] Guest: ${guestName || 'MANAGER IT'}` : '',
      items: lineItems.map((it, idx) => ({
        id: idx + 1,
        name: it.name,
        qty: it.quantity,
        rate: it.rate
      }))
    });
    const existing = getLiveKots();
    saveLiveKots([syncKot, ...existing]);
    broadcastKotChannel(syncKot);

    if (onKOTCreated) onKOTCreated(updatedKotRecord);

    setTimeout(() => setSaveSuccessMsg(null), 3000);

    // Reset line items and state for next entry (Video 07 Frame 32)
    setLineItems([]);
    setKotNo('AUTO');
    setTableNo('');
    setCovers('');
    setGuestName('');
    setNcDept('');
    setNcType('');
    setIsNcMode(false);
    setEditingKotNo(null);
    setOriginalKotSnapshot(null);
    setSelectedRowIdx(null);
  };

  const handleConfirmReason = () => {
    setReasonModalOpen(false);
    if (reasonModalAction === 'DELETE_KOT') {
      // Video 06 Frame 26 - 30: Delete entire KOT from database
      const kotToDelete = editingKotNo;
      const targetTable = tableNo;

      setSavedKots(prev => prev.filter(k => k.kotNo !== kotToDelete));

      // Notify KDS of KOT cancellation
      const cancelKot = normalizeKotOrder({
        id: `IDS-${kotToDelete}`,
        tableNumber: targetTable,
        steward: server,
        outlet: selectedOutlet,
        status: 'CANCELLED',
        totalAmount: 0,
        items: []
      });
      const existing = getLiveKots().filter(k => k.id !== `IDS-${kotToDelete}`);
      saveLiveKots(existing);
      broadcastKotChannel(cancelKot);

      setSaveSuccessMsg(`KOT #${kotToDelete} on Table ${targetTable} Deleted / Voided! [Reason: ${selectedReason}]`);
      setTimeout(() => setSaveSuccessMsg(null), 3500);

      // Reset Order Entry form back to clean state (Video 06 Frame 28)
      setLineItems([]);
      setKotNo('AUTO');
      setTableNo('');
      setCovers('');
      setEditingKotNo(null);
      setOriginalKotSnapshot(null);
      setSelectedRowIdx(null);
      setReasonModalAction('SAVE_KOT');
    } else {
      handleSaveKOT(selectedReason);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1200 }}>
      {/* 1. SELECT OUTLET DIALOG (Video 01 Frame 010) */}
      {!outletConfirmed ? (
        <div 
          className="ids-modal-container" 
          style={{ width: '420px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '3px 3px 10px rgba(0,0,0,0.5)' }}
        >
          <div className="ids-modal-titlebar" style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '12px' }}>Select Outlet</span>
            <button className="ids-win-btn close" onClick={onClose} style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}>✕</button>
          </div>
          <div style={{ padding: '16px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontWeight: 600 }}>Restaurant</label>
              <select 
                value={selectedOutlet}
                onChange={e => setSelectedOutlet(e.target.value)}
                style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
              >
                <option value="RESTAURANT">RESTAURANT</option>
                <option value="LIQUOR BAR">LIQUOR BAR</option>
                <option value="ROOM SERVICE">ROOM SERVICE</option>
                <option value="BANQUET">BANQUET</option>
                <option value="BAR / LOUNGE">BAR / LOUNGE</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontWeight: 600 }}>Accounting Date</label>
              <input 
                type="text" 
                readOnly 
                value={accountingDate} 
                style={{ background: '#E0DFE3', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontWeight: 600 }}>Session</label>
              <select 
                value={selectedSession}
                onChange={e => setSelectedSession(e.target.value)}
                style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
              >
                <option value="General">General</option>
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px', borderTop: '1px solid #D0D0D0', paddingTop: '10px' }}>
              <button 
                onClick={() => {
                  setIntegrityCheckOpen(true);
                  setTimeout(() => {
                    setIntegrityCheckOpen(false);
                    setOutletConfirmed(true);
                  }, 600);
                }}
                className="ids-btn"
                style={{ minWidth: '60px', fontWeight: 600 }}
              >
                Ok
              </button>
              <button 
                onClick={onClose}
                className="ids-btn"
                style={{ minWidth: '60px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* 2. ORDER ENTRY V6.5.002.4 MAIN WINDOW (Video 01 Frame 015 - Frame 040) */
        <div 
          className="ids-modal-container" 
          style={{ width: '920px', maxWidth: '98vw', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '4px 4px 15px rgba(0,0,0,0.6)' }}
        >
          {/* Main Title Bar */}
          <div className="ids-modal-titlebar" style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '12px' }}>Order Entry V6.5.002.4</span>
            <button className="ids-win-btn close" onClick={onClose} style={{ fontSize: '11px', height: '18px', width: '18px', lineHeight: '16px' }}>✕</button>
          </div>

          {/* Subheader Banner (Frame 015 & Video 07 Frame 022) */}
          <div style={{ background: '#D4D0C8', borderBottom: '1px solid #808080', padding: '3px 12px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#000080' }}>
            <span>{selectedOutlet}</span>
            <span>{selectedSession}</span>
            <span style={{ color: isNcMode ? '#C00000' : '#000080' }}>{isNcMode ? 'NC Kot' : 'Standard KOT'}</span>
            <span>{accountingDate}</span>
          </div>

          {/* 12-Icon Win32 Command Toolbar Strictly Matching Video 13 (Frames 015, 040, 070, 090, 102) */}
          <div style={{ background: '#ECE9D8', borderBottom: '1px solid #999', padding: '4px 8px', display: 'flex', gap: '3px', alignItems: 'center' }}>
            {/* 1. Shift+F1: Print Bill (Video 13 Frame 011) */}
            <button 
              className="ids-btn" 
              title="1. Print Bill (Short Key: Shift + F1) — To Print bill after KOT punch" 
              onClick={() => setPosBillModalOpen(true)} 
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '40px', padding: '2px 4px' }}
            >
              <Printer size={16} color="#000080" />
            </button>

            {/* 2. Shift+F2: Bill Settlement (Video 13 Frame 016) */}
            <button 
              className="ids-btn" 
              title="2. Bill Settlement (Short Key: Shift + F2) — Settle Bill via Cash / Card / Room Folio" 
              onClick={() => setPosBillSettlementModalOpen(true)} 
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '40px', padding: '2px 4px', background: posBillSettlementModalOpen ? '#C1D2EE' : undefined }}
            >
              <CreditCard size={16} color="#008000" />
            </button>

            {/* 3. Shift+F3: Table Status (Video 13 Frame 021) */}
            <button 
              className="ids-btn" 
              title="3. Table Status (Short Key: Shift + F3) — Used to check Occupied/Vacant/Billed Status of a Table" 
              onClick={() => setTableStatusOpen(true)} 
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '40px', padding: '2px 4px', background: tableStatusOpen ? '#C1D2EE' : undefined }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', alignItems: 'center', padding: '1px 0' }}>
                <div style={{ width: '13px', height: '5px', background: '#008000', border: '1px solid #000' }}></div>
                <div style={{ width: '13px', height: '5px', background: '#FF0000', border: '1px solid #000' }}></div>
              </div>
            </button>

            {/* 4. Shift+F4: Table Transfer (Video 13 Frame 031) */}
            <button 
              className="ids-btn" 
              title="4. Table Transfer (Short Key: Shift + F4) — Used to transfer a running table to a different table" 
              onClick={() => {
                setTableTransferOpen(true);
                handleLoadSourceTable(transferSourceTable || '10');
              }} 
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '40px', padding: '2px 4px', background: tableTransferOpen ? '#C1D2EE' : undefined }}
            >
              <ArrowRightLeft size={16} color="#000080" />
            </button>

            {/* 5. Shift+F5: Session Transfer (Video 13 Frame 046 - Frame 050) */}
            <button 
              className="ids-btn" 
              title="5. Session Transfer (Short Key: Shift + F5) — Used to change session from Breakfast to Lunch & Lunch to Dinner" 
              onClick={() => {
                setSessionTransferOpen(true);
                handleLoadSessionTransfer();
              }} 
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '40px', padding: '2px 4px', background: sessionTransferOpen ? '#C1D2EE' : undefined }}
            >
              <div style={{ display: 'flex', gap: '1px', alignItems: 'center' }}>
                <div style={{ width: '8px', height: '14px', background: '#0000FF', border: '1px solid #000', color: '#FFF', fontSize: '7px', fontWeight: 900, textAlign: 'center', lineHeight: '14px' }}>B</div>
                <div style={{ width: '8px', height: '14px', background: '#FFD700', border: '1px solid #000', color: '#000', fontSize: '7px', fontWeight: 900, textAlign: 'center', lineHeight: '14px' }}>S</div>
              </div>
            </button>

            {/* 6. Shift+F6: Table Link (Video 13 Frame 055 - Frame 060) */}
            <button 
              className="ids-btn" 
              title="6. Table Link (Short Key: Shift + F6) — Used to link 3-4 tables in one table for billing" 
              onClick={() => setTableLinkOpen(true)} 
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '40px', padding: '2px 4px', background: tableLinkOpen ? '#C1D2EE' : undefined }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
                <div style={{ width: '6px', height: '10px', background: '#316AC5', border: '1px solid #000' }}></div>
                <div style={{ width: '4px', height: '2px', background: '#000' }}></div>
                <div style={{ width: '6px', height: '10px', background: '#316AC5', border: '1px solid #000' }}></div>
              </div>
            </button>

            {/* 7. Shift+F7: Multi-Restaurant (Video 13 Frame 064 - Frame 072) */}
            <button 
              className="ids-btn" 
              title="7. Multi-Restaurant (Short Key: Shift + F7) — Used to change Multiple Outlets at once inside order entry" 
              onClick={() => setMultiOutletOpen(true)} 
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '40px', padding: '2px 4px', background: multiOutletOpen ? '#C1D2EE' : undefined }}
            >
              <div style={{ position: 'relative', width: '16px', height: '14px' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '11px', height: '11px', background: '#FFF', border: '1px solid #666', fontSize: '7px', fontWeight: 700, textAlign: 'center', lineHeight: '11px' }}>R</div>
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '11px', height: '11px', background: '#C1D2EE', border: '1px solid #0A246A', fontSize: '7px', fontWeight: 700, textAlign: 'center', lineHeight: '11px' }}>B</div>
              </div>
            </button>

            {/* 8. Shift+F8: NC KOT (Video 13 Frame 076 - Frame 084) */}
            <button 
              className="ids-btn" 
              title="8. NC KOT (Short Key: Shift + F8) — Used to Make Non-Chargeable KOT" 
              onClick={() => {
                setIsNcMode(prev => !prev);
                setSaveSuccessMsg(`Shift+F8: Toggled NC KOT mode (${!isNcMode ? 'ON' : 'OFF'}).`);
                setTimeout(() => setSaveSuccessMsg(null), 3000);
              }} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '2px', 
                minWidth: '55px', 
                padding: '2px 4px', 
                color: isNcMode ? '#008000' : '#444', 
                fontWeight: 700,
                background: isNcMode ? '#DFF0D8' : undefined,
                border: isNcMode ? '2px inset #FFF' : undefined
              }}
            >
              <FileText size={14} color={isNcMode ? '#008000' : '#000080'} />
              <span style={{ fontSize: '9px', background: isNcMode ? '#008000' : '#C00', color: '#FFF', padding: '0 2px', borderRadius: '1px' }}>
                {isNcMode ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* 9. Shift+F9: Bill and Settle (Video 13 Frame 088 - Frame 092) */}
            <button 
              className="ids-btn" 
              title="9. Bill and Settle (Short Key: Shift + F9) — Used in MINI BAR billing for KOT-BILLING-SETTLEMENT at 1 click" 
              onClick={handleOneClickBillAndSettle} 
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '40px', padding: '2px 4px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 900, color: '#008000' }}>⚡</span>
                <span style={{ fontSize: '8px', fontWeight: 700, color: '#000080' }}>1-CLK</span>
              </div>
            </button>

            {/* 10. Shift+F10: Options (Video 13 Frame 093 - Frame 098) */}
            <button 
              className="ids-btn" 
              title="10. Options (Short Key: Shift + F10) — For NC Bill Printing, or to Open Cash Drawer" 
              onClick={() => setOptionsModalOpen(true)} 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                minWidth: '40px', 
                padding: '2px 4px',
                background: optionsModalOpen ? '#C1D2EE' : undefined
              }}
            >
              <SlidersHorizontal size={15} color="#0A246A" />
            </button>

            {/* Menu Groups Setup (Video 14: Menu Groups V6.5.002.1 & Touch Screen Groups) */}
            <button 
              className="ids-btn" 
              title="Menu Groups V6.5.002.1 & Touch Screen Groups Setup (Video 14)" 
              onClick={() => setMenuGroupsOpen(true)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '38px', padding: '2px 4px', background: menuGroupsOpen ? '#C1D2EE' : undefined }}
            >
              <Archive size={15} color="#274E13" />
            </button>

            {/* HotKey Help (Shift+F1 to Shift+F10 Quick Reference) */}
            <button 
              className="ids-btn" 
              title="HotKey Help — View All IDS Fortune NEXT POS Shortcut Keys (Shift+F1 to Shift+F10)" 
              onClick={() => setHotKeyHelpOpen(true)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '38px', padding: '2px 4px', background: hotKeyHelpOpen ? '#C1D2EE' : undefined }}
            >
              <HelpCircle size={15} color="#0A246A" />
            </button>

            {/* Menu Master (Video 20: Menu Master V6.5.002.3 & Item Setup) */}
            <button 
              className="ids-btn" 
              title="Menu Master V6.5.002.3 — Item Master, Pricing & Portions Setup (Video 20)" 
              onClick={() => setMenuMasterModalOpen(true)} 
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '40px', padding: '2px 4px', background: menuMasterModalOpen ? '#C1D2EE' : undefined }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <span style={{ fontSize: '11px' }}>🍽️</span>
                <span style={{ fontSize: '8px', fontWeight: 700, color: '#000080' }}>MENU</span>
              </div>
            </button>

            {/* Select Outlet (Video 20 Frame 130: Loading items: RES/3) */}
            <button 
              className="ids-btn" 
              title="Select Outlet — Accounting Date & Loading items: RES/3 (Video 20 Frame 130)" 
              onClick={() => setSelectOutletModalOpen(true)} 
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '40px', padding: '2px 4px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <span style={{ fontSize: '11px' }}>🏪</span>
                <span style={{ fontSize: '8px', fontWeight: 700, color: '#006400' }}>OUTLET</span>
              </div>
            </button>

            {/* EAT AS U LIKE (Video 21 Frame 045 & Frame 050: Ctrl + Shift + F4) */}
            <button 
              className="ids-btn" 
              title="EAT AS U LIKE — Package / Combo Item Selector (Ctrl + Shift + F4) (Video 21)" 
              onClick={() => setEatAsULikeModalOpen(true)} 
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '40px', padding: '2px 4px', background: eatAsULikeModalOpen ? '#C1D2EE' : undefined }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <span style={{ fontSize: '11px' }}>🎁</span>
                <span style={{ fontSize: '8px', fontWeight: 700, color: '#C00000' }}>PROMO</span>
              </div>
            </button>

            {/* Sales Promotion Master (Video 21: Setup -> Sales Promotion Master) */}
            <button 
              className="ids-btn" 
              title="Sales Promotion Master V6.5.002.1 — Packages, Combos & Buy 2 Get 1 Free (Video 21)" 
              onClick={() => setSalesPromotionModalOpen(true)} 
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '40px', padding: '2px 4px', background: salesPromotionModalOpen ? '#C1D2EE' : undefined }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <span style={{ fontSize: '11px' }}>🏷️</span>
                <span style={{ fontSize: '8px', fontWeight: 700, color: '#000080' }}>SETUP</span>
              </div>
            </button>

            {/* Reprint Button (Video 13 Frame 099 - Frame 108) */}
            <button 
              className="ids-btn" 
              title="Reprint — To Re-print KOT if it is not printed in first attempt (KOT Reprint V6.5.002.1)" 
              onClick={handleOpenKotReprint} 
              style={{ marginLeft: 'auto', padding: '2px 10px', fontSize: '11px', fontWeight: 700, background: kotReprintOpen ? '#C1D2EE' : '#ECE9D8', color: '#000080' }}
            >
              Reprint
            </button>
          </div>

          {/* Form Header Input Controls (Video 01 Frame 015 & Frame 025) */}
          <div style={{ padding: '8px 12px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px 16px', fontSize: '11px', background: '#ECE9D8', borderBottom: '1px solid #CCC' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ width: '45px', fontWeight: 600 }}>Cur</label>
              <select 
                value={currency} 
                onChange={e => setCurrency(e.target.value)}
                style={{ width: '80px', background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ width: '55px', fontWeight: 600 }}>Table #</label>
              <input 
                type="text" 
                value={tableNo} 
                onChange={e => setTableNo(e.target.value)}
                style={{ width: '60px', background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px', fontWeight: 700 }}
              />
              <button 
                className="ids-btn" 
                onClick={() => setRestaurantTableMasterOpen(true)}
                title="Restaurant Table Master V6.5.002.1 - Lookup & Capacity (Video 16)"
                style={{ padding: '1px 6px', fontSize: '11px', fontWeight: 700 }}
              >
                ?
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ width: '70px', fontWeight: 600 }}>Guest Name</label>
              <input 
                type="text" 
                value={guestName} 
                onChange={e => setGuestName(e.target.value)}
                placeholder="Walk-In Guest"
                style={{ flex: 1, background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ width: '60px', fontWeight: 600 }}>N.C Dept</label>
              <input 
                type="text" 
                value={ncDept} 
                onChange={e => setNcDept(e.target.value)}
                disabled={!isNcMode}
                style={{ flex: 1, background: isNcMode ? '#FFF' : '#E8E8E8', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ width: '45px', fontWeight: 600 }}>KOT #</label>
              <input 
                type="text" 
                value={kotNo} 
                onChange={e => setKotNo(e.target.value)}
                style={{ width: '80px', background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px', fontWeight: 700 }}
              />
              <button 
                className="ids-btn" 
                onClick={() => setPendingKotOpen(true)}
                title="Pending KOTs Lookup"
                style={{ padding: '1px 6px', fontSize: '11px', fontWeight: 700 }}
              >
                ?
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ width: '55px', fontWeight: 600 }}>Covers</label>
              <input 
                type="number" 
                value={covers} 
                onChange={e => setCovers(e.target.value)}
                style={{ width: '60px', background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ width: '70px', fontWeight: 600 }}>Server</label>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <select 
                  value={server} 
                  onChange={e => setServer(e.target.value)}
                  style={{ flex: 1, background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                >
                  {/* Video 19: Exclude Passive servers from Order Entry */}
                  {getStoredServers()
                    .filter(s => s.status !== 'Passive')
                    .map(s => (
                      <option key={s.serverCode} value={s.name}>
                        [{s.serverCode}] {s.name}
                      </option>
                  ))}
                  {POS_STEWARDS.filter(st => {
                    const matched = getStoredServers().find(s => s.name.toLowerCase() === st.toLowerCase());
                    if (matched && matched.status === 'Passive') return false;
                    return !matched;
                  }).map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
                <button 
                  className="ids-btn" 
                  onClick={() => setServersMasterOpen(true)}
                  title="Servers V6.5.002.1 - Stewards Master & Deactivation (Videos 18 & 19)"
                  style={{ padding: '1px 6px', fontSize: '11px', fontWeight: 700 }}
                >
                  ?
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ width: '60px', fontWeight: 600 }}>NC Type</label>
              <input 
                type="text" 
                value={ncType} 
                onChange={e => setNcType(e.target.value)}
                disabled={!isNcMode}
                style={{ flex: 1, background: isNcMode ? '#FFF' : '#E8E8E8', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
              />
            </div>
          </div>

          {/* Feedback banner if saved */}
          {saveSuccessMsg && (
            <div style={{ background: '#D4EDDA', borderBottom: '1px solid #C3E6CB', color: '#155724', padding: '4px 12px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Check size={14} />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Dual-Pane Data Grid (Left: Line Entry, Right: Running Bill Computation) */}
          <div style={{ display: 'grid', gridTemplateColumns: '60% 40%', height: '310px', background: '#FFF', borderBottom: '1px solid #808080', overflow: 'hidden' }}>
            {/* Left Data Entry Grid */}
            <div style={{ overflowY: 'auto', borderRight: '1px solid #A0A0A0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#D4D0C8', borderBottom: '1px solid #808080' }}>
                  <tr>
                    <th style={{ padding: '3px 6px', borderRight: '1px solid #B0B0B0', width: '38px' }}>Res.</th>
                    <th style={{ padding: '3px 6px', borderRight: '1px solid #B0B0B0', width: '45px' }}>Code</th>
                    <th style={{ padding: '3px 6px', borderRight: '1px solid #B0B0B0' }}>Item Name</th>
                    <th style={{ padding: '3px 6px', borderRight: '1px solid #B0B0B0', width: '50px', textAlign: 'right' }}>Quantity</th>
                    <th style={{ padding: '3px 6px', borderRight: '1px solid #B0B0B0', width: '60px', textAlign: 'right' }}>Rate</th>
                    <th style={{ padding: '3px 6px', width: '55px', textAlign: 'center' }}>Modify</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, idx) => {
                    const isSelected = selectedRowIdx === idx;
                    return (
                      <tr 
                        key={idx} 
                        onClick={() => setSelectedRowIdx(idx)}
                        style={{ 
                          background: isSelected ? '#316AC5' : (item.isPromoConstituent ? '#FFFF00' : (idx % 2 === 0 ? '#FFF' : '#F9F9F9')), 
                          color: isSelected ? '#FFF' : '#000',
                          borderBottom: '1px solid #E0E0E0',
                          cursor: 'pointer'
                        }}
                      >
                        <td 
                          style={{ 
                            padding: '3px 6px', 
                            borderRight: '1px solid #E0E0E0', 
                            color: isSelected ? '#FFF' : (item.res === 'CAR' || item.res === 'BAR' ? '#8B0000' : '#444'),
                            fontWeight: item.res === 'CAR' || item.res === 'BAR' ? 700 : 500,
                            cursor: 'pointer'
                          }}
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRowIdx(idx);
                            setFocusedColumn('code');
                          }}
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            handleOpenSupRestaurant(idx);
                          }}
                          onKeyDown={(e) => {
                            if (e.shiftKey && (e.key === 'F11' || e.code === 'F11')) {
                              e.preventDefault();
                              handleOpenSupRestaurant(idx);
                            }
                          }}
                          title="Supplying Outlet: Double-click or press Shift+F11 on Code to change outlet (Video 11)"
                        >
                          {item.res || 'RES'}
                        </td>
                        <td 
                          style={{ 
                            padding: '3px 6px', 
                            borderRight: '1px solid #E0E0E0', 
                            fontWeight: 700, 
                            cursor: 'pointer',
                            background: isSelected ? '#0A246A' : undefined,
                            color: isSelected ? '#FFF' : '#000',
                            textDecoration: isSelected ? 'underline' : 'none'
                          }}
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRowIdx(idx);
                            setFocusedColumn('code');
                          }}
                          onFocus={() => {
                            setSelectedRowIdx(idx);
                            setFocusedColumn('code');
                          }}
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            handleOpenSupRestaurant(idx);
                          }}
                          onKeyDown={(e) => {
                            if (e.shiftKey && (e.key === 'F11' || e.code === 'F11')) {
                              e.preventDefault();
                              handleOpenSupRestaurant(idx);
                            } else if (e.key === 'F5' || e.code === 'F5') {
                              e.preventDefault();
                              handleDeleteRow(idx);
                            }
                          }}
                          title="Click on Item Code | Press Shift+F11 to import items from other outlet (Video 11) | Press <F5> to delete"
                        >
                          {item.code}
                        </td>
                        <td 
                          style={{ 
                            padding: renamingRowIdx === idx ? '1px 2px' : '3px 6px', 
                            borderRight: '1px solid #E0E0E0', 
                            cursor: 'pointer', 
                            color: isSelected ? '#FFF' : '#000080',
                            fontWeight: 500,
                            background: renamingRowIdx === idx ? '#FFF' : undefined
                          }}
                          onClick={(e) => { 
                            e.stopPropagation();
                            setSelectedRowIdx(idx);
                          }}
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            setSelectedRowIdx(idx);
                            setRenamingRowIdx(idx);
                          }}
                          title="Double-click or press Shift+F11 on Quantity to rename item"
                        >
                          {renamingRowIdx === idx ? (
                            <input 
                              type="text" 
                              autoFocus
                              value={item.name} 
                              onChange={e => {
                                const val = e.target.value;
                                setLineItems(prev => {
                                  const copy = [...prev];
                                  copy[idx] = { ...copy[idx], name: val, isRenamed: true };
                                  return copy;
                                });
                              }}
                              onFocus={(e) => e.target.select()}
                              onBlur={() => setRenamingRowIdx(null)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  setRenamingRowIdx(null);
                                  setSaveSuccessMsg(`Item #${item.code} renamed to "${item.name}"`);
                                  setTimeout(() => setSaveSuccessMsg(null), 3000);
                                } else if (e.key === 'Escape') {
                                  e.preventDefault();
                                  setRenamingRowIdx(null);
                                }
                              }}
                              style={{ 
                                width: '98%', 
                                background: '#FFF', 
                                border: '2px solid #0A246A', 
                                color: '#000080', 
                                fontWeight: 700, 
                                fontSize: '11px', 
                                padding: '1px 3px',
                                outline: 'none'
                              }}
                              title="Type custom name and press Enter to commit"
                            />
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                              <span>{item.name}</span>
                              {item.isRenamed && (
                                <span style={{ fontSize: '9px', background: '#FFF3CD', color: '#856404', padding: '0 3px', border: '1px solid #FFEEBA', borderRadius: '2px', fontWeight: 700 }}>
                                  Renamed
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '2px 4px', borderRight: '1px solid #E0E0E0', textAlign: 'right' }}>
                          <input 
                            type="number" 
                            step="1" 
                            min="0"
                            value={item.quantity} 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRowIdx(idx);
                              setFocusedColumn('quantity');
                            }}
                            onFocus={() => {
                              setSelectedRowIdx(idx);
                              setFocusedColumn('quantity');
                            }}
                            onKeyDown={(e) => {
                              if (e.shiftKey && (e.key === 'F11' || e.code === 'F11')) {
                                e.preventDefault();
                                setSelectedRowIdx(idx);
                                setRenamingRowIdx(idx);
                                setSaveSuccessMsg(`Shift+F11: Renaming Item "${item.name}". Type custom name and press Enter.`);
                                setTimeout(() => setSaveSuccessMsg(null), 3500);
                              } else if (e.key === 'F1' || e.code === 'F1') {
                                // Video 13 Frame 109 & 115: <F1> @ Qty for Modifier
                                e.preventDefault();
                                handleOpenItemModifier(idx);
                              }
                            }}
                            onChange={e => {
                              const val = parseFloat(e.target.value) || 0;
                              setLineItems(prev => {
                                const copy = [...prev];
                                copy[idx] = { ...copy[idx], quantity: val };
                                return copy;
                              });
                            }}
                            title="Click on Quantity Field & Press Shift+F11 to Rename Item | Press <F1> for Modifier (Video 13)"
                            style={{ 
                              width: '46px', 
                              textAlign: 'right', 
                              border: '1px solid #7F9DB9', 
                              fontSize: '11px', 
                              padding: '1px 2px',
                              fontWeight: 600,
                              background: '#FFF',
                              color: '#000'
                            }}
                          />
                        </td>
                        <td style={{ padding: '3px 6px', borderRight: '1px solid #E0E0E0', textAlign: 'right' }}>
                          {item.rate.toFixed(2)}
                        </td>
                        <td style={{ padding: '2px 4px', textAlign: 'center' }}>
                          <button 
                            className="ids-btn" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenItemModifier(idx);
                            }}
                            title="Attach Item Modifier (or press <F1> on Quantity) - Video 13 Frame 109 & Frame 115"
                            style={{ 
                              fontSize: '10px', 
                              padding: '1px 4px', 
                              background: item.modifier ? '#FFA500' : '#F0E6D2', 
                              color: '#000',
                              fontWeight: item.modifier ? 700 : 400,
                              border: item.modifier ? '1px solid #CC7A00' : undefined
                            }}
                          >
                            Modifier
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {/* Empty rows to maintain authentic Win32 grid height */}
                  {Array.from({ length: Math.max(0, 10 - lineItems.length) }).map((_, i) => {
                    const emptyRowIdx = lineItems.length + i;
                    return (
                      <tr key={`empty-${i}`} style={{ height: '22px', borderBottom: '1px solid #F0F0F0' }}>
                        <td 
                          style={{ padding: '3px 6px', borderRight: '1px solid #F0F0F0', color: '#888', cursor: 'pointer' }}
                          onClick={() => handleOpenSupRestaurant(emptyRowIdx)}
                          title="Click to select Supplying Outlet (Shift+F11)"
                        >
                          RES
                        </td>
                        <td 
                          style={{ borderRight: '1px solid #F0F0F0', cursor: 'pointer' }}
                          onClick={() => handleOpenSupRestaurant(emptyRowIdx)}
                          title="Click on Code: Press Shift+F11 to import item from other outlet"
                        ></td>
                        <td 
                          style={{ borderRight: '1px solid #F0F0F0', cursor: 'pointer' }}
                          onClick={() => { setActiveRowIdx(emptyRowIdx); setItemHelpOpen(true); }}
                        >
                          <span style={{ color: '#AAA', fontStyle: 'italic', paddingLeft: '4px' }}>Click to add item...</span>
                        </td>
                        <td style={{ borderRight: '1px solid #F0F0F0' }}></td>
                        <td style={{ borderRight: '1px solid #F0F0F0' }}></td>
                        <td></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Right Billing Summary Pane (Video 01 Frame 025 & Frame 038) */}
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#FCFCFC' }}>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#D4D0C8', borderBottom: '1px solid #808080' }}>
                    <tr>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #B0B0B0', width: '50px', textAlign: 'right' }}>Quantity</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #B0B0B0' }}>Item Name</th>
                      <th style={{ padding: '3px 6px', width: '65px', textAlign: 'right' }}>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, idx) => (
                      <React.Fragment key={idx}>
                        <tr style={{ borderBottom: '1px solid #EFEFEF' }}>
                          <td style={{ padding: '3px 6px', textAlign: 'right', borderRight: '1px solid #EFEFEF' }}>{item.quantity.toFixed(3)}</td>
                          <td style={{ padding: '3px 6px', borderRight: '1px solid #EFEFEF' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                              <span>{item.name}</span>
                              {item.res && item.res !== 'RES' && (
                                <span style={{ fontSize: '9px', background: '#F8D7DA', color: '#721C24', padding: '0 3px', border: '1px solid #F5C6CB', borderRadius: '2px', fontWeight: 700 }}>
                                  {item.res}
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '3px 6px', textAlign: 'right', fontWeight: 600 }}>
                            {item.isPromoConstituent ? '0.00' : (item.quantity * item.rate).toFixed(2)}
                          </td>
                        </tr>
                        {/* Video 13 Frame 124: Indented Modifier Row below parent item */}
                        {item.modifier && (
                          <tr style={{ borderBottom: '1px solid #EFEFEF', background: '#FFFDF5' }}>
                            <td style={{ padding: '2px 6px', textAlign: 'right', borderRight: '1px solid #EFEFEF' }}></td>
                            <td style={{ padding: '2px 6px 2px 22px', borderRight: '1px solid #EFEFEF', fontStyle: 'italic', color: '#B35900', fontWeight: 600 }}>
                              {typeof item.modifier === 'object' ? item.modifier.name : item.modifier}
                            </td>
                            <td style={{ padding: '2px 6px', textAlign: 'right', color: '#B35900', fontWeight: 500 }}>
                              {typeof item.modifier === 'object' ? Number(item.modifier.charge || 0).toFixed(2) : '0.00'}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Statutory Taxes & Bill Totals */}
              <div style={{ background: '#F5F4EE', borderTop: '2px solid #808080', padding: '6px 10px', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                  <span style={{ fontWeight: 600 }}>Total Amount:</span>
                  <span style={{ fontWeight: 700 }}>₹{calculations.totalAmount.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: '#444' }}>
                  <span>Central GST @ 2.50:</span>
                  <span>₹{calculations.cgst.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: '#444' }}>
                  <span>State GST @ 2.50:</span>
                  <span>₹{calculations.sgst.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderTop: '1px solid #CCC', marginTop: '2px', fontSize: '12px', fontWeight: 800, color: '#000080' }}>
                  <span>Nett Amount:</span>
                  <span>₹{calculations.nettAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Status Bar matching Video 01, Video 05/06, Video 10 & Video 11 */}
          <div style={{ background: '#ECE9D8', borderBottom: '1px solid #BBB', padding: '3px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#333' }}>
            <span>&lt;F1&gt; @ Qty for Modifier</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: '#E6F0FA', border: '1px solid #7F9DB9', color: '#0A246A', padding: '1px 6px', borderRadius: '2px', fontWeight: 700, fontSize: '10px' }}>
                Code + Shift+F11: Import Items from Other Outlet (LIQUOR BAR)
              </span>
              <span style={{ background: '#FFF8E7', border: '1px solid #E0B86B', color: '#856404', padding: '1px 6px', borderRadius: '2px', fontWeight: 700, fontSize: '10px' }}>
                Qty + Shift+F11: Rename Item
              </span>
              <span style={{ background: '#FCE8E6', border: '1px solid #D93025', color: '#B22222', padding: '1px 6px', borderRadius: '2px', fontWeight: 700, fontSize: '10px' }}>
                Ctrl+Shift+F4: EAT AS U LIKE Promo (Video 21)
              </span>
              <span style={{ fontWeight: 600, color: selectedRowIdx !== null ? '#A00000' : (editingKotNo ? '#C00000' : '#000080') }}>
                {editingKotNo 
                  ? (selectedRowIdx !== null
                      ? `Row #${selectedRowIdx + 1} Selected (<F5> to delete item) | Click Delete Button to delete entire KOT #${editingKotNo}`
                      : `Editing KOT #${editingKotNo} on Table ${tableNo} — Click on Delete Button to delete entire KOT`)
                  : (selectedRowIdx !== null 
                      ? `Row #${selectedRowIdx + 1} (${lineItems[selectedRowIdx]?.name || 'Item'}) Selected — Press <F5> from keyboard to delete item`
                      : 'Click on Item Code to delete item (<F5>) | Click on Quantity Field to Change Item Quantity')}
              </span>
            </div>
            <span>&lt;F10&gt; @ MemberCode for Help</span>
          </div>

          {/* Footer Action Buttons matching Video 01 Frame 015 & Video 06 Frame 020 */}
          <div style={{ padding: '6px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ECE9D8' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button className="ids-btn" onClick={() => setItemHelpOpen(true)} style={{ fontWeight: 600 }}>
                + Add Item
              </button>
              <button 
                className="ids-btn" 
                onClick={() => {
                  const targetIdx = selectedRowIdx !== null ? selectedRowIdx : lineItems.length;
                  handleOpenSupRestaurant(targetIdx);
                }}
                title="Shift + F11 on Code to Import Items from Other Outlet (Video 11)"
                style={{ fontWeight: 700, background: '#E6F0FA', borderColor: '#0A246A', color: '#0A246A' }}
              >
                Shift+F11 Other Outlet
              </button>
              <button 
                className="ids-btn" 
                onClick={() => {
                  setTableNo('14');
                  setServer('Biren');
                  setCovers('1');
                  setCurrency('INR');
                  setKotNo('AUTO');
                  setLineItems([
                    { res: 'RES', code: '1', name: 'CLASSIC RUSSIAN SALAD', quantity: 1.0, rate: 199.0, modifier: '' },
                    { res: 'RES', code: '2', name: 'RED BEANS PEANUT & DF', quantity: 1.0, rate: 199.0, modifier: '' },
                    { res: 'CAR', code: '601', name: 'BLENDERS PRIDE ...', quantity: 1.0, rate: 135.0, modifier: '' },
                    { res: 'CAR', code: '592', name: 'JW BLACK LABEL ...', quantity: 1.0, rate: 480.0, modifier: '' }
                  ]);
                  setSelectedRowIdx(2);
                  setFocusedColumn('code');
                  setSaveSuccessMsg('Table 14 Multi-Outlet Order Loaded (RES Food + CAR Bar Items)! Press Shift+F11 on Code to import from other outlets.');
                  setTimeout(() => setSaveSuccessMsg(null), 4000);
                }}
                title="Load Table 14 Multi-Outlet Video 11 Demo state"
                style={{ fontSize: '10px', background: '#FFF3CD', borderColor: '#856404', color: '#856404', fontWeight: 600 }}
              >
                Table 14 Demo
              </button>
              <button 
                className="ids-btn" 
                onClick={() => {
                  const targetIdx = selectedRowIdx !== null ? selectedRowIdx : 0;
                  if (lineItems[targetIdx]) {
                    setSelectedRowIdx(targetIdx);
                    setRenamingRowIdx(targetIdx);
                    setSaveSuccessMsg(`Shift+F11: Renaming Item "${lineItems[targetIdx].name}". Type custom name and press Enter.`);
                    setTimeout(() => setSaveSuccessMsg(null), 3500);
                  }
                }}
                title="Shift + F11 on Quantity to Rename Item (Video 10)"
                style={{ fontWeight: 600, background: '#F8F9FA', color: '#555' }}
              >
                Shift+F11 Rename
              </button>
              <button 
                className="ids-btn" 
                onClick={() => {
                  setTableNo('11');
                  setServer('Biren');
                  setCovers('1');
                  setLineItems([
                    { res: 'RES', code: '1', name: 'CLASSIC RUSSIAN SALAD', quantity: 1.0, rate: 199.0, modifier: '' },
                    { res: 'RES', code: '2', name: 'RED BEANS PEANUT & DRY FRUIT', quantity: 1.0, rate: 199.0, modifier: '' }
                  ]);
                  setSelectedRowIdx(0);
                  setSaveSuccessMsg('Table 11 loaded with Video 10 Items! Focus quantity and press Shift+F11 to rename.');
                  setTimeout(() => setSaveSuccessMsg(null), 4000);
                }}
                title="Load Table 11 Video 10 Demo state"
                style={{ fontSize: '10px', background: '#F0F0F0' }}
              >
                Table 11 Demo
              </button>
              <button 
                className="ids-btn" 
                onClick={() => {
                  setTableTransferOpen(true);
                  handleLoadSourceTable(transferSourceTable || '10');
                }}
                title="Table Transfer V6.5.002.1 (Video 12 Frame 026)"
                style={{ fontWeight: 700, background: '#E6F0FA', borderColor: '#0A246A', color: '#0A246A', fontSize: '11px' }}
              >
                Table Transfer
              </button>
              <button 
                className="ids-btn" 
                onClick={handleLoadVideo12Demo}
                title="Load Video 12 Initial State (Table 10 Occupied with KOT 1313, Table 14 Vacant)"
                style={{ fontSize: '10px', background: '#E2F0D9', borderColor: '#385723', color: '#385723', fontWeight: 700 }}
              >
                Video 12 Demo (T10-&gt;T14)
              </button>
              <button 
                className="ids-btn" 
                onClick={() => {
                  setSessionTransferOpen(true);
                  handleLoadSessionTransfer();
                }}
                title="Session Transfer (Shift + F5)"
                style={{ fontSize: '10px', background: '#FFF2CC', borderColor: '#D6B656', color: '#665200', fontWeight: 600 }}
              >
                Session Transfer
              </button>
              <button 
                className="ids-btn" 
                onClick={() => setTableLinkOpen(true)}
                title="Table Link (Shift + F6)"
                style={{ fontSize: '10px', background: '#F8CECC', borderColor: '#B85450', color: '#6B1B18', fontWeight: 600 }}
              >
                Table Link
              </button>
              <button 
                className="ids-btn" 
                onClick={() => setMenuGroupsOpen(true)}
                title="Menu Groups V6.5.002.1 & Touch Screen Groups Setup (Video 14)"
                style={{ fontSize: '10px', background: '#D5E8D4', borderColor: '#82B366', color: '#274E13', fontWeight: 700 }}
              >
                Menu Groups (POS-14)
              </button>
              <button 
                className="ids-btn" 
                onClick={() => setTouchScreenGroupsOpen(true)}
                title="Touch Screen Groups V6.5.002.1 & Terminal Tile Configuration (Video 15)"
                style={{ fontSize: '10px', background: '#CCE5FF', borderColor: '#66B2FF', color: '#004085', fontWeight: 700 }}
              >
                TS Groups (POS-15)
              </button>
              <button 
                className="ids-btn" 
                onClick={() => setRestaurantTableMasterOpen(true)}
                title="Restaurant Table Master V6.5.002.1 & Seating Capacities (Video 16)"
                style={{ fontSize: '10px', background: '#FFF2CC', borderColor: '#D6B656', color: '#665200', fontWeight: 700 }}
              >
                Tables (POS-16)
              </button>
              <button 
                className="ids-btn" 
                onClick={() => setHotKeyHelpOpen(true)}
                title="View All POS Shortcut Keys (Shift+F1 to Shift+F10)"
                style={{ fontSize: '10px', background: '#E1D5E7', borderColor: '#9673A6', color: '#4B2A5B', fontWeight: 700 }}
              >
                HotKey Help
              </button>
              <button className="ids-btn" onClick={() => setTableStatusOpen(true)}>
                Table Matrix
              </button>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                className="ids-btn" 
                onClick={() => handleSaveKOT()} 
                style={{ fontWeight: 700, minWidth: '65px', background: '#DFF0D8', borderColor: '#3C763D' }}
              >
                Save
              </button>
              <button 
                className="ids-btn" 
                onClick={() => { setLineItems([]); setSelectedRowIdx(null); }}
                style={{ minWidth: '60px' }}
              >
                Clear
              </button>
              <button 
                className="ids-btn" 
                onClick={() => {
                  if (editingKotNo) {
                    // Video 06 Frame 020: Delete entire KOT
                    setDeleteKotConfirmOpen(true);
                  } else if (selectedRowIdx !== null) {
                    handleDeleteRow(selectedRowIdx);
                  } else if (lineItems.length > 0) {
                    handleDeleteRow(lineItems.length - 1);
                  }
                }}
                title={editingKotNo ? `Delete entire KOT #${editingKotNo}` : "Delete item (<F5>)"}
                style={{ 
                  minWidth: '60px', 
                  fontWeight: (editingKotNo || selectedRowIdx !== null) ? 700 : 400, 
                  color: (editingKotNo || selectedRowIdx !== null) ? '#C00000' : '#000' 
                }}
              >
                Delete {editingKotNo ? '' : (selectedRowIdx !== null && lineItems[selectedRowIdx] ? `(${lineItems[selectedRowIdx].code})` : '')}
              </button>
              <button 
                className="ids-btn" 
                onClick={() => alert("Touch Screen Panel Toggle")}
                style={{ minWidth: '60px' }}
              >
                Panel
              </button>
              <button 
                className="ids-btn" 
                onClick={() => alert(`Room info lookup for in-house dining`)}
                style={{ minWidth: '65px' }}
              >
                Room info
              </button>
              <button 
                className="ids-btn" 
                onClick={() => setPosBillModalOpen(true)}
                style={{ minWidth: '70px', fontWeight: 600 }}
              >
                Check Out
              </button>
              <button 
                className="ids-btn" 
                onClick={onClose}
                style={{ minWidth: '60px' }}
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. TABLE # HELP MODAL (Video 01 Frame 015) */}
      {tableHelpOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1250 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '280px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '3px 3px 12px rgba(0,0,0,0.6)' }}
          >
            <div className="ids-modal-titlebar" style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Table # Help</span>
              <button className="ids-win-btn close" onClick={() => setTableHelpOpen(false)} style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}>✕</button>
            </div>
            <div style={{ padding: '8px' }}>
              <div style={{ height: '220px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9' }}>
                {POS_TABLES.map(t => (
                  <div 
                    key={t}
                    onClick={() => { setTableNo(t); setTableHelpOpen(false); }}
                    style={{ 
                      padding: '3px 8px', 
                      fontSize: '11px', 
                      cursor: 'pointer', 
                      background: tableNo === t ? '#0A246A' : 'transparent',
                      color: tableNo === t ? '#FFF' : '#000',
                      borderBottom: '1px solid #EEE'
                    }}
                  >
                    {t}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '8px' }}>
                <button className="ids-btn" onClick={() => setTableHelpOpen(false)} style={{ minWidth: '55px', fontWeight: 600 }}>Ok</button>
                <button className="ids-btn" onClick={() => setTableHelpOpen(false)} style={{ minWidth: '55px' }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3.1 WIN32 SUP.RESTAURANT (OTHER OUTLETS) MODAL (Video 11 Frame 021) */}
      {supRestaurantModalOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1280 }}>
          <div 
            className="ids-modal-container" 
            style={{ 
              width: '260px', 
              background: '#ECE9D8', 
              border: '2px outset #ECE9D8', 
              boxShadow: '4px 4px 15px rgba(0,0,0,0.5)',
              fontFamily: 'Tahoma, Arial, sans-serif'
            }}
          >
            <div 
              className="ids-modal-titlebar" 
              style={{ 
                background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', 
                color: '#FFF', 
                padding: '2px 5px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                height: '20px'
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Sup.Restaurant</span>
              <button 
                className="ids-win-btn close" 
                onClick={() => setSupRestaurantModalOpen(false)} 
                style={{ fontSize: '10px', height: '14px', width: '14px', lineHeight: '12px' }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ padding: '10px', fontSize: '11px' }}>
              <div 
                style={{ 
                  background: '#FFF', 
                  border: '2px inset #FFF', 
                  height: '95px', 
                  overflowY: 'auto',
                  outline: 'none'
                }}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setSelectedSupOutletIndex(prev => Math.min(POS_SUPPLYING_OUTLETS.length - 1, prev + 1));
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSelectedSupOutletIndex(prev => Math.max(0, prev - 1));
                  } else if (e.key === 'Enter') {
                    e.preventDefault();
                    handleConfirmSupRestaurant();
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    setSupRestaurantModalOpen(false);
                  }
                }}
              >
                {POS_SUPPLYING_OUTLETS.map((outlet, idx) => {
                  const isSelected = selectedSupOutletIndex === idx;
                  return (
                    <div 
                      key={outlet.code}
                      onClick={() => setSelectedSupOutletIndex(idx)}
                      onDoubleClick={() => {
                        setSelectedSupOutletIndex(idx);
                        handleConfirmSupRestaurant();
                      }}
                      style={{ 
                        padding: '2px 6px', 
                        cursor: 'pointer',
                        background: isSelected ? '#0A246A' : 'transparent',
                        color: isSelected ? '#FFF' : '#000',
                        fontWeight: isSelected ? 700 : 400,
                        fontSize: '11px',
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span>{outlet.name}</span>
                      <span style={{ opacity: isSelected ? 0.9 : 0.6, fontSize: '10px' }}>({outlet.code})</span>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
                <button 
                  className="ids-btn" 
                  onClick={handleConfirmSupRestaurant}
                  style={{ minWidth: '65px', fontWeight: 700, padding: '2px 8px' }}
                >
                  Ok
                </button>
                <button 
                  className="ids-btn" 
                  onClick={() => setSupRestaurantModalOpen(false)} 
                  style={{ minWidth: '65px', padding: '2px 8px' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. ITEM HELP SEARCH MODAL (Video 01 Frame 021 & Frame 032, Video 11 Frame 025-027) */}
      {itemHelpOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1260 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '510px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '4px 4px 15px rgba(0,0,0,0.6)' }}
          >
            <div className="ids-modal-titlebar" style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>
                Item Help {itemHelpFilterOutlet && itemHelpFilterOutlet !== 'ALL' ? `— [${itemHelpFilterOutlet}]` : ''}
              </span>
              <button className="ids-win-btn close" onClick={() => setItemHelpOpen(false)} style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}>✕</button>
            </div>
            <div style={{ padding: '10px', fontSize: '11px' }}>
              {/* Outlet Filter Tabs matching Video 11 Frame 023-025 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, fontSize: '10px' }}>Filter Outlet:</span>
                {[
                  { code: 'ALL', label: 'All Items' },
                  { code: 'RES', label: 'RESTAURANT (RES)' },
                  { code: 'CAR', label: 'LIQUOR BAR (CAR)' }
                ].map(tab => (
                  <button
                    key={tab.code}
                    className="ids-btn"
                    onClick={() => setItemHelpFilterOutlet(tab.code)}
                    style={{
                      fontSize: '10px',
                      padding: '1px 6px',
                      background: itemHelpFilterOutlet === tab.code ? '#0A246A' : '#ECE9D8',
                      color: itemHelpFilterOutlet === tab.code ? '#FFF' : '#000',
                      fontWeight: itemHelpFilterOutlet === tab.code ? 700 : 400
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <label style={{ fontWeight: 600 }}>Item Name</label>
                <input 
                  type="text" 
                  autoFocus 
                  value={itemSearchText} 
                  onChange={e => setItemSearchText(e.target.value)}
                  placeholder="Type item name (e.g. Blenders, Russian Salad)..."
                  style={{ flex: 1, background: '#FFF', border: '1px solid #7F9DB9', padding: '3px 6px', fontSize: '11px' }}
                />
              </div>
              <div style={{ height: '230px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#ECE9D8', borderBottom: '1px solid #AAA' }}>
                    <tr>
                      <th style={{ padding: '3px 6px', width: '38px', textAlign: 'left', borderRight: '1px solid #CCC' }}>Res.</th>
                      <th style={{ padding: '3px 6px', width: '50px', textAlign: 'left', borderRight: '1px solid #CCC' }}>Code</th>
                      <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #CCC' }}>Item Name</th>
                      <th style={{ padding: '3px 6px', width: '70px', textAlign: 'right' }}>Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMenuItems.map(m => (
                      <tr 
                        key={m.code}
                        onClick={() => handleSelectItem(m)}
                        style={{ cursor: 'pointer', borderBottom: '1px solid #EEE' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#E5F1FB'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '3px 6px', fontWeight: 600, color: m.outlet === 'CAR' ? '#8B0000' : '#444', borderRight: '1px solid #EEE' }}>{m.outlet || 'RES'}</td>
                        <td style={{ padding: '3px 6px', fontWeight: 600, borderRight: '1px solid #EEE' }}>{m.code}</td>
                        <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE' }}>{m.name}</td>
                        <td style={{ padding: '3px 6px', textAlign: 'right', fontWeight: 600 }}>₹{m.rate.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '10px' }}>
                <button 
                  className="ids-btn" 
                  onClick={() => {
                    if (filteredMenuItems.length > 0) handleSelectItem(filteredMenuItems[0]);
                  }} 
                  style={{ minWidth: '60px', fontWeight: 600 }}
                >
                  Ok
                </button>
                <button className="ids-btn" onClick={() => setItemHelpOpen(false)} style={{ minWidth: '60px' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. PENDING KOT MODAL (Video 01 Frame 043) */}
      {pendingKotOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1270 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '480px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '4px 4px 15px rgba(0,0,0,0.6)' }}
          >
            <div className="ids-modal-titlebar" style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Pending KOT</span>
              <button className="ids-win-btn close" onClick={() => setPendingKotOpen(false)} style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}>✕</button>
            </div>
            <div style={{ padding: '10px', fontSize: '11px' }}>
              <div style={{ height: '200px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#D4D0C8', borderBottom: '1px solid #808080' }}>
                    <tr>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #B0B0B0', textAlign: 'left' }}>KOT #</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #B0B0B0', textAlign: 'left' }}>Accounting Date</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #B0B0B0', textAlign: 'center', width: '60px' }}>Table #</th>
                      <th style={{ padding: '3px 6px', textAlign: 'left' }}>Server</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savedKots.map(k => (
                      <tr 
                        key={k.kotNo}
                        onClick={() => {
                          setStagedKotToModify(k);
                          setUpdateConfirmModalOpen(true);
                        }}
                        style={{ cursor: 'pointer', borderBottom: '1px solid #EEE' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#E5F1FB'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '4px 6px', fontWeight: 700, borderRight: '1px solid #EEE' }}>{k.kotNo}</td>
                        <td style={{ padding: '4px 6px', borderRight: '1px solid #EEE' }}>{k.accountingDate}</td>
                        <td style={{ padding: '4px 6px', textAlign: 'center', borderRight: '1px solid #EEE', fontWeight: 600 }}>{k.tableNo}</td>
                        <td style={{ padding: '4px 6px' }}>{k.server}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '10px' }}>
                <button 
                  className="ids-btn" 
                  onClick={() => {
                    if (savedKots.length > 0) {
                      setStagedKotToModify(savedKots[0]);
                      setUpdateConfirmModalOpen(true);
                    }
                  }} 
                  style={{ minWidth: '60px', fontWeight: 600 }}
                >
                  Select
                </button>
                <button className="ids-btn" onClick={() => setPendingKotOpen(false)} style={{ minWidth: '60px' }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5B. WIN32 CONFIRMATION DIALOG (Video 02 Frame 024) */}
      {updateConfirmModalOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1300 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '320px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '3px 3px 12px rgba(0,0,0,0.6)' }}
          >
            <div className="ids-modal-titlebar" style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Message</span>
              <button className="ids-win-btn close" onClick={() => setUpdateConfirmModalOpen(false)} style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}>✕</button>
            </div>
            <div style={{ padding: '16px', fontSize: '12px' }}>
              <div style={{ marginBottom: '16px', color: '#000', fontWeight: 500 }}>
                Do you want to update this KOT?
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button 
                  className="ids-btn" 
                  onClick={() => {
                    if (stagedKotToModify) {
                      setEditingKotNo(stagedKotToModify.kotNo);
                      setKotNo(stagedKotToModify.kotNo);
                      setTableNo(stagedKotToModify.tableNo);
                      setServer(stagedKotToModify.server);
                      setCovers(stagedKotToModify.covers || '2');
                      setOriginalKotSnapshot({
                        kotNo: stagedKotToModify.kotNo,
                        items: JSON.parse(JSON.stringify(stagedKotToModify.items)),
                        totalQty: stagedKotToModify.items.reduce((s, it) => s + (it.quantity || 1), 0),
                        totalAmount: stagedKotToModify.totalAmount
                      });
                      setLineItems(stagedKotToModify.items.map(it => ({
                        res: 'RES',
                        code: it.code,
                        name: it.name,
                        quantity: it.quantity,
                        rate: it.rate,
                        modifier: it.modifier || ''
                      })));
                      setSelectedRowIdx(null);
                    }
                    setUpdateConfirmModalOpen(false);
                    setPendingKotOpen(false);
                  }}
                  style={{ minWidth: '60px', fontWeight: 600 }}
                >
                  Yes
                </button>
                <button 
                  className="ids-btn" 
                  onClick={() => setUpdateConfirmModalOpen(false)}
                  style={{ minWidth: '60px' }}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5B-2. WIN32 CONFIRM DELETE ENTIRE KOT (Video 06 Frame 021 - Frame 022) */}
      {deleteKotConfirmOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1340 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '320px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '3px 3px 12px rgba(0,0,0,0.6)' }}
          >
            <div className="ids-modal-titlebar" style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Message</span>
              <button className="ids-win-btn close" onClick={() => setDeleteKotConfirmOpen(false)} style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}>✕</button>
            </div>
            <div style={{ padding: '16px', fontSize: '12px' }}>
              <div style={{ marginBottom: '16px', color: '#000', fontWeight: 500 }}>
                Do you want to delete this KOT?
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button 
                  className="ids-btn" 
                  onClick={() => {
                    setDeleteKotConfirmOpen(false);
                    setReasonModalAction('DELETE_KOT');
                    setSelectedReason('Double Entry'); // Video 06 Frame 026 default
                    setReasonModalOpen(true);
                  }}
                  style={{ minWidth: '60px', fontWeight: 600 }}
                >
                  Yes
                </button>
                <button 
                  className="ids-btn" 
                  onClick={() => setDeleteKotConfirmOpen(false)}
                  style={{ minWidth: '60px' }}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POS INTEGRITY CHECK MODAL (Video 06 Frame 010) */}
      {integrityCheckOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1290 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '380px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '3px 3px 12px rgba(0,0,0,0.6)' }}
          >
            <div className="ids-modal-titlebar" style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>POS integrity Check...</span>
              <button className="ids-win-btn close" onClick={() => { setIntegrityCheckOpen(false); setOutletConfirmed(true); }} style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}>✕</button>
            </div>
            <div style={{ padding: '20px 16px', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: '#000' }}>
              PLEASE WAIT... CHECKING TAX STRUCTURE PASSIVE CASES...
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '12px' }}>
              <button className="ids-btn" onClick={() => { setIntegrityCheckOpen(false); setOutletConfirmed(true); }} style={{ minWidth: '60px', fontWeight: 600 }}>Ok</button>
            </div>
          </div>
        </div>
      )}

      {/* 5C. WIN32 STATUTORY REASON DIALOG (Video 05 Frame 30 & Video 06 Frame 24 & 26) */}
      {reasonModalOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1350 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '280px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '3px 3px 14px rgba(0,0,0,0.65)' }}
          >
            {/* Titlebar matching Video 05 Frame 30 */}
            <div className="ids-modal-titlebar" style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Reason</span>
              <button className="ids-win-btn close" onClick={() => setReasonModalOpen(false)} style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}>✕</button>
            </div>
            {/* Modal Body */}
            <div style={{ padding: '8px', fontSize: '11px' }}>
              <div style={{ marginBottom: '4px', color: '#333', fontSize: '10px', fontWeight: 600 }}>
                {reasonModalAction === 'DELETE_KOT' 
                  ? 'Select Reason for deleting KOT.' 
                  : 'Select Statutory Reason for Item Cancellation / Reduction:'}
              </div>
              {/* Listbox */}
              <div 
                style={{ 
                  height: '240px', 
                  overflowY: 'auto', 
                  background: '#FFF', 
                  border: '1px solid #7F9DB9',
                  marginBottom: '8px'
                }}
              >
                {POS_DELETION_REASONS.map(reason => {
                  const isSelected = selectedReason === reason;
                  return (
                    <div 
                      key={reason}
                      onClick={() => setSelectedReason(reason)}
                      onDoubleClick={handleConfirmReason}
                      style={{ 
                        padding: '3px 6px', 
                        fontSize: '11px',
                        cursor: 'pointer',
                        background: isSelected ? '#316AC5' : 'transparent',
                        color: isSelected ? '#FFF' : '#000',
                        userSelect: 'none',
                        fontFamily: 'Tahoma, Arial, sans-serif'
                      }}
                    >
                      {reason}
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons: [...] [ Ok ] [ Cancel ] matching Video 05 Frame 32 */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                <button 
                  className="ids-btn" 
                  onClick={() => alert(`Reason details: ${selectedReason}`)}
                  style={{ minWidth: '28px', padding: '2px 4px' }}
                >
                  ...
                </button>
                <button 
                  className="ids-btn" 
                  onClick={handleConfirmReason}
                  style={{ minWidth: '55px', fontWeight: 700 }}
                >
                  Ok
                </button>
                <button 
                  className="ids-btn" 
                  onClick={() => setReasonModalOpen(false)}
                  style={{ minWidth: '55px' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5D. WIN32 NC KOT DIALOG (Video 07 Frame 016 - Frame 020) */}
      {ncModalOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1360 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '380px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '3px 3px 14px rgba(0,0,0,0.65)' }}
          >
            {/* Titlebar matching Video 07 Frame 016 */}
            <div className="ids-modal-titlebar" style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>NC KOT</span>
              <button className="ids-win-btn close" onClick={() => setNcModalOpen(false)} style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}>✕</button>
            </div>
            {/* Modal Body */}
            <div style={{ padding: '10px', fontSize: '11px' }}>
              <div style={{ color: '#800000', fontSize: '11px', fontWeight: 700, marginBottom: '6px' }}>
                Select NC Department & Enter NC Guest name.
              </div>

              {/* Dual Column Table Container */}
              <div 
                style={{ 
                  height: '140px', 
                  background: '#FFF', 
                  border: '1px solid #7F9DB9',
                  display: 'grid',
                  gridTemplateColumns: '40% 60%',
                  marginBottom: '10px',
                  overflow: 'hidden'
                }}
              >
                {/* Left Column: NC KOT */}
                <div style={{ borderRight: '1px solid #B0B0B0', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ background: '#ECE9D8', borderBottom: '1px solid #B0B0B0', padding: '3px 6px', fontWeight: 700, fontSize: '11px' }}>
                    NC KOT
                  </div>
                  <div style={{ flex: 1, padding: '4px 6px', background: '#316AC5', color: '#FFF', fontWeight: 600 }}>
                    NC Kot
                  </div>
                </div>

                {/* Right Column: Department */}
                <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                  <div style={{ position: 'sticky', top: 0, background: '#ECE9D8', borderBottom: '1px solid #B0B0B0', padding: '3px 6px', fontWeight: 700, fontSize: '11px' }}>
                    Department
                  </div>
                  <div>
                    {POS_NC_DEPARTMENTS.map(dept => {
                      const isSelected = selectedNcDept === dept;
                      return (
                        <div 
                          key={dept}
                          onClick={() => setSelectedNcDept(dept)}
                          style={{ 
                            padding: '3px 6px', 
                            cursor: 'pointer',
                            background: isSelected ? '#316AC5' : 'transparent',
                            color: isSelected ? '#FFF' : '#000',
                            fontWeight: isSelected ? 700 : 400,
                            userSelect: 'none'
                          }}
                        >
                          {dept}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Guest Name input field matching Video 07 Frame 020 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <label style={{ width: '75px', fontWeight: 600 }}>Guest Name</label>
                <input 
                  type="text" 
                  autoFocus
                  value={ncGuestNameInput}
                  onChange={e => setNcGuestNameInput(e.target.value)}
                  placeholder="e.g. MANAGER.IT"
                  style={{ flex: 1, background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 6px', fontSize: '11px', fontWeight: 600 }}
                />
              </div>

              {/* Action Buttons: [ Ok ] [ Cancel ] */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                <button 
                  className="ids-btn" 
                  onClick={() => {
                    setIsNcMode(true);
                    setNcType('NC Kot');
                    setNcDept(selectedNcDept);
                    setGuestName(ncGuestNameInput.trim() || 'MANAGER IT');
                    if (!tableNo) setTableNo('10');
                    if (!covers) setCovers('1');
                    if (!server) setServer('Biren');
                    setNcModalOpen(false);
                    setSaveSuccessMsg(`NC Mode Active: [${selectedNcDept}] - Guest: ${ncGuestNameInput.trim() || 'MANAGER IT'}`);
                    setTimeout(() => setSaveSuccessMsg(null), 3500);
                  }}
                  style={{ minWidth: '60px', fontWeight: 700 }}
                >
                  Ok
                </button>
                <button 
                  className="ids-btn" 
                  onClick={() => setNcModalOpen(false)}
                  style={{ minWidth: '60px' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5E. WIN32 OPTIONS DIALOG (Video 08 Frame 013 - Frame 014) */}
      {optionsModalOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1370 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '180px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '3px 3px 14px rgba(0,0,0,0.65)' }}
          >
            <div className="ids-modal-titlebar" style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Options</span>
              <button className="ids-win-btn close" onClick={() => setOptionsModalOpen(false)} style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}>✕</button>
            </div>
            <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button 
                className="ids-btn" 
                onClick={() => {
                  setOptionsModalOpen(false);
                  setNcBillPrintModalOpen(true);
                }}
                title="Print NC Bill (Video 08 Frame 013)"
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  padding: '8px 4px', 
                  background: '#ECE9D8',
                  border: '2px outset #FFF',
                  cursor: 'pointer'
                }}
              >
                <Printer size={22} color="#000080" />
                <span style={{ fontSize: '11px', fontWeight: 700, marginTop: '4px', color: '#000' }}>NC Bill Print</span>
              </button>

              <button 
                className="ids-btn" 
                onClick={handleDrawerKickOut}
                title="POS Cash Drawer Kick Out Pulse (Video 08 Frame 013)"
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  padding: '8px 4px', 
                  background: '#ECE9D8',
                  border: '2px outset #FFF',
                  cursor: 'pointer'
                }}
              >
                <Archive size={22} color="#806000" />
                <span style={{ fontSize: '11px', fontWeight: 700, marginTop: '4px', color: '#000' }}>Drawer Kick out</span>
              </button>

              <button 
                className="ids-btn" 
                onClick={() => setOptionsModalOpen(false)}
                title="Exit Options"
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  padding: '8px 4px', 
                  background: '#ECE9D8',
                  border: '2px outset #FFF',
                  cursor: 'pointer'
                }}
              >
                <LogOut size={22} color="#C00000" />
                <span style={{ fontSize: '11px', fontWeight: 700, marginTop: '4px', color: '#000' }}>Exit</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5F. WIN32 NC BILL PRINT DIALOG (Video 08 Frame 015 - Frame 021) */}
      {ncBillPrintModalOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1380 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '560px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '4px 4px 16px rgba(0,0,0,0.65)' }}
          >
            {/* Titlebar */}
            <div className="ids-modal-titlebar" style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>NC Bill Print</span>
              <button className="ids-win-btn close" onClick={() => setNcBillPrintModalOpen(false)} style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}>✕</button>
            </div>
            
            {/* Modal Body */}
            <div style={{ padding: '8px 10px', fontSize: '11px' }}>
              {/* Type / Table lookup header (Video 08 Frame 015 & Frame 018) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <label style={{ fontWeight: 700, width: '40px' }}>Type</label>
                <input 
                  type="text" 
                  value={ncPrintTable} 
                  onChange={e => setNcPrintTable(e.target.value)}
                  placeholder="e.g. 10"
                  style={{ width: '80px', background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px', fontWeight: 700 }}
                />
                <button 
                  className="ids-btn" 
                  onClick={() => setPendingNcTablesModalOpen(true)}
                  title="Lookup Pending NC Tables (Video 08 Frame 016)"
                  style={{ padding: '2px 6px', fontSize: '11px', fontWeight: 700 }}
                >
                  (?)
                </button>
                {activeNcKotForPrint && (
                  <span style={{ color: '#000080', fontWeight: 600, marginLeft: '6px' }}>
                    {activeNcKotForPrint.server || 'Biren'} - {activeNcKotForPrint.guestName || 'MANAGER.IT'} [{activeNcKotForPrint.department || 'Managers'}]
                  </span>
                )}
              </div>

              {/* Items Grid matching Video 08 Frame 018 */}
              <div style={{ height: '180px', background: '#FFF', border: '1px solid #7F9DB9', overflowY: 'auto', marginBottom: '10px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#ECE9D8', borderBottom: '1px solid #999', zIndex: 1 }}>
                    <tr>
                      <th style={{ width: '38px', padding: '3px 4px', borderRight: '1px solid #DDD', textAlign: 'center' }}>Type</th>
                      <th style={{ width: '48px', padding: '3px 4px', borderRight: '1px solid #DDD', textAlign: 'center' }}>KOT#</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #DDD', textAlign: 'left' }}>Item Name</th>
                      <th style={{ width: '55px', padding: '3px 6px', borderRight: '1px solid #DDD', textAlign: 'right' }}>Qty</th>
                      <th style={{ width: '65px', padding: '3px 6px', borderRight: '1px solid #DDD', textAlign: 'right' }}>Value</th>
                      <th style={{ width: '75px', padding: '3px 6px', textAlign: 'left' }}>Department</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeNcKotForPrint && activeNcKotForPrint.items && activeNcKotForPrint.items.length > 0 ? (
                      activeNcKotForPrint.items.map((it, idx) => (
                        <tr key={idx} style={{ background: '#D9E8FB', borderBottom: '1px solid #E0E0E0' }}>
                          <td style={{ textAlign: 'center', padding: '3px 4px', borderRight: '1px solid #DDD' }}>{it.type || '2'}</td>
                          <td style={{ textAlign: 'center', padding: '3px 4px', borderRight: '1px solid #DDD', fontWeight: 600 }}>{it.kotNo || activeNcKotForPrint.kotNo || '107'}</td>
                          <td style={{ padding: '3px 6px', borderRight: '1px solid #DDD', fontWeight: 600, color: '#000080' }}>{it.name}</td>
                          <td style={{ textAlign: 'right', padding: '3px 6px', borderRight: '1px solid #DDD' }}>{Number(it.quantity || 1).toFixed(3)}</td>
                          <td style={{ textAlign: 'right', padding: '3px 6px', borderRight: '1px solid #DDD', fontWeight: 700 }}>{Number(it.value || it.costRate || 45).toFixed(2)}</td>
                          <td style={{ padding: '3px 6px', fontWeight: 600, color: '#800000' }}>{it.department || activeNcKotForPrint.ncDeptCode || 'MGR'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#888', fontStyle: 'italic' }}>
                          {ncPrintTable ? `No Pending NC KOT found on Table ${ncPrintTable}. Click (?) to select a pending table.` : 'Enter or select a Table # with pending NC orders.'}
                        </td>
                      </tr>
                    )}
                    {/* Filler blank rows for authentic Win32 look */}
                    {Array.from({ length: Math.max(0, 6 - (activeNcKotForPrint?.items?.length || 0)) }).map((_, i) => (
                      <tr key={`blank-${i}`} style={{ height: '20px', borderBottom: '1px solid #F0F0F0' }}>
                        <td style={{ borderRight: '1px solid #F0F0F0' }}></td>
                        <td style={{ borderRight: '1px solid #F0F0F0' }}></td>
                        <td style={{ borderRight: '1px solid #F0F0F0' }}></td>
                        <td style={{ borderRight: '1px solid #F0F0F0' }}></td>
                        <td style={{ borderRight: '1px solid #F0F0F0' }}></td>
                        <td></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bottom Total Bar */}
              {activeNcKotForPrint && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 6px', background: '#EAE6D6', border: '1px solid #999', marginBottom: '8px', fontSize: '11px', fontWeight: 700 }}>
                  <span>Total Non-Chargeable Cost Valuation:</span>
                  <span style={{ color: '#800000' }}>
                    ₹{activeNcKotForPrint.items?.reduce((s, it) => s + Number(it.value || it.costRate || 0), 0).toFixed(2) || '94.50'}
                  </span>
                </div>
              )}

              {/* Action Buttons: [ Print ] [ Clear ] [ Exit ] (Video 08 Frame 018) */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                <button 
                  className="ids-btn" 
                  onClick={() => {
                    if (!activeNcKotForPrint || !activeNcKotForPrint.items?.length) {
                      alert("Please select a pending NC Table with order items first!");
                      return;
                    }
                    setPosPrintBillModalOpen(true);
                  }}
                  style={{ minWidth: '60px', fontWeight: 700 }}
                >
                  Print
                </button>
                <button 
                  className="ids-btn" 
                  onClick={() => setNcPrintTable('')}
                  style={{ minWidth: '60px' }}
                >
                  Clear
                </button>
                <button 
                  className="ids-btn" 
                  onClick={() => setNcBillPrintModalOpen(false)}
                  style={{ minWidth: '60px' }}
                >
                  Exit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5G. WIN32 PENDING TABLES LOOKUP DIALOG (Video 08 Frame 016 - Frame 017) */}
      {pendingNcTablesModalOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1400 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '300px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '4px 4px 16px rgba(0,0,0,0.65)' }}
          >
            <div className="ids-modal-titlebar" style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Pending Tables</span>
              <button className="ids-win-btn close" onClick={() => setPendingNcTablesModalOpen(false)} style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}>✕</button>
            </div>
            <div style={{ padding: '8px' }}>
              <div style={{ height: '150px', background: '#FFF', border: '1px solid #7F9DB9', overflowY: 'auto', marginBottom: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#ECE9D8', borderBottom: '1px solid #999' }}>
                    <tr>
                      <th style={{ width: '70px', padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #DDD' }}>Table #</th>
                      <th style={{ padding: '3px 6px', textAlign: 'left' }}>Server/Member Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingNcTables.map((p, idx) => {
                      const isSelected = selectedPendingNcTableIdx === idx;
                      return (
                        <tr 
                          key={p.tableNo}
                          onClick={() => setSelectedPendingNcTableIdx(idx)}
                          onDoubleClick={() => {
                            setNcPrintTable(p.tableNo);
                            setPendingNcTablesModalOpen(false);
                          }}
                          style={{ 
                            background: isSelected ? '#316AC5' : '#FFF', 
                            color: isSelected ? '#FFF' : '#000',
                            cursor: 'pointer',
                            borderBottom: '1px solid #EEE'
                          }}
                        >
                          <td style={{ padding: '3px 6px', fontWeight: 700, borderRight: '1px solid #DDD' }}>{p.tableNo}</td>
                          <td style={{ padding: '3px 6px' }}>{p.serverMember}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                <button 
                  className="ids-btn" 
                  onClick={() => {
                    const sel = pendingNcTables[selectedPendingNcTableIdx];
                    if (sel) setNcPrintTable(sel.tableNo);
                    setPendingNcTablesModalOpen(false);
                  }}
                  style={{ minWidth: '60px', fontWeight: 700 }}
                >
                  Select
                </button>
                <button 
                  className="ids-btn" 
                  onClick={() => setPendingNcTablesModalOpen(false)}
                  style={{ minWidth: '60px' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5H. WIN32 POS PRINT BILL MODAL (Video 08 Frame 019) */}
      {posPrintBillModalOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1420 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '320px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '4px 4px 16px rgba(0,0,0,0.65)' }}
          >
            <div className="ids-modal-titlebar" style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>POS Print Bill</span>
              <button className="ids-win-btn close" onClick={() => setPosPrintBillModalOpen(false)} style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}>✕</button>
            </div>
            <div style={{ padding: '12px 14px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '85px 1fr', alignItems: 'center', gap: '6px' }}>
                <label style={{ fontWeight: 600 }}>Description</label>
                <select 
                  value={ncPrintReportDesc} 
                  onChange={e => setNcPrintReportDesc(e.target.value)}
                  style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px', fontWeight: 600 }}
                >
                  <option value="RES/NC">RES/NC</option>
                  <option value="RES/STANDARD">RES/STANDARD</option>
                  <option value="BAR/NC">BAR/NC</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '85px 1fr', alignItems: 'center', gap: '6px' }}>
                <label style={{ fontWeight: 600 }}>Printer</label>
                <select 
                  value={ncPrintReportPrinter} 
                  onChange={e => setNcPrintReportPrinter(e.target.value)}
                  style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                >
                  <option value="Microsoft Print to PDF">Microsoft Print to PDF</option>
                  <option value="POS Receipt Printer (EPSON TM-T88V)">POS Receipt Printer (EPSON TM-T88V)</option>
                  <option value="Direct Thermal Spooler">Direct Thermal Spooler</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button 
                  className="ids-btn" 
                  onClick={handleExecuteNcBillPrint}
                  style={{ minWidth: '65px', fontWeight: 700 }}
                >
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5I. WIN32 PRINTING RECORDS PROGRESS DIALOG (Video 08 Frame 024) */}
      {printingRecordsModalOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1450 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '250px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '4px 4px 16px rgba(0,0,0,0.65)' }}
          >
            <div className="ids-modal-titlebar" style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Printing Records</span>
              <button className="ids-win-btn close" onClick={() => setPrintingRecordsModalOpen(false)} style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}>✕</button>
            </div>
            <div style={{ padding: '14px 12px', fontSize: '11px', textAlign: 'center' }}>
              <div style={{ border: '1px solid #7F9DB9', background: '#FFF', padding: '10px', marginBottom: '12px' }}>
                <div style={{ fontWeight: 700, color: '#333' }}>Copy: 1</div>
                <div style={{ color: '#000080', fontWeight: 700, marginTop: '4px' }}>Printing Page 1</div>
              </div>
              <button 
                className="ids-btn" 
                onClick={() => setPrintingRecordsModalOpen(false)}
                style={{ minWidth: '95px' }}
              >
                Cancel Printing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5J. WIN32 TABLE TRANSFER MODAL (Video 12 Frames 026–042) */}
      {tableTransferOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1390 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '560px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '4px 4px 16px rgba(0,0,0,0.65)' }}
          >
            {/* Titlebar */}
            <div className="ids-modal-titlebar" style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Table Transfer V6.5.002.1</span>
              <button className="ids-win-btn close" onClick={() => setTableTransferOpen(false)} style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}>✕</button>
            </div>

            <div style={{ padding: '8px 10px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Top Outlet / Session / Date Header Section (Frames 028–030) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#F5F4EE', border: '1px solid #CCC', padding: '6px 10px' }}>
                {/* Source Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600 }}>Source Restaurant</span>
                    <input type="text" readOnly value={transferSourceOutlet} style={{ width: '65px', background: '#FFF', border: '1px solid #7F9DB9', padding: '1px 4px', fontSize: '11px', fontWeight: 700 }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600 }}>Session</span>
                    <input type="text" readOnly value={transferSession} style={{ width: '65px', background: '#FFF', border: '1px solid #7F9DB9', padding: '1px 4px', fontSize: '11px' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600 }}>Date</span>
                    <input type="text" readOnly value={accountingDate} style={{ width: '90px', background: '#FFF', border: '1px solid #7F9DB9', padding: '1px 4px', fontSize: '11px' }} />
                  </div>
                </div>

                {/* Target Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600 }}>Target Restaurant</span>
                    <input type="text" readOnly value={transferTargetOutlet} style={{ width: '65px', background: '#FFF', border: '1px solid #7F9DB9', padding: '1px 4px', fontSize: '11px', fontWeight: 700 }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600 }}>Session</span>
                    <input type="text" readOnly value={transferSession} style={{ width: '65px', background: '#FFF', border: '1px solid #7F9DB9', padding: '1px 4px', fontSize: '11px' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600 }}>Date</span>
                    <input type="text" readOnly value={accountingDate} style={{ width: '90px', background: '#FFF', border: '1px solid #7F9DB9', padding: '1px 4px', fontSize: '11px' }} />
                  </div>
                </div>
              </div>

              {/* Source & Target Table Controls (Frames 028–032) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#DDD', padding: '6px 10px', border: '1px solid #BBB' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 700 }}>Source Table #</span>
                  <input 
                    type="text" 
                    value={transferSourceTable} 
                    onChange={e => setTransferSourceTable(e.target.value)}
                    placeholder="10"
                    style={{ width: '55px', textAlign: 'center', fontWeight: 700, fontSize: '12px', background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px' }}
                  />
                </div>

                <button 
                  className="ids-btn" 
                  onClick={() => setTransferOutletsModalOpen(true)}
                  style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px' }}
                >
                  Outlets
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 700 }}>Target Table #</span>
                  <input 
                    type="text" 
                    value={transferTargetTable} 
                    onChange={e => setTransferTargetTable(e.target.value)}
                    placeholder="14"
                    style={{ width: '55px', textAlign: 'center', fontWeight: 700, fontSize: '12px', background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px' }}
                  />
                </div>
              </div>

              {/* Notice Banner */}
              {transferNotice && (
                <div style={{ background: '#FFF8E7', border: '1px solid #E0B86B', padding: '3px 8px', fontSize: '11px', color: '#856404', fontWeight: 600, textAlign: 'center' }}>
                  {transferNotice}
                </div>
              )}

              {/* Line Items Grid (Frames 028–035) */}
              <div style={{ height: '175px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#D4D0C8', borderBottom: '1px solid #808080' }}>
                    <tr>
                      <th style={{ padding: '3px 6px', width: '55px', textAlign: 'left', borderRight: '1px solid #B0B0B0' }}>KOT #</th>
                      <th style={{ padding: '3px 6px', width: '65px', textAlign: 'left', borderRight: '1px solid #B0B0B0' }}>Item Code</th>
                      <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0B0B0' }}>Item Name</th>
                      <th style={{ padding: '3px 6px', width: '65px', textAlign: 'right', borderRight: '1px solid #B0B0B0' }}>Quantity</th>
                      <th style={{ padding: '3px 6px', width: '65px', textAlign: 'center' }}>Selected</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transferGridItems.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#888', fontStyle: 'italic' }}>
                          Enter Occupied Table # and click [ Load ] to fetch running KOT items.
                        </td>
                      </tr>
                    ) : (
                      transferGridItems.map((item, idx) => (
                        <tr 
                          key={idx} 
                          onClick={() => handleToggleSingleItemSelection(idx)}
                          style={{ 
                            borderBottom: '1px solid #EEE', 
                            background: item.selected ? '#F0F8FF' : '#FFF',
                            cursor: 'pointer'
                          }}
                        >
                          <td style={{ padding: '3px 6px', fontWeight: 700, borderRight: '1px solid #EEE' }}>{item.kotNo}</td>
                          <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE' }}>{item.code}</td>
                          <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE', fontWeight: 600 }}>{item.name}</td>
                          <td style={{ padding: '3px 6px', textAlign: 'right', borderRight: '1px solid #EEE' }}>{item.quantity}</td>
                          <td style={{ padding: '3px 6px', textAlign: 'center', fontWeight: 700, color: item.selected ? '#008000' : '#888' }}>
                            {item.selected ? 'YES' : 'NO'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Bottom Action Buttons (Frames 028, 033, 036) */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', borderTop: '1px solid #BBB', paddingTop: '8px' }}>
                <button 
                  className="ids-btn" 
                  onClick={() => handleLoadSourceTable()} 
                  style={{ minWidth: '60px', fontWeight: 600 }}
                >
                  Load
                </button>
                <button 
                  className="ids-btn" 
                  onClick={handleExecuteTableTransfer} 
                  disabled={transferGridItems.length === 0}
                  style={{ 
                    minWidth: '65px', 
                    fontWeight: 700, 
                    color: transferGridItems.length > 0 ? '#000080' : '#888' 
                  }}
                >
                  Transfer
                </button>
                <button 
                  className="ids-btn" 
                  onClick={() => {
                    setTransferSourceTable('');
                    setTransferTargetTable('');
                    setTransferGridItems([]);
                  }} 
                  style={{ minWidth: '55px' }}
                >
                  Clear
                </button>
                <button 
                  className="ids-btn" 
                  onClick={handleToggleTransferSelection} 
                  disabled={transferGridItems.length === 0}
                  style={{ minWidth: '105px' }}
                >
                  Toggle Selection
                </button>
                <button 
                  className="ids-btn" 
                  onClick={() => setTableTransferOpen(false)} 
                  style={{ minWidth: '55px' }}
                >
                  Exit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5K. WIN32 OUTLETS SELECTION POPUP */}
      {transferOutletsModalOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1400 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '300px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '4px 4px 14px rgba(0,0,0,0.6)' }}
          >
            <div className="ids-modal-titlebar" style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Select Outlets &amp; Session</span>
              <button className="ids-win-btn close" onClick={() => setTransferOutletsModalOpen(false)} style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}>✕</button>
            </div>
            <div style={{ padding: '10px 12px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center', gap: '6px' }}>
                <label style={{ fontWeight: 600 }}>Source Outlet</label>
                <select 
                  value={transferSourceOutlet} 
                  onChange={e => setTransferSourceOutlet(e.target.value)}
                  style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                >
                  <option value="RES">RES - RESTAURANT</option>
                  <option value="CAR">CAR - LIQUOR BAR</option>
                  <option value="RS">RS - ROOM SERVICE</option>
                  <option value="BNQ">BNQ - BANQUET</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center', gap: '6px' }}>
                <label style={{ fontWeight: 600 }}>Target Outlet</label>
                <select 
                  value={transferTargetOutlet} 
                  onChange={e => setTransferTargetOutlet(e.target.value)}
                  style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                >
                  <option value="RES">RES - RESTAURANT</option>
                  <option value="CAR">CAR - LIQUOR BAR</option>
                  <option value="RS">RS - ROOM SERVICE</option>
                  <option value="BNQ">BNQ - BANQUET</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center', gap: '6px' }}>
                <label style={{ fontWeight: 600 }}>Session</label>
                <select 
                  value={transferSession} 
                  onChange={e => setTransferSession(e.target.value)}
                  style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                >
                  <option value="GN">GN - General</option>
                  <option value="BK">BK - Breakfast</option>
                  <option value="LN">LN - Lunch</option>
                  <option value="DN">DN - Dinner</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button 
                  className="ids-btn" 
                  onClick={() => setTransferOutletsModalOpen(false)}
                  style={{ minWidth: '60px', fontWeight: 700 }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. TABLE STATUS 4x5 MATRIX MODAL (Video 01 Frame 048) */}
      {tableStatusOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1280 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '480px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '4px 4px 15px rgba(0,0,0,0.6)' }}
          >
            <div className="ids-modal-titlebar" style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Table Status</span>
              <button className="ids-win-btn close" onClick={() => setTableStatusOpen(false)} style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}>✕</button>
            </div>
            <div style={{ padding: '10px' }}>
              {/* 4x5 Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', background: '#DDD', padding: '8px', border: '1px solid #808080' }}>
                {POS_TABLES.map(t => {
                  const matchingKot = savedKots.find(k => k.tableNo === t && !k.settled && !k.ncBillPrinted);
                  const isSettled = settledTables.includes(t);
                  const isBilled = !isSettled && billedTables.includes(t);
                  const isOccupied = isBilled || isSettled ? false : Boolean(matchingKot);
                  const statusLetter = isBilled ? 'B' : (isOccupied ? 'O' : 'V');
                  const bgColor = isBilled ? '#0000FF' : (isOccupied ? '#FF0000' : '#008000');
                  return (
                    <button
                      key={t}
                      onClick={() => {
                        setSelectedTableForDetails(t);
                        setTableDetailsOpen(true);
                      }}
                      style={{
                        background: bgColor,
                        color: '#FFF',
                        height: '42px',
                        fontWeight: 700,
                        fontSize: '12px',
                        border: '2px outset #FFF',
                        borderRadius: '2px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textShadow: '1px 1px 1px rgba(0,0,0,0.6)'
                      }}
                    >
                      {t}/{statusLetter}
                    </button>
                  );
                })}
              </div>

              {/* Status Legend matching Video 01 Frame 048 & Video 02 Frame 034 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px', marginTop: '10px', fontSize: '11px', fontWeight: 700 }}>
                <div style={{ background: '#0000FF', color: '#FFF', padding: '3px 6px', border: '1px solid #000' }}>
                  B :- Billed
                </div>
                <div style={{ background: '#800000', color: '#FFF', padding: '3px 6px', border: '1px solid #000' }}>
                  R :- Reserved
                </div>
                <div style={{ background: '#008000', color: '#FFF', padding: '3px 6px', border: '1px solid #000' }}>
                  V :- Vacant
                </div>
                <div style={{ background: '#FF0000', color: '#FFF', padding: '3px 6px', border: '1px solid #000' }}>
                  O :- Occupied
                </div>
              </div>

              {/* Bottom toolbar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', borderTop: '1px solid #BBB', paddingTop: '8px' }}>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <button className="ids-btn" style={{ minWidth: '32px' }}>⬅️</button>
                  <button className="ids-btn" style={{ minWidth: '32px' }}>⬆️</button>
                  <button className="ids-btn" style={{ minWidth: '32px' }}>⬇️</button>
                  <button className="ids-btn" style={{ minWidth: '32px' }}>➡️</button>
                  <button 
                    className="ids-btn" 
                    onClick={() => {
                      setTableStatusOpen(false);
                      setTableTransferOpen(true);
                      handleLoadSourceTable('10');
                    }}
                    title="Transfer Table (Video 12)"
                    style={{ fontWeight: 700, color: '#000080', fontSize: '11px', marginLeft: '6px' }}
                  >
                    Table Transfer
                  </button>
                </div>
                <button className="ids-btn" onClick={() => setTableStatusOpen(false)} style={{ minWidth: '60px', fontWeight: 600 }}>
                  Exit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. TABLE DETAILS DIALOG (Video 01 Frame 050, Video 02 Frame 034, Video 11 Frame 038 & Video 12 Frame 040) */}
      {tableDetailsOpen && (() => {
        const tableKots = savedKots.filter(k => k.tableNo === selectedTableForDetails && !k.settled);
        const activeTableKot = tableKots[0];
        const currentTableItems = tableKots.length > 0 
          ? tableKots.flatMap(k => (k.items || []).map(it => ({ ...it, kotNo: it.kotNo || k.kotNo })))
          : (selectedTableForDetails === tableNo && lineItems.length > 0 
              ? lineItems.map(it => ({ ...it, kotNo: kotNo === 'AUTO' ? '1318' : kotNo })) 
              : []);
        const computedTableTotal = currentTableItems.reduce((acc, it) => acc + (it.value || ((it.quantity || 1) * (it.rate || 0))), 0);
        const computedTableCgst = Number((computedTableTotal * 0.025).toFixed(2));
        const computedTableSgst = Number((computedTableTotal * 0.025).toFixed(2));
        const computedTableNett = Math.round(computedTableTotal + computedTableCgst + computedTableSgst);

        return (
          <div className="ids-modal-overlay" style={{ zIndex: 1290 }}>
            <div 
              className="ids-modal-container" 
              style={{ width: '520px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '4px 4px 15px rgba(0,0,0,0.6)' }}
            >
              <div className="ids-modal-titlebar" style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '11px' }}>Table Details</span>
                <button className="ids-win-btn close" onClick={() => setTableDetailsOpen(false)} style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}>✕</button>
              </div>
              <div style={{ padding: '10px', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', background: '#DDD', padding: '6px', border: '1px solid #BBB' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 600 }}>Table #</span>
                    <input type="text" readOnly value={selectedTableForDetails} style={{ width: '45px', fontWeight: 700, textAlign: 'center', background: '#FFF', border: '1px solid #7F9DB9' }} />
                    <span style={{ fontWeight: 700 }}>?</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 600 }}>Steward Name</span>
                    <input type="text" readOnly value={activeTableKot?.server || (currentTableItems.length > 0 ? (selectedTableForDetails === '14' ? 'Biren' : server) : '(Vacant)')} style={{ width: '120px', background: '#FFF', border: '1px solid #7F9DB9', padding: '1px 4px' }} />
                  </div>
                </div>

                {/* Items running on table matching Video 11 Frame 038 & Video 12 Frame 040 */}
                <div style={{ height: '210px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#D4D0C8', borderBottom: '1px solid #808080' }}>
                      <tr>
                        <th style={{ padding: '3px 6px', width: '55px', textAlign: 'left', borderRight: '1px solid #B0B0B0' }}>KOT #</th>
                        <th style={{ padding: '3px 6px', textAlign: 'left', borderRight: '1px solid #B0B0B0' }}>Item Name</th>
                        <th style={{ padding: '3px 6px', width: '60px', textAlign: 'right', borderRight: '1px solid #B0B0B0' }}>Quantity</th>
                        <th style={{ padding: '3px 6px', width: '70px', textAlign: 'right' }}>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentTableItems.length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ padding: '24px 12px', textAlign: 'center', color: '#888', fontStyle: 'italic' }}>
                            Table {selectedTableForDetails} is currently Vacant. No active KOTs running.
                          </td>
                        </tr>
                      ) : (
                        currentTableItems.map((it, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #EEE' }}>
                            <td style={{ padding: '3px 6px', fontWeight: 700, borderRight: '1px solid #EEE' }}>{it.kotNo || activeTableKot?.kotNo || '1314'}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE' }}>{it.name}</td>
                            <td style={{ padding: '3px 6px', textAlign: 'right', borderRight: '1px solid #EEE' }}>{Number(it.quantity || 1).toFixed(3)}</td>
                            <td style={{ padding: '3px 6px', textAlign: 'right', fontWeight: 600 }}>{(it.value || ((it.quantity || 1) * (it.rate || 0))).toFixed(2)}</td>
                          </tr>
                        ))
                      )}
                      <tr style={{ background: '#F5F5F5', fontWeight: 700, borderTop: '2px solid #808080' }}>
                        <td colSpan={3} style={{ padding: '4px 6px', textAlign: 'right' }}>Total ======&gt;</td>
                        <td style={{ padding: '4px 6px', textAlign: 'right' }}>{computedTableTotal.toFixed(2)}</td>
                      </tr>
                      <tr style={{ background: '#F5F5F5', color: '#555' }}>
                        <td colSpan={3} style={{ padding: '2px 6px', textAlign: 'right' }}>CGST</td>
                        <td style={{ padding: '2px 6px', textAlign: 'right' }}>{computedTableCgst.toFixed(2)}</td>
                      </tr>
                      <tr style={{ background: '#F5F5F5', color: '#555' }}>
                        <td colSpan={3} style={{ padding: '2px 6px', textAlign: 'right' }}>SGST</td>
                        <td style={{ padding: '2px 6px', textAlign: 'right' }}>{computedTableSgst.toFixed(2)}</td>
                      </tr>
                      <tr style={{ background: '#E8E8E8', fontWeight: 800, color: '#000080' }}>
                        <td colSpan={3} style={{ padding: '4px 6px', textAlign: 'right' }}>Nett Amount</td>
                        <td style={{ padding: '4px 6px', textAlign: 'right' }}>{computedTableNett.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button className="ids-btn" onClick={() => setTableDetailsOpen(false)} style={{ minWidth: '60px', fontWeight: 600 }}>
                    Exit
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 5K. WIN32 SESSION TRANSFER MODAL (Video 13 Frames 048–054) */}
      {sessionTransferOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1400 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '580px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '4px 4px 16px rgba(0,0,0,0.65)' }}
          >
            {/* Titlebar */}
            <div className="ids-modal-titlebar" style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Session Transfer - RESTAURANT</span>
              <button className="ids-win-btn close" onClick={() => setSessionTransferOpen(false)} style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}>✕</button>
            </div>

            <div style={{ padding: '10px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Form Fields (Frame 050) */}
              <div style={{ background: '#F5F4EE', border: '1px solid #CCC', padding: '8px 10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600 }}>Accounting Date</span>
                  <input type="text" readOnly value={accountingDate} style={{ width: '100px', background: '#FFF', border: '1px solid #7F9DB9', padding: '1px 4px', fontSize: '11px' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600 }}>Source Session</span>
                  <input type="text" readOnly value={sessionSourceSession} style={{ width: '100px', background: '#FFF', border: '1px solid #7F9DB9', padding: '1px 4px', fontSize: '11px', fontWeight: 700 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600 }}>Date</span>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    <input type="text" value={sessionTransferDate} onChange={e => setSessionTransferDate(e.target.value)} style={{ width: '80px', background: '#FFF', border: '1px solid #7F9DB9', padding: '1px 4px', fontSize: '11px' }} />
                    <button className="ids-btn" style={{ padding: '0 4px', fontSize: '10px', fontWeight: 700 }}>?</button>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600 }}>New Session</span>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    <select 
                      value={sessionNewSession} 
                      onChange={e => setSessionNewSession(e.target.value)} 
                      style={{ width: '80px', background: '#FFF', border: '1px solid #7F9DB9', padding: '1px 2px', fontSize: '11px', fontWeight: 600 }}
                    >
                      <option value="Breakfast">Breakfast</option>
                      <option value="Lunch">Lunch</option>
                      <option value="Dinner">Dinner</option>
                      <option value="General">General</option>
                    </select>
                    <button className="ids-btn" style={{ padding: '0 4px', fontSize: '10px', fontWeight: 700 }}>?</button>
                  </div>
                </div>
              </div>

              {/* Subtitle description matching Video 13 Frame 050 */}
              <div style={{ fontStyle: 'italic', color: '#A00', fontSize: '10px', padding: '0 2px' }}>
                * Session transfer is used to change session from Breakfast to Lunch &amp; Lunch to Dinner.
              </div>

              {/* Notice */}
              {sessionNotice && (
                <div style={{ background: '#D4EDDA', border: '1px solid #C3E6CB', color: '#155724', padding: '3px 8px', fontSize: '10px', fontWeight: 700 }}>
                  {sessionNotice}
                </div>
              )}

              {/* Grid (Frame 050) */}
              <div style={{ height: '170px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#D4D0C8', borderBottom: '1px solid #808080' }}>
                    <tr>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #B0B0B0', textAlign: 'left', width: '65px' }}>KOT #</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #B0B0B0', textAlign: 'left' }}>Item Name</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #B0B0B0', textAlign: 'right', width: '65px' }}>Quantity</th>
                      <th style={{ padding: '3px 6px', textAlign: 'left', width: '80px' }}>Server</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessionGridItems.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ padding: '24px 12px', textAlign: 'center', color: '#888', fontStyle: 'italic' }}>
                          Click &quot;Load&quot; to fetch running KOT items from current session.
                        </td>
                      </tr>
                    ) : (
                      sessionGridItems.map((it, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #EEE', background: idx % 2 === 0 ? '#FFF' : '#F9F9F9' }}>
                          <td style={{ padding: '3px 6px', fontWeight: 700, borderRight: '1px solid #EEE' }}>{it.kotNo}</td>
                          <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE' }}>{it.name}</td>
                          <td style={{ padding: '3px 6px', textAlign: 'right', borderRight: '1px solid #EEE' }}>{it.quantity}</td>
                          <td style={{ padding: '3px 6px' }}>{it.server}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Bottom Actions (Frame 050) */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '6px' }}>
                <button className="ids-btn" onClick={handleLoadSessionTransfer} style={{ minWidth: '65px', fontWeight: 600 }}>
                  Load
                </button>
                <button className="ids-btn" onClick={handleExecuteSessionTransfer} style={{ minWidth: '65px', fontWeight: 700, background: '#DFF0D8', borderColor: '#3C763D' }}>
                  Transfer
                </button>
                <button className="ids-btn" onClick={() => setSessionGridItems([])} style={{ minWidth: '65px' }}>
                  Clear
                </button>
                <button className="ids-btn" onClick={() => setSessionTransferOpen(false)} style={{ minWidth: '65px' }}>
                  Exit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5L. WIN32 TABLE LINK MODAL (Video 13 Frames 056–063) */}
      {tableLinkOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1400 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '360px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '4px 4px 16px rgba(0,0,0,0.65)' }}
          >
            {/* Titlebar */}
            <div className="ids-modal-titlebar" style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Table Link</span>
              <button className="ids-win-btn close" onClick={() => setTableLinkOpen(false)} style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}>✕</button>
            </div>

            {/* Header Banner (Frame 058) */}
            <div style={{ background: '#D4D0C8', borderBottom: '1px solid #808080', padding: '3px 8px', fontSize: '11px', fontWeight: 700, color: '#000080', textAlign: 'center' }}>
              {selectedOutlet || 'RESTAURANT'}
            </div>

            <div style={{ padding: '12px 14px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Source Table Input */}
              <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 700 }}>Source Table #</span>
                <input 
                  type="text" 
                  value={linkSourceTable} 
                  onChange={e => setLinkSourceTable(e.target.value)} 
                  placeholder="T-1"
                  style={{ width: '80px', background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 6px', fontSize: '11px', fontWeight: 700 }}
                />
              </div>

              {/* Multi-Select Link Table(s) Listbox (Frame 058) */}
              <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '8px' }}>
                <span style={{ fontWeight: 700 }}>Link Table(s)</span>
                <div style={{ height: '140px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9', padding: '2px' }}>
                  {availableLinkTables.map(tbl => {
                    const isSelected = selectedLinkTables.includes(tbl);
                    return (
                      <div 
                        key={tbl}
                        onClick={() => handleToggleLinkTable(tbl)}
                        style={{
                          padding: '2px 8px',
                          cursor: 'pointer',
                          background: isSelected ? '#316AC5' : '#FFF',
                          color: isSelected ? '#FFF' : '#000',
                          fontWeight: isSelected ? 700 : 400,
                          userSelect: 'none'
                        }}
                      >
                        {tbl}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Subtitle description matching Video 13 Frame 058 */}
              <div style={{ fontStyle: 'italic', color: '#A00', fontSize: '10px', lineHeight: '13px' }}>
                * Table Link option is used to link 3-4 table in one table for billing. (Not Mandatory)
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '8px', marginTop: '6px' }}>
                <button className="ids-btn" onClick={handleSaveTableLink} style={{ minWidth: '65px', fontWeight: 700 }}>
                  Save
                </button>
                <button className="ids-btn" onClick={() => setTableLinkOpen(false)} style={{ minWidth: '65px' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5M. WIN32 MULTI-RESTAURANT SELECT OUTLET MODAL (Video 13 Frames 068–075) */}
      {multiOutletOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1400 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '400px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '4px 4px 16px rgba(0,0,0,0.65)' }}
          >
            {/* Titlebar */}
            <div className="ids-modal-titlebar" style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Select Outlet</span>
              <button className="ids-win-btn close" onClick={() => setMultiOutletOpen(false)} style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}>✕</button>
            </div>

            <div style={{ padding: '14px 16px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 600 }}>Restaurant</span>
                <select 
                  value={multiOutletChoice} 
                  onChange={e => setMultiOutletChoice(e.target.value)}
                  style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px', fontWeight: 700 }}
                >
                  <option value="LIQUOR BAR">LIQUOR BAR</option>
                  <option value="RESTAURANT">RESTAURANT</option>
                  <option value="ROOM SERVICE">ROOM SERVICE</option>
                  <option value="BANQUET">BANQUET</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 600 }}>Accounting Date</span>
                <input type="text" readOnly value={accountingDate} style={{ background: '#E0DFE3', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 600 }}>Session</span>
                <input type="text" readOnly value={selectedSession} style={{ background: '#E0DFE3', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }} />
              </div>

              {/* Subtitle description matching Video 13 Frame 070 */}
              <div style={{ fontStyle: 'italic', color: '#A00', fontSize: '10px' }}>
                * This option is used to change Multiple Outlets at once, Inside order entry screen.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button className="ids-btn" onClick={() => handleApplyMultiOutlet(multiOutletChoice)} style={{ minWidth: '65px', fontWeight: 700 }}>
                  Ok
                </button>
                <button className="ids-btn" onClick={() => setMultiOutletOpen(false)} style={{ minWidth: '65px' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5N. WIN32 KOT REPRINT MODAL V6.5.002.1 (Video 13 Frames 101–108) */}
      {kotReprintOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1400 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '640px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '4px 4px 16px rgba(0,0,0,0.65)' }}
          >
            {/* Titlebar */}
            <div className="ids-modal-titlebar" style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>KOT Reprint V6.5.002.1</span>
              <button className="ids-win-btn close" onClick={() => setKotReprintOpen(false)} style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}>✕</button>
            </div>

            <div style={{ padding: '8px 10px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {/* Grid (Frame 103) */}
              <div style={{ height: '240px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#D4D0C8', borderBottom: '1px solid #808080' }}>
                    <tr>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #B0B0B0', width: '55px', textAlign: 'left' }}>Table #</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #B0B0B0', width: '55px', textAlign: 'left' }}>KOT #</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #B0B0B0', width: '65px', textAlign: 'left' }}>KOT Time</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #B0B0B0', textAlign: 'left' }}>Item Name</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #B0B0B0', width: '55px', textAlign: 'right' }}>Quantity</th>
                      <th style={{ padding: '3px 6px', width: '45px', textAlign: 'center' }}>Select</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reprintGridItems.map((it, idx) => (
                      <tr 
                        key={idx} 
                        onClick={() => handleToggleReprintRow(idx)}
                        style={{ 
                          borderBottom: '1px solid #EEE', 
                          background: it.selected ? '#E6F0FA' : (idx % 2 === 0 ? '#FFF' : '#F9F9F9'),
                          cursor: 'pointer' 
                        }}
                      >
                        <td 
                          style={{ padding: '3px 6px', fontWeight: 700, borderRight: '1px solid #EEE', color: '#000080' }}
                          onDoubleClick={(e) => { e.stopPropagation(); handleDblClickReprintTable(it.tableNo); }}
                          title="Double-click to select all KOTs for Table"
                        >
                          {it.tableNo}
                        </td>
                        <td 
                          style={{ padding: '3px 6px', fontWeight: 700, borderRight: '1px solid #EEE' }}
                          onDoubleClick={(e) => { e.stopPropagation(); handleDblClickReprintKot(it.kotNo); }}
                          title="Double-click to select all items of this KOT"
                        >
                          {it.kotNo}
                        </td>
                        <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE', color: '#555' }}>{it.kotTime}</td>
                        <td style={{ padding: '3px 6px', borderRight: '1px solid #EEE' }}>{it.name}</td>
                        <td style={{ padding: '3px 6px', textAlign: 'right', borderRight: '1px solid #EEE' }}>{it.quantity}</td>
                        <td style={{ padding: '3px 6px', textAlign: 'center', fontWeight: 800, color: it.selected ? '#008000' : '#888' }}>
                          {it.selected ? 'Y' : 'N'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footnote shortcuts matching Frame 103 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#333', background: '#E6E4DC', padding: '3px 8px', border: '1px solid #CCC' }}>
                <span>Dbl Click on Tbl# to select all the KOTs</span>
                <span>Dbl Click on KOT # to select all items of that KOT</span>
              </div>

              {/* Subtitle description matching Video 13 Frame 103 */}
              <div style={{ fontStyle: 'italic', color: '#A00', fontSize: '10px' }}>
                * To Re-print KOT if it is not printed in first attempt.
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '4px' }}>
                <button className="ids-btn" onClick={() => setReprintGridItems(prev => prev.map(it => ({ ...it, selected: false })))} style={{ minWidth: '65px' }}>
                  Clear
                </button>
                <button className="ids-btn" onClick={handleExecuteKotReprint} style={{ minWidth: '65px', fontWeight: 700, background: '#DFF0D8', borderColor: '#3C763D' }}>
                  Print
                </button>
                <button className="ids-btn" onClick={() => setKotReprintOpen(false)} style={{ minWidth: '65px' }}>
                  Exit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5O. WIN32 ITEM MODIFIERS MODAL (Video 13 Frames 118–126) */}
      {itemModifierOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1400 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '450px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '4px 4px 16px rgba(0,0,0,0.65)' }}
          >
            {/* Titlebar */}
            <div className="ids-modal-titlebar" style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Item Modifiers</span>
              <button className="ids-win-btn close" onClick={() => setItemModifierOpen(false)} style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}>✕</button>
            </div>

            <div style={{ padding: '10px 14px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Target Item Name Label */}
              <div style={{ fontWeight: 700, color: '#000080', borderBottom: '1px solid #CCC', paddingBottom: '3px' }}>
                Target: {modifierTargetRowIdx !== null ? lineItems[modifierTargetRowIdx]?.name : 'Selected Item'}
              </div>

              {/* Form Input Block (Frame 119) */}
              <div style={{ background: '#F5F4EE', border: '1px solid #CCC', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 600 }}>Item Code</span>
                  <input 
                    type="text" 
                    value={modifierCode} 
                    onChange={e => setModifierCode(e.target.value)} 
                    style={{ width: '60px', background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px', fontWeight: 700 }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 600 }}>Item Name</span>
                  <input 
                    type="text" 
                    value={modifierName} 
                    onChange={e => setModifierName(e.target.value)} 
                    placeholder="e.g. spicy, less spicy, no onion"
                    style={{ background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px', fontWeight: 600, color: '#000080' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 600 }}>Rate</span>
                  <input 
                    type="text" 
                    value={modifierRate} 
                    onChange={e => setModifierRate(e.target.value)} 
                    style={{ width: '80px', background: '#FFF', border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '4px' }}>
                  <button className="ids-btn" onClick={handleSaveItemModifier} style={{ minWidth: '60px', fontWeight: 700 }}>
                    Ok
                  </button>
                  <button className="ids-btn" onClick={handleDeleteItemModifier} style={{ minWidth: '60px', color: '#A00' }}>
                    Delete
                  </button>
                </div>
              </div>

              {/* Standard Modifier Catalog Grid (Frame 119) */}
              <div style={{ height: '120px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#D4D0C8', borderBottom: '1px solid #808080' }}>
                    <tr>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #B0B0B0', width: '70px', textAlign: 'left' }}>Item Code</th>
                      <th style={{ padding: '3px 6px', borderRight: '1px solid #B0B0B0', textAlign: 'left' }}>Item Name</th>
                      <th style={{ padding: '3px 6px', width: '60px', textAlign: 'right' }}>Charge</th>
                    </tr>
                  </thead>
                  <tbody>
                    {POS_STANDARD_MODIFIERS.map(mod => {
                      const isSelected = modifierName.toLowerCase() === mod.name.toLowerCase();
                      return (
                        <tr 
                          key={mod.code}
                          onClick={() => {
                            setModifierCode(mod.code);
                            setModifierName(mod.name);
                            setModifierRate(mod.charge.toFixed(2));
                          }}
                          style={{
                            borderBottom: '1px solid #EEE',
                            background: isSelected ? '#316AC5' : '#FFF',
                            color: isSelected ? '#FFF' : '#000',
                            cursor: 'pointer'
                          }}
                        >
                          <td style={{ padding: '2px 6px', fontWeight: 700, borderRight: '1px solid #EEE' }}>{mod.code}</td>
                          <td style={{ padding: '2px 6px', borderRight: '1px solid #EEE' }}>{mod.name}</td>
                          <td style={{ padding: '2px 6px', textAlign: 'right' }}>{mod.charge.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bottom Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '4px' }}>
                <button className="ids-btn" onClick={handleSaveItemModifier} style={{ minWidth: '65px', fontWeight: 700 }}>
                  Select
                </button>
                <button className="ids-btn" onClick={() => setItemModifierOpen(false)} style={{ minWidth: '65px' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5P. WIN32 POS SHORTCUT KEYS HELP MODAL (Video 13 Master Reference) */}
      {hotKeyHelpOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1450 }}>
          <div 
            className="ids-modal-container" 
            style={{ width: '680px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '5px 5px 20px rgba(0,0,0,0.7)' }}
          >
            {/* Titlebar */}
            <div className="ids-modal-titlebar" style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>POS Shortcut Keys Help - IDS Fortune NEXT 6.5 &amp; 7.0 (Video 13)</span>
              <button className="ids-win-btn close" onClick={() => setHotKeyHelpOpen(false)} style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}>✕</button>
            </div>

            <div style={{ padding: '10px 14px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontWeight: 700, color: '#000080', fontSize: '12px' }}>
                Master Keyboard Shortcuts &amp; Toolbar Commands
              </div>

              <div style={{ height: '300px', overflowY: 'auto', background: '#FFF', border: '1px solid #7F9DB9' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#D4D0C8', borderBottom: '1px solid #808080' }}>
                    <tr>
                      <th style={{ padding: '4px 6px', borderRight: '1px solid #B0B0B0', textAlign: 'left', width: '90px' }}>Short Key</th>
                      <th style={{ padding: '4px 6px', borderRight: '1px solid #B0B0B0', textAlign: 'left', width: '120px' }}>Command</th>
                      <th style={{ padding: '4px 6px', borderRight: '1px solid #B0B0B0', textAlign: 'left' }}>Description (Video 13)</th>
                      <th style={{ padding: '4px 6px', textAlign: 'center', width: '70px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { key: 'Shift + F1', name: 'Print Bill', desc: 'To Print bill after KOT punch', action: () => { setHotKeyHelpOpen(false); setPosBillModalOpen(true); } },
                      { key: 'Shift + F2', name: 'Bill Settlement', desc: 'Settle bill via Cash / Card / Room Folio / Ledger', action: () => { setHotKeyHelpOpen(false); setPosBillSettlementModalOpen(true); } },
                      { key: 'Shift + F3', name: 'Table Status', desc: 'Check Occupied / Vacant / Billed status matrix', action: () => { setHotKeyHelpOpen(false); setTableStatusOpen(true); } },
                      { key: 'Shift + F4', name: 'Table Transfer', desc: 'Transfer running table to another table', action: () => { setHotKeyHelpOpen(false); setTableTransferOpen(true); handleLoadSourceTable(transferSourceTable || '10'); } },
                      { key: 'Shift + F5', name: 'Session Transfer', desc: 'Change session from Breakfast to Lunch & Lunch to Dinner', action: () => { setHotKeyHelpOpen(false); setSessionTransferOpen(true); handleLoadSessionTransfer(); } },
                      { key: 'Shift + F6', name: 'Table Link', desc: 'Link 3-4 tables in one table for billing (Not Mandatory)', action: () => { setHotKeyHelpOpen(false); setTableLinkOpen(true); } },
                      { key: 'Shift + F7', name: 'Multi-Restaurant', desc: 'Change Multiple Outlets at once inside order entry (RES / BAR)', action: () => { setHotKeyHelpOpen(false); setMultiOutletOpen(true); } },
                      { key: 'Shift + F8', name: 'NC KOT', desc: 'Make Non-Chargeable KOT (Managers / Directors / Complimentary)', action: () => { setHotKeyHelpOpen(false); setIsNcMode(prev => !prev); } },
                      { key: 'Shift + F9', name: 'Bill & Settle', desc: 'Used in MINI BAR billing for KOT-BILLING-SETTLEMENT at 1 click', action: () => { setHotKeyHelpOpen(false); handleOneClickBillAndSettle(); } },
                      { key: 'Shift + F10', name: 'Options', desc: 'For NC Bill Printing or Cash Drawer Kick Out', action: () => { setHotKeyHelpOpen(false); setOptionsModalOpen(true); } },
                      { key: 'Shift + F11', name: 'Rename / Import', desc: '@ Qty: Rename Item | @ Code: Import items from other outlet', action: () => { setHotKeyHelpOpen(false); handleOpenSupRestaurant(0); } },
                      { key: '<F1>', name: 'Item Modifier', desc: '@ Qty column: Open Item Modifiers dialog (spicy, less spicy, jain)', action: () => { setHotKeyHelpOpen(false); handleOpenItemModifier(0); } },
                      { key: '<F5>', name: 'Delete Item', desc: 'Delete currently selected row from order entry grid', action: () => { setHotKeyHelpOpen(false); handleDeleteRow(0); } },
                      { key: 'Reprint', name: 'KOT Reprint', desc: 'To Re-print KOT if it is not printed in first attempt', action: () => { setHotKeyHelpOpen(false); handleOpenKotReprint(); } },
                      { key: 'Setup', name: 'Menu Groups', desc: 'Setup Menu Groups V6.5.002.1 & Touch Screen Groups (Video 14)', action: () => { setHotKeyHelpOpen(false); setMenuGroupsOpen(true); } },
                      { key: 'Setup', name: 'TS Groups', desc: 'Touch Screen Groups V6.5.002.1 & Terminal Tile Configuration (Video 15)', action: () => { setHotKeyHelpOpen(false); setTouchScreenGroupsOpen(true); } },
                      { key: 'Setup', name: 'Table Master', desc: 'Restaurant Table Master V6.5.002.1 & Seating Capacities (Video 16)', action: () => { setHotKeyHelpOpen(false); setRestaurantTableMasterOpen(true); } },
                      { key: 'Setup', name: 'Delete Table', desc: 'Delete Restaurant Table & Alert Window V6.5.002.1 (Video 17)', action: () => { setHotKeyHelpOpen(false); setRestaurantTableMasterOpen(true); } },
                      { key: 'Setup', name: 'Servers Master', desc: 'Servers V6.5.002.1 & Deactivation (Active/Passive) (Videos 18 & 19)', action: () => { setHotKeyHelpOpen(false); setServersMasterOpen(true); } },
                      { key: 'Setup', name: 'Menu Master', desc: 'Menu Master V6.5.002.3 & Items Setup (Video 20)', action: () => { setHotKeyHelpOpen(false); setMenuMasterModalOpen(true); } },
                      { key: 'Outlet', name: 'Select Outlet', desc: 'Outlet & Session Selector — Loading items: RES/3 (Video 20 Frame 130)', action: () => { setHotKeyHelpOpen(false); setSelectOutletModalOpen(true); } }
                    ].map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #EEE', background: idx % 2 === 0 ? '#FFF' : '#F9F9F9' }}>
                        <td style={{ padding: '3px 6px', fontWeight: 800, color: '#0A246A', borderRight: '1px solid #EEE' }}>{row.key}</td>
                        <td style={{ padding: '3px 6px', fontWeight: 600, borderRight: '1px solid #EEE' }}>{row.name}</td>
                        <td style={{ padding: '3px 6px', color: '#444', borderRight: '1px solid #EEE' }}>{row.desc}</td>
                        <td style={{ padding: '2px 4px', textAlign: 'center' }}>
                          <button className="ids-btn" onClick={row.action} style={{ fontSize: '10px', padding: '1px 5px' }}>
                            Run
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button className="ids-btn" onClick={() => setHotKeyHelpOpen(false)} style={{ minWidth: '70px', fontWeight: 600 }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. POS BILL PRINTING MODAL (Video 03 Frame 018 - Frame 036) */}
      <IdsPosBillModal
        isOpen={posBillModalOpen}
        onClose={() => setPosBillModalOpen(false)}
        initialTableNo={tableNo}
        accountingDate={accountingDate}
        outlet={selectedOutlet}
        session={selectedSession}
        steward={server}
        kots={savedKots}
        onOpenCrystalReport={onOpenCrystalReport}
        onBillPrinted={({ billNo, tableNo: bTableNo }) => {
          setBilledTables(prev => Array.from(new Set([...prev, bTableNo])));
        }}
        onBillSettled={(settlementRecord) => {
          const tNo = settlementRecord.tableNo;
          setBilledTables(prev => prev.filter(t => t !== tNo));
          setSettledTables(prev => Array.from(new Set([...prev, tNo])));
          setSavedKots(prev => prev.filter(k => k.tableNo !== tNo));
          setSaveSuccessMsg(`Bill #${settlementRecord.billNo} on Table ${tNo} Settled! Table is now Vacant.`);
          setTimeout(() => setSaveSuccessMsg(null), 3000);
        }}
      />

      {/* 9. BILL SETTLEMENT V6.5.008.30 (Video 04 Frame 016 - Frame 054) */}
      <IdsPosBillSettlementModal
        isOpen={posBillSettlementModalOpen}
        onClose={() => setPosBillSettlementModalOpen(false)}
        initialBillNo="4"
        accountingDate={accountingDate}
        outlet={selectedOutlet}
        session={selectedSession}
        steward={server}
        onBillSettled={(settlementRecord) => {
          const tNo = settlementRecord.tableNo;
          setBilledTables(prev => prev.filter(t => t !== tNo));
          setSettledTables(prev => Array.from(new Set([...prev, tNo])));
          setSavedKots(prev => prev.filter(k => k.tableNo !== tNo));
          setSaveSuccessMsg(`Bill #${settlementRecord.billNo} on Table ${tNo} Settled! Table ${tNo} is now Vacant.`);
          setTimeout(() => setSaveSuccessMsg(null), 3000);
        }}
        onOpenCrystalReport={onOpenCrystalReport}
      />

      {/* POS Video 14: Menu Groups V6.5.002.1 */}
      <IdsMenuGroupsModal
        isOpen={menuGroupsOpen}
        onClose={() => setMenuGroupsOpen(false)}
        accountingDate={accountingDate}
        currentUser="MANAGER"
        onOpenTouchScreenGroups={() => {
          setMenuGroupsOpen(false);
          setTouchScreenGroupsOpen(true);
        }}
      />

      {/* POS Video 15: Touch Screen Groups V6.5.002.1 & Terminal Tile Configuration */}
      <IdsTouchScreenGroupsModal
        isOpen={touchScreenGroupsOpen}
        onClose={() => setTouchScreenGroupsOpen(false)}
        accountingDate={accountingDate}
        currentUser="MANAGER"
        onOpenMenuGroups={() => {
          setTouchScreenGroupsOpen(false);
          setMenuGroupsOpen(true);
        }}
      />

      {/* POS Video 16: Restaurant Table Master V6.5.002.1 & Floor Plan Matrix */}
      <IdsRestaurantTableMasterModal
        isOpen={restaurantTableMasterOpen}
        onClose={() => setRestaurantTableMasterOpen(false)}
        accountingDate={accountingDate}
        currentUser="MANAGER"
        initialOutlet={resOutlet === 'BAR' ? 'LIQUOR BAR' : 'RESTAURANT'}
        onSelectTableForOrder={(tbl) => {
          setTableNo(tbl);
          setRestaurantTableMasterOpen(false);
        }}
      />

      {/* POS Video 18: Servers V6.5.002.1 - Stewards Master */}
      <IdsServersModal
        isOpen={serversMasterOpen}
        onClose={() => setServersMasterOpen(false)}
        accountingDate={accountingDate}
        currentUser="MANAGER"
        onSelectServerForOrder={(srv) => {
          setServer(srv.name);
          setServersMasterOpen(false);
        }}
      />

      {/* POS Video 20: Menu Master V6.5.002.3 */}
      <IdsMenuMasterModal
        isOpen={menuMasterModalOpen}
        onClose={() => setMenuMasterModalOpen(false)}
        accountingDate={accountingDate}
        currentUser="MANAGER"
      />

      {/* POS Video 20 Frame 130: Select Outlet Modal */}
      {selectOutletModalOpen && (
        <div className="ids-modal-overlay" style={{ zIndex: 1360 }}>
          <div 
            className="ids-modal-container"
            style={{ width: '380px', background: '#ECE9D8', border: '2px solid #808080', boxShadow: '4px 4px 16px rgba(0,0,0,0.7)', fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '11px' }}
          >
            <div 
              className="ids-modal-titlebar"
              style={{ background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)', color: '#FFF', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span style={{ fontWeight: 700, fontSize: '11px' }}>Select Outlet</span>
              <button className="ids-win-btn close" onClick={() => setSelectOutletModalOpen(false)} style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}>✕</button>
            </div>
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px', background: '#F5F4EC' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 600 }}>Restaurant</span>
                <select 
                  value={selectOutletRestaurant} 
                  onChange={e => setSelectOutletRestaurant(e.target.value)}
                  style={{ border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px', background: '#FFF' }}
                >
                  <option value="RESTAURANT">RESTAURANT</option>
                  <option value="LIQUOR BAR">LIQUOR BAR</option>
                  <option value="ROOM SERVICE">ROOM SERVICE</option>
                  <option value="BANQUET">BANQUET</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 600 }}>Accounting Date</span>
                <input 
                  type="text" 
                  value={selectOutletAccountingDate} 
                  onChange={e => setSelectOutletAccountingDate(e.target.value)}
                  style={{ border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px', background: '#FFF' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 600 }}>Session</span>
                <input 
                  type="text" 
                  value={selectOutletSession} 
                  onChange={e => setSelectOutletSession(e.target.value)}
                  style={{ border: '1px solid #7F9DB9', padding: '2px 4px', fontSize: '11px', background: '#FFF' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <span style={{ fontWeight: 600 }}>Loading items</span>
                <span style={{ fontWeight: 700, color: '#0A246A' }}>
                  RES/{getStoredMenuItems().filter(i => i.outletName === selectOutletRestaurant || selectOutletRestaurant === 'RESTAURANT').length}
                </span>
              </div>

              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button 
                  className="ids-btn" 
                  onClick={() => {
                    setResOutlet(selectOutletRestaurant === 'LIQUOR BAR' ? 'BAR' : 'RES');
                    setSelectOutletModalOpen(false);
                    setSaveSuccessMsg(`Outlet: ${selectOutletRestaurant} loaded with RES/${getStoredMenuItems().length} items from Menu Master!`);
                    setTimeout(() => setSaveSuccessMsg(null), 3000);
                  }}
                  style={{ minWidth: '60px', fontWeight: 700 }}
                >
                  Ok
                </button>
                <button 
                  className="ids-btn" 
                  onClick={() => setSelectOutletModalOpen(false)}
                  style={{ minWidth: '60px' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POS Video 21: Sales Promotion Master V6.5.002.1 */}
      <IdsSalesPromotionMasterModal
        isOpen={salesPromotionModalOpen}
        onClose={() => setSalesPromotionModalOpen(false)}
        accountingDate={accountingDate}
        currentUser="MANAGER"
        onSelectPromotionForOrder={(promo) => {
          handlePunchPromotion(promo);
          setSalesPromotionModalOpen(false);
        }}
      />

      {/* POS Video 21 Frame 050: EAT AS U LIKE Package Selector Modal */}
      {eatAsULikeModalOpen && (() => {
        const storedPromos = getStoredPromotions();
        const activePromo = storedPromos[activeEatPromoIdx] || storedPromos[0];
        return (
          <div className="ids-modal-overlay" style={{ zIndex: 1360 }}>
            <div 
              className="ids-modal-container"
              style={{
                width: '450px',
                background: '#ECE9D8',
                border: '2px solid #808080',
                boxShadow: '4px 4px 16px rgba(0,0,0,0.7)',
                fontFamily: 'Tahoma, Arial, sans-serif',
                fontSize: '11px'
              }}
            >
              {/* Titlebar */}
              <div 
                className="ids-modal-titlebar"
                style={{
                  background: 'linear-gradient(90deg, #0A246A 0%, #A6CAF0 100%)',
                  color: '#FFF',
                  padding: '3px 6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ fontWeight: 700, fontSize: '11px' }}>EAT AS U LIKE</span>
                <button 
                  className="ids-win-btn close" 
                  onClick={() => setEatAsULikeModalOpen(false)} 
                  style={{ fontSize: '10px', height: '16px', width: '16px', lineHeight: '14px' }}
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Active Promo Header / Selector */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #CCC', paddingBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 700, color: '#0A246A', fontSize: '12px' }}>
                      {activePromo?.promotionName || 'Buy 2 Get 1 Free'}
                    </span>
                    <span style={{ background: '#E6F0FA', border: '1px solid #7F9DB9', padding: '1px 4px', fontSize: '10px', fontWeight: 600, color: '#006400' }}>
                      INR {activePromo?.promotionValue || '280.00'}
                    </span>
                  </div>

                  {storedPromos.length > 1 && (
                    <select 
                      value={activeEatPromoIdx} 
                      onChange={e => setActiveEatPromoIdx(Number(e.target.value))}
                      style={{ fontSize: '10px', border: '1px solid #7F9DB9', padding: '1px 3px' }}
                    >
                      {storedPromos.map((p, idx) => (
                        <option key={idx} value={idx}>{p.promotionName}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Two Columns: Main Items & Complimentary Items (Frame 050) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {/* Left Column: Main Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <span style={{ fontWeight: 600, fontSize: '10px', color: '#333' }}>
                      Main Items ({activePromo?.mainItems?.length || 0})
                    </span>
                    <div 
                      style={{ 
                        height: '110px', 
                        background: '#A6B695', 
                        border: '2px inset #FFF', 
                        padding: '2px', 
                        overflowY: 'auto' 
                      }}
                    >
                      {(activePromo?.mainItems || []).map((m, idx) => (
                        <div 
                          key={idx}
                          style={{
                            background: '#B22222',
                            color: '#FFF',
                            padding: '3px 6px',
                            fontWeight: 700,
                            fontSize: '11px',
                            marginBottom: '2px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {m.itemName} ({m.quantity} Qty)
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Complimentary Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <span style={{ fontWeight: 600, fontSize: '10px', color: '#333' }}>
                      Complimentary Items ({activePromo?.complimentaryItems?.length || 0})
                    </span>
                    <div 
                      style={{ 
                        height: '110px', 
                        background: '#A6B695', 
                        border: '2px inset #FFF', 
                        padding: '2px', 
                        overflowY: 'auto' 
                      }}
                    >
                      {(activePromo?.complimentaryItems || []).map((c, idx) => (
                        <div 
                          key={idx}
                          style={{
                            background: '#B22222',
                            color: '#FFF',
                            padding: '3px 6px',
                            fontWeight: 700,
                            fontSize: '11px',
                            marginBottom: '2px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {c.itemName} ({c.quantity} Free)
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Subtitle Message (Frame 050) */}
                <div style={{ textAlign: 'center', color: '#B22222', fontStyle: 'italic', fontSize: '11px', fontWeight: 700, marginTop: '2px' }}>
                  Press Enter to Select the Item.
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '4px' }}>
                  <button 
                    className="ids-btn" 
                    onClick={() => handlePunchPromotion(activePromo)}
                    style={{ minWidth: '70px', fontWeight: 700, color: '#006400' }}
                  >
                    Select
                  </button>
                  <button 
                    className="ids-btn" 
                    onClick={() => setEatAsULikeModalOpen(false)}
                    style={{ minWidth: '70px' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
