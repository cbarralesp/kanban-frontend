import { Injectable, computed, inject, signal } from '@angular/core';
import { EMPTY, Observable, catchError, finalize, map, switchMap, tap } from 'rxjs';

import { TareaApi } from '../../core/api/tarea.api';
import { ApiError } from '../../core/models/api-error';
import {
  EstadoTarea,
  LIMITE_EN_CURSO,
  Tarea,
  TareaRequest,
} from '../../core/models/tarea.model';
import { ToastService } from '../../shared/ui/toast.service';

/**
 * Estado del tablero (patrón Store/Facade con signals).
 * Las páginas leen signals y llaman a métodos; nunca hablan con la API directamente.
 */
@Injectable({ providedIn: 'root' })
export class TareasStore {
  private readonly api = inject(TareaApi);
  private readonly toast = inject(ToastService);

  /** Todas las tareas que hay en el servidor. */
  readonly tareas = signal<Tarea[]>([]);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  /** Las tareas repartidas por columna. */
  readonly tareasPorEstado = computed<Record<EstadoTarea, Tarea[]>>(() => {
    const columnas: Record<EstadoTarea, Tarea[]> = { POR_HACER: [], EN_CURSO: [], HECHA: [] };
    for (const tarea of this.tareas()) {
      columnas[tarea.estado].push(tarea);
    }
    return columnas;
  });

  /** Contadores por columna y si En curso llegó al límite. */
  readonly resumen = computed(() => {
    const columnas = this.tareasPorEstado();
    return {
      total: this.tareas().length,
      porHacer: columnas.POR_HACER.length,
      enCurso: columnas.EN_CURSO.length,
      hechas: columnas.HECHA.length,
      enCursoLleno: columnas.EN_CURSO.length >= LIMITE_EN_CURSO,
    };
  });

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.refrescar()
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({ error: (e: ApiError) => this.error.set(e.message) });
  }

  /**
   * Cada operación devuelve un Observable que emite solo si salió bien;
   * así la pantalla cierra el formulario únicamente en caso de éxito.
   */
  crear(request: TareaRequest): Observable<void> {
    return this.api.crear(request).pipe(
      switchMap(() => this.refrescar()),
      tap(() => this.toast.exito('Tarea creada')),
      catchError(this.fallar),
    );
  }

  actualizar(id: number, request: TareaRequest): Observable<void> {
    return this.api.actualizar(id, request).pipe(
      switchMap(() => this.refrescar()),
      tap(() => this.toast.exito('Tarea actualizada')),
      catchError(this.fallar),
    );
  }

  /** Mueve una tarea de columna. Las reglas (límite, un paso a la vez) las valida el backend. */
  mover(id: number, estado: EstadoTarea): Observable<void> {
    return this.api.mover(id, estado).pipe(
      switchMap(() => this.refrescar()),
      catchError(this.fallar),
    );
  }

  eliminar(id: number): Observable<void> {
    return this.api.eliminar(id).pipe(
      switchMap(() => this.refrescar()),
      tap(() => this.toast.exito('Tarea eliminada')),
      catchError(this.fallar),
    );
  }

  /** Vuelve a pedir la lista al servidor. */
  private refrescar(): Observable<void> {
    return this.api.listar().pipe(
      tap((tareas) => this.tareas.set(tareas)),
      map(() => undefined),
    );
  }

  /** Muestra el error y corta el flujo: el Observable termina sin emitir. */
  private readonly fallar = (error: ApiError): Observable<never> => {
    this.toast.error(error.message);
    return EMPTY;
  };
}
