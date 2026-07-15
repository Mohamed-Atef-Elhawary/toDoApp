import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-task-input-component',
  imports: [FormsModule],
  templateUrl: './task-input-component.html',
  styleUrl: './task-input-component.css',
})
export class TaskInputComponent {
  task: string | null = null;
  newTask = output<string>();
  onEnter() {
    let task = this.task?.trim();
    if (task) {
      this.newTask.emit(task);
    }
    this.task = null;
  }
}
