// components/admin/server/server-management.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Server, ServerService } from '../../../services/admin/server.service';
import { DatePipe, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-server-management',
  standalone: true,
  imports:  [FormsModule, ReactiveFormsModule,DatePipe,NgIf,NgFor],
  templateUrl: './server-management.component.html',
  styleUrls: ['./server-management.component.css']
})
export class ServerManagementComponent implements OnInit {
  servers: Server[] = [];
  serverForm: FormGroup;
  loading = false;
  error = '';
  isEditing = false;
  selectedServerId: number | null = null;

  serverTypes = [
    { value: 'cdn', label: 'CDN' },
    { value: 'direct', label: 'Direct' },
    { value: 'embed', label: 'Embed' }
  ];

  constructor(
    private serverService: ServerService,
    private fb: FormBuilder
  ) {
    this.serverForm = this.fb.group({
      Name: ['', [Validators.required]],
      Type: ['embed', [Validators.required]],
      Priority: [0, [Validators.required, Validators.min(0)]],
      IsActive: [true]
    });
  }

  ngOnInit() {
    this.loadServers();
  }

  loadServers() {
    this.loading = true;
    this.serverService.getServers().subscribe({
      next: (response) => {
        if (response.success) {
          this.servers = response.data;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Không thể tải danh sách server';
        this.loading = false;
      }
    });
  }

  onSubmit() {
    if (this.serverForm.valid) {
      this.loading = true;
      const serverData = this.serverForm.value;

      const request = this.isEditing
        ? this.serverService.updateServer(this.selectedServerId!, serverData)
        : this.serverService.addServer(serverData);

      request.subscribe({
        next: (response) => {
          if (response.success) {
            this.loadServers();
            this.resetForm();
          } else {
            this.error = response.message;
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Có lỗi xảy ra';
          this.loading = false;
        }
      });
    }
  }

  editServer(server: Server) {
    this.isEditing = true;
    this.selectedServerId = server.ServerID;
    this.serverForm.patchValue({
      Name: server.Name,
      Type: server.Type,
      Priority: server.Priority,
      IsActive: server.IsActive
    });
  }

  deleteServer(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa server này?')) {
      this.loading = true;
      this.serverService.deleteServer(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadServers();
          } else {
            this.error = response.message;
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Không thể xóa server';
          this.loading = false;
        }
      });
    }
  }

  resetForm() {
    this.isEditing = false;
    this.selectedServerId = null;
    this.serverForm.reset({
      Name: '',
      Type: 'embed',
      Priority: 0,
      IsActive: true
    });
  }
}
