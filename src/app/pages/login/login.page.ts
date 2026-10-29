import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api/api.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.page.html',
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });
  error = '';
  submitting = false;

  submit(): void {
    if (this.form.invalid || this.submitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.error = '';
    this.submitting = true;
    const { username, password } = this.form.getRawValue();
    this.auth.login(username, password).subscribe({
      next: (response) => {
        this.auth.startSession(username, response);
        const requestedUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        const returnUrl = requestedUrl?.startsWith('/') && !requestedUrl.startsWith('//')
          ? requestedUrl
          : '/';
        this.submitting = false;
        this.changeDetector.markForCheck();
        void this.router.navigateByUrl(returnUrl);
      },
      error: (error: unknown) => {
        this.error = this.api.mensaje(error);
        this.submitting = false;
        this.changeDetector.markForCheck();
      },
    });
  }
}
