import {
  OnInit,
  Component,
  ViewChild,
  ViewEncapsulation,
  Input,
} from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Usuario } from '../../core/models/usuario.model';
import { MatDialog } from '@angular/material/dialog';
import { UsuariosService } from '../../core/services/usuarios.service';
import { NgClass, NgIf, SlicePipe } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { ToastrModule } from 'ngx-toastr';
import { LoginService } from 'src/app/core/services/login.service';
import { UsuariosDialogComponent } from './usuarios-dialog/usuarios-dialog.component';
import { MatChipsModule } from '@angular/material/chips';
import { StarterServices } from '../../core/services/starter.service';
import { IDependencias, IRoles } from '../../core/models/datos-estaticos1';
import { EventoTituloComponent } from '../../components/evento-titulo/evento-titulo.component';
import {EventosService} from "../../core/services/eventos.service";
import {Evento} from "../../core/models/eventos.model";
import {EventosResponse} from "../../core/models/eventos.dto";

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss'],
  standalone: true,
  imports: [
    MaterialModule,
    TablerIconsModule,
    ToastrModule,
    SlicePipe,
    NgClass,
    MatChipsModule,
    EventoTituloComponent,
    NgIf,
  ],
  providers: [LoginService],
  encapsulation: ViewEncapsulation.None,
})
export class UsuariosComponent implements OnInit {
  @ViewChild(MatTable, { static: true }) table: MatTable<any> =
    Object.create(null);
  @Input() id_evento?: string | null; // <- opcional para usarlo fuera de contexto de eventos

  displayedColumns: string[] = [
    'nombre',
    'correo',
    'rol',
    'telefono',
    'estatus',
    'action',
  ];


  usuarios: Usuario[] = [];
  _id: any;
  dataSource = new MatTableDataSource(this.usuarios);
  private idEventoEsInput: boolean = false;
  clave_rol_usuario: number = 0;
  textoBotonUsuario: string = 'Agregar Usuario';

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator =
    Object.create(null);
  user: any;

  constructor(
    private usuariosService: UsuariosService,
    private starterService: StarterServices,
    private eventoService: EventosService,
    public dialog: MatDialog
  ) {}

  // ngOnInit(): void {
  //   if (this.id_evento && this.id_evento !== 'null') {
  //     this.idEventoEsInput = true;
  //   }
  //
  //   if (!this.idEventoEsInput) {
  //     const localEvento = localStorage.getItem('id_evento');
  //     const claveRol = Number(localStorage.getItem('clave_rol'));
  //     this.clave_rol_usuario = claveRol;
  //
  //     if (localEvento && localEvento !== 'null') {
  //       this.id_evento = localEvento;
  //     }
  //   }
  //   this.definirTextoBoton();
  //   this.obtenerTablaUsuario();
  //   this.dataSource.paginator = this.paginator;
  // }

  ngOnInit(): void {
    if (this.id_evento && this.id_evento !== 'null') {
      this.idEventoEsInput = true;
    }

    const localEvento = localStorage.getItem('id_evento');
    const claveRol = Number(localStorage.getItem('clave_rol'));
    this.clave_rol_usuario = claveRol;

    if (!this.idEventoEsInput && localEvento && localEvento !== 'null') {
      this.id_evento = localEvento;
    }

    if (this.clave_rol_usuario === 27) {
      this.displayedColumns.splice(3, 0, 'evento');
      // inserta "evento" antes de teléfono, o ajusta la posición como prefieras
    }

    this.definirTextoBoton();
    this.obtenerTablaUsuario();
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  definirTextoBoton(): void {
    if (this.clave_rol_usuario === 27) {
      this.textoBotonUsuario = 'Agregar Usuario';
    } else if (this.clave_rol_usuario === 35) {
      this.textoBotonUsuario = 'Agregar Promotor'
    } else if (this.clave_rol_usuario === 48) {
      this.textoBotonUsuario = 'Agregar Enlace';
    } else {
      this.textoBotonUsuario = 'Agregar Usuario';
    }
    console.log(this.textoBotonUsuario);
  }

  // obtenerTablaUsuario() {
  //   this.usuariosService.ObtenerTablaUsuarios().subscribe((res: any) => {
  //     let usuariosFiltrados = res.data;
  //
  //     if (this.id_evento && this.idEventoEsInput) {
  //       usuariosFiltrados = usuariosFiltrados.filter(
  //         (usuario: any) => usuario.id_evento === this.id_evento
  //       );
  //     }
  //
  //     if (!this.id_evento && !this.idEventoEsInput) {
  //       usuariosFiltrados = usuariosFiltrados.filter(
  //         (usuario: any) => !usuario.id_evento
  //       );
  //     }
  //
  //     this.usuarios = usuariosFiltrados;
  //
  //     this.starterService.getRoles().subscribe((roles: IRoles[]) => {
  //       this.starterService
  //         .getDependencias()
  //         .subscribe((dependencias: IDependencias[]) => {
  //           if (this.usuarios) {
  //             this.usuarios = this.usuarios.map((usuario: any) => {
  //               const nombreCompleto = `${usuario.nombre} ${usuario.ap_paterno} ${usuario.ap_materno}`;
  //               const nombre_rol =
  //                 roles.find(
  //                   (rol: IRoles) => rol.clave_rol === usuario.clave_rol
  //                 )?.nombre_rol || 'Sin Rol';
  //               // const nombre_dependencia = dependencias.find((dependencia: IDependencias) => dependencia.clave_dependencia === usuario.clave_dependencia)?.nombre_dependencia || 'Sin Dependencia';
  //               return {
  //                 ...usuario,
  //                 nombre_rol,
  //                 // nombre_dependencia,
  //                 nombreCompleto,
  //               };
  //             });
  //           }
  //           this.dataSource = new MatTableDataSource<any>(this.usuarios);
  //           this.dataSource.paginator = this.paginator;
  //         });
  //     });
  //   });
  // }

  // obtenerTablaUsuario() {
  //   this.usuariosService.ObtenerTablaUsuarios().subscribe((res: any) => {
  //     let usuarios = res?.data ?? [];
  //
  //     const sameEvent = (u: any, idEvento?: string | null) => {
  //       if (!idEvento || idEvento === 'null') return true; // sin contexto, no filtra por evento
  //       const val = u?.id_evento;
  //       if (!val) return false;
  //       try {
  //         const asStr =
  //           typeof val === 'string'
  //             ? val
  //             : val?.$oid ?? val?.toString?.() ?? String(val);
  //         return String(asStr) === String(idEvento);
  //       } catch {
  //         return false;
  //       }
  //     };
  //
  //     if (this.clave_rol_usuario === 27) {
  //       usuarios = usuarios.filter(
  //         (u: any) =>
  //           u?.clave_rol === 35 &&
  //           !!u?.id_evento && // debe existir id_evento
  //           sameEvent(u, this.id_evento) // si hay contexto de evento, filtra por ese
  //       );
  //     } else if (this.clave_rol_usuario === 35) {
  //       usuarios = usuarios.filter(
  //         (u: any) =>
  //           (u?.clave_rol === 48 || u?.clave_rol === 49) &&
  //           sameEvent(u, this.id_evento) // mismo evento que el admin está gestionando
  //       );
  //     }
  //
  //     // Mapea nombre_rol / nombreCompleto
  //     this.starterService.getRoles().subscribe((roles: IRoles[]) => {
  //       this.starterService.getDependencias().subscribe((dependencias: IDependencias[]) => {
  //         this.usuarios = (usuarios ?? []).map((usuario: any) => {
  //           const nombreCompleto = `${usuario.nombre} ${usuario.ap_paterno} ${usuario.ap_materno}`;
  //           const nombre_rol =
  //             roles.find((rol: IRoles) => rol.clave_rol === usuario.clave_rol)?.nombre_rol || 'Sin Rol';
  //           return {
  //             ...usuario,
  //             nombre_rol,
  //             nombreCompleto,
  //           };
  //         });
  //
  //         this.dataSource = new MatTableDataSource<any>(this.usuarios);
  //         this.dataSource.paginator = this.paginator;
  //
  //
  //       });
  //     });
  //   });
  // }


  obtenerTablaUsuario() {
    this.usuariosService.ObtenerTablaUsuarios().subscribe((res: any) => {
      let usuarios = res?.data ?? [];

      const sameEvent = (u: any, idEvento?: string | null) => {
        if (!idEvento || idEvento === 'null') return true;
        const val = u?.id_evento;
        if (!val) return false;
        try {
          const asStr =
            typeof val === 'string'
              ? val
              : val?.$oid ?? val?.toString?.() ?? String(val);
          return String(asStr) === String(idEvento);
        } catch {
          return false;
        }
      };

      if (this.clave_rol_usuario === 27) {
        // Superadmin → administradores por evento
        usuarios = usuarios.filter(
          (u: any) => u?.clave_rol === 35 && !!u?.id_evento && sameEvent(u, this.id_evento)
        );
      } else if (this.clave_rol_usuario === 35) {
        // Admin → promotores y enlaces del mismo evento
        usuarios = usuarios.filter(
          (u: any) => (u?.clave_rol === 48 || u?.clave_rol === 49) && sameEvent(u, this.id_evento)
        );
      } else if (this.clave_rol_usuario === 48) {
        // Promotor → el backend ya devuelve solo sus enlaces; no filtres más
      }

      // Mapear nombre completo y nombre_rol
      this.starterService.getRoles().subscribe((roles: IRoles[]) => {
        const base = (usuarios ?? []).map((usuario: any) => {
          const nombreCompleto = `${usuario.nombre} ${usuario.ap_paterno} ${usuario.ap_materno}`;
          const nombre_rol =
            roles.find((rol: IRoles) => rol.clave_rol === usuario.clave_rol)?.nombre_rol || 'Sin Rol';
          return { ...usuario, nombre_rol, nombreCompleto };
        });

        if (this.clave_rol_usuario === 27) {
          // 🔵 SOLO el superadmin carga y mapea eventos
          this.eventoService.obtenerEventos().subscribe((response: EventosResponse) => {
            if (response.code === 200) {
              const eventos = response.data; // Evento[] con campo .nombre
              this.usuarios = base.map((u: any) => {
                const id = typeof u.id_evento === 'string' ? u.id_evento : u.id_evento?.$oid;
                const evento = eventos.find(e => e._id === id);
                return { ...u, nombre_evento: evento?.nombre || 'Sin evento' };
              });
            } else {
              this.usuarios = base.map((u:any) => ({ ...u, nombre_evento: 'Sin evento' }));
            }
            this.dataSource = new MatTableDataSource<any>(this.usuarios);
            this.dataSource.paginator = this.paginator;
          }, _err => {
            this.usuarios = base.map((u: any) => ({ ...u, nombre_evento: 'Sin evento' }));
            this.dataSource = new MatTableDataSource<any>(this.usuarios);
            this.dataSource.paginator = this.paginator;
          });
        } else {
          // 🟢 Admin (35) y Promotor (48): NO cargar eventos, asigna directo
          this.usuarios = base;
          this.dataSource = new MatTableDataSource<any>(this.usuarios);
          this.dataSource.paginator = this.paginator;
        }
      });
    });
  }


  openNuevoUsuario(action: string, usuario: any): void {
    const dialogUsuarioNuevo = this.dialog.open(UsuariosDialogComponent, {
      data: { action, dato_usuario: usuario, id_evento: this.id_evento },
    });
  }
}
