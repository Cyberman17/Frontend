import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  imports: [RouterLink],
  templateUrl: './dashboard.page.html',
})
export class DashboardPage {
  readonly auth = inject(AuthService);
}
