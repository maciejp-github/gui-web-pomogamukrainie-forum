import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpInterceptor, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { throwError, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SnackbarService } from '@app/shared/services';
import { TranslateService } from '@ngx-translate/core';
import { ALERT_TYPES } from '@app/shared/models';
import * as pl from '@app/core/translations/pl_PL';
interface ApiErrors {
  field: 'offer' | 'user';
  message: string;
  type: string;
}

type PL_KEYS = keyof typeof pl.default;

// const config: {[P in keyof AccommodationOffer]: PL_KEYS} = {
//   guests: 'NUMBER_OF_PEOPLE',
//   description: 'LABEL_OFFER_DESCRIPTION',
//   hostLanguage: ''
// }

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private snackbarService: SnackbarService, private translateService: TranslateService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((req) => {
        if (req instanceof HttpErrorResponse) {
          this.convertErrorToNotifcation(req);
        }
        return throwError(() => req);
      })
    );
  }

  private convertErrorToNotifcation(req: HttpErrorResponse): void {
    switch (req.status) {
      case 400:
        break;
      case 401:
      case 403:
        this.snackbarService.openSnack(
          this.translateService.instant('API_HTTP_ERROR_SESSION_OR_PERMISSION'),
          ALERT_TYPES.ERROR
        );
        break;
      case 404:
        try {
          const firstError: ApiErrors = (req.error.errors as ApiErrors[])[0];
          // not found user
          if (firstError.field === 'user') {
            this.snackbarService.openSnack(firstError.message, ALERT_TYPES.ERROR);
          }
        } catch {}
        break;
      case 500:
      case 0:
      default:
        this.snackbarService.openSnack(
          this.translateService.instant('API_HTTP_ERROR_SERVER_FAILED_CONNECTION'),
          ALERT_TYPES.ERROR
        );
        break;
    }
  }
}
