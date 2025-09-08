import {
  Component,
  OnInit,
  Input,
  ChangeDetectorRef,
  OnChanges,
} from '@angular/core';
import { navItems } from './sidebar-data';
import { Router } from '@angular/router';
import { NavService } from '../../../../core/services/nav.service';
import { MediaMatcher } from '@angular/cdk/layout';
import { AppHorizontalNavItemComponent } from './nav-item/nav-item.component';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {MatAnchor, MatIconButton} from "@angular/material/button";
import {MatMenu, MatMenuTrigger} from "@angular/material/menu";
import { SimpleChanges } from '@angular/core';
import {NavItem} from "../../vertical/sidebar/nav-item/nav-item";

@Component({
  selector: 'app-horizontal-sidebar',
  standalone: true,
  imports: [AppHorizontalNavItemComponent, NgIf, NgForOf, CommonModule, RouterModule, RouterLink, MatAnchor, MatIconButton, MatMenu, MatMenuTrigger],
  templateUrl: './sidebar.component.html',
})
export class AppHorizontalSidebarComponent{
  navItems = navItems;
  @Input() items: any;

  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  constructor(
    public navService: NavService,
    public router: Router,
    media: MediaMatcher,
    changeDetectorRef: ChangeDetectorRef
  ) {
    this.mobileQuery = media.matchMedia('(min-width: 1100px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    this.items = this.navItems;
  }

  ngOnInit(): void {
    if(this.items){
      this.navItems = this.items;
      console.log("items sidebar horizontal", this.items);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['items']) {
      const v = changes['items'].currentValue as NavItem[];
      this.navItems = v ?? [];
      console.log('items sidebar horizontal (changed)', v);
    }
  }

  protected readonly localStorage = localStorage;
}
