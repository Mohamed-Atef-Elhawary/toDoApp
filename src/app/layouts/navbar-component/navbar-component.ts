import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task-service';

@Component({
  selector: 'app-navbar-component',
  imports: [FormsModule],
  templateUrl: './navbar-component.html',
  styleUrl: './navbar-component.css',
})
export class NavbarComponent {
  searchString: string = '';
  constructor(private taskservice: TaskService) {}
  onInput() {
    this.taskservice.searchString$.next(this.searchString);
  }
}
