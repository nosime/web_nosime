// admin.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminMainComponent } from './admin-main/admin-main.component';
import { ServerManagementComponent } from "./server-management/server-management.component";
import { UserListComponent } from "./user-list/user-list.component";
import { AdminSettingsComponent } from './admin-settings/admin-settings.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminMainComponent, ServerManagementComponent, UserListComponent, AdminSettingsComponent],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  activeTab = 'main';

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}
