import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonInput,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonText,
  NavController,
  SegmentCustomEvent,
} from '@ionic/angular';

import { ApiError } from '../../core/api/api-error';
import { AuthStore } from '../../core/auth/auth.store';

type Mode = 'login' | 'register';

const MIN_PASSWORD_LENGTH = 8;

/** Sign in / sign up. Provisional layout: there is no design for this screen yet. */
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonContent, IonSegment, IonSegmentButton, IonInput, IonButton, IonSpinner, IonText],
})
export class LoginPage {
  private readonly auth = inject(AuthStore);
  private readonly nav = inject(NavController);

  protected readonly minPasswordLength = MIN_PASSWORD_LENGTH;
  protected readonly mode = signal<Mode>('login');
  protected readonly email = signal('');
  protected readonly displayName = signal('');
  protected readonly password = signal('');
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly canSubmit = computed(
    () =>
      !this.submitting() &&
      this.email().includes('@') &&
      this.password().length >= MIN_PASSWORD_LENGTH &&
      (this.mode() === 'login' || this.displayName().trim().length >= 2),
  );

  protected onModeChange(event: SegmentCustomEvent): void {
    this.mode.set(event.detail.value === 'register' ? 'register' : 'login');
    this.error.set(null);
  }

  protected async submit(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.canSubmit()) {
      return;
    }

    this.submitting.set(true);
    this.error.set(null);
    try {
      if (this.mode() === 'login') {
        await this.auth.login(this.email().trim(), this.password());
      } else {
        await this.auth.register(this.email().trim(), this.displayName().trim(), this.password());
      }
      await this.nav.navigateRoot('/tabs/colecciones');
    } catch (error) {
      this.error.set(error instanceof ApiError ? error.message : 'Algo ha fallado. Inténtalo de nuevo.');
    } finally {
      this.submitting.set(false);
    }
  }
}
