import { Component, HostListener, OnInit } from '@angular/core';

import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { MdbCollapseModule } from 'mdb-angular-ui-kit/collapse';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [NgIf,RouterLink,MdbCollapseModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {
  user: any = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Subscribe to user changes
    this.authService.currentUser.subscribe(user => {
      this.user = user;
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  isDropdownOpen = false;

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
    const dropdownMenu = (event.target as HTMLElement).nextElementSibling as HTMLElement;

    if (this.isDropdownOpen) {
      dropdownMenu.classList.add('show');
    } else {
      dropdownMenu.classList.remove('show');
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e: Event) => {
      const clickedElement = e.target as HTMLElement;
      const targetElement = event.target as HTMLElement;

      if (!dropdownMenu.contains(clickedElement) && targetElement !== clickedElement) {
        this.isDropdownOpen = false;
        dropdownMenu.classList.remove('show');
      }
    }, { once: true });
  }
// Thêm vào UserProfileComponent
@HostListener('document:click', ['$event'])
onDocumentClick(event: Event) {
  const element = event.target as HTMLElement;
  if (!element.closest('.user-menu')) {
    this.isDropdownOpen = false;
  }
}
}
