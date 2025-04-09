import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AlertBase, AlertBaseDefaults } from 'models/alerts/alert-base';
import { AlertsCollection } from 'models/alerts/alerts-collections';
import { SnackbarType } from 'models/shared/snackbar-type';
import { AlertsGenericService } from 'src/service/alerts/alerts-generic.service';
import { SnackbarService } from 'src/service/snackbar.service';

@Component({
  selector: 'app-alerts-batch',
  templateUrl: './alerts-batch.component.html',
  styleUrls: ['./alerts-batch.component.css', './../../styles-alerts.css'],
})
export class AlertsBatchComponent {
  @ViewChild('alertForm') alertForm!: NgForm; // Reference to the form
  codeSnippet: string = ''; // Holds the user's JSON string
  parsedCode: string = ''; // Holds the parsed JSON string for display
  messages: { type: 'error' | 'info'; content: string }[] = []; // Holds raw responses
  isLoading: boolean = false; // Tracks loading state

  constructor(
    private alertService: AlertsGenericService,
    private snackbarService: SnackbarService
  ) {}

  triggerSubmit() {
    if (this.alertForm.valid) {
      this.submitCode(); // Call the form submission logic
    } else {
      this.addMessage('error', 'Form is invalid. Please check your input.');
    }
  }
  // Function to validate and process the JSON string
  submitCode() {
    this.messages = []; // Clear previous messages
    this.parsedCode = ''; // Clear previous parsed code
    this.isLoading = true;

    try {
      // Step 1: Validate and parse the JSON string
      const parsedData = this.validateAndParseJSON(this.codeSnippet);
      this.parsedCode = JSON.stringify(parsedData, null, 2); // Format JSON for display

      // Step 2: Validate that the parsed data matches the AlertBase[] structure
      const alerts = this.validateAlerts(parsedData);

      // Step 3: Send the validated alerts to the server
      this.sendAlertsToServer(alerts);
    } catch (error) {
      // Handle errors during JSON parsing or validation
      this.addMessage(
        'error',
        error instanceof Error ? error.message : String(error)
      );
      this.isLoading = false;
    }
  }

  // Validates and parses the JSON string
  private validateAndParseJSON(jsonString: string): any {
    try {
      return JSON.parse(jsonString); // Attempt to parse the JSON string
    } catch (error) {
      throw new Error(
        'Invalid JSON format. Please provide a valid JSON string.'
      );
    }
  }

  // Validates that the parsed data conforms to the AlertBase[] structure
  private validateAlerts(data: any): AlertBase[] {
    if (!Array.isArray(data)) {
      throw new Error(
        'Parsed data is not an array. Expected an array of AlertBase objects.'
      );
    }

    const requiredFields = Object.keys(AlertBaseDefaults);
    for (const [index, item] of data.entries()) {
      for (const field of requiredFields) {
        if (!(field in item)) {
          throw new Error(
            `Missing field "${field}" in alert at index ${index}.`
          );
        }
      }
      if (!Array.isArray(item.tvScreensUrls)) {
        throw new Error(
          `Field "tvScreensUrls" must be an array in alert at index ${index}.`
        );
      }
      if (typeof item.price !== 'number') {
        throw new Error(
          `Field "price" must be a number in alert at index ${index}.`
        );
      }
    }

    return data as AlertBase[];
  }

  // Sends the validated alerts to the server
  private sendAlertsToServer(alerts: AlertBase[]) {
    this.alertService
      .addAlertsBatch(AlertsCollection.WorkingAlerts, alerts)
      .subscribe({
        next: (response) => {
          this.addMessage('info', JSON.stringify(response, null, 2)); // Add success response as JSON
        },
        error: (error) => {
          this.addMessage('error', JSON.stringify(error, null, 2)); // Add error response as JSON
          this.snackbarService.showSnackBar(
            'Failed to add alerts',
            'Please try again later.',
            8000,
            SnackbarType.Error
          );
        },
        complete: () => {
          this.isLoading = false; // Ensure loading state is reset
        },
      });
  }

  // Helper method t
  clearInput() {
    this.codeSnippet = '';
    this.parsedCode = '';
    this.messages = [];
  }
  private addMessage(type: 'error' | 'info', content: string) {
    this.messages.push({ type, content });
  }
}
