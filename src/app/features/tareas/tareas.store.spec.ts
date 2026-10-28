import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { errorInterceptor } from '../../core/interceptors/error.interceptor';
import { Tarea } from '../../core/models/tarea.model';
import { TareasStore } from './tareas.store';

const ahora = '2026-10-15T10:00:00';
function tarea(id: number, estado: Tarea['estado']): Tarea {
  return {
    id, titulo: `Tarea ${id}`, descripcion: null, estado, prioridad: 'MEDIA',
    fechaLimite: null, creadaEn: ahora, actualizadaEn: ahora,
  };
}

describe('TareasStore', () => {
  let store: TareasStore;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([errorInterceptor])), provideHttpClientTesting()],
    });
    store = TestBed.inject(TareasStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function cargarDatos(tareas: Tarea[]): void {
    store.cargar();
    http.expectOne('/api/tareas').flush(tareas);
  }

  it('carga las tareas', () => {
    store.cargar();
    expect(store.cargando()).toBe(true);

    http.expectOne('/api/tareas').flush([tarea(1, 'POR_HACER')]);

    expect(store.tareas().length).toBe(1);
    expect(store.cargando()).toBe(false);
  });

  it('reparte las tareas por columna y calcula el resumen', () => {
    cargarDatos([tarea(1, 'POR_HACER'), tarea(2, 'EN_CURSO'), tarea(3, 'HECHA'), tarea(4, 'EN_CURSO')]);

    expect(store.tareasPorEstado().EN_CURSO.map((t) => t.id)).toEqual([2, 4]);
    expect(store.resumen()).toEqual({ total: 4, porHacer: 1, enCurso: 2, hechas: 1, enCursoLleno: false });
  });

  it('avisa cuando En curso llega al límite de 3', () => {
    cargarDatos([tarea(1, 'EN_CURSO'), tarea(2, 'EN_CURSO'), tarea(3, 'EN_CURSO')]);

    expect(store.resumen().enCursoLleno).toBe(true);
  });

  it('guarda el mensaje si el servidor no responde', () => {
    store.cargar();
    http.expectOne('/api/tareas').error(new ProgressEvent('error'), { status: 0 });

    expect(store.error()).toContain('No hay conexión');
    expect(store.cargando()).toBe(false);
  });

  it('crea con POST y recarga la lista', () => {
    cargarDatos([]);
    let terminado = false;

    store
      .crear({ titulo: 'Nueva', descripcion: null, prioridad: 'ALTA', fechaLimite: null })
      .subscribe(() => (terminado = true));

    const post = http.expectOne('/api/tareas');
    expect(post.request.method).toBe('POST');
    post.flush(tarea(1, 'POR_HACER'));
    http.expectOne('/api/tareas').flush([tarea(1, 'POR_HACER')]);

    expect(terminado).toBe(true);
    expect(store.tareas().length).toBe(1);
  });

  it('mueve con PATCH y recarga la lista', () => {
    cargarDatos([tarea(1, 'POR_HACER')]);

    store.mover(1, 'EN_CURSO').subscribe();

    const patch = http.expectOne('/api/tareas/1/estado');
    expect(patch.request.method).toBe('PATCH');
    expect(patch.request.body).toEqual({ estado: 'EN_CURSO' });
    patch.flush(tarea(1, 'EN_CURSO'));
    http.expectOne('/api/tareas').flush([tarea(1, 'EN_CURSO')]);

    expect(store.tareasPorEstado().EN_CURSO.length).toBe(1);
  });

  it('si el servidor rechaza el movimiento (409) no emite y deja el tablero igual', () => {
    cargarDatos([tarea(1, 'POR_HACER')]);
    let terminado = false;

    store.mover(1, 'EN_CURSO').subscribe(() => (terminado = true));

    http
      .expectOne('/api/tareas/1/estado')
      .flush({ mensaje: 'La columna En curso ya tiene el máximo de 3 tareas' }, { status: 409, statusText: 'Conflict' });

    expect(terminado).toBe(false);
    expect(store.tareas()[0].estado).toBe('POR_HACER');
  });

  it('edita con PUT y elimina con DELETE', () => {
    cargarDatos([tarea(1, 'POR_HACER'), tarea(2, 'POR_HACER')]);

    store.actualizar(1, { titulo: 'X', descripcion: null, prioridad: 'BAJA', fechaLimite: null }).subscribe();
    const put = http.expectOne('/api/tareas/1');
    expect(put.request.method).toBe('PUT');
    put.flush(tarea(1, 'POR_HACER'));
    http.expectOne('/api/tareas').flush([tarea(1, 'POR_HACER'), tarea(2, 'POR_HACER')]);

    store.eliminar(2).subscribe();
    const del = http.expectOne('/api/tareas/2');
    expect(del.request.method).toBe('DELETE');
    del.flush(null);
    http.expectOne('/api/tareas').flush([tarea(1, 'POR_HACER')]);

    expect(store.tareas().length).toBe(1);
  });
});
