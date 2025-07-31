
// add-movie.component.ts
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MovieService } from '../../../../services/movie.service';
import { MoviesService } from '../../../../services/admin/movies.service';
interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Country {
  id: number;
  name: string;
  slug: string;
}

@Component({
  selector: 'app-add-movie',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-movie.component.html',
  styleUrls: ['./add-movie.component.css']
})
export class AddMovieComponent implements OnInit {
  @Output() onCancel = new EventEmitter<void>();
  @Output() onSubmitSuccess = new EventEmitter<void>();

  movieForm: FormGroup;
  categories: Category[] = [];
  countries: Country[] = [];
  years: number[] = [];
  types = [
    { value: 'single', label: 'Phim lẻ' },
    { value: 'series', label: 'Phim bộ' }
  ];
  statuses = [
    { value: 'completed', label: 'Hoàn thành' },
    { value: 'ongoing', label: 'Đang chiếu' },
    { value: 'trailer', label: 'Sắp chiếu' }
  ];

  languages = [
    { value: 'Vietsub', label: 'Vietsub' },
    { value: 'Thuyết minh', label: 'Thuyết minh' },
    { value: 'Lồng tiếng', label: 'Lồng tiếng' }
  ];
  qualities = [
    { value: 'FHD', label: '1080p - Full HD' },
    { value: 'HD', label: '720p - HD' },
    { value: '4K', label: '2160p - 4K' },
    { value: '2K', label: '1440p - 2K' },
    { value: 'BLU', label: 'Bluray' },
    { value: 'WEB', label: 'WEB-DL' },
    { value: 'CAM', label: 'CAM' }
  ];
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private movieService: MovieService,
    private addMovieService: MoviesService
  ) {
    // Tạo mảng năm từ 1990 đến năm hiện tại
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 1990; year--) {
      this.years.push(year);
    }

    this.movieForm = this.fb.group({
      Name: ['', [Validators.required, Validators.minLength(3)]],
      OriginName: ['', Validators.required],
      Description: ['', [Validators.required, Validators.minLength(50)]],
      Type: ['single', Validators.required],
      Status: ['completed', Validators.required],
      ThumbUrl: ['', [Validators.required, Validators.pattern('^https?://.*')]],
      PosterUrl: ['', [Validators.required, Validators.pattern('^https?://.*')]],
      TrailerUrl: ['', Validators.pattern('^https?://.*')],
      Year: [currentYear, Validators.required],
      Language: ['Vietsub', Validators.required],
      Actors: [''],
      Directors: [''],
      Quality: ['HD', [Validators.required]],
      Categories: [[], [Validators.required]],
      Countries: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.loadCategories();
    this.loadCountries();
  }


loadCategories() {
  this.movieService.getCategories().subscribe({
    next: (response) => {
      if (response.success) {
        this.categories = response.data.map((cat: any) => ({
          id: cat.CategoryID,
          name: cat.Name,
          slug: cat.Slug
        }));
        console.log('Loaded categories:', this.categories);
      }
    },
    error: (error) => {
      console.error('Error loading categories:', error);
      this.error = 'Không thể tải danh sách thể loại';
    }
  });
}

loadCountries() {
  this.movieService.getCountries().subscribe({
    next: (response) => {
      if (response.success) {
        this.countries = response.data.map((country: any) => ({
          id: country.CountryID,
          name: country.Name,
          slug: country.Slug
        }));
        console.log('Loaded countries:', this.countries);
      }
    },
    error: (error) => {
      console.error('Error loading countries:', error);
      this.error = 'Không thể tải danh sách quốc gia';
    }
  });
}

  // Helper để kiểm tra lỗi form
  getErrorMessage(fieldName: string): string {
    const control = this.movieForm.get(fieldName);
    if (control?.errors) {
      if (control.errors['required']) return 'Trường này là bắt buộc';
      if (control.errors['minlength']) return `Tối thiểu ${control.errors['minlength'].requiredLength} ký tự`;
      if (control.errors['pattern']) return 'URL không hợp lệ';
    }
    return '';
  }

  onSubmit() {
    if (this.movieForm.valid) {
      this.loading = true;
      this.error = '';

      // Clone formData để không ảnh hưởng đến form gốc
      const formData = {...this.movieForm.value};

      // Chỉ lấy mảng các slug, không wrap trong object
      formData.Countries = [formData.Countries];
      formData.Countries = formData.Countries;

      console.log('Form data to submit:', formData);

      this.addMovieService.addMovie(formData).subscribe({
        next: (response) => {
          if (response.success) {
            console.log('Movie added successfully:', response);
            this.onSubmitSuccess.emit();
          } else {
            this.error = response.message || 'Có lỗi xảy ra';
            console.error('Error response:', response);
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('API error:', error);
          this.error = 'Có lỗi xảy ra khi thêm phim';
          this.loading = false;
        }
      });
    } else {
      console.log('Form validation errors:', this.movieForm.errors);
      this.markFormGroupTouched(this.movieForm);
    }
  }
  // Helper để highlight tất cả các field lỗi
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
// add-movie.component.ts
handleImageError(event: any) {
  event.target.src = 'assets/images/placeholder.jpg'; // Đặt placeholder image của bạn
}
  cancel() {
    this.onCancel.emit();
  }
}
