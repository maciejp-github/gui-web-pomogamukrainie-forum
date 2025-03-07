import { Component } from '@angular/core';
import { defaults } from '@app/shared/utils';
import { TransportOfferDefinitionDTO, TransportResourceService } from '@app/core/api';
import { PREFIXES } from '@app/shared/consts';
import { SnackbarService } from '@app/shared/services/snackbar.service';
import { CorePath, ALERT_TYPES } from '@app/shared/models';
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-transport-form',
  templateUrl: './transport-form.component.html',
  styleUrls: ['./transport-form.component.scss'],
})
export class TransportFormComponent {
  minDate: Date = new Date();
  PREFIXES = PREFIXES;
  phonePrefix: string = '48';
  phoneNumber: string = '';
  data = defaults<TransportOfferDefinitionDTO>();
  loading: boolean = false;

  constructor(
    private transportResourceService: TransportResourceService,
    private router: Router,
    private snackbarService: SnackbarService
  ) {}

  onPhoneNumberChange(): void {
    this.data.phoneNumber = this.phonePrefix + this.phoneNumber;
  }

  submitOffer(): void {
    this.transportResourceService
      .createTransport(this.data)
      .pipe(take(1))
      .subscribe(
        (response) => this.redirectOnSuccess(),
        (error) => this.snackbarService.openSnack(error.message, ALERT_TYPES.ERROR)
      )
      .add(() => (this.loading = false));
  }

  redirectOnSuccess() {
    this.router.navigate([CorePath.MyAccount]).then((navigated: boolean) => {
      if (navigated) {
        this.snackbarService.openSnackAlert(ALERT_TYPES.OFFER_SUCCESS);
      }
    });
  }
}
