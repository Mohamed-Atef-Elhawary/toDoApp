import { Component, computed, OnInit, signal } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { TaskInputComponent } from '../components/task-input-component/task-input-component';
import { PageTitleComponent } from '../components/page-title-component/page-title-component';
import { TaskItemComponent } from '../components/task-item-component/task-item-component';
import { TaskService } from '../../services/task-service';
import { Itask } from '../../interfaces/task-interface';
import { ToastrService } from 'ngx-toastr';
import { FailConfig, SuccessConfig } from '../../config/toastr-config';

@Component({
  selector: 'app-tasks-component',
  imports: [TaskInputComponent, PageTitleComponent, TaskItemComponent],
  templateUrl: './tasks-component.html',
  styleUrl: './tasks-component.css',
})
export class TasksComponent implements OnInit {
  category = signal<string>('');
  allTasks = signal<Itask[]>([]);
  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private toastr: ToastrService,
  ) {}
  specificTasks = computed<Itask[]>(() => {
    if (this.category() === 'important') {
      return this.allTasks().filter((task) => task.isImportant);
    } else if (this.category() === 'complete') {
      return this.allTasks().filter((task) => task.isComplete);
    }
    return this.allTasks();
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((paramsAsMap: ParamMap) => {
      this.category.set(paramsAsMap.get('category') || 'all');
    });
    this.getTasks();
  }

  getTasks() {
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.allTasks.set(tasks);
      },
      error: (err) => console.log(err),
    });
  }

  onNewTask(newTask: string) {
    this.taskService.addTask({ title: newTask }).subscribe({
      next: (task) => {
        this.allTasks.update((tasks: Itask[]) => [...tasks, task]);
        this.toastr.success('The task added successfully', 'Success', SuccessConfig);
      },
      error: (err) => this.toastr.error(err, 'Error', FailConfig),
    });
  }
}
