import { Component, input } from '@angular/core';
import { Itask } from '../../../interfaces/task-interface';

@Component({
  selector: 'app-task-item-component',
  imports: [],
  templateUrl: './task-item-component.html',
  styleUrl: './task-item-component.css',
})
export class TaskItemComponent {
  allTasks = input.required<Itask[]>();
}
