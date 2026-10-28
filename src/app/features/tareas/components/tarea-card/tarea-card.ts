import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { EstadoTarea, Tarea } from '../../../../core/models/tarea.model';
import { ETIQUETA_PRIORIDAD, formatearFecha, hoyIso } from '../../tarea-labels';

/** Tipo de dato que viaja en el arrastre (API nativa de HTML5): el id de la tarea. */
export const TIPO_ARRASTRE = 'text/plain';

/** Tarjeta de una tarea. Componente presentacional: recibe datos y avisa con eventos. */
@Component({
  selector: 'app-tarea-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tarea-card.html',
  styleUrl: './tarea-card.css',
})
export class TareaCard {
  readonly tarea = input.required<Tarea>();

  readonly editar = output<Tarea>();
  readonly eliminar = output<Tarea>();
  readonly mover = output<EstadoTarea>();

  protected readonly etiquetaPrioridad = computed(() => ETIQUETA_PRIORIDAD[this.tarea().prioridad]);
  protected readonly fecha = computed(() => {
    const iso = this.tarea().fechaLimite;
    return iso ? formatearFecha(iso) : null;
  });
  protected readonly vencida = computed(() => {
    const iso = this.tarea().fechaLimite;
    return !!iso && iso < hoyIso() && this.tarea().estado !== 'HECHA';
  });

  protected alArrastrar(evento: DragEvent): void {
    evento.dataTransfer?.setData(TIPO_ARRASTRE, String(this.tarea().id));
    if (evento.dataTransfer) {
      evento.dataTransfer.effectAllowed = 'move';
    }
  }

  protected retroceder(): void {
    this.mover.emit(this.tarea().estado === 'HECHA' ? 'EN_CURSO' : 'POR_HACER');
  }

  protected avanzar(): void {
    this.mover.emit(this.tarea().estado === 'POR_HACER' ? 'EN_CURSO' : 'HECHA');
  }
}
