import {
    CanActivateFn,
    Router
} from '@angular/router';

import {Injectable,inject} from '@angular/core'; // Asegúrate de importar Injectable
import {catchError, map, Observable, of} from 'rxjs';
import {LoginService} from 'src/app/core/services/login.service';


export const authAdminGuard: CanActivateFn = (route, state) => {
    const authService = inject(LoginService);
    const router = inject(Router);
    return authService.validarSessionAdmin().pipe(
        map(response => {
            if (response.code === 200) {
                return true;
            } else {
                router.navigate(['/authentication/login']);
                return false;
            }
        })
    );
};
