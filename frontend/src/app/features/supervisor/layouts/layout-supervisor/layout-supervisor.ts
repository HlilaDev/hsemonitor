import { Component, inject } from '@angular/core';
import { Footer } from "../../../../shared/footer/footer";
import { SidebarSupervisor } from "../sidebar-supervisor/sidebar-supervisor";
import { HeaderSupervisor } from "../header-supervisor/header-supervisor";
import { RouterModule } from "@angular/router";
import { LayoutService } from '../../../../core/services/layout/layout';

@Component({
  selector: 'app-layout-supervisor',
  imports: [Footer, SidebarSupervisor, HeaderSupervisor, RouterModule],
  templateUrl: './layout-supervisor.html',
  styleUrl: './layout-supervisor.scss',
})
export class LayoutSupervisor {
  layout = inject(LayoutService);

}
