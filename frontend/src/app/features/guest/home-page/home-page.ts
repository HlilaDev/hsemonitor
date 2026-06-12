import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Header } from '../components/header/header';
import { Footer } from '../components/footer/footer';
import { Pricing } from '../components/pricing/pricing';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, Header, Footer, Pricing],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss'
})
export class HomePage {
  currentYear = new Date().getFullYear();

  scrollTo(anchor: string): void {
    document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' });
  }
}
