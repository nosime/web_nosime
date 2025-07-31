import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category, Country, Language, MovieService, Type } from '../../../services/movie.service';

export interface FilterState {
  types: string[];
  categories: string[];
  countries: string[];
  status: string[];
  years: number[];
  languages: string[];
  limit?: string;
  page?: string;
}

type FilterTypes = {
  types: string[];
  categories: string[];
  countries: string[];
  status: string[];
  years: number[];
  languages: string[];
}

type RouteType = 'phim-bo' | 'phim-le'| 'tv-shows' | 'hoat-hinh';


// Khai báo mapping với type cụ thể
const TYPE_MAPPING: Record<string, string> = {
  'phim-bo': 'series',
  'phim-le': 'single',
  'tv-shows': 'tvshows',
  'hoat-hinh': 'hoathinh'
};
@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit {
  @Output() filterChange = new EventEmitter<FilterState>();
  @Input() set initialType(value: string) {
    if (value) {
      // Check if value is valid RouteType
      if (this.isValidRouteType(value)) {
        const apiType = TYPE_MAPPING[value];
        this.types = [apiType];
        this.emitFilters();
      }
    }
  }
  activeDropdown: 'types' | 'categories' | 'countries' | 'status' | 'years' | 'languages' | null = null; // Thêm 'languages'

  toggleDropdown(type: 'types' | 'categories' | 'countries' | 'status' | 'years' | 'languages') {
    this.activeDropdown = this.activeDropdown === type ? null : type;
  }
  private isValidRouteType(value: string): value is RouteType {
    return Object.keys(TYPE_MAPPING).includes(value);
  }
  types: string[] = [];
  categories: string[] = [];
  countries: string[] = [];
  status: string[] = [];
  years: number[] = [];
  languages: string[] = [];

  availableCategories: Category[] = [];
  availableCountries: Country[] = [];
  availableYears: number[] = [];
  availableTypes: Type[] = [];
  availableLanguages: Language[] = [];

  constructor(private movieService: MovieService) {}

  ngOnInit() {
    // Load categories
    this.movieService.getCategories().subscribe({
      next: (response: {success: boolean, data: Category[]}) => {
        if (response.success) {
          this.availableCategories = response.data;
        }
      }
    });

    // Load countries
    this.movieService.getCountries().subscribe({
      next: (response: {success: boolean, data: Country[]}) => {
        if (response.success) {
          this.availableCountries = response.data;
        }
      }
    });
    this.movieService.getMovieTypes().subscribe(types => {
      this.availableTypes = types;
    });
    this.movieService.getLanguages().subscribe({
      next: (response) => {
        if (response.success) {
          this.availableLanguages = response.data;
        }
      }
    });
    // Generate years
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 1990; year--) {
      this.availableYears.push(year);
    }
  }

  get hasFilters(): boolean {
    return this.types.length > 0 ||
           this.categories.length > 0 ||
           this.countries.length > 0 ||
           this.status.length > 0 ||
           this.languages.length > 0 ||
           this.years.length > 0;
  }

  toggleFilter(filterType: keyof FilterTypes, value: string | number) {
    const array = this[filterType] as (string | number)[];
    const index = array.indexOf(value);

    if (index === -1) {
      array.push(value);
    } else {
      array.splice(index, 1);
    }

    // Emit ngay khi có thay đổi
    this.emitFilters();
  }

  private emitFilters() {
    const filters: FilterState = {
      types: this.types,
      categories: this.categories,
      countries: this.countries,
      status: this.status,
      years: this.years,
      languages:this.languages
    };

    this.filterChange.emit(filters);
  }

  clearAll() {
    this.types = [];
    this.categories = [];
    this.countries = [];
    this.status = [];
    this.years = [];
    this.languages = []; // Thêm reset languages
    this.emitFilters();
  }


}
