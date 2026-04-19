import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HseagentSidebar } from '../hseagent-sidebar/hseagent-sidebar';
import { Footer } from '../../../../shared/footer/footer';
import { LayoutService } from '../../../../core/services/layout/layout';
import { HeaderAgent } from "../header-agent/header-agent";

@Component({
  selector: 'app-hseagent-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    HseagentSidebar,
    Footer,
    HeaderAgent
],
  templateUrl: './hseagent-layout.html',
  styleUrl: './hseagent-layout.scss',
})
export class HseagentLayout {
  layout = inject(LayoutService);
}