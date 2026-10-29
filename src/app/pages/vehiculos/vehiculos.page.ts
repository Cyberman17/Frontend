import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/api/api.service';
import { AuthService } from '../../core/auth/auth.service';
import { Cliente, Vehiculo } from '../../core/models/api.models';

@Component({
  imports: [ReactiveFormsModule],
  templateUrl: './vehiculos.page.html',
})
export class VehiculosPage {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly changeDetector = inject(ChangeDetectorRef);
  readonly auth = inject(AuthService);

  vehiculos: Vehiculo[] = [];
  clientes: Cliente[] = [];
  loading = true;
  saving = false;
  formOpen = false;
  editingId: number | null = null;
  error = '';
  success = '';
  fieldErrors: Record<string, string> = {};
  search = '';

  readonly form = this.fb.nonNullable.group({
    placa: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}-\d{3}$/)]],
    marca: ['', [Validators.required, Validators.maxLength(40)]],
    modelo: ['', [Validators.required, Validators.maxLength(40)]],
    anio: [new Date().getFullYear(), [Validators.required, Validators.min(1990), Validators.max(2027)]],
    clienteId: [0, [Validators.required, Validators.min(1)]],
  });

  constructor() {
    this.load();
  }

  get filteredVehicles(): Vehiculo[] {
    const query = this.search.trim().toLocaleLowerCase();
    return this.vehiculos.filter((vehicle) =>
      `${vehicle.placa} ${vehicle.marca} ${vehicle.modelo} ${vehicle.clienteNombre}`.toLocaleLowerCase().includes(query),
    );
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.api.clientes().subscribe({
      next: (clients) => {
        this.clientes = clients;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.error = this.api.mensaje(error);
        this.changeDetector.markForCheck();
      },
    });
    this.api.vehiculos().subscribe({
      next: (vehicles) => {
        this.vehiculos = vehicles;
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
    this.form.reset({
      placa: '',
      marca: '',
      modelo: '',
      anio: new Date().getFullYear(),
      clienteId: this.clientes[0]?.id ?? 0,
    });
    this.error = '';
    this.fieldErrors = {};
    this.formOpen = true;
  }

  openEdit(vehicle: Vehiculo): void {
    this.editingId = vehicle.id;
    this.form.reset({
      placa: vehicle.placa,
      marca: vehicle.marca,
      modelo: vehicle.modelo,
      anio: vehicle.anio,
      clienteId: vehicle.clienteId,
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
      ? this.api.crearVehiculo(request)
      : this.api.actualizarVehiculo(this.editingId, request);
    action.subscribe({
      next: () => {
        this.success = this.editingId === null ? 'Vehículo registrado correctamente.' : 'Vehículo actualizado correctamente.';
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

  remove(vehicle: Vehiculo): void {
    if (!window.confirm(`¿Eliminar el vehículo ${vehicle.placa}?`)) return;
    this.error = '';
    this.api.eliminarVehiculo(vehicle.id).subscribe({
      next: () => {
        this.success = 'Vehículo eliminado correctamente.';
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
