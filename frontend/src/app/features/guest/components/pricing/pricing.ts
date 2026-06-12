import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-pricing',
  imports: [TranslatePipe],
  templateUrl: './pricing.html',
  styleUrl: './pricing.scss'
})
export class Pricing {}
