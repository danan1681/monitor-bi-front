import {CanActivateFn, Router} from "@angular/router";
import {inject} from "@angular/core";
import {LoginService} from "../services/login.service";
import {catchError, map, of} from "rxjs";

export const authAdminOrPromotorGuard: CanActivateFn = (route, state) => {
  const authService = inject(LoginService);
  const router = inject(Router);

  return authService.validarSessionAdmin().pipe(
    map(response => {
      if (response.code === 200) {
        return true;
      }
      throw new Error('Admin validation failed or returned non-200 code');
    }),
    catchError(adminError => {
      return authService.validarSessionPromotor().pipe(
        map(response => {
          if (response.code === 200) {
            return true;
          } else {
            router.navigate(['/authentication/login']);
            return false;
          }
        }),
        catchError(promotorError => {
          router.navigate(['/authentication/login']);
          return of(false);
        })
      );
    })
  );
};
