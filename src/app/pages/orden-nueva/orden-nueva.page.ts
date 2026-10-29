import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api/api.service';
import { Orden, Servicio, Vehiculo } from '../../core/models/api.models';

type DetalleForm = FormGroup<{
  servicioId: FormControl<number | null>;
  cantidad: FormControl<number>;
}>;

@Component({
  imports: [CurrencyPipe, ReactiveFormsModule, RouterLink],
  templateUrl: './orden-nueva.page.html',
})
export class OrdenNuevaPage {
  private readonly api = inject(ApiService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  vehiculos: Vehiculo[] = [];
  servicios: Servicio[] = [];
  loading = true;
  submitting = false;
  error = '';
  fieldErrors: Record<string, string> = {};
  createdOrder: Orden | null = null;

  readonly form = new FormGroup({
    vehiculoId: new FormControl<number | null>(null, Validators.required),
    kilometraje: new FormControl<number | null>(null, [Validators.required, Validators.min(0), Validators.max(9999999)]),
    detalles: new FormArray<DetalleForm>([this.createLine()]),
  });

  constructor() {
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
    this.api.servicios().subscribe({
      next: (services) => {
        this.servicios = services.filter((service) => service.activo);
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.error = this.api.mensaje(error);
        this.changeDetector.markForCheck();
      },
    });
  }

  get lines(): FormArray<DetalleForm> {
    return this.form.controls.detalles;
  }

  get total(): number {
    return this.lines.controls.reduce((sum, line) => sum + this.subtotal(line), 0);
  }

  addLine(): void {
    if (this.lines.length < 10) this.lines.push(this.createLine());
  }

  removeLine(index: number): void {
    if (this.lines.length > 1) this.lines.removeAt(index);
  }

  serviceUsedInAnotherLine(serviceId: number, currentIndex: number): boolean {
    return this.lines.controls.some((line, index) =>
      index !== currentIndex && line.controls.servicioId.value === serviceId,
    );
  }

  serviceName(serviceId: number | null): string {
    return this.servicios.find((service) => service.id === serviceId)?.nombre ?? '';
  }

  servicePrice(serviceId: number | null): number {
    return this.servicios.find((service) => service.id === serviceId)?.precio ?? 0;
  }

  subtotal(line: DetalleForm): number {
    return this.servicePrice(line.controls.servicioId.value) * line.controls.cantidad.value;
  }

  submit(): void {
    if (this.form.invalid || this.submitting) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    if (raw.vehiculoId === null || raw.kilometraje === null) return;
    this.error = '';
    this.fieldErrors = {};
    this.createdOrder = null;
    this.submitting = true;
    this.api.crearOrden({
      vehiculoId: raw.vehiculoId,
      kilometraje: raw.kilometraje,
      detalles: raw.detalles.flatMap((detail) =>
        detail.servicioId === null
          ? []
          : [{ servicioId: detail.servicioId, cantidad: detail.cantidad ?? 1 }],
      ),
    }).subscribe({
      next: (order) => {
        this.createdOrder = order;
        this.form.reset({ vehiculoId: null, kilometraje: null });
        this.lines.clear();
        this.lines.push(this.createLine());
        this.submitting = false;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.error = this.api.mensaje(error);
        this.fieldErrors = this.api.erroresCampos(error);
        this.submitting = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  fieldError(name: string): string {
    return this.fieldErrors[name] ?? '';
  }

  detailFieldError(index: number, field: 'servicioId' | 'cantidad'): string {
    return this.fieldErrors[`detalles[${index}].${field}`] ?? '';
  }

  private createLine(): DetalleForm {
    return new FormGroup({
      servicioId: new FormControl<number | null>(null, Validators.required),
      cantidad: new FormControl(1, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(1), Validators.max(5)],
      }),
    });
  }
}
