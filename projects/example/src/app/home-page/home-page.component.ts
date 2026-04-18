import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OmegaChannel } from 'omega-angular';

import { AuthWire } from '../auth/omega/auth.constants';

/**
 * Vista home: solo Omega + router; datos de sesión vienen del `resolve` (no API ni storage aquí).
 */
@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
})
export class HomePageComponent {
  private readonly router = inject(Router);
  private readonly channel = inject(OmegaChannel);
  private readonly route = inject(ActivatedRoute);

  private readonly home = this.route.snapshot.data['home'] as {
    displayName: string;
    sessionKey: string;
  };

  protected readonly displayName = signal(this.home.displayName);
  protected readonly sessionKey = this.home.sessionKey;

  protected logout(): void {
    this.channel.emitNamed(AuthWire.logout);
    void this.router.navigate(['/login']);
  }
}
