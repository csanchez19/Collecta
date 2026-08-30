import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { sparklesOutline } from 'ionicons/icons';

/**
 * One reusable "coming soon" screen for routes still on the roadmap. Title and
 * copy arrive from route `data` via router input binding — no per-screen file
 * until the real screen is built.
 */
@Component({
  selector: 'app-placeholder',
  templateUrl: './placeholder.page.html',
  styleUrls: ['./placeholder.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonIcon],
})
export class PlaceholderPage {
  readonly title = input('Collecta');
  readonly message = input('Estamos montando esta pantalla. Vuelve pronto.');

  constructor() {
    addIcons({ sparklesOutline });
  }
}
