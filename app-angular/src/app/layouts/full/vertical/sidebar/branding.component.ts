import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { CoreService } from '../../../../core/services/core.service';

@Component({
  selector: 'app-branding',
  standalone: true,
  imports: [NgIf],
  template: `
    <div class="branding">
      @if(options.theme === 'light') {
      <a href="/">
        <img
            src="./assets/images/logos/logo_geo.png"
            class="align-middle m-2"
            alt="logo"
            style="width:20%; height:auto;"
        />
      </a>
      } @if(options.theme === 'dark') {
      <a href="/">
        <img
            src="./assets/images/logos/logo_geo.png"
            class="align-middle m-2"
            alt="logo"
            style="width:20%; height:auto;"
        />
      </a>
      }
    </div>
  `,
})
export class BrandingComponent {
  options = this.settings.getOptions();

  constructor(private settings: CoreService) {}
}
