import { Component } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  title = 'ng-music';
  menu = [{
    label: 'Find',
    path: '/home'
  },{
    label: 'Menu',
    path: '/sheet'
}]
}
