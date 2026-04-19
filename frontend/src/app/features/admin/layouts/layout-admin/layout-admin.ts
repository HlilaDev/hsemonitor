import { Component } from '@angular/core';
import { Footer } from "../../../../shared/footer/footer";
import { RouterOutlet } from "@angular/router";
import { SidebarAdmin } from "../sidebar-admin/sidebar-admin";
import { LayoutService } from '../../../../core/services/layout/layout';
import { HeaderAdmin } from "../header-admin/header-admin";

@Component({
  selector: 'app-layout-admin',
  imports: [ Footer, RouterOutlet, SidebarAdmin, HeaderAdmin],
  templateUrl: './layout-admin.html',
  styleUrl: './layout-admin.scss',
})
export class LayoutAdmin {
  constructor(public layout: LayoutService) {}


}
