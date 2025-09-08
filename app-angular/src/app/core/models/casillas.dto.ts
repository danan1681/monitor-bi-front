import {ResponseApi} from "./response.model";
import {Casilla} from "./casillas.model";

export interface CasillasResponse extends ResponseApi {
  data: Casilla[];
}

export interface CasillaCreate extends Omit<Casilla, '_id' > {}

export interface CasillaUpdate extends Omit<Casilla, '_id' | 'createdAt' | 'updatedAt'> {
  id_casilla: string;
}

export interface CasillaResponse extends ResponseApi {
  data: Casilla;
}
