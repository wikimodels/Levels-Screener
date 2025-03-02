import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NewAlertComponent } from '../alerts/new-alert/new-alert.component';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css'],
})
export class NavBarComponent implements OnInit, OnDestroy {
  constructor(private router: Router, private modelDialog: MatDialog) {}

  ngOnInit(): void {}
  ngOnDestroy(): void {}

  onGetToWork() {
    this.router.navigate([]);
  }

  onGoToCoin() {
    this.router.navigate([]);
  }

  onGoToWs() {
    this.router.navigate([]);
  }

  onGoToCoinProvider() {
    this.router.navigate([]);
  }

  onGoToCoinBlackList() {
    this.router.navigate([]);
  }

  onGoToAdminPanel() {
    this.router.navigate([]);
  }

  onAddAlert() {
    this.modelDialog.open(NewAlertComponent, {
      enterAnimationDuration: 250,
      exitAnimationDuration: 250,
      width: '100vw',
      height: '100vh',
    });
  }
}
