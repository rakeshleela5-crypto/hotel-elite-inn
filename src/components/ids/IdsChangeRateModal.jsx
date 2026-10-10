import React, { useState, useEffect } from 'react';

/* =========================================================================
   VIDEO 11: HOW TO CHANGE ROOM RATE / CHANGE TARIFF IN IDS 6.5 & 7.0
   Replication of:
   1. Change Rate V6.5002.2 Dialog (Video 11 Frames 024–025 & 045)
   2. Rate Details Dialog (Video 11 Frames 028–030 & 045)
   3. Package Selection V6.5.002.1 Sub-Dialog (Video 11 Frame 032)
   4. Live persistence into Room 312 and sync with Room Rack & Guest Information
   ========================================================================= */

// Authentic 27-Room Tariff Database for Hotel Elite Inn Front Desk PMS
export const DEFAULT_ROOM_TARIFFS = {
  // Floor 1 (9 Rooms: 101 - 109)
  '101': { roomNo: '101', roomType: 'EXE', folioNo: '1', regNo: 'REG-101', arrival: 'Today 12:00', departure: 'Tomorrow 12:00', billingInstruction: '1', pax: '2 Extra Adult 0 Extra Child 0', guestName: 'Executive Guest', nationality: 'IND', guestStatus: 'REG', group: '', payMode: 'CAS', companyCode: '', companyName: '', currency: 'INR', guestClassification: 'Regular', checkOut: '12 Noon', roomUpgrade: 'EXE', plan: 'CP', rateName: 'Executive King Rate', rackRate: 2050, currentRate: 2050, doubleTariff: 2450, extraAdult: 550, extraChild: 0, mealPlanRate: 0, mealPlanAdult: 0, mealPlanChild: 0, rateTaxCode: '804', rateTaxDesc: 'SGST_CGST 12%', planTaxCode: '804', planTaxDesc: 'SGST_CGST 12%', extraBedRateTaxCode: '804', extraBedPlanTaxCode: '804', remarks: 'Floor 1 Executive King Bed', reason: '', authorizedBy: 'Manager' },
  '102': { roomNo: '102', roomType: 'DLX', folioNo: '1', regNo: 'REG-102', arrival: 'Today 12:00', departure: 'Tomorrow 12:00', billingInstruction: '1', pax: '2 Extra Adult 0 Extra Child 0', guestName: 'Sunil Mohanty', nationality: 'IND', guestStatus: 'REG', group: '', payMode: 'BTC', companyCode: 'CORP01', companyName: 'Ashok Leyland Logistics', currency: 'INR', guestClassification: 'Corporate', checkOut: '12 Noon', roomUpgrade: 'DLX', plan: 'CP', rateName: 'Deluxe King Rate', rackRate: 1750, currentRate: 1750, doubleTariff: 2250, extraAdult: 550, extraChild: 0, mealPlanRate: 0, mealPlanAdult: 0, mealPlanChild: 0, rateTaxCode: '804', rateTaxDesc: 'SGST_CGST 12%', planTaxCode: '804', planTaxDesc: 'SGST_CGST 12%', extraBedRateTaxCode: '804', extraBedPlanTaxCode: '804', remarks: 'Floor 1 Deluxe King Bed', reason: '', authorizedBy: 'Manager' },
  '103': { roomNo: '103', roomType: 'EXE', folioNo: '1', regNo: 'REG-103', arrival: 'Today 12:00', departure: 'Tomorrow 12:00', billingInstruction: '1', pax: '2 Extra Adult 0 Extra Child 0', guestName: 'Executive Guest', nationality: 'IND', guestStatus: 'WLK', group: '', payMode: 'CAS', companyCode: '', companyName: '', currency: 'INR', guestClassification: 'Regular', checkOut: '12 Noon', roomUpgrade: 'EXE', plan: 'CP', rateName: 'Executive King Rate', rackRate: 2050, currentRate: 2050, doubleTariff: 2450, extraAdult: 550, extraChild: 0, mealPlanRate: 0, mealPlanAdult: 0, mealPlanChild: 0, rateTaxCode: '804', rateTaxDesc: 'SGST_CGST 12%', planTaxCode: '804', planTaxDesc: 'SGST_CGST 12%', extraBedRateTaxCode: '804', extraBedPlanTaxCode: '804', remarks: 'Floor 1 Executive King Bed', reason: '', authorizedBy: 'Manager' },
  '104': { roomNo: '104', roomType: 'DLX', folioNo: '1', regNo: 'REG-104', arrival: 'Today 12:00', departure: 'Tomorrow 12:00', billingInstruction: '1', pax: '2 Extra Adult 0 Extra Child 0', guestName: 'Maintenance Block', nationality: 'IND', guestStatus: 'OOO', group: '', payMode: 'CAS', companyCode: '', companyName: '', currency: 'INR', guestClassification: 'Regular', checkOut: '12 Noon', roomUpgrade: 'DLX', plan: 'CP', rateName: 'Deluxe King Rate', rackRate: 1750, currentRate: 1750, doubleTariff: 2250, extraAdult: 550, extraChild: 0, mealPlanRate: 0, mealPlanAdult: 0, mealPlanChild: 0, rateTaxCode: '804', rateTaxDesc: 'SGST_CGST 12%', planTaxCode: '804', planTaxDesc: 'SGST_CGST 12%', extraBedRateTaxCode: '804', extraBedPlanTaxCode: '804', remarks: 'Floor 1 Deluxe King Bed (Under AC Service)', reason: 'Cooling Coil Servicing', authorizedBy: 'Maintenance' },
  '105': { roomNo: '105', roomType: 'EXE', folioNo: '1', regNo: 'REG-105', arrival: 'Today 12:00', departure: 'Tomorrow 12:00', billingInstruction: '1', pax: '2 Extra Adult 0 Extra Child 0', guestName: 'Ramesh Rao', nationality: 'IND', guestStatus: 'REG', group: '', payMode: 'BTC', companyCode: 'CORP02', companyName: 'Linde India Industrial Gases', currency: 'INR', guestClassification: 'Corporate', checkOut: '12 Noon', roomUpgrade: 'EXE', plan: 'CP', rateName: 'Executive Twin Rate', rackRate: 2050, currentRate: 2050, doubleTariff: 2450, extraAdult: 550, extraChild: 0, mealPlanRate: 0, mealPlanAdult: 0, mealPlanChild: 0, rateTaxCode: '804', rateTaxDesc: 'SGST_CGST 12%', planTaxCode: '804', planTaxDesc: 'SGST_CGST 12%', extraBedRateTaxCode: '804', extraBedPlanTaxCode: '804', remarks: 'Floor 1 Executive Twin Bed', reason: '', authorizedBy: 'Manager' },
  '106': { roomNo: '106', roomType: 'DLX', folioNo: '1', regNo: 'REG-106', arrival: 'Today 12:00', departure: 'Tomorrow 12:00', billingInstruction: '1', pax: '2 Extra Adult 0 Extra Child 0', guestName: 'Deluxe Guest', nationality: 'IND', guestStatus: 'WLK', group: '', payMode: 'CAS', companyCode: '', companyName: '', currency: 'INR', guestClassification: 'Regular', checkOut: '12 Noon', roomUpgrade: 'DLX', plan: 'CP', rateName: 'Deluxe King Rate', rackRate: 1750, currentRate: 1750, doubleTariff: 2250, extraAdult: 550, extraChild: 0, mealPlanRate: 0, mealPlanAdult: 0, mealPlanChild: 0, rateTaxCode: '804', rateTaxDesc: 'SGST_CGST 12%', planTaxCode: '804', planTaxDesc: 'SGST_CGST 12%', extraBedRateTaxCode: '804', extraBedPlanTaxCode: '804', remarks: 'Floor 1 Deluxe King Bed', reason: '', authorizedBy: 'Manager' },
  '107': { roomNo: '107', roomType: 'EXE', folioNo: '1', regNo: 'REG-107', arrival: 'Today 12:00', departure: 'Tomorrow 12:00', billingInstruction: '1', pax: '3 Extra Adult 0 Extra Child 0', guestName: 'Executive Guest', nationality: 'IND', guestStatus: 'DIRTY', group: '', payMode: 'CAS', companyCode: '', companyName: '', currency: 'INR', guestClassification: 'Regular', checkOut: '12 Noon', roomUpgrade: 'EXE', plan: 'CP', rateName: 'Executive Triple Rate', rackRate: 2050, currentRate: 2050, doubleTariff: 2450, extraAdult: 550, extraChild: 0, mealPlanRate: 0, mealPlanAdult: 0, mealPlanChild: 0, rateTaxCode: '804', rateTaxDesc: 'SGST_CGST 12%', planTaxCode: '804', planTaxDesc: 'SGST_CGST 12%', extraBedRateTaxCode: '804', extraBedPlanTaxCode: '804', remarks: 'Floor 1 Executive Triple Bed', reason: '', authorizedBy: 'Housekeeping' },
  '108': { roomNo: '108', roomType: 'STD', folioNo: '1', regNo: 'REG-108', arrival: 'Today 12:00', departure: 'Tomorrow 12:00', billingInstruction: '1', pax: '1 Extra Adult 0 Extra Child 0', guestName: 'Standard Guest', nationality: 'IND', guestStatus: 'WLK', group: '', payMode: 'CAS', companyCode: '', companyName: '', currency: 'INR', guestClassification: 'Regular', checkOut: '12 Noon', roomUpgrade: 'STD', plan: 'CP', rateName: 'Standard Single Rate', rackRate: 1450, currentRate: 1450, doubleTariff: 1450, extraAdult: 550, extraChild: 0, mealPlanRate: 0, mealPlanAdult: 0, mealPlanChild: 0, rateTaxCode: '804', rateTaxDesc: 'SGST_CGST 12%', planTaxCode: '804', planTaxDesc: 'SGST_CGST 12%', extraBedRateTaxCode: '804', extraBedPlanTaxCode: '804', remarks: 'Floor 1 Standard Single Bed', reason: '', authorizedBy: 'Manager' },
  '109': { roomNo: '109', roomType: 'SUI', folioNo: '1', regNo: 'REG-109', arrival: 'Today 12:00', departure: 'Tomorrow 12:00', billingInstruction: '1', pax: '2 Extra Adult 0 Extra Child 0', guestName: 'Suite Guest', nationality: 'IND', guestStatus: 'WLK', group: '', payMode: 'CAS', companyCode: '', companyName: '', currency: 'INR', guestClassification: 'VIP', checkOut: '12 Noon', roomUpgrade: 'SUI', plan: 'CP', rateName: 'Suite King Rate', rackRate: 3250, currentRate: 3250, doubleTariff: 3850, extraAdult: 550, extraChild: 0, mealPlanRate: 0, mealPlanAdult: 0, mealPlanChild: 0, rateTaxCode: '804', rateTaxDesc: 'SGST_CGST 12%', planTaxCode: '804', planTaxDesc: 'SGST_CGST 12%', extraBedRateTaxCode: '804', extraBedPlanTaxCode: '804', remarks: 'Floor 1 Premium Suite King Bed', reason: '', authorizedBy: 'Manager' },

  // Floor 2 (9 Rooms: 201 - 209)
  '201': { roomNo: '201', roomType: 'EXE', folioNo: '1', regNo: 'REG-201', arrival: 'Today 12:00', departure: 'Tomorrow 12:00', billingInstruction: '1', pax: '2 Extra Adult 0 Extra Child 0', guestName: 'Executive Guest', nationality: 'IND', guestStatus: 'WLK', group: '', payMode: 'CAS', companyCode: '', companyName: '', currency: 'INR', guestClassification: 'Regular', checkOut: '12 Noon', roomUpgrade: 'EXE', plan: 'CP', rateName: 'Executive King Rate', rackRate: 2050, currentRate: 2050, doubleTariff: 2450, extraAdult: 550, extraChild: 0, mealPlanRate: 0, mealPlanAdult: 0, mealPlanChild: 0, rateTaxCode: '804', rateTaxDesc: 'SGST_CGST 12%', planTaxCode: '804', planTaxDesc: 'SGST_CGST 12%', extraBedRateTaxCode: '804', extraBedPlanTaxCode: '804', remarks: 'Floor 2 Executive King Bed', reason: '', authorizedBy: 'Manager' },
  '202': { roomNo: '202', roomType: 'DLX', folioNo: '1', regNo: 'REG-202', arrival: 'Today 12:00', departure: 'Tomorrow 12:00', billingInstruction: '1', pax: '2 Extra Adult 0 Extra Child 0', guestName: 'Deluxe Guest', nationality: 'IND', guestStatus: 'WLK', group: '', payMode: 'CAS', companyCode: '', companyName: '', currency: 'INR', guestClassification: 'Regular', checkOut: '12 Noon', roomUpgrade: 'DLX', plan: 'CP', rateName: 'Deluxe King Rate', rackRate: 1750, currentRate: 1750, doubleTariff: 2250, extraAdult: 550, extraChild: 0, mealPlanRate: 0, mealPlanAdult: 0, mealPlanChild: 0, rateTaxCode: '804', rateTaxDesc: 'SGST_CGST 12%', planTaxCode: '804', planTaxDesc: 'SGST_CGST 12%', extraBedRateTaxCode: '804', extraBedPlanTaxCode: '804', remarks: 'Floor 2 Deluxe King Bed', reason: '', authorizedBy: 'Manager' },
  '203': { roomNo: '203', roomType: 'EXE', folioNo: '1', regNo: 'REG-203', arrival: 'Today 12:00', departure: 'Tomorrow 12:00', billingInstruction: '1', pax: '2 Extra Adult 0 Extra Child 0', guestName: 'P. K. Verma', nationality: 'IND', guestStatus: 'REG', group: '', payMode: 'BTC', companyCode: 'CORP03', companyName: 'Utkal Alumina Int. Ltd (Aditya Birla)', currency: 'INR', guestClassification: 'Corporate', checkOut: '12 Noon', roomUpgrade: 'EXE', plan: 'CP', rateName: 'Executive King Rate', rackRate: 2050, currentRate: 2050, doubleTariff: 2450, extraAdult: 550, extraChild: 0, mealPlanRate: 0, mealPlanAdult: 0, mealPlanChild: 0, rateTaxCode: '804', rateTaxDesc: 'SGST_CGST 12%', planTaxCode: '804', planTaxDesc: 'SGST_CGST 12%', extraBedRateTaxCode: '804', extraBedPlanTaxCode: '804', remarks: 'Floor 2 Executive King Bed', reason: '', authorizedBy: 'Manager' },
  '204': { roomNo: '204', roomType: 'DLX', folioNo: '1', regNo: 'REG-204', arrival: 'Today 12:00', departure: 'Tomorrow 12:00', billingInstruction: '1', pax: '2 Extra Adult 0 Extra Child 0', guestName: 'Deluxe Guest', nationality: 'IND', guestStatus: 'WLK', group: '', payMode: 'CAS', companyCode: '', companyName: '', currency: 'INR', guestClassification: 'Regular', checkOut: '12 Noon', roomUpgrade: 'DLX', plan: 'CP', rateName: 'Deluxe King Rate', rackRate: 1750, currentRate: 1750, doubleTariff: 2250, extraAdult: 550, extraChild: 0, mealPlanRate: 0, mealPlanAdult: 0, mealPlanChild: 0, rateTaxCode: '804', rateTaxDesc: 'SGST_CGST 12%', planTaxCode: '804', planTaxDesc: 'SGST_CGST 12%', extraBedRateTaxCode: '804', extraBedPlanTaxCode: '804', remarks: 'Floor 2 Deluxe King Bed', reason: '', authorizedBy: 'Manager' },
  '205': { roomNo: '205', roomType: 'EXE', folioNo: '1', regNo: 'REG-205', arrival: 'Today 12:00', departure: 'Tomorrow 12:00', billingInstruction: '1', pax: '2 Extra Adult 0 Extra Child 0', guestName: 'Executive Guest', nationality: 'IND', guestStatus: 'WLK', group: '', payMode: 'CAS', companyCode: '', companyName: '', currency: 'INR', guestClassification: 'Regular', checkOut: '12 Noon', roomUpgrade: 'EXE', plan: 'CP', rateName: 'Executive Twin Rate', rackRate: 2050, currentRate: 2050, doubleTariff: 2450, extraAdult: 550, extraChild: 0, mealPlanRate: 0, mealPlanAdult: 0, mealPlanChild: 0, rateTaxCode: '804', rateTaxDesc: 'SGST_CGST 12%', planTaxCode: '804', planTaxDesc: 'SGST_CGST 12%', extraBedRateTaxCode: '804', extraBedPlanTaxCode: '804', remarks: 'Floor 2 Executive Twin Bed', reason: '', authorizedBy: 'Manager' },
  '206': { roomNo: '206', roomType: 'DLX', folioNo: '1', regNo: 'REG-206', arrival: 'Today 12:00', departure: 'Tomorrow 12:00', billingInstruction: '1', pax: '2 Extra Adult 0 Extra Child 0', guestName: 'Corporate Guest', nationality: 'IND', guestStatus: 'REG', group: '', payMode: 'BTC', companyCode: 'CORP04', companyName: 'JK Paper Mills Ltd (Rayagada)', currency: 'INR', guestClassification: 'Corporate', checkOut: '12 Noon', roomUpgrade: 'DLX', plan: 'CP', rateName: 'Deluxe King Rate', rackRate: 1750, currentRate: 1750, doubleTariff: 2250, extraAdult: 550, extraChild: 0, mealPlanRate: 0, mealPlanAdult: 0, mealPlanChild: 0, rateTaxCode: '804', rateTaxDesc: 'SGST_CGST 12%', planTaxCode: '804', planTaxDesc: 'SGST_CGST 12%', extraBedRateTaxCode: '804', extraBedPlanTaxCode: '804', remarks: 'Floor 2 Deluxe King Bed', reason: '', authorizedBy: 'Manager' },
  '207': { roomNo: '207', roomType: 'EXE', folioNo: '1', regNo: 'REG-207', arrival: 'Today 12:00', departure: 'Tomorrow 12:00', billingInstruction: '1', pax: '3 Extra Adult 0 Extra Child 0', guestName: 'Executive Guest', nationality: 'IND', guestStatus: 'DIRTY', group: '', payMode: 'CAS', companyCode: '', companyName: '', currency: 'INR', guestClassification: 'Regular', checkOut: '12 Noon', roomUpgrade: 'EXE', plan: 'CP', rateName: 'Executive Triple Rate', rackRate: 2050, currentRate: 2050, doubleTariff: 2450, extraAdult: 550, extraChild: 0, mealPlanRate: 0, mealPlanAdult: 0, mealPlanChild: 0, rateTaxCode: '804', rateTaxDesc: 'SGST_CGST 12%', planTaxCode: '804', planTaxDesc: 'SGST_CGST 12%', extraBedRateTaxCode: '804', extraBedPlanTaxCode: '804', remarks: 'Floor 2 Executive Triple Bed (Geyser Inspection)', reason: '', authorizedBy: 'Housekeeping' },
  '208': { roomNo: '208', roomType: 'STD', folioNo: '1', regNo: 'REG-208', arrival: 'Today 12:00', departure: 'Tomorrow 12:00', billingInstruction: '1', pax: '1 Extra Adult 0 Extra Child 0', guestName: 'Standard Guest', nationality: 'IND', guestStatus: 'WLK', group: '', payMode: 'CAS', companyCode: '', companyName: '', currency: 'INR', guestClassification: 'Regular', checkOut: '12 Noon', roomUpgrade: 'STD', plan: 'CP', rateName: 'Standard Single Rate', rackRate: 1450, currentRate: 1450, doubleTariff: 1450, extraAdult: 550, extraChild: 0, mealPlanRate: 0, mealPlanAdult: 0, mealPlanChild: 0, rateTaxCode: '804', rateTaxDesc: 'SGST_CGST 12%', planTaxCode: '804', planTaxDesc: 'SGST_CGST 12%', extraBedRateTaxCode: '804', extraBedPlanTaxCode: '804', remarks: 'Floor 2 Standard Single Bed', reason: '', authorizedBy: 'Manager' },
  '209': { roomNo: '209', roomType: 'SUI', folioNo: '1', regNo: 'REG-209', arrival: 'Today 12:00', departure: 'Tomorrow 12:00', billingInstruction: '1', pax: '2 Extra Adult 0 Extra Child 0', guestName: 'Suite Guest', nationality: 'IND', guestStatus: 'WLK', group: '', payMode: 'CAS', companyCode: '', companyName: '', currency: 'INR', guestClassification: 'VIP', checkOut: '12 Noon', roomUpgrade: 'SUI', plan: 'CP', rateName: 'Suite King Rate', rackRate: 3250, currentRate: 3250, doubleTariff: 3850, extraAdult: 550, extraChild: 0, mealPlanRate: 0, mealPlanAdult: 0, mealPlanChild: 0, rateTaxCode: '804', rateTaxDesc: 'SGST_CGST 12%', planTaxCode: '804', planTaxDesc: 'SGST_CGST 12%', extraBedRateTaxCode: '804', extraBedPlanTaxCode: '804', remarks: 'Floor 2 Premium Suite King Bed', reason: '', authorizedBy: 'Manager' },

  // Floor 3 (9 Rooms: 301 - 309)
  '301': { roomNo: '301', roomType: 'EXE', folioNo: '1', regNo: 'REG-301', arrival: 'Today 12:00', departure: 'Tomorrow 12:00', billingInstruction: '1', pax: '2 Extra Adult 0 Extra Child 0', guestName: 'Rajesh Sharma', nationality: 'IND', guestStatus: 'REG', group: '', payMode: 'CAS', companyCode: '', companyName: '', currency: 'INR', guestClassification: 'Regular', checkOut: '12 Noon', roomUpgrade: 'EXE', plan: 'CP', rateName: 'Executive King Rate', rackRate: 2050, currentRate: 2050, doubleTariff: 2450, extraAdult: 550, extraChild: 0, mealPlanRate: 0, mealPlanAdult: 0, mealPlanChild: 0, rateTaxCode: '804', rateTaxDesc: 'SGST_CGST 12%', planTaxCode: '804', planTaxDesc: 'SGST_CGST 12%', extraBedRateTaxCode: '804', extraBedPlanTaxCode: '804', remarks: 'Floor 3 Executive King Bed', reason: '', authorizedBy: 'Manager' },
  '302': { roomNo: '302', roomType: 'EXE', folioNo: '1', regNo: 'REG-302', arrival: 'Today 12:00', departure: 'Tomorrow 12:00', billingInstruction: '1', pax: '2 Extra Adult 0 Extra Child 0', guestName: 'Executive Guest', nationality: 'IND', guestStatus: 'WLK', group: '', payMode: 'CAS', companyCode: '', companyName: '', currency: 'INR', guestClassification: 'Regular', checkOut: '12 Noon', roomUpgrade: 'EXE', plan: 'CP', rateName: 'Executive King Rate', rackRate: 2050, currentRate: 2050, doubleTariff: 2450, extraAdult: 550, extraChild: 0, mealPlanRate: 0, mealPlanAdult: 0, mealPlanChild: 0, rateTaxCode: '804', rateTaxDesc: 'SGST_CGST 12%', planTaxCode: '804', planTaxDesc: 'SGST_CGST 12%', extraBedRateTaxCode: '804', extraBedPlanTaxCode: '804', remarks: 'Floor 3 Executive King Bed', reason: '', authorizedBy: 'Manager' },
  '303': { roomNo: '303', roomType: 'EXE', folioNo: '1', regNo: 'REG-303', arrival: 'Today 12:00', departure: 'Tomorrow 12:00', billingInstruction: '1', pax: '2 Extra Adult 0 Extra Child 0', guestName: 'Prakash Jena', nationality: 'IND', guestStatus: 'REG', group: '', payMode: 'CAS', companyCode: '', companyName: '', currency: 'INR', guestClassification: 'Regular', checkOut: '12 Noon', roomUpgrade: 'EXE', plan: 'CP', rateName: 'Executive King Rate', rackRate: 2050, currentRate: 2050, doubleTariff: 2450, extraAdult: 550, extraChild: 0, mealPlanRate: 0, mealPlanAdult: 0, mealPlanChild: 0, rateTaxCode: '804', rateTaxDesc: 'SGST_CGST 12%', planTaxCode: '804', planTaxDesc: 'SGST_CGST 12%', extraBedRateTaxCode: '804', extraBedPlanTaxCode: '804', remarks: 'Floor 3 Executive King Bed', reason: '', authorizedBy: 'Manager' },
  '304': { roomNo: '304', roomType: 'EXE', folioNo: '1', regNo: 'REG-304', arrival: 'Today 12:00', departure: 'Tomorrow 12:00', billingInstruction: '1', pax: '2 Extra Adult 0 Extra Child 0', guestName: 'Executive Guest', nationality: 'IND', guestStatus: 'WLK', group: '', payMode: 'CAS', companyCode: '', companyName: '', currency: 'INR', guestClassification: 'Regular', checkOut: '12 Noon', roomUpgrade: 'EXE', plan: 'CP', rateName: 'Executive King Rate', rackRate: 2050, currentRate: 2050, doubleTariff: 2450, extraAdult: 550, extraChild: 0, mealPlanRate: 0, mealPlanAdult: 0, mealPlanChild: 0, rateTaxCode: '804', rateTaxDesc: 'SGST_CGST 12%', planTaxCode: '804', planTaxDesc: 'SGST_CGST 12%', extraBedRateTaxCode: '804', extraBedPlanTaxCode: '804', remarks: 'Floor 3 Executive King Bed', reason: '', authorizedBy: 'Manager' },
  '305': { roomNo: '305', roomType: 'EXE', folioNo: '1', regNo: 'REG-305', arrival: 'Today 12:00', departure: 'Tomorrow 12:00', billingInstruction: '1', pax: '2 Extra Adult 0 Extra Child 0', guestName: 'Executive Guest', nationality: 'IND', guestStatus: 'WLK', group: '', payMode: 'CAS', companyCode: '', companyName: '', currency: 'INR', guestClassification: 'Regular', checkOut: '12 Noon', roomUpgrade: 'EXE', plan: 'CP', rateName: 'Executive King Rate', rackRate: 2050, currentRate: 2050, doubleTariff: 2450, extraAdult: 550, extraChild: 0, mealPlanRate: 0, mealPlanAdult: 0, mealPlanChild: 0, rateTaxCode: '804', rateTaxDesc: 'SGST_CGST 12%', planTaxCode: '804', planTaxDesc: 'SGST_CGST 12%', extraBedRateTaxCode: '804', extraBedPlanTaxCode: '804', remarks: 'Floor 3 Executive King Bed', reason: '', authorizedBy: 'Manager' },
  '306': { roomNo: '306', roomType: 'EXE', folioNo: '1', regNo: 'REG-306', arrival: 'Today 12:00', departure: 'Tomorrow 12:00', billingInstruction: '1', pax: '2 Extra Adult 0 Extra Child 0', guestName: 'Executive Guest', nationality: 'IND', guestStatus: 'WLK', group: '', payMode: 'CAS', companyCode: '', companyName: '', currency: 'INR', guestClassification: 'Regular', checkOut: '12 Noon', roomUpgrade: 'EXE', plan: 'CP', rateName: 'Executive King Rate', rackRate: 2050, currentRate: 2050, doubleTariff: 2450, extraAdult: 550, extraChild: 0, mealPlanRate: 0, mealPlanAdult: 0, mealPlanChild: 0, rateTaxCode: '804', rateTaxDesc: 'SGST_CGST 12%', planTaxCode: '804', planTaxDesc: 'SGST_CGST 12%', extraBedRateTaxCode: '804', extraBedPlanTaxCode: '804', remarks: 'Floor 3 Executive King Bed', reason: '', authorizedBy: 'Manager' },
  '307': { roomNo: '307', roomType: 'EXE', folioNo: '1', regNo: 'REG-307', arrival: 'Today 12:00', departure: 'Tomorrow 12:00', billingInstruction: '1', pax: '2 Extra Adult 0 Extra Child 0', guestName: 'Executive Guest', nationality: 'IND', guestStatus: 'WLK', group: '', payMode: 'CAS', companyCode: '', companyName: '', currency: 'INR', guestClassification: 'Regular', checkOut: '12 Noon', roomUpgrade: 'EXE', plan: 'CP', rateName: 'Executive King Rate', rackRate: 2050, currentRate: 2050, doubleTariff: 2450, extraAdult: 550, extraChild: 0, mealPlanRate: 0, mealPlanAdult: 0, mealPlanChild: 0, rateTaxCode: '804', rateTaxDesc: 'SGST_CGST 12%', planTaxCode: '804', planTaxDesc: 'SGST_CGST 12%', extraBedRateTaxCode: '804', extraBedPlanTaxCode: '804', remarks: 'Floor 3 Executive King Bed', reason: '', authorizedBy: 'Manager' },
  '308': { roomNo: '308', roomType: 'EXE', folioNo: '1', regNo: 'REG-308', arrival: 'Today 12:00', departure: 'Tomorrow 12:00', billingInstruction: '1', pax: '2 Extra Adult 0 Extra Child 0', guestName: 'Executive Guest', nationality: 'IND', guestStatus: 'WLK', group: '', payMode: 'CAS', companyCode: '', companyName: '', currency: 'INR', guestClassification: 'Regular', checkOut: '12 Noon', roomUpgrade: 'EXE', plan: 'CP', rateName: 'Executive King Rate', rackRate: 2050, currentRate: 2050, doubleTariff: 2450, extraAdult: 550, extraChild: 0, mealPlanRate: 0, mealPlanAdult: 0, mealPlanChild: 0, rateTaxCode: '804', rateTaxDesc: 'SGST_CGST 12%', planTaxCode: '804', planTaxDesc: 'SGST_CGST 12%', extraBedRateTaxCode: '804', extraBedPlanTaxCode: '804', remarks: 'Floor 3 Executive King Bed', reason: '', authorizedBy: 'Manager' },
  '309': { roomNo: '309', roomType: 'PRM', folioNo: '1', regNo: 'REG-309', arrival: 'Today 12:00', departure: 'Tomorrow 12:00', billingInstruction: '1', pax: '2 Extra Adult 0 Extra Child 0', guestName: 'Premium Guest', nationality: 'IND', guestStatus: 'WLK', group: '', payMode: 'CAS', companyCode: '', companyName: '', currency: 'INR', guestClassification: 'VIP', checkOut: '12 Noon', roomUpgrade: 'PRM', plan: 'CP', rateName: 'Premium King Rate', rackRate: 2450, currentRate: 2450, doubleTariff: 2850, extraAdult: 550, extraChild: 0, mealPlanRate: 0, mealPlanAdult: 0, mealPlanChild: 0, rateTaxCode: '804', rateTaxDesc: 'SGST_CGST 12%', planTaxCode: '804', planTaxDesc: 'SGST_CGST 12%', extraBedRateTaxCode: '804', extraBedPlanTaxCode: '804', remarks: 'Floor 3 Premium King Bed', reason: '', authorizedBy: 'Manager' }
};

/* =========================================================================
   1. PACKAGE SELECTION V6.5.002.1 SUB-MODAL (Video 11 Frame 032)
   ========================================================================= */
export function IdsPackageSelectionModal({ isOpen, onClose }) {
  const [exclusivelyTariff, setExclusivelyTariff] = useState(true);
  const [inclusivePackages, setInclusivePackages] = useState(false);
  const [planInclusiveTax, setPlanInclusiveTax] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1350 }}>
      <div 
        className="ids-dialog-window" 
        style={{ width: '480px', maxWidth: '96vw', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', background: '#ECE9D8' }}
      >
        <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '11px' }}>Package Selection V6.5.002.1</span>
          <button className="ids-win-btn close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '8px 10px', fontSize: '11px' }}>
          <div style={{ marginBottom: '6px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '4px' }}>
              <input 
                type="checkbox" 
                checked={exclusivelyTariff} 
                onChange={(e) => {
                  setExclusivelyTariff(e.target.checked);
                  if (e.target.checked) setInclusivePackages(false);
                }} 
              />
              <span style={{ fontWeight: 600 }}>Tariff Amount is Exclusively for Tariff</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={inclusivePackages} 
                onChange={(e) => {
                  setInclusivePackages(e.target.checked);
                  if (e.target.checked) setExclusivelyTariff(false);
                }} 
              />
              <span>Tariff Amount is Inclusive of Both Packages</span>
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            {/* Room Package Box */}
            <div className="ids-groupbox">
              <span className="ids-groupbox-title">Room Package</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '4px 2px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><input type="checkbox" /> <span>Rate</span></label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><input type="checkbox" /> <span>Rate Taxes</span></label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><input type="checkbox" /> <span>Plan</span></label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><input type="checkbox" /> <span>Plan Taxes</span></label>
              </div>
            </div>

            {/* Extra Bed Package Box */}
            <div className="ids-groupbox">
              <span className="ids-groupbox-title">Extra Bed Package</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '4px 2px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><input type="checkbox" /> <span>Rate</span></label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><input type="checkbox" /> <span>Rate Taxes</span></label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><input type="checkbox" /> <span>Plan</span></label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><input type="checkbox" /> <span>Plan Taxes</span></label>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={planInclusiveTax} 
                onChange={(e) => setPlanInclusiveTax(e.target.checked)} 
              />
              <span>Plan Amount is Inclusive of Plan Taxes</span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
            <button className="ids-btn-classic" style={{ minWidth: '60px', fontWeight: 700 }} onClick={onClose}>Ok</button>
            <button className="ids-btn-classic" style={{ minWidth: '60px' }} onClick={onClose}>Exit</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   2. RATE DETAILS MODAL (Video 11 Frames 028–030 & 045)
   ========================================================================= */
export function IdsRateDetailsModal({
  isOpen,
  onClose,
  tariffData,
  onSaveRateDetails
}) {
  const [newCharge, setNewCharge] = useState(tariffData?.currentRate === 3500 ? '2,500.00' : `${tariffData?.currentRate || 3500}.00`);
  const [extraBedAdult, setExtraBedAdult] = useState('1,000.00');
  const [extraBedChild, setExtraBedChild] = useState('0.00');
  const [remarks, setRemarks] = useState(tariffData?.remarks || 'Corporate discount applied');
  const [reason, setReason] = useState(tariffData?.reason || 'Manager Special Approval');
  const [authorizedBy, setAuthorizedBy] = useState(tariffData?.authorizedBy || 'Manager');
  const [packageSelectionOpen, setPackageSelectionOpen] = useState(false);

  useEffect(() => {
    if (tariffData) {
      if (tariffData.currentRate === 3500) {
        setNewCharge('2,500.00'); // Video 11 Frame 030 exact override demonstration
      } else {
        setNewCharge(`${tariffData.currentRate.toFixed(2)}`);
      }
      setRemarks(tariffData.remarks || 'Corporate discount applied');
      setReason(tariffData.reason || 'Manager Special Approval');
      setAuthorizedBy(tariffData.authorizedBy || 'Manager');
    }
  }, [tariffData, isOpen]);

  if (!isOpen || !tariffData) return null;

  const handleSave = () => {
    const parsedRate = parseFloat(newCharge.replace(/,/g, '')) || 2500;
    if (onSaveRateDetails) {
      onSaveRateDetails({
        roomNo: tariffData.roomNo,
        newRate: parsedRate,
        extraAdult: parseFloat(extraBedAdult.replace(/,/g, '')) || 1000,
        extraChild: parseFloat(extraBedChild.replace(/,/g, '')) || 0,
        remarks,
        reason,
        authorizedBy
      });
    }
    onClose();
  };

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1300 }}>
      <div 
        className="ids-dialog-window" 
        style={{ width: '680px', maxWidth: '96vw', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', background: '#ECE9D8' }}
      >
        <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '11px' }}>Rate Details</span>
          <button className="ids-win-btn close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '8px 10px', fontSize: '11px' }}>
          {/* Existing Rate Box (Frame 028) */}
          <div className="ids-groupbox" style={{ marginBottom: '8px' }}>
            <span className="ids-groupbox-title">Existing Rate</span>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', background: '#FFF' }}>
              <thead style={{ background: '#ECE9D8' }}>
                <tr>
                  <th style={{ width: '70px', border: '1px solid #CCC', padding: '2px 4px' }}></th>
                  <th style={{ border: '1px solid #CCC', padding: '2px 4px', textAlign: 'right' }}>Charge</th>
                  <th style={{ border: '1px solid #CCC', padding: '2px 4px', textAlign: 'right' }}>Extra Adult</th>
                  <th style={{ border: '1px solid #CCC', padding: '2px 4px', textAlign: 'right' }}>Extra Child</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #CCC', padding: '2px 4px', fontWeight: 600 }}>Rate</td>
                  <td style={{ border: '1px solid #CCC', padding: '2px 4px', textAlign: 'right', fontWeight: 700, color: '#0A246A' }}>
                    {tariffData.currentRate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ border: '1px solid #CCC', padding: '2px 4px', textAlign: 'right' }}>
                    {tariffData.extraAdult.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ border: '1px solid #CCC', padding: '2px 4px', textAlign: 'right' }}>
                    {tariffData.extraChild.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #CCC', padding: '2px 4px', fontWeight: 600 }}>Plan</td>
                  <td style={{ border: '1px solid #CCC', padding: '2px 4px', textAlign: 'right' }}>0.00</td>
                  <td style={{ border: '1px solid #CCC', padding: '2px 4px', textAlign: 'right' }}>0.00</td>
                  <td style={{ border: '1px solid #CCC', padding: '2px 4px', textAlign: 'right' }}>0.00</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Middle Parameter Fields (Frame 028) */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 90px 1fr', gap: '4px', alignItems: 'center' }}>
              <span>Plan</span>
              <div style={{ display: 'flex', gap: '2px' }}>
                <input className="ids-input" value={tariffData.plan} readOnly style={{ width: '45px', background: '#EBEBE4' }} />
              </div>

              <span>Currency Code</span>
              <input className="ids-input" value={tariffData.currency} readOnly style={{ width: '45px', background: '#EBEBE4' }} />

              <span>Rate / Rack ID</span>
              <div style={{ display: 'flex', gap: '2px' }}>
                <input className="ids-input" defaultValue="1" style={{ width: '35px' }} />
                <button className="ids-btn-classic" style={{ padding: '0 4px' }}>?</button>
              </div>

              <span>Total Pax</span>
              <input className="ids-input" defaultValue="2" style={{ width: '35px' }} />

              <span>Discount</span>
              <input className="ids-input" defaultValue="0" style={{ width: '45px' }} />

              <span>Extra Adult</span>
              <input className="ids-input" defaultValue="0" style={{ width: '35px' }} />

              <span></span>
              <span></span>

              <span>Extra Child</span>
              <input className="ids-input" defaultValue="0" style={{ width: '35px' }} />
            </div>

            {/* Quick Action Badges matching Frame 028 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'center', alignItems: 'center', background: '#ECE9D8', border: '1px solid #CCC', padding: '6px' }}>
              <button 
                className="ids-btn-classic" 
                style={{ width: '90px', padding: '4px', fontWeight: 700, background: '#D9D3B8' }}
                onClick={() => setNewCharge('2,500.00')}
                title="Apply standard discounted rate (Video 11)"
              >
                Discount
              </button>
              <button className="ids-btn-classic" style={{ width: '90px', padding: '4px' }}>
                Revenue
              </button>
            </div>
          </div>

          {/* New Rate Editable Grid (Frame 030) */}
          <div style={{ marginBottom: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', background: '#FFF' }}>
              <thead style={{ background: '#ECE9D8' }}>
                <tr>
                  <th style={{ width: '140px', border: '1px solid #CCC', padding: '2px 4px' }}></th>
                  <th style={{ border: '1px solid #CCC', padding: '2px 4px', textAlign: 'right' }}>Rate</th>
                  <th style={{ border: '1px solid #CCC', padding: '2px 4px', textAlign: 'right' }}>Plan</th>
                  <th style={{ width: '220px', border: '1px solid #CCC', padding: '2px 4px', textAlign: 'left' }}>Tax Slab / Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #CCC', padding: '2px 4px', fontWeight: 700 }}>Charge</td>
                  <td style={{ border: '1px solid #CCC', padding: '2px 4px', textAlign: 'right' }}>
                    <input 
                      className="ids-input" 
                      value={newCharge} 
                      onChange={(e) => setNewCharge(e.target.value)}
                      style={{ textAlign: 'right', fontWeight: 700, color: '#900', background: '#FFF7CC', width: '100px' }} 
                      title="Enter new rate (Video 11 Frame 030 enters 2500.00)"
                    />
                  </td>
                  <td style={{ border: '1px solid #CCC', padding: '2px 4px', textAlign: 'right' }}>
                    <input className="ids-input" defaultValue="0.00" readOnly style={{ textAlign: 'right', width: '70px', background: '#EBEBE4' }} />
                  </td>
                  <td style={{ border: '1px solid #CCC', padding: '2px 4px', color: '#555' }}>
                    * Direct Tariff Override
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #CCC', padding: '2px 4px' }}>Extra Bed Adult</td>
                  <td style={{ border: '1px solid #CCC', padding: '2px 4px', textAlign: 'right' }}>
                    <input 
                      className="ids-input" 
                      value={extraBedAdult} 
                      onChange={(e) => setExtraBedAdult(e.target.value)}
                      style={{ textAlign: 'right', width: '100px' }} 
                    />
                  </td>
                  <td style={{ border: '1px solid #CCC', padding: '2px 4px', textAlign: 'right' }}>
                    <input className="ids-input" defaultValue="0.00" readOnly style={{ textAlign: 'right', width: '70px', background: '#EBEBE4' }} />
                  </td>
                  <td style={{ border: '1px solid #CCC', padding: '2px 4px' }}></td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #CCC', padding: '2px 4px' }}>Extra Bed Child</td>
                  <td style={{ border: '1px solid #CCC', padding: '2px 4px', textAlign: 'right' }}>
                    <input 
                      className="ids-input" 
                      value={extraBedChild} 
                      onChange={(e) => setExtraBedChild(e.target.value)}
                      style={{ textAlign: 'right', width: '100px' }} 
                    />
                  </td>
                  <td style={{ border: '1px solid #CCC', padding: '2px 4px', textAlign: 'right' }}>
                    <input className="ids-input" defaultValue="0.00" readOnly style={{ textAlign: 'right', width: '70px', background: '#EBEBE4' }} />
                  </td>
                  <td style={{ border: '1px solid #CCC', padding: '2px 4px' }}></td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #CCC', padding: '2px 4px' }}>Rate Tax</td>
                  <td style={{ border: '1px solid #CCC', padding: '2px 4px', textAlign: 'right' }}>
                    <span style={{ fontWeight: 600 }}>798</span>
                    <button className="ids-btn-classic" style={{ marginLeft: '4px', padding: '0 3px' }}>?</button>
                  </td>
                  <td style={{ border: '1px solid #CCC', padding: '2px 4px' }}></td>
                  <td style={{ border: '1px solid #CCC', padding: '2px 4px', color: '#0A246A', fontWeight: 600 }}>Oct New Tax Slab</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #CCC', padding: '2px 4px' }}>Plan Tax</td>
                  <td style={{ border: '1px solid #CCC', padding: '2px 4px', textAlign: 'right' }}>
                    <span style={{ fontWeight: 600 }}>804</span>
                    <button className="ids-btn-classic" style={{ marginLeft: '4px', padding: '0 3px' }}>?</button>
                  </td>
                  <td style={{ border: '1px solid #CCC', padding: '2px 4px' }}></td>
                  <td style={{ border: '1px solid #CCC', padding: '2px 4px', color: '#0A246A' }}>SGST_CGST 12%</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #CCC', padding: '2px 4px' }}>Extra Bed Rate Tax</td>
                  <td style={{ border: '1px solid #CCC', padding: '2px 4px', textAlign: 'right' }}>
                    <span style={{ fontWeight: 600 }}>804</span>
                    <button className="ids-btn-classic" style={{ marginLeft: '4px', padding: '0 3px' }}>?</button>
                  </td>
                  <td style={{ border: '1px solid #CCC', padding: '2px 4px' }}></td>
                  <td style={{ border: '1px solid #CCC', padding: '2px 4px', color: '#0A246A' }}>SGST_CGST 12%</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #CCC', padding: '2px 4px' }}>Extra Bed Plan Tax</td>
                  <td style={{ border: '1px solid #CCC', padding: '2px 4px', textAlign: 'right' }}>
                    <span style={{ fontWeight: 600 }}>804</span>
                    <button className="ids-btn-classic" style={{ marginLeft: '4px', padding: '0 3px' }}>?</button>
                  </td>
                  <td style={{ border: '1px solid #CCC', padding: '2px 4px' }}></td>
                  <td style={{ border: '1px solid #CCC', padding: '2px 4px', color: '#0A246A' }}>SGST_CGST 12%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Remarks, Reason, Authorized By (Frame 030) */}
          <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr 90px 120px', gap: '4px', alignItems: 'center', marginBottom: '10px' }}>
            <span>Remarks</span>
            <input className="ids-input" value={remarks} onChange={(e) => setRemarks(e.target.value)} />

            <span>Authorized By</span>
            <input className="ids-input" value={authorizedBy} onChange={(e) => setAuthorizedBy(e.target.value)} />

            <span>Reason</span>
            <input className="ids-input" value={reason} onChange={(e) => setReason(e.target.value)} style={{ gridColumn: '2 / 5' }} />
          </div>

          {/* Bottom Control Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
            <button 
              className="ids-btn-classic" 
              style={{ minWidth: '60px' }}
              onClick={() => setPackageSelectionOpen(true)}
            >
              Package
            </button>
            <button 
              className="ids-btn-classic" 
              style={{ minWidth: '60px', fontWeight: 700 }}
              onClick={handleSave}
            >
              Save
            </button>
            <button 
              className="ids-btn-classic" 
              style={{ minWidth: '60px' }}
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <IdsPackageSelectionModal 
        isOpen={packageSelectionOpen}
        onClose={() => setPackageSelectionOpen(false)}
      />
    </div>
  );
}

/* =========================================================================
   3. CHANGE RATE V6.5002.2 MAIN DIALOG (Video 11 Frames 024–025 & 045)
   ========================================================================= */
export default function IdsChangeRateModal({
  isOpen,
  onClose,
  initialRoomNo = '101',
  roomTariffs = DEFAULT_ROOM_TARIFFS,
  onSaveTariffChange,
  onOpenRoomHelpLookup
}) {
  const [selectedRoom, setSelectedRoom] = useState(initialRoomNo);
  const [tariffData, setTariffData] = useState(roomTariffs[initialRoomNo] || roomTariffs['101']);
  const [rateDetailsOpen, setRateDetailsOpen] = useState(false);
  const [packageSelectionOpen, setPackageSelectionOpen] = useState(false);
  const [isSavedFlash, setIsSavedFlash] = useState(false);

  useEffect(() => {
    if (initialRoomNo && roomTariffs[initialRoomNo]) {
      setSelectedRoom(initialRoomNo);
      setTariffData(roomTariffs[initialRoomNo]);
    } else if (roomTariffs['101']) {
      setSelectedRoom('101');
      setTariffData(roomTariffs['101']);
    }
  }, [initialRoomNo, roomTariffs, isOpen]);

  if (!isOpen) return null;

  const handleRoomChange = (roomNo) => {
    setSelectedRoom(roomNo);
    if (roomTariffs[roomNo]) {
      setTariffData(roomTariffs[roomNo]);
    }
  };

  const handleRateDetailsSaved = (updatedData) => {
    setTariffData(prev => ({
      ...prev,
      currentRate: updatedData.newRate,
      extraAdult: updatedData.extraAdult,
      extraChild: updatedData.extraChild,
      remarks: updatedData.remarks,
      reason: updatedData.reason,
      authorizedBy: updatedData.authorizedBy
    }));

    if (onSaveTariffChange) {
      onSaveTariffChange({
        roomNo: updatedData.roomNo,
        newRate: updatedData.newRate,
        extraAdult: updatedData.extraAdult,
        extraChild: updatedData.extraChild,
        remarks: updatedData.remarks,
        reason: updatedData.reason,
        authorizedBy: updatedData.authorizedBy
      });
    }

    setIsSavedFlash(true);
    setTimeout(() => setIsSavedFlash(false), 2000);
  };

  return (
    <div className="ids-modal-overlay" style={{ zIndex: 1220 }}>
      <div 
        className="ids-dialog-window" 
        style={{ width: '740px', maxWidth: '98vw', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', background: '#ECE9D8' }}
      >
        {/* Title Bar matching Frame 024 */}
        <div className="ids-dialog-titlebar plain" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '11px' }}>Change Rate V6.5002.2</span>
          <button className="ids-win-btn close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '8px 10px', fontSize: '11px' }}>
          
          {isSavedFlash && (
            <div style={{ background: '#E6FFE6', border: '1px solid #4CAF50', padding: '4px 8px', marginBottom: '6px', color: '#1B5E20', fontWeight: 700 }}>
              ✓ Room {tariffData.roomNo} Tariff successfully changed to ₹{tariffData.currentRate.toFixed(2)}!
            </div>
          )}

          {/* Top Form Grid matching Frame 025 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            
            {/* Left Column */}
            <div style={{ display: 'grid', gridTemplateColumns: '95px 1fr', gap: '3px', alignItems: 'center' }}>
              <span>Room#/Type</span>
              <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                <input 
                  className="ids-input" 
                  value={selectedRoom} 
                  onChange={(e) => handleRoomChange(e.target.value)}
                  style={{ width: '55px', fontWeight: 700 }} 
                />
                <button 
                  className="ids-btn-classic" 
                  style={{ padding: '0 5px' }}
                  onClick={() => {
                    if (onOpenRoomHelpLookup) onOpenRoomHelpLookup();
                  }}
                  title="Search room"
                >
                  ?
                </button>
                <input className="ids-input" value={tariffData.roomType} readOnly style={{ width: '45px', background: '#EBEBE4', fontWeight: 600 }} />
              </div>

              <span>Folio #</span>
              <input className="ids-input" value={tariffData.folioNo} readOnly style={{ width: '70px', background: '#EBEBE4' }} />

              <span>Reg. #</span>
              <input className="ids-input" value={tariffData.regNo} readOnly style={{ width: '70px', background: '#EBEBE4' }} />

              <span>Arrival</span>
              <input className="ids-input" value={tariffData.arrival} readOnly style={{ background: '#EBEBE4' }} />

              <span>Departure</span>
              <input className="ids-input" value={tariffData.departure} readOnly style={{ background: '#EBEBE4' }} />

              <span>Billing Instruction</span>
              <input className="ids-input" value={tariffData.billingInstruction} readOnly style={{ width: '70px', background: '#EBEBE4' }} />
            </div>

            {/* Right Column */}
            <div style={{ display: 'grid', gridTemplateColumns: '85px 1fr', gap: '3px', alignItems: 'center' }}>
              <span>Pax</span>
              <input className="ids-input" value={tariffData.pax} readOnly style={{ background: '#EBEBE4' }} />

              <span>Guest Name</span>
              <input className="ids-input" value={tariffData.guestName} readOnly style={{ fontWeight: 700, color: '#0A246A', background: '#EBEBE4' }} />

              <span>Nationality</span>
              <input className="ids-input" value={tariffData.nationality} readOnly style={{ width: '50px', background: '#EBEBE4' }} />

              <span>Guest Status</span>
              <input className="ids-input" value={tariffData.guestStatus} readOnly style={{ width: '60px', background: '#EBEBE4' }} />

              <span>Group</span>
              <input className="ids-input" value={tariffData.group || ''} readOnly style={{ width: '60px', background: '#EBEBE4' }} />

              <span>Pay Mode</span>
              <input className="ids-input" value={tariffData.payMode} readOnly style={{ width: '60px', background: '#EBEBE4' }} />
            </div>
          </div>

          <div style={{ height: '1px', background: '#B0AB9A', margin: '4px 0 6px 0' }}></div>

          {/* Secondary Details Grid matching Frame 025 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '95px 1fr', gap: '3px', alignItems: 'center' }}>
              <span>Company</span>
              <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                <input className="ids-input" value={tariffData.companyCode || ''} readOnly style={{ width: '60px', background: '#EBEBE4' }} />
                <button className="ids-btn-classic" style={{ padding: '0 4px' }}>?</button>
              </div>

              <span>Currency</span>
              <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                <input className="ids-input" value={tariffData.currency} readOnly style={{ width: '50px', background: '#EBEBE4' }} />
                <button className="ids-btn-classic" style={{ padding: '0 4px' }}>?</button>
              </div>

              <span>Guest Classification</span>
              <select className="ids-select" defaultValue={tariffData.guestClassification}>
                <option>Regular</option>
                <option>VIP</option>
                <option>Repeat</option>
              </select>

              <span>Check Out</span>
              <select className="ids-select" defaultValue={tariffData.checkOut}>
                <option>12 Noon</option>
                <option>2 PM</option>
                <option>6 PM</option>
              </select>

              <span>Room Upgrade</span>
              <input className="ids-input" value={tariffData.roomUpgrade} readOnly style={{ width: '60px', background: '#EBEBE4' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '85px 1fr', gap: '3px', alignItems: 'center' }}>
              <span>Name</span>
              <input className="ids-input" value={tariffData.companyName || ''} readOnly style={{ background: '#EBEBE4' }} />

              <span></span>
              <button className="ids-btn-classic" style={{ width: '85px', fontSize: '10px' }}>Pax Details</button>

              <span>Plan</span>
              <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                <input className="ids-input" value={tariffData.plan} readOnly style={{ width: '45px', background: '#EBEBE4' }} />
                <button className="ids-btn-classic" style={{ padding: '0 4px' }}>?</button>
              </div>

              <span>Rate</span>
              <select className="ids-select" defaultValue={tariffData.rateName}>
                <option>Discount</option>
                <option>Rack Rate</option>
                <option>Corporate</option>
                <option>Complimentary</option>
              </select>
            </div>
          </div>

          {/* Rate Matrix Box matching Frame 025 (Interactive click opens Rate Details) */}
          <div className="ids-groupbox" style={{ marginBottom: '8px' }}>
            <span className="ids-groupbox-title">Room Tariff Matrix (Click Rate to Override / Change)</span>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', background: '#FFF' }}>
              <thead style={{ background: '#ECE9D8' }}>
                <tr>
                  <th style={{ width: '90px', border: '1px solid #CCC', padding: '3px 4px' }}></th>
                  <th style={{ border: '1px solid #CCC', padding: '3px 4px', textAlign: 'right' }}>Charge</th>
                  <th style={{ border: '1px solid #CCC', padding: '3px 4px', textAlign: 'right' }}>Extra Adult</th>
                  <th style={{ border: '1px solid #CCC', padding: '3px 4px', textAlign: 'right' }}>Extra Child</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  onClick={() => setRateDetailsOpen(true)}
                  style={{ cursor: 'pointer', background: '#FFFDF0' }}
                  title="Click to Open Rate Details and Change Tariff (Video 11 Frame 028)"
                >
                  <td style={{ border: '1px solid #CCC', padding: '4px', fontWeight: 700, color: '#0A246A' }}>
                    Rate ✏️
                  </td>
                  <td style={{ border: '1px solid #CCC', padding: '4px', textAlign: 'right', fontWeight: 700, fontSize: '11px', color: '#B00' }}>
                    {tariffData.currentRate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ border: '1px solid #CCC', padding: '4px', textAlign: 'right' }}>
                    {tariffData.extraAdult.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ border: '1px solid #CCC', padding: '4px', textAlign: 'right' }}>
                    {tariffData.extraChild.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #CCC', padding: '4px', fontWeight: 600 }}>Meal Plan</td>
                  <td style={{ border: '1px solid #CCC', padding: '4px', textAlign: 'right' }}>0.00</td>
                  <td style={{ border: '1px solid #CCC', padding: '4px', textAlign: 'right' }}>0.00</td>
                  <td style={{ border: '1px solid #CCC', padding: '4px', textAlign: 'right' }}>0.00</td>
                </tr>
              </tbody>
            </table>
            <div style={{ textAlign: 'right', fontSize: '9px', color: '#666', marginTop: '2px' }}>
              💡 Click on Rate Charge <strong>₹{tariffData.currentRate.toFixed(2)}</strong> to modify room tariff
            </div>
          </div>

          {/* Bottom Action Strip matching Frame 025 */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
            <button 
              className="ids-btn-classic" 
              style={{ minWidth: '65px' }}
              onClick={() => setPackageSelectionOpen(true)}
            >
              Package
            </button>
            <button className="ids-btn-classic" style={{ minWidth: '60px' }}>Clear</button>
            <button 
              className="ids-btn-classic" 
              style={{ minWidth: '60px' }}
              onClick={() => setRateDetailsOpen(true)}
            >
              Panel
            </button>
            <button 
              className="ids-btn-classic" 
              style={{ minWidth: '60px', fontWeight: 700 }}
              onClick={onClose}
            >
              Exit
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Modal: Rate Details */}
      <IdsRateDetailsModal 
        isOpen={rateDetailsOpen}
        onClose={() => setRateDetailsOpen(false)}
        tariffData={tariffData}
        onSaveRateDetails={handleRateDetailsSaved}
      />

      {/* Sub-Modal: Package Selection */}
      <IdsPackageSelectionModal 
        isOpen={packageSelectionOpen}
        onClose={() => setPackageSelectionOpen(false)}
      />
    </div>
  );
}
