import { HttpParams } from '@angular/common/http';

export function createHttpParams(params?: { [key: string]: any }): HttpParams {
  let httpParams = new HttpParams();
  if (params) {
    for (const key of Object.keys(params)) {
      httpParams = httpParams.set(key, params[key]);
    }
  }
  return httpParams;
}
