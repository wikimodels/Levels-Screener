import { Component } from '@angular/core';
import { env } from 'environment/environment';
declare const google: any; // Declare the global `google` object
@Component({
  selector: 'app-google-sign-in',
  templateUrl: './google-sign-in.component.html',
  styleUrls: ['./google-sign-in.component.css'],
})
export class GoogleSignInComponent {
  ngOnInit(): void {
    // Initialize the Google Sign-In button after the script has loaded
    google.accounts.id.initialize({
      client_id: env.googleClientId, // Replace with your Google Client ID
      callback: this.handleCredentialResponse.bind(this), // Callback for handling login response
    });

    google.accounts.id.renderButton(
      document.getElementById('google-signin-button'), // Container for the button
      { theme: 'outline', size: 'large' } // Customize the button appearance
    );
  }

  handleCredentialResponse(response: any): void {
    console.log('Encoded JWT ID token: ' + response.credential);
    // Handle the response (e.g., send it to your backend for verification)
  }
}
