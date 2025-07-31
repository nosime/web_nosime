import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, User } from '../../../services/admin/user.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit, OnDestroy {
  users: User[] = [];
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  loading = false;
  error = '';
  private destroy$ = new Subject<void>();

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get pages(): number[] {
    const pageNumbers: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      if (i === 1 || i === this.totalPages ||
          (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
        pageNumbers.push(i);
      }
    }
    return pageNumbers;
  }

  loadUsers() {
    this.loading = true;
    this.error = '';

    this.userService.getUsers(this.currentPage, this.itemsPerPage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.users = response.data;
            if (response.pagination) {
              this.totalItems = response.pagination.totalItems;
            }
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading users:', err);
          this.error = 'Không thể tải danh sách người dùng';
          this.loading = false;
        }
      });
  }

  deleteUser(userId: number) {
    if (confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      this.userService.deleteUser(userId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.users = this.users.filter(user => user.UserID !== userId);
              this.totalItems--;
              // Kiểm tra nếu page hiện tại trống thì chuyển về page trước
              if (this.users.length === 0 && this.currentPage > 1) {
                this.goToPage(this.currentPage - 1);
              } else {
                this.loadUsers();
              }
            }
          },
          error: (err) => {
            console.error('Error deleting user:', err);
            alert('Không thể xóa người dùng');
          }
        });
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadUsers();
      window.scrollTo(0, 0);
    }
  }
}
