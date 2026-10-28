import { EstadoTarea, PrioridadTarea } from '../../core/models/tarea.model';

/** Textos que ve el usuario para los valores del backend (el JSON usa los códigos en mayúsculas). */
export const ETIQUETA_ESTADO: Record<EstadoTarea, string> = {
  POR_HACER: 'Por hacer',
  EN_CURSO: 'En curso',
  HECHA: 'Hecha',
};

export const ETIQUETA_PRIORIDAD: Record<PrioridadTarea, string> = {
  BAJA: 'Baja',
  MEDIA: 'Media',
  ALTA: 'Alta',
};

/** "2026-10-31" -> "31-10-2026" (sin pasar por Date, para evitar corrimientos de zona horaria). */
export function formatearFecha(iso: string): string {
  const [anio, mes, dia] = iso.split('-');
  return `${dia}-${mes}-${anio}`;
}

/** Fecha de hoy como "YYYY-MM-DD" en hora local. */
export function hoyIso(): string {
  const ahora = new Date();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  return `${ahora.getFullYear()}-${mes}-${dia}`;
}
