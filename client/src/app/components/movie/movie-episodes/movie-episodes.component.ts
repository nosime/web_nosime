import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Episode, ServerEpisodes } from '../../../services/movie.service';
import { MovieViewComponent } from "../movie-view/movie-view.component";
import { ViewHistoryService } from '../../../services/view-history.service';
import { AuthService } from '../../../services/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-movie-episodes',
  standalone: true,
  imports: [CommonModule, MovieViewComponent],
  templateUrl: './movie-episodes.component.html',
  styleUrl: './movie-episodes.component.css'
})
export class MovieEpisodesComponent implements OnInit {
  @Input() set movieServers(servers: ServerEpisodes[]) {
    this._movieServers = this.filterUniqueServers(servers);
    this.initializeFirstEpisode();
  }
  @Input() movieId!: number;

  constructor(
    private viewHistoryService: ViewHistoryService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  get movieServers(): ServerEpisodes[] {
    return this._movieServers;
  }

  get episodes(): Episode[] {
    return this.selectedServer?.episodes || [];
  }

  private _movieServers: ServerEpisodes[] = [];
  selectedServer: ServerEpisodes | null = null;
  selectedEpisode: Episode | null = null;

  ngOnInit() {
    this.initializeFirstEpisode();
    this.route.fragment.subscribe(fragment => {
      if (fragment && fragment.startsWith('episode-')) {
        const episodeNumber = parseInt(fragment.split('-')[1]);
        if (!isNaN(episodeNumber)) {
          // Tìm và chọn tập phim
          const episode = this.episodes.find(ep =>
            ep.EpisodeNumber === episodeNumber
          );
          if (episode) {
            this.selectEpisode(episode);
            // Scroll tới player giữa màn hình
            setTimeout(() => {
              const playerElement = document.querySelector('.episodes-container');
              if (playerElement) {
                const windowHeight = window.innerHeight;
                const playerRect = playerElement.getBoundingClientRect();
                const scrollTo = window.scrollY + playerRect.top - (windowHeight - playerRect.height) / 2;
                window.scrollTo({
                  top: scrollTo - 300,
                  behavior: 'smooth'
                });
              }
            }, 100);
          }
        }
      }
    });
  }

  private initializeFirstEpisode(): void {
    if (this._movieServers.length > 0) {
      const firstServer = this._movieServers[0];
      this.selectedServer = firstServer;

      if (firstServer.episodes?.length) {
        const firstEp = firstServer.episodes[0];
        this.selectedEpisode = firstEp;

        // Chỉ lưu lịch sử nếu đã login
        const currentUser = this.authService.currentUserValue;
        if (currentUser) {
          this.saveViewHistory(firstEp);
        }
      }
    }
  }

  changeServer(server: ServerEpisodes): void {
    if (server === this.selectedServer) {
      return; // Bỏ qua nếu chọn lại server cũ
    }

    this.selectedServer = server;
    if (server.episodes?.length) {
      const firstEp = server.episodes[0];
      this.selectedEpisode = firstEp;
      this.saveViewHistory(firstEp);
      this.scrollToPlayer();
    }
  }

  selectEpisode(episode: Episode): void {
    if (episode === this.selectedEpisode) {
      return; // Bỏ qua nếu chọn lại tập cũ
    }

    this.selectedEpisode = episode;
    this.saveViewHistory(episode);
    this.scrollToPlayer();
  }

private saveViewHistory(episode: Episode): void {
  // Kiểm tra user đã đăng nhập chưa
  const currentUser = this.authService.currentUserValue;
  if (!currentUser) {
    console.log('Chưa đăng nhập, bỏ qua lưu lịch sử');
    return;
  }

  // Kiểm tra đủ thông tin cần thiết
  if (!this.selectedServer || !this.movieId || !episode) {
    console.error('Thiếu thông tin để lưu lịch sử');
    return;
  }

  // Kiểm tra nếu đang xem lại cùng một tập
  if (this.selectedEpisode?.EpisodeID === episode.EpisodeID) {
    console.log('Đang xem lại tập cũ, chỉ cập nhật thời gian');
  }

  // Gọi API lưu lịch sử
  this.viewHistoryService.saveHistory({
    userId: currentUser.UserID,
    movieId: this.movieId,
    episodeId: episode.EpisodeID,
    serverId: this.selectedServer.serverID
  }).subscribe({
    next: (response) => {
      if (response.success) {
        console.log('Đã lưu lịch sử xem:', response.message);
      } else {
        console.error('Lỗi khi lưu:', response.message);
      }
    },
    error: (err) => {
      console.error('Lỗi khi lưu lịch sử:', err);
    }
  });
}

  private scrollToPlayer(): void {
    window.scrollTo({
      top: 730,
      behavior: 'smooth'
    });
  }

  private filterUniqueServers(servers: ServerEpisodes[]): ServerEpisodes[] {
    const serverMap = new Map<string, ServerEpisodes>();

    servers.forEach(server => {
      const existingServer = serverMap.get(server.serverName);

      if (!existingServer) {
        serverMap.set(server.serverName, {
          ...server,
          episodes: this.sortEpisodes(server.episodes)
        });
      } else {
        serverMap.set(server.serverName, {
          ...existingServer,
          episodes: this.mergeAndSortEpisodes(existingServer.episodes, server.episodes)
        });
      }
    });

    return Array.from(serverMap.values());
  }

  private sortEpisodes(episodes: Episode[] | undefined): Episode[] {
    return episodes?.sort((a, b) => a.EpisodeNumber - b.EpisodeNumber) || [];
  }

  private mergeAndSortEpisodes(existing: Episode[] = [], newEpisodes: Episode[] = []): Episode[] {
    const uniqueEpisodes = [...existing];

    newEpisodes.forEach(episode => {
      if (!uniqueEpisodes.find(e => e.EpisodeNumber === episode.EpisodeNumber)) {
        uniqueEpisodes.push(episode);
      }
    });

    return this.sortEpisodes(uniqueEpisodes);
  }
}
