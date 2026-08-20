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
            const solidStarSvg: Element | null = taskItemNtiveElement.querySelector(
              'fa-icon [data-icon="star"][data-prefix="fas"]',
            );
            expect(solidStarSvg).toBeTruthy();
          });
          it('should call onToggleImportant with "task" when icon clicked', () => {
            const spyonToggleImportant = vi.spyOn(taskItemComponent, 'onToggleImportant');
            const solidStar = taskItemNtiveElement.querySelector('fa-icon')! as HTMLElement;
            solidStar.click();
            expect(spyonToggleImportant).toHaveBeenCalledTimes(1);
            expect(spyonToggleImportant).toHaveBeenCalledWith(tasks[0]);
          });
        });
        describe('when the isImportant status is false', () => {
          it('should display regularStar icon', () => {
            const unImportantDiv = taskItemNtiveElement.querySelectorAll('div')[1];
            const RegularStarSvg = unImportantDiv.querySelector(
              'fa-icon [data-icon="star"][data-prefix="far"]',
            );

            expect(RegularStarSvg).toBeTruthy();
          });
          it('should call onToggleImportant with "task" when icon clicked', () => {
            const unImportantDiv = taskItemNtiveElement.querySelectorAll('div')[1];
            const RegularStarIcon = unImportantDiv.querySelector('fa-icon') as HTMLElement;
            const spyOnonToggleImportant = vi.spyOn(taskItemComponent, 'onToggleImportant');
            RegularStarIcon.click();
            expect(taskItemComponent.onToggleImportant).toHaveBeenCalledTimes(1);
            expect(taskItemComponent.onToggleImportant).toHaveBeenCalledWith(tasks[1]);
          });
        });
      });

      describe('task isComplete status', () => {
        let tasks: Itask[];
        beforeEach(() => {
          tasks = [
            { title: 'task 1', id: '1', isImportant: true, isComplete: true },
            { title: 'task 2', id: '2' },
          ];
          fixture.componentRef.setInput('allTasks', tasks);
          fixture.detectChanges();
        });
        describe('when the isComplete status is true', () => {
          it('should display solidCheck icon', () => {
            const solidCheckSvg: Element | null = taskItemNtiveElement.querySelector(
              'div fa-icon [data-icon="circle-check"][data-prefix="fas"]',
            );

            expect(solidCheckSvg).toBeTruthy();
          });
          it('should call onToggleCompleted with "task" when icon clicked', () => {
            const solidCheck: HTMLElement = taskItemNtiveElement.querySelector(
              'div fa-icon:nth-child(2)',
            )!;
            const spyOnToggleCompleted = vi.spyOn(taskItemComponent, 'onToggleCompleted');
            solidCheck.click();
            expect(spyOnToggleCompleted).toHaveBeenCalledTimes(1);
            expect(spyOnToggleCompleted).toHaveBeenCalledWith(tasks[0]);
          });
        });
        describe('when the isComplete status is false', () => {
          it('should display regularCheck icon', () => {
            const unCompleteDiv = taskItemNtiveElement.querySelectorAll('div')[1];
            const regularCheckSvg = unCompleteDiv.querySelector(
              'fa-icon [data-icon="circle-check"][data-prefix="far"]',
            );

            expect(regularCheckSvg).toBeTruthy();
          });
          it('should call onToggleCompleted with "task" when icon clicked', () => {
            const unCompleteDiv = taskItemNtiveElement.querySelectorAll('div')[1];
            const regularCheck: HTMLElement = unCompleteDiv.querySelector('fa-icon:nth-child(2')!;
            const spyOnToggleCompleted = vi.spyOn(taskItemComponent, 'onToggleCompleted');
            regularCheck.click();
            expect(spyOnToggleCompleted).toHaveBeenCalledTimes(1);
            expect(spyOnToggleCompleted).toHaveBeenCalledWith(tasks[1]);
          });
        });
      });
      describe('delete task', () => {
        let tasks: Itask[];
        beforeEach(() => {
          tasks = [
            { title: 'task 1', id: '1', isImportant: true, isComplete: true },
            { title: 'task 2', id: '2' },
          ];
          fixture.componentRef.setInput('allTasks', tasks);
          fixture.detectChanges();
        });
        it('should display xmake icon', () => {
          const divs: NodeListOf<HTMLDivElement> = taskItemNtiveElement.querySelectorAll('div');
          divs.forEach((div) => {
            const xmarkSvg = div.querySelector(
              'fa-icon [data-icon="circle-xmark"][data-prefix="far"]',
            );

            expect(xmarkSvg).toBeTruthy();
          });
        });
        it('should call onDelete with "task" when icon clicked', () => {
          const div: HTMLDivElement = taskItemNtiveElement.querySelector('div')!;

          const xmarkIcon: HTMLElement = div.querySelector(':nth-child(3)')!;
          const spyOnDelete = vi.spyOn(taskItemComponent, 'onDelete');
          xmarkIcon.click();
          expect(spyOnDelete).toHaveBeenCalledTimes(1);
          expect(spyOnDelete).toHaveBeenCalledWith(tasks[0]);
        });
      });
    });
    describe('if allTasks is  empty ', () => {
      it('should not render any article elements', () => {
        fixture.componentRef.setInput('allTasks', []);
        fixture.detectChanges();
        const articles: NodeListOf<HTMLElement> = document.querySelectorAll('article');
        expect(articles.length).toBe(0);
      });
    });
  });
});
