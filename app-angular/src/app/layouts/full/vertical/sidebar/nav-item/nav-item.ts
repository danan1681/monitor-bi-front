export interface NavItem {
    displayName?: string;
    disabled?: boolean;
    external?: boolean;
    twoLines?: boolean;
    chip?: boolean;
    iconName?: string;
    navCap?: string;
    chipContent?: string;
    chipClass?: string;
    subtext?: string;
    route?: string;
    children?: NavItem[];
    ddType?: string;
    notificacionCritica?: string;
    notificacionMedia?: string;
    nombre?: string;
    aprobada?: boolean;
    estatus_seccion?: string;
}




export interface Notificaciones {
//   "nombre": string;
//   "numero_enviadas":string;
//   "numero_vistas":string;
//   "numero_pendientes": string;
}
