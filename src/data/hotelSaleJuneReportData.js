import hotelSalesRaw from './hotelSaleJuneReportData.json';

export const HOTEL_JUNE_SALES = hotelSalesRaw;

export const HOTEL_JUNE_SUMMARY = {
  month: 'JUNE 2026',
  property: 'HOTEL ELITE INN, MUNIGUDA, RAYAGADA, ODISHA',
  gstin: '21AEWFS9433F1ZN',
  stateCode: '21',
  roomRentGross: 753058.20,
  roomDiscount: 690.00,
  roomRentNet: 752368.20,
  roomCgst: 18809.20,
  roomSgst: 18809.20,
  roomTotalWithGst: 789986.61,
  laundryBase: 3446.62,
  laundryCgst: 310.20,
  laundrySgst: 310.20,
  laundryTotal: 4067.01,
  roomServiceTotal: 138919.45,
  totalNetRevenue: 933663.13,
  advancesApplied: 245777.15,
  cashCollected: 48767.98,
  btcCorporate: 85436.00,
  creditCard: 151713.00,
  onlineUpi: 398998.00,
  totalTransactions: HOTEL_JUNE_SALES.length
};
