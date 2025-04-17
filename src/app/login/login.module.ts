import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoginComponent } from './login.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { LoginRoutingModule } from './login-routing.module';

@NgModule({
  declarations: [LoginComponent, UserProfileComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    LoginRoutingModule,
  ],
  exports: [LoginComponent, UserProfileComponent],
})
export class LoginModule {}
