import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Episode, EpisodesService } from '../../../../services/admin/episodes.service';
import { Server, ServerService } from '../../../../services/admin/server.service';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-episodes-management',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule,NgFor,NgIf],
  templateUrl: './episodes-management.component.html',
  styleUrls: ['./episodes-management.component.css']
})
export class EpisodesManagementComponent implements OnInit {
  episodes: Episode[] = [];
  servers: Server[] = [];
  episodeForm: FormGroup;
  isEditMode: boolean = false;
  loading = false;
  error = '';
  @Input() movieId!: number;

  constructor(
    private fb: FormBuilder,
    private episodesService: EpisodesService,
    private serversService: ServerService
  ) {
    this.episodeForm = this.fb.group({
      EpisodeID: [null],
      MovieID: this.movieId,
      ServerID: [null, Validators.required],
      Name: ['', Validators.required],
      Slug: ['', Validators.required],
      FileName: ['', Validators.required],
      EpisodeNumber: [1, Validators.required],
      EmbedUrl: ['', [Validators.required, Validators.pattern(/^(http|https):\/\/.+/)]], // URL hợp lệ
    });
  }

  ngOnInit(): void {
    this.loadEpisodes();
    this.loadServers();

    // Gán giá trị movieId vào MovieID của form
    if (this.movieId) {
      this.episodeForm.patchValue({ MovieID: this.movieId });
    }

  }


  loadEpisodes(): void {
    this.loading = true;
    this.episodesService.getEpisodes(this.movieId).subscribe({
      next: (response) => {
        if (response.success) {
          this.episodes = response.data;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Không thể tải danh sách server';
        this.loading = false;
      }
    });
  }

  loadServers() {
    this.loading = true;
    this.serversService.getServers().subscribe({
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


  getServerName(serverId: number): string {
    const server = this.servers.find((s) => s.ServerID === serverId);
    return server ? server.Name : 'N/A';
  }

  generateSlug(): void {
    const name = this.episodeForm.get('Name')?.value || '';
    this.episodeForm.patchValue({ Slug: name.trim().toLowerCase().replace(/ /g, '-') });
  }



  onEdit(episode: any): void {
    this.isEditMode = true;

    // Giữ MovieID trong form khi chỉnh sửa
    this.episodeForm.patchValue({
      EpisodeID: episode.EpisodeID,
      ServerID: episode.ServerID,
      Name: episode.Name,
      Slug: episode.Slug,
      FileName: episode.FileName,
      EpisodeNumber: episode.EpisodeNumber,
      EmbedUrl: episode.EmbedUrl,
      MovieID: this.movieId, // Đảm bảo MovieID được giữ nguyên
    });
  }


  onDelete(episodeID: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa tập này?')) {
      this.episodesService.deleteEpisode(episodeID).subscribe(() => this.loadEpisodes());
    }
  }

  onSubmit(): void {
    if (this.episodeForm.invalid) return;

    const episodeData = this.episodeForm.value;

    if (this.isEditMode) {
      this.episodesService.updateEpisode(episodeData).subscribe(() => {
        this.loadEpisodes();
        this.episodeForm.reset();
        this.isEditMode = false;
      });
    } else {
      this.episodesService.addEpisode(episodeData).subscribe(() => {
        this.loadEpisodes();
        this.episodeForm.reset();
      });
    }
  }

  onCancel(): void {
    this.episodeForm.reset();
    this.isEditMode = false;
  }
}
