import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ViewHistoryItem, ViewHistoryService } from '../../services/view-history.service';
import { AuthService } from '../../services/auth.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-view-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './view-history.component.html',
  styleUrl: './view-history.component.css'
})
export class ViewHistoryComponent implements OnInit {
  historyItems: ViewHistoryItem[] = [];
  loading = false;
  error = '';
  userId : any = '';
  constructor(
    private viewHistoryService: ViewHistoryService,
    private authService: AuthService,
    private router: Router,
    private titleService: Title,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.titleService.setTitle('Lịch Sử Xem | WebNosime');
    this.route.params.subscribe(params => {
      this.userId = +params['userId'];
      this.loadHistory();
    });
  }

  loadHistory() {
    this.loading = true;
    this.viewHistoryService.getUserHistory(this.userId)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.historyItems = response.data;
          }
        },
        error: (err) => {
          console.error('Lỗi khi tải lịch sử:', err);
          this.error = 'Không thể tải lịch sử xem phim';
        },
        complete: () => {
          this.loading = false;
        }
      });
  }

  resumeMovie(item: ViewHistoryItem) {
    // Chuyển đến trang phim với slug và chọn tập
    this.router.navigate(['/phim', item.movie.slug], {
      fragment: `episode-${item.episode.episodeNumber}`
    });
  }
}
