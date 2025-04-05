import { AlertsCollection } from '../../models/alerts/alerts-collections';
import { env } from 'environment/environment';

//COMPONENTS
export const TRIGGERED_ALERTS = AlertsCollection.TriggeredAlerts;
export const ARCHIVED_ALERTS = AlertsCollection.ArchivedAlerts;
export const ALERTS_AT_WORK = AlertsCollection.WorkingAlerts;

export const EXCHANGES = 'exchanges';
export const COINS = 'coins';
export const ADMIN = 'admin';
export const WORK = 'work';
export const KLINE_CHART = 'kline-chart';
export const LIGHTWEIGHT_CHART = 'lightweight-chart';

export const VWAP_TRIGGERED_ALERTS = 'vwap-' + AlertsCollection.TriggeredAlerts;
export const VWAP_ARCHIVED_ALERTS = 'vwap-' + AlertsCollection.ArchivedAlerts;
export const VWAP_ALERTS_AT_WORK = 'vwap-' + AlertsCollection.WorkingAlerts;

//URLS
const baseURL = env.baseURL;

export const ALERTS_URLS = {
  alertsUrl: `${baseURL}/alerts`,
  alertsAddOneUrl: `${baseURL}/alerts/add/one`,
  alertsDeleteManyUrl: `${baseURL}/alerts/delete/many`,
  alertsUpdateOneUrl: `${baseURL}/alerts/update/one`,
  alertsMoveManyUrl: `${baseURL}/alerts/move/many`,
};

export const COINS_URLS = {
  coinsUrl: `${baseURL}/proxy-coins`,
  coinsRefreshUrl: `${baseURL}/proxy-coins/refresh`,
};

export const KLINE_URLS = {
  proxyKlineUrl: `${baseURL}/proxy-kline`,
};

export const WORKING_COINS_URLS = {
  workingCoinsUrl: `${baseURL}/working-coins`,
  addWorkingCoinUrl: `${baseURL}/working-coins/add/one`,
  addWorkingCoinsUrl: `${baseURL}/working-coins/add/many`,
  updateWorkingCoinUrl: `${baseURL}/working-coins/update/one`,
  deleteWorkingCoinsUrl: `${baseURL}/working-coins/delete/many`,
};

// export const ANCHORED_VWAP_URLS = {
//   anchoredPointsBySymbolUrl: `${baseURL}/anchor-point/symbol`,
//   anchoredPointsAllUrl: `${baseURL}/anchor-point/all`,
//   anchoredPointAddUrl: `${baseURL}/anchor-point/add`,
//   anchoredPointDeleteUrl: `${baseURL}/anchor-point/delete`,
// };

export const GENERAL_URLS = {
  refreshReposUrl: `${baseURL}/refresh-repos`,
};

export const VWAP_ALERTS_URLS = {
  vwapAlertsUrl: `${baseURL}/vwap-alerts`,
  vwapAlertsAddOneUrl: `${baseURL}/vwap-alerts/add/one`,
  vwapAlertsUpdateOneUrl: `${baseURL}/vwap-alerts/update/one`,
  vwapAlertsMoveManyUrl: `${baseURL}/vwap-alerts/move/many`,
  vwapAlertsDeleteManyUrl: `${baseURL}/vwap-alerts/delete/many`,
  vwapAlertsDeleteOneUrl: `${baseURL}/vwap-alerts/delete/one`,
  vwapAlertsBySymbolUrl: `${baseURL}/vwap-alerts/symbol`,
  vwapAlertDeleteBySymbolAndOpenTimeUrl: `${baseURL}/vwap-alerts/delete/symbol/openTime`,
};
