export interface AlertBase {
  symbol: string;
  alertName: string;
  action: string;
  price: number;
  description?: string;
  tvScreensUrls: string[];
}

export const AlertBaseDefaults = {
  action: '',
  alertName: '',
  symbol: '',
  tvScreensUrls: [],
  price: 0,
};
