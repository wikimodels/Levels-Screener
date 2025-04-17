import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgZone } from '@angular/core'; // Import NgZone
import { ALERTS_AT_WORK } from 'src/consts/url-consts';
import { AuthService } from 'src/app/login/service/auth.service';

declare const google: any; // Declare the global `google` object

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone // Inject NgZone
  ) {}

  ngOnInit(): void {
    // Initialize the Google Sign-In button after the script has loaded
    google.accounts.id.initialize({
      client_id:
        '302652955824-mt8cbkaa2b4n4i0lb8dqml3kadh60ito.apps.googleusercontent.com', // Replace with your Google Client ID
      callback: this.handleCredentialResponse.bind(this), // Callback for handling login response
    });

    google.accounts.id.renderButton(
      document.getElementById('google-signin-button'), // Container for the button
      { theme: 'outline', size: 'large' } // Customize the button appearance
    );

    this.authService.isGoogleInitialized = true;
  }

  handleCredentialResponse(response: any): void {
    console.log('Encoded JWT ID token: ' + response.credential);

    // Authenticate the user and navigate within Angular's zone
    this.authService.authenticateUser(response.credential).subscribe({
      next: (userData) => {
        this.ngZone.run(() => {
          this.router.navigate([ALERTS_AT_WORK]);
        });
      },
      error: (err) => {
        console.error('Authentication failed:', err);
      },
    });
  }
}
