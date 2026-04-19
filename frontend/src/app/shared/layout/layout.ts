import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from "../footer/footer"; 
import { LayoutService } from '../../core/services/layout/layout';
import { ScrollTop } from "../ui/scroll-top/scroll-top";


@Component({
  selector: 'app-layout',
  standalone: true, 
  imports: [
    RouterOutlet,
    Footer,
    ScrollTop
],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
    layout = inject(LayoutService);

}