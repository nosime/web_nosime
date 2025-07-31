import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Episode } from '../../../services/movie.service';

@Component({
  selector: 'app-movie-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-view.component.html',
  styleUrl: './movie-view.component.css'
})
export class MovieViewComponent implements OnChanges {
  @Input() episode: Episode | null = null;
  embedUrl: SafeResourceUrl | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['episode'] && this.episode) {
      this.updateEmbedUrl();
    }
  }

  private updateEmbedUrl() {
    if (this.episode?.EmbedUrl) {
      this.embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.episode.EmbedUrl);
    }
  }
}
