import { AlertsCollection } from '../../models/alerts/alerts-collections';
import { env } from 'environment/environment';

//COMPONENTS
export const TRIGGERED_ALERTS = AlertsCollection.TriggeredAlerts;
export const ARCHIVED_ALERTS = AlertsCollection.ArchivedAlerts;
export const ALERTS_AT_WORK = AlertsCollection.WorkingAlerts;
export const ADMIN = 'admin';
export const WORK = 'work';

//URLS
const baseURL = env.baseURL;

export const SANTIMENT_URLS = {
  echartsUrl: `${baseURL}/santiment/echarts`,
  dataMissingUrl: `${baseURL}/santiment/coins/data-missing`,
};

export const ALERTS_URLS = {
  alertsUrl: `${baseURL}/alerts`,
  alertsAddOneUrl: `${baseURL}/alerts/add/one`,
  alertsDeleteManyUrl: `${baseURL}/alerts/delete/many`,
  alertsUpdateOneUrl: `${baseURL}/alerts/update/one`,
  alertsMoveManyUrl: `${baseURL}/alerts/move/many`,
};

export const COINS_URLS = {
  coinsUrl: `${baseURL}/proxy-coins`,
};

export const WORKING_COINS_URLS = {
  workingCoinsUrl: `${baseURL}/working-coins`,
  addWorkingCoinsUrl: `${baseURL}/working-coins/add/one`,
  updateWorkingCoinUrl: `${baseURL}/working-coins/update/one`,
  deleteWorkingCoinsUrl: `${baseURL}/working-coins/delete/many`,
};
