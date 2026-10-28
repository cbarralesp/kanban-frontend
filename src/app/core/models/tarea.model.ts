export type EstadoTarea = 'POR_HACER' | 'EN_CURSO' | 'HECHA';

export type PrioridadTarea = 'BAJA' | 'MEDIA' | 'ALTA';

/** Tarea tal como la entrega la API (GET /api/tareas). Las fechas llegan como texto ISO. */
export interface Tarea {
  id: number;
  titulo: string;
  descripcion: string | null;
  estado: EstadoTarea;
  prioridad: PrioridadTarea;
  fechaLimite: string | null;
  creadaEn: string;
  actualizadaEn: string;
}

/** Datos para crear (POST) o editar (PUT) una tarea. El estado lo maneja el servidor / el tablero. */
export interface TareaRequest {
  titulo: string;
  descripcion: string | null;
  prioridad: PrioridadTarea;
  fechaLimite: string | null;
}

/** Orden de las columnas del tablero: de izquierda a derecha. */
export const ESTADOS: readonly EstadoTarea[] = ['POR_HACER', 'EN_CURSO', 'HECHA'];

/** Máximo de tareas simultáneas en la columna En curso (el backend lo exige igual). */
export const LIMITE_EN_CURSO = 3;

/** Reglas que el formulario repite para avisar antes de enviar (el backend las valida igual). */
export const REGLAS_TAREA = {
  tituloMaxLargo: 100,
  descripcionMaxLargo: 500,
} as const;
