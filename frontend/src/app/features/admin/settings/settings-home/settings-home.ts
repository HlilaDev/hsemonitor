import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-settings-home',
  standalone: true,
  imports: [RouterModule, TranslateModule],
  templateUrl: './settings-home.html',
  styleUrl: './settings-home.scss',
})
export class AdminSettingsHome {}
