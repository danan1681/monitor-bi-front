import {ResponseApi} from "./response.model";
import {Evento} from "./eventos.model";

export interface EventosResponse extends ResponseApi {
  data: Evento[];
}

export interface EventoCreate extends Omit<Evento, '_id' > {}

export interface EventoUpdate extends Omit<Evento, '_id' | 'createdAt' | 'updatedAt'> {
  id_evento: string;
}

export interface EventoResponse extends ResponseApi {
  data: Evento;
}
