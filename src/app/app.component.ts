import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { IonApp, IonRouterOutlet, NavController } from '@ionic/angular';

import { AuthStore } from './core/auth/auth.store';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor() {
    const auth = inject(AuthStore);
    const nav = inject(NavController);

    // Session ended underneath the user (refresh token rejected, logout): back to the login screen.
    let wasAuthenticated = auth.isAuthenticated();
    effect(() => {
      const isAuthenticated = auth.isAuthenticated();
      if (wasAuthenticated && !isAuthenticated) {
        void nav.navigateRoot('/login');
      }
      wasAuthenticated = isAuthenticated;
    });
  }
}
