import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../core/api/api.service';
import { IngresoServicio } from '../../core/models/api.models';

@Component({
  imports: [CurrencyPipe, DecimalPipe, ReactiveFormsModule],
  templateUrl: './reportes.page.html',
})
export class ReportesPage {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly changeDetector = inject(ChangeDetectorRef);

  readonly filters = this.fb.nonNullable.group({ desde: [''], hasta: [''] });
  rows: IngresoServicio[] = [];
  loading = true;
  error = '';

  constructor() {
    this.search();
  }

  get totalIngresos(): number {
    return this.rows.reduce((total, row) => total + row.importeTotal, 0);
  }

  search(): void {
    const { desde, hasta } = this.filters.getRawValue();
    this.loading = true;
    this.error = '';
    this.api.ingresos(desde, hasta).subscribe({
      next: (report) => {
        this.rows = report;
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

  reset(): void {
    this.filters.reset({ desde: '', hasta: '' });
    this.search();
  }
}
