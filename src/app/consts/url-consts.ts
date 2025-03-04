import { env } from 'environment/environment';
//COMPONENTS
export const TRIGGERED_ALERTS = 'triggered-alerts';
export const ARCHIVED_ALERTS = 'archived-alerts';
export const ALERTS_AT_WORK = 'alerts-at-work';
export const WORK = 'work';

//URLS
const baseURL = env.baseURL;
export const coinsUrl = `${baseURL}get-all-coins`;

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

 

 