import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  template: `
    <div class="empty-state access-denied">
      <span class="empty-icon">?</span>
      <span class="eyebrow">PÁGINA NO ENCONTRADA</span>
      <h1>No encontramos esa página</h1>
      <p class="muted">La dirección puede haber cambiado o no estar disponible.</p>
      <a class="button button-primary" routerLink="/">Volver al inicio</a>
    </div>
  `,
})
export class NoEncontradoPage {}
