import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskItemComponent } from './task-item-component';
import { Itask } from '../../../interfaces/task-interface';

describe('TaskItemComponent', () => {
  let fixture: ComponentFixture<TaskItemComponent>;
  let taskItemComponent: TaskItemComponent;
  let task: Itask;
  let emittedTask: Itask = {} as Itask;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    fixture = TestBed.createComponent(TaskItemComponent);
    taskItemComponent = fixture.componentInstance;
    task = { title: 'task 1', id: '1' };
  });
  it('should create', () => {
    expect(taskItemComponent).toBeTruthy();
  });

  it('should emit toggleImportant with the exact task', () => {
    taskItemComponent.toggleImportant.subscribe((recievedEmittedTask: Itask) => {
      emittedTask = recievedEmittedTask;
    });
    taskItemComponent.onToggleImportant(task);
    expect(emittedTask).toEqual(task);
  });
  it('should emit toggleComplete with the exact task', () => {
    taskItemComponent.toggleComplete.subscribe((recievedEmittedTask: Itask) => {
      emittedTask = recievedEmittedTask;
    });
    taskItemComponent.onToggleCompleted(task);
    expect(emittedTask).toEqual(task);
  });
  it('should emit delete with the exact task', () => {
    taskItemComponent.delete.subscribe((recievedEmittedTask: Itask) => {
      emittedTask = recievedEmittedTask;
    });
    taskItemComponent.onDelete(task);
    expect(emittedTask).toEqual(task);
  });

  describe('TaskItemComponent Dom', () => {
    let taskItemNtiveElement: HTMLElement;
    beforeEach(() => {
      taskItemNtiveElement = fixture.nativeElement as HTMLElement;
    });

    describe('if allTasks is not emtpy ', () => {
      describe('rendering multiple tasks', () => {
        let tasks: Itask[];
        beforeEach(() => {
          tasks = [
            { title: 'task 1', id: '1' },
            { title: 'task 2', id: '2' },
            { title: 'task 3', id: '3' },
            { title: 'task 4', id: '4' },
            { title: 'task 5', id: '5' },
          ];
          fixture.componentRef.setInput('allTasks', tasks);
          fixture.detectChanges();
        });
        it('should article repeated as many as allTasks.length', () => {
          let articles = taskItemNtiveElement.querySelectorAll('article');
          expect(articles.length).toBe(tasks.length);
        });
        it('should render the correct task title in h3', () => {
          let h3s = taskItemNtiveElement.querySelectorAll('h3');
          h3s.forEach((h3, index) => {
            expect(h3.textContent).toBe(tasks[index].title);
          });
        });
      });

      describe('task isImportant status', () => {
        let tasks: Itask[];
        beforeEach(() => {
          tasks = [
            { title: 'task 1', id: '1', isImportant: true, isComplete: true },
            { title: 'task 2', id: '2' },
          ];
          fixture.componentRef.setInput('allTasks', tasks);
          fixture.detectChanges();
        });
        describe('when the isImportant status is true', () => {
          it('should display solidStar icon', () => {
            let div = taskItemNtiveElement.querySelector('article div');
            console.log(div?.firstChild);
          });
          it('should call onToggleImportant with "task" when icon clicked', () => {});
        });
        describe('when the isImportant status is false', () => {
          it('should display regularStar icon', () => {});
          it('should call onToggleImportant with "task" when icon clicked', () => {});
        });
      });

      describe('task isComplete status', () => {
        describe('when the isComplete status is true', () => {
          it('should display solidCheck icon', () => {});
          it('should call onToggleCompleted with "task" when icon clicked', () => {});
        });
        describe('when the isComplete status is false', () => {
          it('should display regularCheck icon', () => {});
          it('should call onToggleCompleted with "task" when icon clicked', () => {});
        });
      });

      it('should display xmake icon', () => {});
      it('should call onDelete with "task" when icon clicked', () => {});
    });
    describe('if allTasks is  empty ', () => {
      it('should not render any article elements', () => {});
    });
  });
});
