import { Component } from '@angular/core';

import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.html',
})
export class Pricing {
  readonly appUrl = environment.appUrl;
}
