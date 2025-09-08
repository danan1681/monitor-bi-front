import { Injectable } from '@angular/core'; // Asegúrate de importar Injectable
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
import { LoginService } from 'src/app/core/services/login.service';
import { RespuestaValidarSession } from 'src/app/core/models/usuario.model';

@Injectable({
  providedIn: 'root', // Esto hace que el servicio esté disponible globalmente
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router, // Renombré 'routes' a 'router' para mayor claridad
    private loginService: LoginService
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.loginService.validarSession().pipe(
      map((data: RespuestaValidarSession) => {
        if (data.code === 200) {
          return true;
        } else {
          this.router.navigate(['/authentication/login']);
          return false;
        }
      }),
      catchError((error: any) => {
        this.router.navigate(['/authentication/login']);
        return of(false); // Usa `of(false)` para devolver un Observable válido
      })
    );
  }
}
