import { AfterViewInit, Component } from '@angular/core';
import { AuthService } from './service/auth.service';

declare const google: any; // Declare the global `google` object
@Component({
  selector: 'app-test',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements AfterViewInit {
  constructor(private authService: AuthService) {}

  ngAfterViewInit(): void {
    if (google && google.accounts) {
      google.accounts.id.initialize({
        client_id:
          '302652955824-mt8cbkaa2b4n4i0lb8dqml3kadh60ito.apps.googleusercontent.com',
        callback: this.handleCredentialResponse.bind(this),
        auto_select: true,
        context: 'signin',
      });

      google.accounts.id.renderButton(
        document.getElementById('google-signin-button')!,
        {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
        }
      );

      google.accounts.id.prompt();
    } else {
      console.error('Google Identity Services script not loaded.');
    }
  }

  handleCredentialResponse(response: any): void {
    const idToken = response.credential; // Extract the ID token
    this.authService.signInWithGoogleIdToken(idToken).subscribe(() => {
      console.log('User signed in with Google ID token.');
    });
  }
}
