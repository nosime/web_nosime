// edit-movie.component.ts
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MovieService, Movie } from '../../../../services/movie.service';
import { MoviesService } from '../../../../services/admin/movies.service';

@Component({
  selector: 'app-edit-movie',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './edit-movie.component.html',
  styleUrls: ['./edit-movie.component.css']
})
export class EditMovieComponent implements OnInit {
  @Input() Slug!: string;
  @Input() movieId!: number;
  @Output() onCancel = new EventEmitter<void>();
  @Output() onSubmitSuccess = new EventEmitter<void>();

  movieForm: FormGroup;
  categories: any[] = [];
  countries: any[] = [];
  years: number[] = [];
  qualities = [
    { value: 'FHD', label: '1080p - Full HD' },
    { value: 'HD', label: '720p - HD' },
    { value: '4K', label: '2160p - 4K' },
    { value: '2K', label: '1440p - 2K' },
    { value: 'BLU', label: 'Bluray' },
    { value: 'WEB', label: 'WEB-DL' },
    { value: 'CAM', label: 'CAM' }
  ];

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

  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private movieService: MovieService,
    private editMovieService: MoviesService
  ) {
    // Tạo mảng năm từ 1990 đến hiện tại
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 1990; year--) {
      this.years.push(year);
    }

    // Khởi tạo form
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
      Quality: ['FHD', [Validators.required]],
      Categories: [[], [Validators.required]],
      Countries: ['', [Validators.required]]
    });
  }

  ngOnInit() {


    // Load categories và countries trước
    Promise.all([
      this.loadCategories(),
      this.loadCountries()
    ]).then(() => {
      // Sau khi có categories và countries thì mới load movie
      this.loadMovie();
    });
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

  // Load thông tin phim cần edit
  loadMovie() {
    this.loading = true;
    this.movieService.getMovieBySlug(this.Slug).subscribe({
      next: (response) => {
        if (response.success) {
          this.updateForm(response.data);
        } else {
          this.error = 'Không thể tải thông tin phim';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading movie:', error);
        this.error = 'Không thể tải thông tin phim';
        this.loading = false;
      }
    });
  }
// Kiểm tra xem category có được chọn không
isSelectedCategory(categorySlug: string): boolean {
  const selectedCategories = this.movieForm.get('Categories')?.value || [];
  return selectedCategories.includes(categorySlug);
}

// Xử lý khi checkbox thay đổi
onCategoryChange(event: any, categorySlug: string) {
  const selectedCategories = this.movieForm.get('Categories')?.value || [];

  if (event.target.checked) {
    // Thêm category nếu được chọn
    this.movieForm.patchValue({
      Categories: [...selectedCategories, categorySlug]
    });
  } else {
    // Xóa category nếu bỏ chọn
    this.movieForm.patchValue({
      Categories: selectedCategories.filter((slug: string) => slug !== categorySlug)
    });
  }
}
  // Fill data vào form
  updateForm(movie: any) {
    console.log('Movie data to update:', movie);

     // Xử lý Categories
  let categoryValues: string[] = [];
  if (movie.Categories) {
    // Nếu Categories là string, chuyển thành mảng
    const categoriesArray = movie.Categories.split(',').map((cat: string) => cat.trim());

    // Lọc và lấy slug của các category được chọn
    categoryValues = this.categories
      .filter(cat => categoriesArray.includes(cat.name))
      .map(cat => cat.slug);
  }
    // Xử lý Countries: lấy slug từ country đầu tiên
    let countryValue = '';
    if (movie.Countries) {
      const countriesArray = typeof movie.Countries === 'string'
        ? movie.Countries.split(', ')
        : movie.Countries;

      const firstCountry = countriesArray[0];
      const countryName = typeof firstCountry === 'string'
        ? firstCountry
        : firstCountry?.Name;

      const foundCountry = this.countries.find(
        c => c.name === countryName
      );
      countryValue = foundCountry?.slug || '';
    }

    // Cập nhật form
    this.movieForm.patchValue({
      Name: movie.Name || '',
      OriginName: movie.OriginName || '',
      Description: movie.Description || '',
      Type: movie.Type || 'single',
      Status: movie.Status || 'completed',
      ThumbUrl: movie.ThumbUrl || '',
      PosterUrl: movie.PosterUrl || '',
      TrailerUrl: movie.TrailerUrl || '',
      Year: movie.Year ? parseInt(movie.Year) : new Date().getFullYear(),
      Language: movie.Language || 'Vietsub',
      Actors: movie.Actors || '',
      Directors: movie.Directors || '',
      Quality: movie.Quality || 'FHD',
      Categories: categoryValues,
      Countries: countryValue
    });

    console.log('Form values after update:', this.movieForm.value);
  }



  onSubmit() {
    if (this.movieForm.valid) {
      this.loading = true;
      const formData = {...this.movieForm.value};

      // Format dữ liệu gửi lên
      formData.Countries = [formData.Countries];

      this.editMovieService.updateMovie(this.movieId, formData).subscribe({
        next: (response) => {
          if (response.success) {
            this.onSubmitSuccess.emit();
          } else {
            this.error = response.message || 'Có lỗi xảy ra';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error updating movie:', error);
          this.error = 'Có lỗi xảy ra khi cập nhật phim';
          this.loading = false;
        }
      });
    }
  }

  getErrorMessage(fieldName: string): string {
    const control = this.movieForm.get(fieldName);
    if (control?.errors) {
      if (control.errors['required']) return 'Trường này là bắt buộc';
      if (control.errors['minlength'])
        return `Tối thiểu ${control.errors['minlength'].requiredLength} ký tự`;
      if (control.errors['pattern']) return 'URL không hợp lệ';
    }
    return '';
  }

  handleImageError(event: any) {
    event.target.src = 'assets/images/placeholder.jpg';
  }

  cancel() {
    this.onCancel.emit();
  }
}
