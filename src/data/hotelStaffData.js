/**
 * HOTEL ELITE INN — MASTER STAFF & EMPLOYEE DIRECTORY
 * Authentic 31 Staff Member Roster covering all 5 core hotel departments:
 * 1. Reception / Front Office: 3 Members (Morning, Evening, Night Shifts)
 * 2. Restaurant / F&B Service: 7 Members (1 Manager + 6 Stewards/Order Boys)
 * 3. Kitchen / Culinary Production: 10 Members (1 Supervisor, 4 Chefs, 2 Helpers + 3 Utility/Dishwash)
 * 4. Housekeeping & Laundry: 9 Members (1 Manager, 1 Supervisor, 3 Female Attendants, 4 Male Attendants)
 * 5. Security & Gate Patrol: 2 Members (Day Gate Marshall, Night Perimeter Patrol)
 *
 * Integrated into:
 * - IDS Fortune NEXT Win32 Servers Master (IdsServersModal)
 * - IDS POS Order Entry & Touch Terminal (IdsOrderEntryModal, IdsTouchPosTerminalModal)
 * - IDS Housekeeping Linen & Room Status (IdsHkInventoryModal, IdsHkRoomStatusModal)
 * - IDS Front Desk Cashiering & Night Audit (IdsCheckInForms, IdsNightAuditModal, IdsPostDepositModal)
 * - Steward QR Badges & Mobile Order Pad (StewardQrManagerModal, StewardMobileOrderPad)
 */

export const HOTEL_STAFF_MEMBERS = [
  // ==========================================
  // DEPARTMENT 1: RECEPTION / FRONT OFFICE (3)
  // ==========================================
  {
    id: 'EMP-REC-001',
    serverCode: 'FO-01',
    name: 'Ranjan Kumar Dash',
    shortName: 'Ranjan',
    gender: 'Male',
    department: 'Reception',
    subDept: 'Front Desk / Cashiering',
    role: 'Sr. Front Desk Cashier',
    designation: 'Senior Front Desk Executive',
    shift: 'Morning',
    shiftHours: '07:00 AM - 03:30 PM',
    weeklyOff: 'Tuesday',
    phone: '+91 94370 11001',
    email: 'ranjan.reception@hoteleliteinn.com',
    status: 'Active',
    idsRole: 'CASHIER',
    accessLevel: 'Front Office Cashier',
    joinDate: '15-JAN-2023',
    monthlySalary: 22000,
    emergencyContact: '+91 94370 99001 (Father - K. Dash)'
  },
  {
    id: 'EMP-REC-002',
    serverCode: 'FO-02',
    name: 'Sneha Mohapatra',
    shortName: 'Sneha',
    gender: 'Female',
    department: 'Reception',
    subDept: 'Front Desk / Guest Relations',
    role: 'Front Desk Executive',
    designation: 'Guest Relations & Check-in Desk',
    shift: 'Evening',
    shiftHours: '03:00 PM - 11:30 PM',
    weeklyOff: 'Wednesday',
    phone: '+91 94370 11002',
    email: 'sneha.frontdesk@hoteleliteinn.com',
    status: 'Active',
    idsRole: 'CASHIER',
    accessLevel: 'Front Office Cashier',
    joinDate: '01-MAR-2023',
    monthlySalary: 21000,
    emergencyContact: '+91 94370 99002 (Mother - R. Mohapatra)'
  },
  {
    id: 'EMP-REC-003',
    serverCode: 'FO-03',
    name: 'Manash Ranjan Sahu',
    shortName: 'Manash',
    gender: 'Male',
    department: 'Reception',
    subDept: 'Night Audit & Duty Management',
    role: 'Night Auditor & Duty Receptionist',
    designation: 'Night Duty Manager & PMS Auditor',
    shift: 'Night',
    shiftHours: '11:00 PM - 07:30 AM',
    weeklyOff: 'Thursday',
    phone: '+91 94370 11003',
    email: 'manash.nightaudit@hoteleliteinn.com',
    status: 'Active',
    idsRole: 'NIGHT_AUDITOR',
    accessLevel: 'Night Auditor / Supervisor',
    joinDate: '10-NOV-2022',
    monthlySalary: 24000,
    emergencyContact: '+91 94370 99003 (Brother - B. Sahu)'
  },

  // ==========================================
  // DEPARTMENT 2: RESTAURANT & F&B SERVICE (7)
  // (1 Manager + 6 Stewards / Order Boys)
  // ==========================================
  {
    id: 'EMP-REST-001',
    serverCode: '001',
    name: 'Kaushik Mukherjee',
    shortName: 'Kaushik',
    gender: 'Male',
    department: 'Restaurant',
    subDept: 'F&B Operations',
    role: 'Restaurant & Banquet Manager',
    designation: 'F&B Service Manager & Captain',
    shift: 'General',
    shiftHours: '10:00 AM - 10:00 PM',
    weeklyOff: 'Monday',
    phone: '+91 94370 12000',
    email: 'kaushik.fb@hoteleliteinn.com',
    status: 'Active',
    idsRole: 'SUPERVISOR',
    accessLevel: 'F&B Manager / Void Authorization',
    pin: '1234',
    joinDate: '05-DEC-2021',
    monthlySalary: 32000,
    emergencyContact: '+91 94370 99004 (Spouse - P. Mukherjee)'
  },
  {
    id: 'EMP-REST-002',
    serverCode: '002',
    stewardBadge: 'STW-01',
    name: 'Sadananda Nayak',
    shortName: 'Sadananda',
    gender: 'Male',
    department: 'Restaurant',
    subDept: 'Dining Floor & Room Service',
    role: 'Floor Captain & Steward',
    designation: 'Senior Service Steward',
    shift: 'Split / Morning',
    shiftHours: '07:00 AM - 03:00 PM / 07:00 PM - 11:00 PM',
    weeklyOff: 'Tuesday',
    phone: '+91 94370 12001',
    email: 'sadananda.stw@hoteleliteinn.com',
    status: 'Active',
    idsRole: 'SERVER',
    accessLevel: 'Steward Mobile Order Pad',
    joinDate: '15-FEB-2022',
    monthlySalary: 16500,
    emergencyContact: '+91 94370 99005 (Brother - K. Nayak)'
  },
  {
    id: 'EMP-REST-003',
    serverCode: '003',
    stewardBadge: 'STW-02',
    name: 'Koti Rao',
    shortName: 'Koti',
    gender: 'Male',
    department: 'Restaurant',
    subDept: 'Dining Floor & In-Room Service',
    role: 'Service Steward (Room Service)',
    designation: 'Steward & In-Room Runner',
    shift: 'Morning',
    shiftHours: '11:00 AM - 07:30 PM',
    weeklyOff: 'Wednesday',
    phone: '+91 94370 12002',
    email: 'koti.stw@hoteleliteinn.com',
    status: 'Active',
    idsRole: 'SERVER',
    accessLevel: 'Steward Mobile Order Pad',
    joinDate: '10-MAY-2022',
    monthlySalary: 15500,
    emergencyContact: '+91 94370 99006 (Father - S. Rao)'
  },
  {
    id: 'EMP-REST-004',
    serverCode: '004',
    stewardBadge: 'STW-03',
    name: 'Deepak Sahoo',
    shortName: 'Deepak',
    gender: 'Male',
    department: 'Restaurant',
    subDept: 'Restaurant Floor & Satvik Dining',
    role: 'Service Steward (Main Dining)',
    designation: 'Table Service Steward',
    shift: 'Evening',
    shiftHours: '03:00 PM - 11:30 PM',
    weeklyOff: 'Thursday',
    phone: '+91 94370 12003',
    email: 'deepak.stw@hoteleliteinn.com',
    status: 'Active',
    idsRole: 'SERVER',
    accessLevel: 'Steward Mobile Order Pad',
    joinDate: '20-JUN-2022',
    monthlySalary: 15500,
    emergencyContact: '+91 94370 99007 (Brother - M. Sahoo)'
  },
  {
    id: 'EMP-REST-005',
    serverCode: '005',
    stewardBadge: 'STW-04',
    name: 'Bijay Pradhan',
    shortName: 'Bijay',
    gender: 'Male',
    department: 'Restaurant',
    subDept: 'Dining Floor & Banquet Service',
    role: 'Service Steward (Banquet & Floor)',
    designation: 'Banquets Steward',
    shift: 'Evening',
    shiftHours: '04:00 PM - 12:30 AM',
    weeklyOff: 'Friday',
    phone: '+91 94370 12004',
    email: 'bijay.stw@hoteleliteinn.com',
    status: 'Active',
    idsRole: 'SERVER',
    accessLevel: 'Steward Mobile Order Pad',
    joinDate: '18-AUG-2022',
    monthlySalary: 15500,
    emergencyContact: '+91 94370 99008 (Brother - N. Pradhan)'
  },
  {
    id: 'EMP-REST-006',
    serverCode: '006',
    stewardBadge: 'STW-05',
    name: 'Ramesh Chandra Sethi',
    shortName: 'Ramesh',
    gender: 'Male',
    department: 'Restaurant',
    subDept: 'Dining Floor & Morning Breakfast',
    role: 'Service Steward (Breakfast & Floor)',
    designation: 'Morning Service Steward',
    shift: 'Morning',
    shiftHours: '06:30 AM - 03:00 PM',
    weeklyOff: 'Saturday',
    phone: '+91 94370 12005',
    email: 'ramesh.stw@hoteleliteinn.com',
    status: 'Active',
    idsRole: 'SERVER',
    accessLevel: 'Steward Mobile Order Pad',
    joinDate: '01-OCT-2022',
    monthlySalary: 15000,
    emergencyContact: '+91 94370 99009 (Father - G. Sethi)'
  },
  {
    id: 'EMP-REST-007',
    serverCode: '007',
    stewardBadge: 'STW-06',
    name: 'Santosh Gouda',
    shortName: 'Santosh',
    gender: 'Male',
    department: 'Restaurant',
    subDept: 'Night Room Service & Late Dining',
    role: 'Service Steward (Night Room Service)',
    designation: 'Night Order Service Steward',
    shift: 'Night',
    shiftHours: '06:00 PM - 02:30 AM',
    weeklyOff: 'Sunday',
    phone: '+91 94370 12006',
    email: 'santosh.stw@hoteleliteinn.com',
    status: 'Active',
    idsRole: 'SERVER',
    accessLevel: 'Steward Mobile Order Pad',
    joinDate: '15-JAN-2023',
    monthlySalary: 15000,
    emergencyContact: '+91 94370 99010 (Uncle - P. Gouda)'
  },

  // ==========================================
  // DEPARTMENT 3: KITCHEN / FOOD PRODUCTION (10)
  // [4 Chefs + 2 Helpers + 1 Supervisor] (7) + [3 Utility/Dishwash] (3) = 10
  // ==========================================
  {
    id: 'EMP-KIT-001',
    serverCode: 'KIT-01',
    name: 'Chef Biren Mohanty',
    shortName: 'Chef Biren',
    gender: 'Male',
    department: 'Kitchen',
    subDept: 'Culinary Production & Management',
    role: 'Kitchen Supervisor / Executive Chef',
    designation: 'Head Chef & Kitchen Production Master',
    shift: 'General',
    shiftHours: '09:00 AM - 09:30 PM',
    weeklyOff: 'Monday',
    phone: '+91 94370 13001',
    email: 'chef.biren@hoteleliteinn.com',
    status: 'Active',
    idsRole: 'CHEF_SUPERVISOR',
    accessLevel: 'KDS Kitchen Manager Display',
    station: 'Hot Range, KDS Dispatch & Quality Check',
    joinDate: '01-OCT-2021',
    monthlySalary: 38000,
    emergencyContact: '+91 94370 99011 (Spouse - S. Mohanty)'
  },
  {
    id: 'EMP-KIT-002',
    serverCode: 'KIT-02',
    name: 'Chef Tapan Swain',
    shortName: 'Chef Tapan',
    gender: 'Male',
    department: 'Kitchen',
    subDept: 'Tandoor & Kebab Section',
    role: 'Tandoor & Clay Oven Master Chef',
    designation: 'Senior Cook - Tandoor & Roti',
    shift: 'Afternoon / Dinner',
    shiftHours: '02:00 PM - 11:30 PM',
    weeklyOff: 'Tuesday',
    phone: '+91 94370 13002',
    email: 'chef.tapan@hoteleliteinn.com',
    status: 'Active',
    idsRole: 'COOK',
    accessLevel: 'KDS Tandoor Station',
    station: 'Tandoor Breads, Kebabs, Tikka',
    joinDate: '15-JAN-2022',
    monthlySalary: 23000,
    emergencyContact: '+91 94370 99012 (Brother - R. Swain)'
  },
  {
    id: 'EMP-KIT-003',
    serverCode: 'KIT-03',
    name: 'Chef Ashok Barik',
    shortName: 'Chef Ashok',
    gender: 'Male',
    department: 'Kitchen',
    subDept: 'Indian Curry & Satvik Gravies',
    role: 'Indian Gravy & Satvik Cuisine Specialist',
    designation: 'Cook - Indian Curry & Dal Section',
    shift: 'Morning / Lunch',
    shiftHours: '06:30 AM - 03:00 PM',
    weeklyOff: 'Wednesday',
    phone: '+91 94370 13003',
    email: 'chef.ashok@hoteleliteinn.com',
    status: 'Active',
    idsRole: 'COOK',
    accessLevel: 'KDS Range Station',
    station: 'Satvik Gravies, Paneer Dishes, Dal Tadka',
    joinDate: '01-APR-2022',
    monthlySalary: 22000,
    emergencyContact: '+91 94370 99013 (Father - B. Barik)'
  },
  {
    id: 'EMP-KIT-004',
    serverCode: 'KIT-04',
    name: 'Chef Purna Chandra Panda',
    shortName: 'Chef Purna',
    gender: 'Male',
    department: 'Kitchen',
    subDept: 'Odia Authentic & Rice Section',
    role: 'Odia Authentic & Rice Specialist',
    designation: 'Cook - Odia Thali, Rice & Dalma',
    shift: 'Morning',
    shiftHours: '08:00 AM - 04:30 PM',
    weeklyOff: 'Thursday',
    phone: '+91 94370 13004',
    email: 'chef.purna@hoteleliteinn.com',
    status: 'Active',
    idsRole: 'COOK',
    accessLevel: 'KDS Rice Station',
    station: 'Rice, Pulao, Khichdi, Traditional Odia Thali',
    joinDate: '10-JUL-2022',
    monthlySalary: 21500,
    emergencyContact: '+91 94370 99014 (Spouse - G. Panda)'
  },
  {
    id: 'EMP-KIT-005',
    serverCode: 'KIT-05',
    name: 'Chef Sanjay Jena',
    shortName: 'Chef Sanjay',
    gender: 'Male',
    department: 'Kitchen',
    subDept: 'Breakfast, Snacks & Continental',
    role: 'Breakfast & Evening Snacks Cook',
    designation: 'Cook - South Indian, Snacks & Tea/Coffee',
    shift: 'Morning',
    shiftHours: '06:00 AM - 02:30 PM',
    weeklyOff: 'Friday',
    phone: '+91 94370 13005',
    email: 'chef.sanjay@hoteleliteinn.com',
    status: 'Active',
    idsRole: 'COOK',
    accessLevel: 'KDS Pantry Station',
    station: 'Dosa, Idli, Poori Bhaji, Pakoda, Sandwiches',
    joinDate: '05-SEP-2022',
    monthlySalary: 20000,
    emergencyContact: '+91 94370 99015 (Brother - A. Jena)'
  },
  {
    id: 'EMP-KIT-006',
    serverCode: 'KIT-06',
    name: 'Jitendra Samal',
    shortName: 'Jitendra',
    gender: 'Male',
    department: 'Kitchen',
    subDept: 'Vegetable Prep & Mis-en-place',
    role: 'Kitchen Helper 1 (Vegetable Prep)',
    designation: 'Culinary Assistant & Prep Helper',
    shift: 'Morning',
    shiftHours: '06:30 AM - 03:00 PM',
    weeklyOff: 'Saturday',
    phone: '+91 94370 13006',
    email: 'jitendra.prep@hoteleliteinn.com',
    status: 'Active',
    idsRole: 'KITCHEN_HELPER',
    accessLevel: 'Kitchen Staff',
    station: 'Vegetable Cutting, Onion-Garlic Free Prep, Masala Pastes',
    joinDate: '12-OCT-2022',
    monthlySalary: 13500,
    emergencyContact: '+91 94370 99016 (Father - H. Samal)'
  },
  {
    id: 'EMP-KIT-007',
    serverCode: 'KIT-07',
    name: 'Chandan Behera',
    shortName: 'Chandan',
    gender: 'Male',
    department: 'Kitchen',
    subDept: 'Live Counter & Griddle Assistant',
    role: 'Kitchen Helper 2 (Live Counter)',
    designation: 'Culinary Assistant & Tawa Helper',
    shift: 'Evening',
    shiftHours: '03:00 PM - 11:30 PM',
    weeklyOff: 'Sunday',
    phone: '+91 94370 13007',
    email: 'chandan.helper@hoteleliteinn.com',
    status: 'Active',
    idsRole: 'KITCHEN_HELPER',
    accessLevel: 'Kitchen Staff',
    station: 'Tawa Assist, Frying & Garnish Preparation',
    joinDate: '01-NOV-2022',
    monthlySalary: 13500,
    emergencyContact: '+91 94370 99017 (Brother - D. Behera)'
  },
  {
    id: 'EMP-KIT-008',
    serverCode: 'KIT-08',
    name: 'Dillip Tarai',
    shortName: 'Dillip',
    gender: 'Male',
    department: 'Kitchen',
    subDept: 'Pot Washing & Heavy Utensil Cleaning',
    role: 'Kitchen Utility & Pot Washer',
    designation: 'Stewarding Utility Staff',
    shift: 'Split Shift',
    shiftHours: '10:00 AM - 03:00 PM / 07:00 PM - 11:30 PM',
    weeklyOff: 'Monday',
    phone: '+91 94370 13008',
    email: 'dillip.utility@hoteleliteinn.com',
    status: 'Active',
    idsRole: 'KITCHEN_UTILITY',
    accessLevel: 'Kitchen Staff',
    station: 'Pot Wash Sink, Large Kadai & Degchi Sanitization',
    joinDate: '15-DEC-2022',
    monthlySalary: 12500,
    emergencyContact: '+91 94370 99018 (Uncle - T. Tarai)'
  },
  {
    id: 'EMP-KIT-009',
    serverCode: 'KIT-09',
    name: 'Pravat Rout',
    shortName: 'Pravat',
    gender: 'Male',
    department: 'Kitchen',
    subDept: 'Plate & Crockery Sanitization',
    role: 'Kitchen Utility & Dishwasher',
    designation: 'Dishwashing & Crockery Sanitizer',
    shift: 'Evening',
    shiftHours: '03:30 PM - 12:00 AM',
    weeklyOff: 'Wednesday',
    phone: '+91 94370 13009',
    email: 'pravat.dishwash@hoteleliteinn.com',
    status: 'Active',
    idsRole: 'KITCHEN_UTILITY',
    accessLevel: 'Kitchen Staff',
    station: 'Dishwashing Station, Glassware & Cutlery Drying',
    joinDate: '10-JAN-2023',
    monthlySalary: 12500,
    emergencyContact: '+91 94370 99019 (Father - M. Rout)'
  },
  {
    id: 'EMP-KIT-010',
    serverCode: 'KIT-010',
    name: 'Lalatendu Mallick',
    shortName: 'Lalatendu',
    gender: 'Male',
    department: 'Kitchen',
    subDept: 'Kitchen Pantry & Deep Cleaning',
    role: 'Kitchen Pantry & Garbage Handler',
    designation: 'Kitchen Cleaner & Hygiene Runner',
    shift: 'Morning',
    shiftHours: '07:00 AM - 03:30 PM',
    weeklyOff: 'Thursday',
    phone: '+91 94370 13010',
    email: 'lalatendu.clean@hoteleliteinn.com',
    status: 'Active',
    idsRole: 'KITCHEN_UTILITY',
    accessLevel: 'Kitchen Staff',
    station: 'Kitchen Floor Mopping, Garbage Disposal & Pest Guard',
    joinDate: '01-FEB-2023',
    monthlySalary: 12500,
    emergencyContact: '+91 94370 99020 (Brother - J. Mallick)'
  },

  // ==========================================
  // DEPARTMENT 4: HOUSEKEEPING & LAUNDRY (9)
  // (1 Manager + 1 Supervisor + 3 Female + 4 Male = 9)
  // ==========================================
  {
    id: 'EMP-HK-001',
    serverCode: 'HK-01',
    name: 'Subrat Patnaik',
    shortName: 'Subrat',
    gender: 'Male',
    department: 'Housekeeping',
    subDept: 'Executive Housekeeping Management',
    role: 'Housekeeping Manager',
    designation: 'Executive Housekeeper & Laundry Head',
    shift: 'General',
    shiftHours: '08:30 AM - 05:30 PM',
    weeklyOff: 'Sunday',
    phone: '+91 94370 14001',
    email: 'subrat.hk@hoteleliteinn.com',
    status: 'Active',
    idsRole: 'HK_SUPERVISOR',
    accessLevel: 'Housekeeping Manager',
    joinDate: '10-AUG-2021',
    monthlySalary: 28000,
    emergencyContact: '+91 94370 99021 (Spouse - M. Patnaik)'
  },
  {
    id: 'EMP-HK-002',
    serverCode: 'HK-02',
    name: 'Sunil Mohapatra',
    shortName: 'Sunil',
    gender: 'Male',
    department: 'Housekeeping',
    subDept: 'Floor Supervision & Linen Inventory',
    role: 'Housekeeping Supervisor',
    designation: 'Floor Inspection & Linen Room Master',
    shift: 'Morning',
    shiftHours: '07:00 AM - 03:30 PM',
    weeklyOff: 'Monday',
    phone: '+91 94370 14002',
    email: 'sunil.supervisor@hoteleliteinn.com',
    status: 'Active',
    idsRole: 'HK_SUPERVISOR',
    accessLevel: 'Housekeeping Floor Supervisor',
    joinDate: '01-JAN-2022',
    monthlySalary: 20000,
    emergencyContact: '+91 94370 99022 (Brother - P. Mohapatra)'
  },
  {
    id: 'EMP-HK-003',
    serverCode: 'HK-03',
    name: 'Laxmi Majhi',
    shortName: 'Laxmi',
    gender: 'Female',
    department: 'Housekeeping',
    subDept: '1st Floor Guest Rooms (101-109)',
    role: 'Female Housekeeping Attendant',
    designation: 'Room Attendant - Floor 1',
    shift: 'Morning',
    shiftHours: '07:30 AM - 04:00 PM',
    weeklyOff: 'Tuesday',
    phone: '+91 94370 14003',
    email: 'laxmi.hk@hoteleliteinn.com',
    status: 'Active',
    idsRole: 'HK_ATTENDANT',
    accessLevel: 'Room Cleaning & Bed Making',
    assignedFloor: '1st Floor (Rooms 101–109)',
    joinDate: '15-MAR-2022',
    monthlySalary: 14000,
    emergencyContact: '+91 94370 99023 (Husband - K. Majhi)'
  },
  {
    id: 'EMP-HK-004',
    serverCode: 'HK-04',
    name: 'Mamata Nayak',
    shortName: 'Mamata',
    gender: 'Female',
    department: 'Housekeeping',
    subDept: '2nd Floor Guest Rooms (201-209)',
    role: 'Female Housekeeping Attendant',
    designation: 'Room Attendant - Floor 2',
    shift: 'Morning',
    shiftHours: '08:00 AM - 04:30 PM',
    weeklyOff: 'Wednesday',
    phone: '+91 94370 14004',
    email: 'mamata.hk@hoteleliteinn.com',
    status: 'Active',
    idsRole: 'HK_ATTENDANT',
    accessLevel: 'Room Cleaning & Bed Making',
    assignedFloor: '2nd Floor (Rooms 201–209)',
    joinDate: '01-JUN-2022',
    monthlySalary: 14000,
    emergencyContact: '+91 94370 99024 (Father - B. Nayak)'
  },
  {
    id: 'EMP-HK-005',
    serverCode: 'HK-05',
    name: 'Puspalata Biswal',
    shortName: 'Puspalata',
    gender: 'Female',
    department: 'Housekeeping',
    subDept: '3rd Floor Rooms & Public Areas',
    role: 'Female Housekeeping Attendant',
    designation: 'Room Attendant & Turndown Service',
    shift: 'Evening',
    shiftHours: '02:00 PM - 10:30 PM',
    weeklyOff: 'Thursday',
    phone: '+91 94370 14005',
    email: 'puspalata.hk@hoteleliteinn.com',
    status: 'Active',
    idsRole: 'HK_ATTENDANT',
    accessLevel: 'Room Cleaning & Public Area Sanitization',
    assignedFloor: '3rd Floor (Rooms 301–309)',
    joinDate: '15-SEP-2022',
    monthlySalary: 14000,
    emergencyContact: '+91 94370 99025 (Husband - R. Biswal)'
  },
  {
    id: 'EMP-HK-006',
    serverCode: 'HK-06',
    name: 'Ramesh Nayak',
    shortName: 'Ramesh N',
    gender: 'Male',
    department: 'Housekeeping',
    subDept: '2nd Floor Trolley & Linen Replenishment',
    role: 'Male Housekeeping Attendant',
    designation: 'Floor Trolley & Heavy Cleaning Staff',
    shift: 'Morning',
    shiftHours: '07:00 AM - 03:30 PM',
    weeklyOff: 'Friday',
    phone: '+91 94370 14006',
    email: 'ramesh.hk@hoteleliteinn.com',
    status: 'Active',
    idsRole: 'HK_ATTENDANT',
    accessLevel: 'HK Trolley & Linen Exchange',
    assignedFloor: 'Floor 2 (Trolley FL-02)',
    joinDate: '01-FEB-2022',
    monthlySalary: 14000,
    emergencyContact: '+91 94370 99026 (Father - N. Nayak)'
  },
  {
    id: 'EMP-HK-007',
    serverCode: 'HK-07',
    name: 'Debendra Jena',
    shortName: 'Debendra',
    gender: 'Male',
    department: 'Housekeeping',
    subDept: '3rd Floor Trolley & Vacuuming',
    role: 'Male Housekeeping Attendant',
    designation: 'Room Cleaning & Vacuum Specialist',
    shift: 'Morning',
    shiftHours: '08:00 AM - 04:30 PM',
    weeklyOff: 'Saturday',
    phone: '+91 94370 14007',
    email: 'debendra.hk@hoteleliteinn.com',
    status: 'Active',
    idsRole: 'HK_ATTENDANT',
    accessLevel: 'HK Trolley & Carpet Shampooing',
    assignedFloor: 'Floor 3 (Trolley FL-03)',
    joinDate: '20-MAR-2022',
    monthlySalary: 14000,
    emergencyContact: '+91 94370 99027 (Brother - G. Jena)'
  },
  {
    id: 'EMP-HK-008',
    serverCode: 'HK-08',
    name: 'Bishnu Charan Das',
    shortName: 'Bishnu',
    gender: 'Male',
    department: 'Housekeeping',
    subDept: 'Lobby, Corridors & Public Restrooms',
    role: 'Male Housekeeping Attendant',
    designation: 'Public Area Maintenance Attendant',
    shift: 'Evening',
    shiftHours: '03:00 PM - 11:30 PM',
    weeklyOff: 'Sunday',
    phone: '+91 94370 14008',
    email: 'bishnu.hk@hoteleliteinn.com',
    status: 'Active',
    idsRole: 'HK_ATTENDANT',
    accessLevel: 'Lobby & Glass Facade Cleaning',
    assignedFloor: 'Ground Floor & Lobby Areas',
    joinDate: '10-NOV-2022',
    monthlySalary: 13500,
    emergencyContact: '+91 94370 99028 (Father - S. Das)'
  },
  {
    id: 'EMP-HK-009',
    serverCode: 'HK-09',
    name: 'Manoj Kumar Sethi',
    shortName: 'Manoj',
    gender: 'Male',
    department: 'Housekeeping',
    subDept: 'In-House Laundry & Steam Pressing Plant',
    role: 'Laundry Plant Attendant & Washer',
    designation: 'Laundry Plant Operator & Presser',
    shift: 'Day Shift',
    shiftHours: '09:00 AM - 06:00 PM',
    weeklyOff: 'Wednesday',
    phone: '+91 94370 14009',
    email: 'manoj.laundry@hoteleliteinn.com',
    status: 'Active',
    idsRole: 'LAUNDRY_OPERATOR',
    accessLevel: 'Laundry Machine & Pressing Plant',
    assignedFloor: 'Basement Laundry Plant',
    joinDate: '15-DEC-2022',
    monthlySalary: 14500,
    emergencyContact: '+91 94370 99029 (Brother - K. Sethi)'
  },

  // ==========================================
  // DEPARTMENT 5: SECURITY & PROPERTY PATROL (2)
  // ==========================================
  {
    id: 'EMP-SEC-001',
    serverCode: 'SEC-01',
    name: 'Balaram Swain',
    shortName: 'Balaram',
    gender: 'Male',
    department: 'Security',
    subDept: 'Main Gate & Parking Marshal',
    role: 'Day Security Officer',
    designation: 'Security Guard & Visitor Register',
    shift: 'Day',
    shiftHours: '07:00 AM - 07:00 PM (12-Hour Shift)',
    weeklyOff: 'Rotational',
    phone: '+91 94370 15001',
    email: 'security.day@hoteleliteinn.com',
    status: 'Active',
    idsRole: 'SECURITY',
    accessLevel: 'Gate Pass & Vehicle Entry Log',
    station: 'Main Entry Gate & Parking Lot',
    joinDate: '01-JAN-2022',
    monthlySalary: 15000,
    emergencyContact: '+91 94370 99030 (Son - P. Swain)'
  },
  {
    id: 'EMP-SEC-002',
    serverCode: 'SEC-02',
    name: 'Kailash Chandra Behera',
    shortName: 'Kailash',
    gender: 'Male',
    department: 'Security',
    subDept: 'Night Patrol & CCTV Surveillance',
    role: 'Night Security Guard',
    designation: 'Night Property Guard & Fire Safety',
    shift: 'Night',
    shiftHours: '07:00 PM - 07:00 AM (12-Hour Shift)',
    weeklyOff: 'Rotational',
    phone: '+91 94370 15002',
    email: 'security.night@hoteleliteinn.com',
    status: 'Active',
    idsRole: 'SECURITY',
    accessLevel: 'CCTV Room & Night Perimeter Guard',
    station: 'Perimeter Boundary & CCTV Surveillance Post',
    joinDate: '15-FEB-2022',
    monthlySalary: 15500,
    emergencyContact: '+91 94370 99031 (Spouse - S. Behera)'
  }
];

// Department Summary
export const DEPARTMENT_SUMMARY = {
  totalStaff: HOTEL_STAFF_MEMBERS.length, // 31
  departments: {
    Reception: { count: 3, label: 'Reception / Front Desk' },
    Restaurant: { count: 7, label: 'Restaurant & F&B Service' },
    Kitchen: { count: 10, label: 'Kitchen & Production' },
    Housekeeping: { count: 9, label: 'Housekeeping & Laundry' },
    Security: { count: 2, label: 'Security & Property Guard' }
  }
};

// Recognized Stewards (compat format for StewardMobileOrderPad & StewardQrManagerModal)
export const RECOGNIZED_STEWARDS = HOTEL_STAFF_MEMBERS
  .filter(s => s.department === 'Restaurant' && s.stewardBadge)
  .map(s => ({
    id: s.stewardBadge ? s.name.toUpperCase().split(' ')[0] : s.id,
    name: s.shortName,
    fullName: s.name,
    code: s.stewardBadge || s.serverCode,
    serverCode: s.serverCode,
    phone: s.phone,
    empId: s.id,
    shift: s.shift
  }));

// Helper functions
export function getStaffByDepartment(dept) {
  if (!dept || dept === 'ALL') return HOTEL_STAFF_MEMBERS;
  return HOTEL_STAFF_MEMBERS.filter(s => s.department.toLowerCase() === dept.toLowerCase());
}

export function getStewardsList() {
  return HOTEL_STAFF_MEMBERS.filter(s => s.department === 'Restaurant');
}

export function getKitchenCrew() {
  return HOTEL_STAFF_MEMBERS.filter(s => s.department === 'Kitchen');
}

export function getHousekeepingCrew() {
  return HOTEL_STAFF_MEMBERS.filter(s => s.department === 'Housekeeping');
}

export function getFrontOfficeStaff() {
  return HOTEL_STAFF_MEMBERS.filter(s => s.department === 'Reception');
}

export function getSecurityStaff() {
  return HOTEL_STAFF_MEMBERS.filter(s => s.department === 'Security');
}

// Storage helpers for live edits in IDS Modals
export function getStoredStaff() {
  try {
    const raw = localStorage.getItem('ids_hotel_staff_roster');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load ids_hotel_staff_roster', e);
  }
  return HOTEL_STAFF_MEMBERS;
}

export function saveStoredStaff(list) {
  try {
    localStorage.setItem('ids_hotel_staff_roster', JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save ids_hotel_staff_roster', e);
  }
}

// Exactly 9 Operational QR Badges for Staff Portals & Wall Displays
// (6 Stewards + 2 Housekeeping Leads + 1 Kitchen KDS Manager)
export const OPERATIONAL_QR_BADGES = [
  // 1. Restaurant Floor Stewards (6 QR codes)
  {
    category: 'Restaurant Floor Stewards',
    badgeType: 'steward',
    icon: '👨‍🍳',
    colorAccent: '#fbbf24',
    darkColor: '#0f172a',
    id: 'SADANANDA',
    name: 'Sadananda Nayak',
    shortName: 'Sadananda',
    code: 'STW-01',
    serverCode: '002',
    role: 'Floor Captain & Senior Steward',
    department: 'Restaurant',
    shift: 'Split / Morning Shift',
    phone: '+91 94370 12001',
    urlPath: '/?view=steward&staff=SADANANDA',
    description: 'Scans to open Sadananda Floor Mobile Order Pad'
  },
  {
    category: 'Restaurant Floor Stewards',
    badgeType: 'steward',
    icon: '👨‍🍳',
    colorAccent: '#fbbf24',
    darkColor: '#0f172a',
    id: 'KOTI',
    name: 'Koti Rao',
    shortName: 'Koti',
    code: 'STW-02',
    serverCode: '003',
    role: 'Room Service Steward Runner',
    department: 'Restaurant',
    shift: 'Morning / Day Shift',
    phone: '+91 94370 12002',
    urlPath: '/?view=steward&staff=KOTI',
    description: 'Scans to open Koti In-Room Order Taking Pad'
  },
  {
    category: 'Restaurant Floor Stewards',
    badgeType: 'steward',
    icon: '👨‍🍳',
    colorAccent: '#fbbf24',
    darkColor: '#0f172a',
    id: 'DEEPAK',
    name: 'Deepak Sahoo',
    shortName: 'Deepak',
    code: 'STW-03',
    serverCode: '004',
    role: 'Main Dining Floor Steward',
    department: 'Restaurant',
    shift: 'Evening Dining Shift',
    phone: '+91 94370 12003',
    urlPath: '/?view=steward&staff=DEEPAK',
    description: 'Scans to open Deepak Satvik Dining Order Pad'
  },
  {
    category: 'Restaurant Floor Stewards',
    badgeType: 'steward',
    icon: '👨‍🍳',
    colorAccent: '#fbbf24',
    darkColor: '#0f172a',
    id: 'BIJAY',
    name: 'Bijay Pradhan',
    shortName: 'Bijay',
    code: 'STW-04',
    serverCode: '005',
    role: 'Banquets & Floor Steward',
    department: 'Restaurant',
    shift: 'Evening / Banquet Shift',
    phone: '+91 94370 12004',
    urlPath: '/?view=steward&staff=BIJAY',
    description: 'Scans to open Bijay Banquets Order Pad'
  },
  {
    category: 'Restaurant Floor Stewards',
    badgeType: 'steward',
    icon: '👨‍🍳',
    colorAccent: '#fbbf24',
    darkColor: '#0f172a',
    id: 'RAMESH',
    name: 'Ramesh Chandra Sethi',
    shortName: 'Ramesh',
    code: 'STW-05',
    serverCode: '006',
    role: 'Morning Breakfast Service Steward',
    department: 'Restaurant',
    shift: 'Morning Breakfast Shift',
    phone: '+91 94370 12005',
    urlPath: '/?view=steward&staff=RAMESH',
    description: 'Scans to open Ramesh Morning Order Pad'
  },
  {
    category: 'Restaurant Floor Stewards',
    badgeType: 'steward',
    icon: '👨‍🍳',
    colorAccent: '#fbbf24',
    darkColor: '#0f172a',
    id: 'SANTOSH',
    name: 'Santosh Gouda',
    shortName: 'Santosh',
    code: 'STW-06',
    serverCode: '007',
    role: 'Night Room Service Steward',
    department: 'Restaurant',
    shift: 'Night Duty Shift',
    phone: '+91 94370 12006',
    urlPath: '/?view=steward&staff=SANTOSH',
    description: 'Scans to open Santosh Night Order Pad'
  },

  // 2. Housekeeping Leadership (2 QR codes)
  {
    category: 'Housekeeping Leadership',
    badgeType: 'housekeeping',
    icon: '👩‍💼',
    colorAccent: '#10b981',
    darkColor: '#064e3b',
    id: 'HK-MGR',
    name: 'Subrat Patnaik',
    shortName: 'HK Manager',
    code: 'HK-MGR-01',
    serverCode: 'HK-01',
    role: 'Executive Housekeeper & Laundry Head',
    department: 'Housekeeping',
    shift: 'General Duty Shift',
    phone: '+91 94370 14001',
    urlPath: '/?view=housekeeping&role=MANAGER',
    description: 'Scans to open HK Manager Mobile Console & Inspection Roster'
  },
  {
    category: 'Housekeeping Leadership',
    badgeType: 'housekeeping',
    icon: '👨‍🔧',
    colorAccent: '#10b981',
    darkColor: '#064e3b',
    id: 'HK-SUP',
    name: 'Sunil Mohapatra',
    shortName: 'HK Supervisor',
    code: 'HK-SUP-01',
    serverCode: 'HK-02',
    role: 'Floor Supervisor & Linen Master',
    department: 'Housekeeping',
    shift: 'Morning Floor Shift',
    phone: '+91 94370 14002',
    urlPath: '/?view=housekeeping&role=SUPERVISOR',
    description: 'Scans to open Floor Supervisor Room Checklist & Trolley Linen Pad'
  },

  // 3. Kitchen Display System (1 QR code)
  {
    category: 'Kitchen Culinary Production',
    badgeType: 'kitchen',
    icon: '🍳',
    colorAccent: '#ef4444',
    darkColor: '#7f1d1d',
    id: 'KDS-MASTER',
    name: 'Chef Biren Mohanty',
    shortName: 'Kitchen KDS Display',
    code: 'KDS-MASTER',
    serverCode: 'KIT-01',
    role: 'Executive Chef & Kitchen Supervisor',
    department: 'Kitchen',
    shift: 'Production General Shift',
    phone: '+91 94370 13001',
    urlPath: '/?view=kds',
    description: 'Scans to mount live Kitchen Display System (KDS) & KOT chime order feed'
  }
];

export const HOUSEKEEPING_STAFF = {
  MANAGER: {
    id: 'HK-MANAGER',
    name: 'Anita Majhi',
    role: 'Housekeeping Manager',
    code: 'HK-MGR-01',
    phone: '+91 98611 52365',
    emoji: '👩‍💼',
    color: '#10b981'
  },
  SUPERVISOR: {
    id: 'HK-SUPERVISOR',
    name: 'Bikram Mohanty',
    role: 'Housekeeping Supervisor',
    code: 'HK-SUP-01',
    phone: '+91 63707 57541',
    emoji: '👨‍🔧',
    color: '#38bdf8'
  }
};

