import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { TaskInputComponent } from '../components/task-input-component/task-input-component';
import { PageTitleComponent } from '../components/page-title-component/page-title-component';
import { TaskItemComponent } from '../components/task-item-component/task-item-component';
import { TaskService } from '../../services/task-service';
import { Itask } from '../../interfaces/task-interface';
import { ToastrService } from 'ngx-toastr';
import { FailConfig, SuccessConfig } from '../../config/toastr-config';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
@Component({
  selector: 'app-tasks-component',
  imports: [TaskInputComponent, PageTitleComponent, TaskItemComponent],
  templateUrl: './tasks-component.html',
  styleUrl: './tasks-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksComponent implements OnInit {
  category = signal<string>('');
  storedTasks = signal<Itask[]>([]);
  allTasks = signal<Itask[]>([]);
  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private toastr: ToastrService,
    private destroyRef: DestroyRef,
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

    this.taskService.searchString$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((searchString) => {
        if (searchString) {
          this.allTasks.update(() => {
            return this.storedTasks().filter((task) => {
              return task.title.toLowerCase().includes(searchString.trim().toLowerCase());
            });
          });
        } else {
          this.allTasks.set(this.storedTasks());
        }
      });

    this.getTasks();
  }

  getTasks() {
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.allTasks.set(tasks);
        this.storedTasks.set(tasks);
      },
      error: (err) => {
        this.toastr.error(err.message, 'Error', FailConfig);
      },
    });
  }

  onNewTask(newTaskTitle: string) {
    const regXp = /task \d{1,5}\b/i;
    if (regXp.test(newTaskTitle)) {
      this.taskService
        .modifyTasks([{ title: newTaskTitle, id: String(Date.now()) }, ...this.storedTasks()])
        .subscribe({
          next: (tasks) => {
            this.storedTasks.set(tasks);
            this.toastr.success('The task added successfully', 'Success', SuccessConfig);
            const value = this.taskService.searchString$.value;
            this.taskService.searchString$.next(value);
          },
          error: (err) => this.toastr.error(err.message, 'Error', FailConfig),
        });
    } else {
      this.toastr.error("Task must follow the format 'task <number>'");
    }
  }
  onToggleImportant(updatedTask: Itask) {
    const OldTasks = this.storedTasks();
    this.storedTasks.update((tasks) => {
      return tasks.map((task) => {
        const modifiedTask: Itask = { ...task };
        if (task.id === updatedTask.id) {
          modifiedTask.isImportant = !task.isImportant;
        }
        return modifiedTask;
      });
    });
    this.taskService.modifyTasks(this.storedTasks()).subscribe({
      next: (tasks) => {
        this.allTasks.set(tasks);
        this.toastr.success('important status has been changed', 'Success', SuccessConfig);
        const value = this.taskService.searchString$.value;
        this.taskService.searchString$.next(value);
      },
      error: (err) => {
        this.toastr.error(err.message, 'Error', FailConfig);
        this.storedTasks.set(OldTasks);
      },
    });
  }

  onToggleComplete(updatedTask: Itask) {
    this.storedTasks.update((tasks) => {
      return tasks.map((task) => {
        const modifiedTask: Itask = { ...task };
        if (task.id === updatedTask.id) {
          modifiedTask.isComplete = !updatedTask.isComplete;
        }
        return modifiedTask;
      });
    });

    this.taskService.modifyTasks(this.storedTasks()).subscribe({
      next: (tasks) => {
        this.allTasks.set(tasks);

        this.toastr.success('complete status has been changed', 'Success', SuccessConfig);
        const value = this.taskService.searchString$.value;
        this.taskService.searchString$.next(value);
      },
      error: (err) => {
        this.toastr.error(err.message, 'Error', FailConfig);
      },
    });
  }

  onDelete(deletedTask: Itask) {
    const id = deletedTask.id;
    id && this.storedTasks.update((tasks) => tasks.filter((task) => task.id !== deletedTask.id));
    this.taskService.modifyTasks(this.storedTasks()).subscribe({
      next: (tasks) => {
        this.allTasks.set(tasks);

        this.toastr.success('task has been deleted successfully', 'Success', SuccessConfig);
        const value = this.taskService.searchString$.value;
        this.taskService.searchString$.next(value);
      },
      error: (err) => {
        this.toastr.error(err.message, 'Error', FailConfig);
      },
    });
  }
}
