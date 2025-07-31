import { Component, HostListener, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { MdbCollapseModule, MdbCollapseDirective } from 'mdb-angular-ui-kit/collapse';
import { NavigationMenuComponent } from "./navigation-menu/navigation-menu.component";
import { UserProfileComponent } from "./user-profile/user-profile.component";
import { SearchComponent } from "./search/search.component";
import { isPlatformBrowser, NgClass } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MdbCollapseModule, NavigationMenuComponent, UserProfileComponent, SearchComponent,NgClass],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  isScrolled = false;

  @ViewChild('buttonsNav')
  buttonsNav!: MdbCollapseDirective;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
   if (isPlatformBrowser(this.platformId)) {
     const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
     this.isScrolled = scrollPosition > 0;

     // Close navbar when scrolling
     if (!this.buttonsNav?.collapsed) {
       this.buttonsNav.hide();
     }
   }
  }
  @HostListener('document:click', ['$event'])
  onClick(event: Event) {
    const navbarToggler = document.querySelector('.navbar-toggler');
    const clickTarget = event.target as HTMLElement;
    const navbarElement = document.querySelector('#navbarButtonsExample');

    if (navbarElement &&
        !navbarElement.contains(clickTarget) &&
        clickTarget !== navbarToggler &&
        !navbarToggler?.contains(clickTarget)) {
      this.buttonsNav.hide();
    }
  }
  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.onWindowScroll();
      document.addEventListener("scroll", () => {
        const header = document.getElementById("header");
        const overlay = header?.querySelector('.header-overlay');

        if (window.scrollY > 0) {
          overlay?.classList.add('scrolled');
        } else {
          overlay?.classList.remove('scrolled');
        }
      });
    }
  }
}
