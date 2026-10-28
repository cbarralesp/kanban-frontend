import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';

import {
  ESTADOS,
  EstadoTarea,
  LIMITE_EN_CURSO,
  Tarea,
  TareaRequest,
} from '../../../core/models/tarea.model';
import { ConfirmDialog } from '../../../shared/ui/confirm-dialog';
import { TIPO_ARRASTRE, TareaCard } from '../components/tarea-card/tarea-card';
import { TareaForm } from '../components/tarea-form/tarea-form';
import { ETIQUETA_ESTADO } from '../tarea-labels';
import { TareasStore } from '../tareas.store';

/** Pantalla principal: el tablero con sus tres columnas. Solo habla con el store. */
@Component({
  selector: 'app-tablero-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TareaCard, TareaForm, ConfirmDialog],
  templateUrl: './tablero.page.html',
  styleUrl: './tablero.page.css',
})
export class TableroPage implements OnInit {
  protected readonly store = inject(TareasStore);

  protected readonly columnas = ESTADOS;
  protected readonly etiqueta = ETIQUETA_ESTADO;
  protected readonly limite = LIMITE_EN_CURSO;

  /** Diálogo del formulario: cerrado, "nueva" o una tarea en edición. */
  protected readonly formulario = signal<'nueva' | Tarea | null>(null);
  protected readonly guardando = signal(false);
  protected readonly porEliminar = signal<Tarea | null>(null);
  /** Columna sobre la que se está arrastrando (para resaltarla). */
  protected readonly columnaActiva = signal<EstadoTarea | null>(null);

  ngOnInit(): void {
    this.store.cargar();
  }

  protected tareaEnEdicion(): Tarea | null {
    const f = this.formulario();
    return f === 'nueva' ? null : f;
  }

  protected guardar(request: TareaRequest): void {
    const edicion = this.tareaEnEdicion();
    this.guardando.set(true);
    const operacion = edicion ? this.store.actualizar(edicion.id, request) : this.store.crear(request);
    operacion.subscribe({
      next: () => this.formulario.set(null),
      complete: () => this.guardando.set(false),
    });
  }

  protected mover(tarea: Tarea, destino: EstadoTarea): void {
    if (tarea.estado !== destino) {
      this.store.mover(tarea.id, destino).subscribe();
    }
  }

  protected confirmarEliminar(): void {
    const tarea = this.porEliminar();
    if (tarea) {
      this.store.eliminar(tarea.id).subscribe(() => this.porEliminar.set(null));
    }
  }

  // ---------- arrastrar y soltar (API nativa de HTML5) ----------
  protected alPasarSobre(evento: DragEvent, columna: EstadoTarea): void {
    evento.preventDefault(); // sin esto el navegador no permite soltar aquí
    this.columnaActiva.set(columna);
  }

  protected alSoltar(evento: DragEvent, columna: EstadoTarea): void {
    evento.preventDefault();
    this.columnaActiva.set(null);
    const id = Number(evento.dataTransfer?.getData(TIPO_ARRASTRE));
    const tarea = this.store.tareas().find((t) => t.id === id);
    if (tarea) {
      this.mover(tarea, columna);
    }
  }
}
