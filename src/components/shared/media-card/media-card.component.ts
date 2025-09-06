
import { Component, ChangeDetectionStrategy, input, AfterViewChecked } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Media } from '../../../models/media.model';

declare var lucide: any;

@Component({
  selector: 'app-media-card',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, RouterLink],
  templateUrl: './media-card.component.html',
  styleUrls: ['./media-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MediaCardComponent implements AfterViewChecked {
  media = input.required<Media>();

  ngAfterViewChecked() {
    lucide.createIcons();
  }
}
