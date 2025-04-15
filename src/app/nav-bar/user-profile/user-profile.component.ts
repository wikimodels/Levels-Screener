import { Component, Input } from '@angular/core';
import { UserData } from 'models/user/user-data';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent {
  @Input() userData: UserData | null = null;
}
