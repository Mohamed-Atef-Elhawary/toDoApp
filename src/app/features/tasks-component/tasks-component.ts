import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { TaskInputComponent } from '../components/task-input-component/task-input-component';
import { PageTitleComponent } from '../components/page-title-component/page-title-component';
import { TaskItemComponent } from '../components/task-item-component/task-item-component';
import { TaskService } from '../../services/task-service';
import { Itask } from '../../interfaces/task-interface';

@Component({
  selector: 'app-tasks-component',
  imports: [TaskInputComponent, PageTitleComponent, TaskItemComponent],
  templateUrl: './tasks-component.html',
  styleUrl: './tasks-component.css',
})
export class TasksComponent implements OnInit {
  category!: string;
  allTasks = signal<Itask[]>([]);
  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
  ) {}

  ngOnInit(): void {
    // console.log('outtttttttttttttttttttttttttttttttt');
    this.route.paramMap.subscribe((paramsAsMap: ParamMap) => {
      // console.log('innnnnnnnnnnnnnnnnn');
      this.category = paramsAsMap.get('category') || 'all';
    });
    // this.taskService.addTask({ title: 'task1' }).subscribe();
    ///////////////////////////////////
    this.getTasks();
  }
  getTasks() {
    this.taskService.getTasks().subscribe({
      next: (tasks) => this.allTasks.set(tasks),
      error: (err) => console.log(err),
    });
  }

  onNewTask(newTask: string) {}
}
