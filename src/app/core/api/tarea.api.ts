import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { EstadoTarea, Tarea, TareaRequest } from '../models/tarea.model';

/** Único lugar que conoce las rutas HTTP del backend (Spring Boot, /api/tareas). */
@Injectable({ providedIn: 'root' })
export class TareaApi {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/tareas';

  listar(): Observable<Tarea[]> {
    return this.http.get<Tarea[]>(this.base);
  }

  crear(request: TareaRequest): Observable<Tarea> {
    return this.http.post<Tarea>(this.base, request);
  }

  actualizar(id: number, request: TareaRequest): Observable<Tarea> {
    return this.http.put<Tarea>(`${this.base}/${id}`, request);
  }

  mover(id: number, estado: EstadoTarea): Observable<Tarea> {
    return this.http.patch<Tarea>(`${this.base}/${id}/estado`, { estado });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
