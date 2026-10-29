import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api/api.service';
import { AuthService } from '../../core/auth/auth.service';
import { Orden } from '../../core/models/api.models';

@Component({
  imports: [CurrencyPipe, DatePipe, DecimalPipe, ReactiveFormsModule, RouterLink],
  templateUrl: './ordenes.page.html',
})
export class OrdenesPage {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly changeDetector = inject(ChangeDetectorRef);
  readonly auth = inject(AuthService);

  readonly filters = this.fb.nonNullable.group({
    placa: [''],
    estado: [''],
    desde: [''],
    hasta: [''],
  });
  ordenes: Orden[] = [];
  selectedOrder: Orden | null = null;
  annulOrder: Orden | null = null;
  motivo = '';
  loading = true;
  saving = false;
  error = '';
  modalError = '';
  modalFieldErrors: Record<string, string> = {};

  constructor() {
    this.search();
  }

  search(): void {
    this.loading = true;
    this.error = '';
    this.api.ordenes(this.filters.getRawValue()).subscribe({
      next: (orders) => {
        this.ordenes = orders;
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

  resetFilters(): void {
    this.filters.reset({ placa: '', estado: '', desde: '', hasta: '' });
    this.search();
  }

  showDetails(order: Orden): void {
    this.modalError = '';
    this.modalFieldErrors = {};
    this.api.orden(order.id).subscribe({
      next: (detail) => {
        this.selectedOrder = detail;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.error = this.api.mensaje(error);
        this.changeDetector.markForCheck();
      },
    });
  }

  openAnnul(order: Orden): void {
    this.annulOrder = order;
    this.motivo = '';
    this.modalError = '';
    this.modalFieldErrors = {};
  }

  closeModals(): void {
    if (!this.saving) {
      this.selectedOrder = null;
      this.annulOrder = null;
    }
  }

  annul(): void {
    if (!this.annulOrder || this.motivo.trim().length < 10 || this.motivo.trim().length > 200 || this.saving) return;
    this.saving = true;
    this.modalError = '';
    this.modalFieldErrors = {};
    this.api.anularOrden(this.annulOrder.id, this.motivo.trim()).subscribe({
      next: () => {
        this.annulOrder = null;
        this.saving = false;
        this.search();
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.modalError = this.api.mensaje(error);
        this.modalFieldErrors = this.api.erroresCampos(error);
        this.saving = false;
        this.changeDetector.markForCheck();
      },
    });
  }
}
