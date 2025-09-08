import {
  Component,
  OnInit,
  Input,
} from '@angular/core';
import { Router } from '@angular/router';
import { NavService } from '../../../../../core/services/nav.service';
import { TablerIconsModule } from 'angular-tabler-icons';
import { CommonModule, NgForOf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {MatAnchor} from "@angular/material/button";

@Component({
  selector: 'app-horizontal-nav-item',
  standalone: true,
  imports: [TablerIconsModule, CommonModule, MatIconModule, NgForOf, MatAnchor],
  templateUrl: './nav-item.component.html',
})
export class AppHorizontalNavItemComponent implements OnInit {
  @Input() depth: any;
  @Input() item: any;

  constructor(public navService: NavService, public router: Router) {
    if (this.depth === undefined) {
      this.depth = 0;
    }
  }

  ngOnInit() {}
  onItemSelected(item: any) {
    if (!item.children || !item.children.length) {
      this.router.navigate([item.route]);
    }
  }
}
