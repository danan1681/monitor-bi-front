import {ResponseApi} from "./response.model";
import {Candidato} from "./candidato.model";

export interface CandidatosResponse extends ResponseApi {
  data: Candidato[];
}

export interface CandidatoCreate extends Omit<Candidato, '_id' | 'token'> {}

export interface CandidatoUpdate extends Omit<Candidato, '_id' | 'createdAt' | 'updatedAt'| 'token' | 'contrasena'> {
  id_candidato: string;
}

export interface CandidatoResponse extends ResponseApi {
  data: Candidato;
}
