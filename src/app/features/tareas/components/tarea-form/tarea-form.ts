import { ChangeDetectionStrategy, Component, OnInit, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { REGLAS_TAREA, Tarea, TareaRequest } from '../../../../core/models/tarea.model';

/** Formulario (en un diálogo) para crear o editar. Las validaciones repiten las del DTO del backend. */
@Component({
  selector: 'app-tarea-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './tarea-form.html',
  styleUrl: './tarea-form.css',
})
export class TareaForm implements OnInit {
  private readonly fb = inject(FormBuilder).nonNullable;

  /** Si viene una tarea se edita; si es null se crea una nueva. */
  readonly tarea = input<Tarea | null>(null);
  readonly guardando = input(false);

  readonly guardar = output<TareaRequest>();
  readonly cancelar = output<void>();

  protected readonly reglas = REGLAS_TAREA;

  protected readonly form = this.fb.group({
    titulo: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(REGLAS_TAREA.tituloMaxLargo)]],
    descripcion: ['', [Validators.maxLength(REGLAS_TAREA.descripcionMaxLargo)]],
    prioridad: ['MEDIA' as TareaRequest['prioridad'], [Validators.required]],
    fechaLimite: [''],
  });

  ngOnInit(): void {
    const t = this.tarea();
    if (t) {
      this.form.patchValue({
        titulo: t.titulo,
        descripcion: t.descripcion ?? '',
        prioridad: t.prioridad,
        fechaLimite: t.fechaLimite ?? '',
      });
    }
  }

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.guardar.emit({
      titulo: v.titulo.trim(),
      descripcion: v.descripcion.trim() || null,
      prioridad: v.prioridad,
      fechaLimite: v.fechaLimite || null,
    });
  }
}
