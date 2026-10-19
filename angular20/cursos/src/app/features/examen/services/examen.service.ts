import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_BASE } from '../../../core/config/api.config';
import { CommonService } from '../../../shared/common.service';
import { Examen } from '../models/examen.model';

@Injectable({ providedIn: 'root' })
export class ExamenService extends CommonService<Examen> {

  constructor() {
    super(inject(HttpClient), `${API_BASE}/examenes`);
  }
}