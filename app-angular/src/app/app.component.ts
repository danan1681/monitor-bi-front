import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {LoaderService} from "./core/services/loader.service";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgIf],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'Modernize Angular Admin Template';

  isLoading = false;

  constructor(private loaderService: LoaderService) {}

  ngOnInit() {
    this.loaderService.isLoading.subscribe((loading) => {
      this.isLoading = loading;
    });
  }
}
