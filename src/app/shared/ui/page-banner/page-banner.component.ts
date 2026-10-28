import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IonIcon, IonSkeletonText } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { chevronBack } from 'ionicons/icons';

/**
 * Striped header in the collection's tone with big faint letters behind the
 * title. While `loading`, the back button stays usable and the texts are
 * skeletons. Project actions with `[actions]` and the icon tile with `[icon]`.
 */
@Component({
  selector: 'app-page-banner',
  templateUrl: './page-banner.component.html',
  styleUrls: ['./page-banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonIcon, IonSkeletonText],
})
export class PageBannerComponent {
  readonly hue = input(30);
  readonly ghost = input('');
  readonly eyebrow = input('');
  readonly title = input('');
  readonly backLabel = input.required<string>();
  readonly loading = input(false);

  readonly back = output<void>();

  constructor() {
    addIcons({ chevronBack });
  }
}
