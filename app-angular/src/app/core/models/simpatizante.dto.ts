import {ResponseApi} from "./response.model";
import {ISimpatizante} from "./simpatizante.model";

export interface SimpatizantesResponse extends ResponseApi {
  data: ISimpatizante[];
}

export interface SimpatizanteCreate extends Omit<ISimpatizante, '_id' | 'token'> {}

export interface SimpatizanteUpdate extends Omit<ISimpatizante, '_id' | 'createdAt' | 'updatedAt'| 'token'> {
  id_simpatizante: string;
}

export interface SimpatizanteResponse extends ResponseApi {
  data: ISimpatizante;
}
