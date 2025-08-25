import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: User | null = null;
  private userSubscription?: Subscription;
  isEditing = false;
  showPasswordForm = false;
  isLoading = false;
  error: string | null = null;
  editForm = {
    displayName: '',
    email: ''
  };
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.error = null;

    // First check if user is logged in
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Subscribe to user changes from auth service
    this.userSubscription = this.authService.currentUser.subscribe(user => {
      if (!user) {
        this.router.navigate(['/login']);
      }
    });

    // Load fresh profile data from server
    this.loadProfile();
  }

  loadProfile() {
    this.isLoading = true;
    this.error = null;

    this.authService.getProfile().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.data) {
          // Update user data with fresh data from server
          const userData = response.data as any;
          this.user = {
            UserID: userData.UserID,
            Username: userData.Username,
            Email: userData.Email,
            DisplayName: userData.DisplayName,
            Avatar: userData.Avatar,
            IsVerified: true, // Assume verified for existing users
            IsActive: true,
            IsPremium: false
          };
          this.editForm = {
            displayName: userData.DisplayName || '',
            email: userData.Email || ''
          };
          
          // Also update the auth service's current user data
          this.authService.updateCurrentUser(this.user);
        } else {
          this.error = response.message || 'Không thể tải thông tin profile';
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading profile:', error);
        
        // If unauthorized, redirect to login
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
        } else {
          this.error = error.error?.message || 'Có lỗi xảy ra khi tải thông tin profile';
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // Reset form when canceling
      if (this.user) {
        this.editForm = {
          displayName: this.user.DisplayName || '',
          email: this.user.Email || ''
        };
      }
    }
  }

  togglePasswordForm() {
    this.showPasswordForm = !this.showPasswordForm;
    if (!this.showPasswordForm) {
      // Reset form when hiding
      this.passwordForm = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
    }
  }

  saveProfile() {
    // Validate input
    if (!this.editForm.displayName.trim()) {
      alert('Tên hiển thị không được để trống!');
      return;
    }

    if (!this.editForm.email.trim()) {
      alert('Email không được để trống!');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.editForm.email)) {
      alert('Email không hợp lệ!');
      return;
    }

    // Call API to update profile
    this.authService.updateProfile({
      displayName: this.editForm.displayName,
      email: this.editForm.email
    }).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Cập nhật thông tin thành công!');
          this.loadProfile(); // Reload fresh data
          this.toggleEdit();
        } else {
          alert(response.message || 'Có lỗi xảy ra khi cập nhật thông tin!');
        }
      },
      error: (error) => {
        console.error('Update profile error:', error);
        if (error.error?.message) {
          alert(error.error.message);
        } else {
          alert('Có lỗi xảy ra khi cập nhật thông tin!');
        }
      }
    });
  }

  changePassword() {
    // Validate passwords
    if (!this.passwordForm.currentPassword || !this.passwordForm.newPassword || !this.passwordForm.confirmPassword) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      alert('Mật khẩu mới và xác nhận mật khẩu không khớp!');
      return;
    }

    if (this.passwordForm.newPassword.length < 6) {
      alert('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }

    // Call API to change password
    this.authService.changePassword({
      currentPassword: this.passwordForm.currentPassword,
      newPassword: this.passwordForm.newPassword
    }).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Đổi mật khẩu thành công!');
          this.togglePasswordForm();
        } else {
          alert(response.message || 'Có lỗi xảy ra khi đổi mật khẩu!');
        }
      },
      error: (error) => {
        console.error('Change password error:', error);
        if (error.error?.message) {
          alert(error.error.message);
        } else {
          alert('Có lỗi xảy ra khi đổi mật khẩu!');
        }
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
