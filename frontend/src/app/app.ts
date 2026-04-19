import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LanguageService } from './core/services/languages/language';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'hsemonitor';

  private lang = inject(LanguageService);

  constructor() {
    this.lang.init(); // initialise fr/en/de + charge la langue sauvegardée
  }
}