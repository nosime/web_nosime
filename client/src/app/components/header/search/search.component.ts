// search.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule], // Thêm FormsModule vào imports
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit, OnDestroy {
  searchTerm: string = '';
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private router: Router) {}

  ngOnInit() {
    // Thiết lập subscription cho searchSubject
    this.searchSubject.pipe(
      takeUntil(this.destroy$),
      debounceTime(100),
      distinctUntilChanged()
    ).subscribe(term => {
      console.log('Search term:', term);
      if (term) {
        this.navigateToSearch(term);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput(event: any) {
    console.log('Input event triggered');
    const term = event.target.value.trim();
    console.log('Search input:', term);
    this.searchSubject.next(term);
  }

  onSearch(event: Event) {
    console.log('Form submitted');
    event.preventDefault();
    const term = this.searchTerm.trim();
    console.log('Search submit:', term);
    if (term) {
      this.navigateToSearch(term);
    }
  }

  private navigateToSearch(term: string) {
    console.log('Navigating to search with term:', term);
    this.router.navigate(['/search'], {
      queryParams: { q: term, page: '1' }
    });
  }
}
