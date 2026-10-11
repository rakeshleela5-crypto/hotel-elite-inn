import restaurantSalesRaw from './restaurantSaleJuneReportData.json';
import restaurantMgmRaw from './restaurantMgmJuneReportData.json';

export const RESTAURANT_JUNE_SALES = restaurantSalesRaw;
export const RESTAURANT_JUNE_MGM_SALES = restaurantMgmRaw;

export const RESTAURANT_JUNE_SUMMARY = {
  month: 'JUNE 2026',
  outlet: 'CANNON RESTAURANT & ROOM SERVICE',
  foodSalesGross: 828328.53,
  beverageSalesGross: 52935.00,
  grossFnbSubtotal: 881263.53,
  posDiscount: 63.00,
  managementNcTotal: 90478.00,
  taxableFnbNet: 790722.53,
  cgst: 19768.06,
  sgst: 19768.06,
  commercialFnbTotal: 830258.66,
  totalFnbProduction: 920739.00,
  totalOrders: RESTAURANT_JUNE_SALES.length,
  totalMgmOrders: RESTAURANT_JUNE_MGM_SALES.length
};
