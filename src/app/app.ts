import { Component, signal } from '@angular/core';
import { MainLayoutComponent } from './layouts/main-layout-component/main-layout-component';

@Component({
  selector: 'app-root',
  imports: [MainLayoutComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('toDoApp');
}
