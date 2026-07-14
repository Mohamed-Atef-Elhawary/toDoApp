import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../../services/task-service';

@Component({
  selector: 'app-task-input-component',
  imports: [FormsModule],
  templateUrl: './task-input-component.html',
  styleUrl: './task-input-component.css',
})
export class TaskInputComponent {
  task: string | null = null;
  newTask = output<string>();
  constructor(private taskService: TaskService) {}
  onEnter() {
    console.log(this.task);
    this.task = null;
  }
  addTask() {
    if (this.task) {
      this.newTask.emit(this.task);
    }
  }
}
