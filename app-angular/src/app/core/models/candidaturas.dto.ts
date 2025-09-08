import {ResponseApi} from "./response.model";
import {Candidatura} from "./candidaturas.model";

export interface CandidaturasResponse extends ResponseApi {
  data: Candidatura[];
}

export interface CandidaturaCreate extends Omit<Candidatura, '_id' > {}

export interface CandidaturaUpdate extends Omit<Candidatura, '_id' | 'createdAt' | 'updatedAt'| 'estatus'> {
  id_candidatura: string;
}

export interface CandidaturaResponse extends ResponseApi {
  data: Candidatura;
}
