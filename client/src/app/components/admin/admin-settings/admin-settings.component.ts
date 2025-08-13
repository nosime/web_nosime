import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SyncService, SyncResponse } from '../../../services/admin/sync.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-settings.component.html',
  styleUrl: './admin-settings.component.css'
})
export class AdminSettingsComponent {
  loading: { [key: string]: boolean } = {};
  messages: { [key: string]: string } = {};

  constructor(private syncService: SyncService) {}

  // Sync categories
  syncCategories(): void {
    this.setLoading('categories', true);
    this.syncService.syncCategories().subscribe({
      next: (response: SyncResponse) => {
        this.setLoading('categories', false);
        this.setMessage('categories', `Thành công: ${response.message}`, 'success');
      },
      error: (error) => {
        this.setLoading('categories', false);
        this.setMessage('categories', 'Lỗi khi đồng bộ thể loại', 'error');
        console.error('Error syncing categories:', error);
      }
    });
  }

  // Sync countries
  syncCountries(): void {
    this.setLoading('countries', true);
    this.syncService.syncCountries().subscribe({
      next: (response: SyncResponse) => {
        this.setLoading('countries', false);
        this.setMessage('countries', `Thành công: ${response.message}`, 'success');
      },
      error: (error) => {
        this.setLoading('countries', false);
        this.setMessage('countries', 'Lỗi khi đồng bộ quốc gia', 'error');
        console.error('Error syncing countries:', error);
      }
    });
  }

  // Sync movies (24 movies)
  syncMovies(): void {
    this.setLoading('movies', true);
    this.syncService.syncMovies().subscribe({
      next: (response: SyncResponse) => {
        this.setLoading('movies', false);
        const successCount = response.stats?.totalSuccess || 0;
        this.setMessage('movies', `Đồng bộ thành công ${successCount} phim`, 'success');
      },
      error: (error) => {
        this.setLoading('movies', false);
        this.setMessage('movies', 'Lỗi khi đồng bộ phim', 'error');
        console.error('Error syncing movies:', error);
      }
    });
  }

  // Parallel sync movies (2400 movies)
  parallelSyncMovies(): void {
    this.setLoading('parallelMovies', true);
    this.syncService.parallelSyncMovies().subscribe({
      next: (response: SyncResponse) => {
        this.setLoading('parallelMovies', false);
        const successCount = response.stats?.totalSuccess || 0;
        this.setMessage('parallelMovies', `Đồng bộ song song thành công ${successCount} phim`, 'success');
      },
      error: (error) => {
        this.setLoading('parallelMovies', false);
        this.setMessage('parallelMovies', 'Lỗi khi đồng bộ song song phim', 'error');
        console.error('Error parallel syncing movies:', error);
      }
    });
  }

  // Clean all movies
  cleanAllMovies(): void {
    if (!confirm('Bạn có chắc chắn muốn xóa tất cả phim? Hành động này không thể hoàn tác!')) {
      return;
    }

    this.setLoading('clean', true);
    this.syncService.cleanAllMovies().subscribe({
      next: (response: SyncResponse) => {
        this.setLoading('clean', false);
        this.setMessage('clean', 'Đã xóa tất cả dữ liệu phim thành công', 'success');
      },
      error: (error) => {
        this.setLoading('clean', false);
        this.setMessage('clean', 'Lỗi khi xóa dữ liệu phim', 'error');
        console.error('Error cleaning movies:', error);
      }
    });
  }

  private setLoading(key: string, loading: boolean): void {
    this.loading[key] = loading;
  }

  private setMessage(key: string, message: string, type: 'success' | 'error'): void {
    this.messages[key] = message;
    // Auto clear message after 5 seconds
    setTimeout(() => {
      if (this.messages[key] === message) {
        delete this.messages[key];
      }
    }, 5000);
  }

  isLoading(key: string): boolean {
    return this.loading[key] || false;
  }

  getMessage(key: string): string {
    return this.messages[key] || '';
  }
}
