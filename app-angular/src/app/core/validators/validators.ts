
import {AbstractControl, AsyncValidatorFn, FormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {distinctUntilChanged, first, Observable, of} from 'rxjs';
import { catchError, map, debounceTime, switchMap } from 'rxjs/operators';
import { UsuariosService } from '../services/usuarios.service';
import { CandidaturasService } from "../services/candidaturas.service";
import {SimpatizantesService} from "../services/simpatizantes.service";
import {StarterServices} from "../services/starter.service";


export function confirmarContrasenaValidator(contrasena: string) {
  return (control: AbstractControl): ValidationErrors | null => {
    const formGroup = control.parent;
    if (!formGroup) {
      return null;
    }

    const passwordControl = formGroup.get(contrasena);
    if (!passwordControl) {
      return null;
    }

    const password = passwordControl.value;
    const confirmPassword = control.value;

    return password === confirmPassword ? null : { passwordMatch: true };
  };
}

export function contenidoVacio(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const content = control.value || '';
    const plainText = content.replace(/<(.|\n)*?>/g, '').trim(); // Eliminar etiquetas y verificar el texto
    const containsText = plainText.length > 0;

    return containsText ? null : { 'required': true }; // Retorna error si solo hay etiquetas vacías
  };
}


export function correoExistenteValidator(usuarioService: UsuariosService, correoOriginal?: string): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const nuevoCorreo = control.value;

    if (!nuevoCorreo) return of(null);

    if (correoOriginal && nuevoCorreo === correoOriginal) return of(null);

    return usuarioService.verificarCorreoExistente(nuevoCorreo).pipe(
      map((existe: boolean) => {
        return existe ? { correoExistente: true } : null;
      })
    );
  };
}

export function telefonoUsuarioExistenteValidator(usuarioService: UsuariosService, telefonoOriginal?: string): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const nuevoTelefono = control.value;

    if (!nuevoTelefono) return of(null);

    if (telefonoOriginal && nuevoTelefono === telefonoOriginal) return of(null);

    return usuarioService.verificarTelefonoExistente(nuevoTelefono).pipe(
      map((existe: boolean) => {
        return existe ? { telefonoExistente: true } : null;
      })
    );
  };
}
//
//
// export function curpExistenteValidator(usuarioService: UsuariosService, curpOriginal?: string): AsyncValidatorFn {
//   return (control: AbstractControl): Observable<ValidationErrors | null> => {
//     const nuevoCurp = control.value;
//
//     // Si está vacío, no se valida
//     if (!nuevoCurp) return of(null);
//
//     // Si se está actualizando y el valor no cambió, no validamos
//     if (curpOriginal && nuevoCurp === curpOriginal) return of(null);
//
//     // Validación en el backend
//     return usuarioService.verificarCurpExistente(nuevoCurp).pipe(
//       map((existe: boolean) => {
//         return existe ? { curpExistente: true } : null;
//       })
//     );
//   };
// }

export function curpExistenteValidator(usuarioService: UsuariosService, curpOriginal?: string, id_evento?: string): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const nuevoCurp = control.value;

    if (!nuevoCurp) return of(null);
    if (curpOriginal && nuevoCurp === curpOriginal) return of(null);

    return usuarioService.verificarCurpExistente(nuevoCurp, id_evento).pipe(
      map((existe: boolean) => existe ? { curpExistente: true } : null)
    );
  };
}


// export function curpExistenteSimpatizanteValidator(simpatizanteService: SimpatizantesService, curpOriginal?: string): AsyncValidatorFn {
//   return (control: AbstractControl): Observable<ValidationErrors | null> => {
//     const nuevoCurp = control.value;
//
//     // Si está vacío, no se valida
//     if (!nuevoCurp) return of(null);
//
//     // Si se está actualizando y el valor no cambió, no validamos
//     if (curpOriginal && nuevoCurp === curpOriginal) return of(null);
//
//     // Validación en el backend
//     return simpatizanteService.verificarCurpsimpatizante(nuevoCurp).pipe(
//       map((existe: boolean) => {
//         return existe ? { curpExistente: true } : null;
//       })
//     );
//   };
// }

export function curpExistenteSimpatizanteValidator(simpatizanteService: SimpatizantesService, curpOriginal?: string, id_evento?: string): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const nuevoCurp = control.value;

    if (!nuevoCurp) return of(null);
    if (curpOriginal && nuevoCurp === curpOriginal) return of(null);

    return simpatizanteService.verificarCurpExistente(nuevoCurp, id_evento).pipe(
      map((existe: boolean) => existe ? { curpExistente: true } : null)
    );
  };
}

export function telefonoExistenteValidator(simpatizanteService: SimpatizantesService, telefonoOriginal?: string, id_evento?: string): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const nuevoTelefono = control.value;

    if (!nuevoTelefono) return of(null);
    if (telefonoOriginal && nuevoTelefono === telefonoOriginal) return of(null);

    return simpatizanteService.verificarTelefonoExistente(nuevoTelefono, id_evento).pipe(
      map((existe: boolean) => existe ? { telefonoExistente: true } : null)
    );
  };
}


// export class nombreExistenteValidator {
//   static nombreUnico(candidaturaService: CandidaturasService, nombreActual?: string) {
//     return (control: AbstractControl): Observable<{ nombreExistente: boolean } | null> => {
//       // Evitar hacer la solicitud si el campo está vacío o no ha cambiado
//       if (!control.value || control.value === nombreActual) {
//         return of(null);
//       }
//
//       return of(control.value).pipe(
//         debounceTime(500), // Esperar 300 ms tras la última entrada
//         distinctUntilChanged(), // Solo disparar si el valor cambia
//         switchMap((nombre: any) =>
//           candidaturaService.verificarNombreExistente(nombre).pipe(
//             map((isTaken: boolean) => (isTaken ? { nombreExistente: true } : null)),
//             catchError(() => of(null)) // En caso de error, devolver null
//           )
//         )
//       );
//     };
//   }
// }


export class nombreExistenteValidator {
  static nombreUnico(
    candidaturaService: CandidaturasService,
    id_evento: string,
    nombreActual?: string
  ): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const nombre = control.value;

      // Evitar validación innecesaria si el campo está vacío o no ha cambiado
      if (!nombre || nombre === nombreActual) {
        return of(null);
      }

      return of(nombre).pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((nombre) =>
          candidaturaService.verificarNombreExistente(nombre, id_evento).pipe(
            map((isTaken: boolean) =>
              isTaken ? { nombreExistente: true } : null
            ),
            catchError(() => of(null)) // Si hay error, no bloquear el formulario
          )
        )
      );
    };
  }
}


export function seccionExisteValidator(starterService: StarterServices): AsyncValidatorFn {
  return (control: AbstractControl) => {
    return control.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => starterService.validarSeccionExiste(value)),
      map(existe => (existe ? null : { seccionNoExiste: true })),
      first()
    );
  };
}


