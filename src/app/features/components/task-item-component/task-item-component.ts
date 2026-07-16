import { Component, input, output } from '@angular/core';
import { Itask } from '../../../interfaces/task-interface';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faStar as faSolidStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as faRegularStar } from '@fortawesome/free-regular-svg-icons';
import { faCircleCheck as faSolidCheck } from '@fortawesome/free-solid-svg-icons';
import { faCircleCheck as faRegularCheck } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-task-item-component',
  imports: [FontAwesomeModule],
  templateUrl: './task-item-component.html',
  styleUrl: './task-item-component.css',
})
export class TaskItemComponent {
  allTasks = input.required<Itask[]>();
  solidStar = faSolidStar;
  regularStar = faRegularStar;
  solidCheck = faSolidCheck;
  regularCheck = faRegularCheck;

  toggleImportant = output<Itask>();
  toggleComplete = output<Itask>();

  onToggleImportant(task: Itask) {
    this.toggleImportant.emit(task);
  }
  onToggleCompleted(task: Itask) {
    this.toggleComplete.emit(task);
  }
}
