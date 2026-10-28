import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/** Diálogo de confirmación reutilizable. El padre decide cuándo se muestra y qué hacer. */
@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fondo" (click)="cancelar.emit()">
      <div class="dialogo" role="alertdialog" aria-modal="true" [attr.aria-label]="titulo()" (click)="$event.stopPropagation()">
        <h2>{{ titulo() }}</h2>
        <p>{{ mensaje() }}</p>
        <div class="acciones">
          <button type="button" class="btn" (click)="cancelar.emit()">Cancelar</button>
          <button type="button" class="btn btn-peligro" (click)="confirmar.emit()">{{ textoConfirmar() }}</button>
        </div>
      </div>
    </div>
  `,
  styles: `
    .fondo { position: fixed; inset: 0; background: rgb(3 6 14 / .75); display: grid; place-items: center; z-index: 40; padding: 1rem; }
    .dialogo { background: var(--superficie); border: 1px solid var(--borde); border-radius: .9rem; padding: 1.5rem; width: min(26rem, 100%); box-shadow: 0 20px 50px rgb(0 0 0 / .6); }
    h2 { margin: 0 0 .5rem; font-size: 1.15rem; }
    p { margin: 0 0 1.25rem; color: var(--texto-suave); }
    .acciones { display: flex; justify-content: flex-end; gap: .5rem; }
  `,
})
export class ConfirmDialog {
  readonly titulo = input.required<string>();
  readonly mensaje = input.required<string>();
  readonly textoConfirmar = input('Eliminar');
  readonly confirmar = output<void>();
  readonly cancelar = output<void>();
}
