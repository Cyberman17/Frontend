import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  template: `
    <div class="empty-state access-denied">
      <span class="empty-icon">⊘</span>
      <span class="eyebrow">ACCESO RESTRINGIDO</span>
      <h1>Esta sección no está disponible</h1>
      <p class="muted">Tu usuario no cuenta con los permisos necesarios para acceder a esta página.</p>
      <a class="button button-primary" routerLink="/">Volver al inicio</a>
    </div>
  `,
})
export class AccesoDenegadoPage {}
