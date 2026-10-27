import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';

import { AuthStore } from './auth.store';

export const authGuard: CanMatchFn = () =>
  inject(AuthStore).isAuthenticated() || inject(Router).createUrlTree(['/login']);

export const guestGuard: CanMatchFn = () =>
  !inject(AuthStore).isAuthenticated() || inject(Router).createUrlTree(['/tabs/colecciones']);
