import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/api/api.service';
import { AuthService } from '../../core/auth/auth.service';
import { Servicio } from '../../core/models/api.models';

@Component({
  imports: [CurrencyPipe, ReactiveFormsModule],
  templateUrl: './servicios.page.html',
})
export class ServiciosPage {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly changeDetector = inject(ChangeDetectorRef);
  readonly auth = inject(AuthService);

  servicios: Servicio[] = [];
  loading = true;
  saving = false;
  formOpen = false;
  editingId: number | null = null;
  error = '';
  success = '';
  fieldErrors: Record<string, string> = {};
  search = '';

  readonly form = this.fb.nonNullable.group({
    codigo: ['', [Validators.required, Validators.pattern(/^SRV-\d{3}$/)]],
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
    precio: [0, [Validators.required, Validators.min(0.01)]],
    duracionMin: [60, [Validators.required, Validators.min(15), Validators.max(480)]],
  });

  constructor() {
    this.load();
  }

  get filteredServices(): Servicio[] {
    const query = this.search.trim().toLocaleLowerCase();
    return this.servicios.filter((service) =>
      `${service.codigo} ${service.nombre}`.toLocaleLowerCase().includes(query),
    );
  }

  load(): void {
    this.loading = true;
    this.api.servicios().subscribe({
      next: (services) => {
        this.servicios = services;
        this.loading = false;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.error = this.api.mensaje(error);
        this.loading = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  openCreate(): void {
    this.editingId = null;
    this.form.reset({ codigo: '', nombre: '', precio: 0, duracionMin: 60 });
    this.error = '';
    this.fieldErrors = {};
    this.formOpen = true;
  }

  openEdit(service: Servicio): void {
    this.editingId = service.id;
    this.form.reset({
      codigo: service.codigo,
      nombre: service.nombre,
      precio: service.precio,
      duracionMin: service.duracionMin,
    });
    this.error = '';
    this.fieldErrors = {};
    this.formOpen = true;
  }

  closeForm(): void {
    if (!this.saving) this.formOpen = false;
  }

  submit(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.error = '';
    this.fieldErrors = {};
    const request = this.form.getRawValue();
    const action = this.editingId === null
      ? this.api.crearServicio(request)
      : this.api.actualizarServicio(this.editingId, request);

    action.subscribe({
      next: () => {
        this.success = this.editingId === null ? 'Servicio registrado correctamente.' : 'Servicio actualizado correctamente.';
        this.formOpen = false;
        this.saving = false;
        this.load();
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.error = this.api.mensaje(error);
        this.fieldErrors = this.api.erroresCampos(error);
        this.saving = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  toggleActive(service: Servicio): void {
    this.error = '';
    this.api.cambiarEstadoServicio(service.id, !service.activo).subscribe({
      next: (updated) => {
        this.servicios = this.servicios.map((item) => item.id === updated.id ? updated : item);
        this.success = updated.activo ? 'Servicio activado.' : 'Servicio dado de baja.';
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.error = this.api.mensaje(error);
        this.changeDetector.markForCheck();
      },
    });
  }

  remove(service: Servicio): void {
    if (!window.confirm(`¿Eliminar el servicio ${service.codigo} - ${service.nombre}?`)) return;
    this.error = '';
    this.api.eliminarServicio(service.id).subscribe({
      next: () => {
        this.success = 'Servicio eliminado correctamente.';
        this.load();
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.error = this.api.mensaje(error);
        this.changeDetector.markForCheck();
      },
    });
  }

  fieldError(name: string): string {
    return this.fieldErrors[name] ?? '';
  }
}
