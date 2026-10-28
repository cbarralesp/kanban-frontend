import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { Toast } from './shared/ui/toast';

/** Layout principal: cabecera + zona donde el router dibuja cada pantalla. */
@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, Toast],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
