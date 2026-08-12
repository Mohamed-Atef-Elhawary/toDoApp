import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, retry, Subject, throwError } from 'rxjs';
import { Ibins, Itask } from '../interfaces/task-interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  searchString$ = new BehaviorSubject<string>('');

  constructor(private http: HttpClient) {}

  getTasks(): Observable<Itask[]> {
    return this.http
      .get<Ibins>(`${environment.backendUrl}/${environment.binId}`, {
        headers: new HttpHeaders({ 'X-Master-Key': environment.masterKey }),
      })
      .pipe(
        retry({ count: 1, delay: 1000 }),
        map((response: Ibins) => {
          return response['record']['tasks'];
        }),
        catchError(() => throwError(() => new Error('please try again later'))),
      );
  }

  modifyTasks(tasks: Itask[]): Observable<Itask[]> {
    return this.http
      .put<Ibins>(
        `${environment.backendUrl}/${environment.binId}`,
        { tasks },
        {
          headers: new HttpHeaders({
            'X-Master-Key': environment.masterKey,
          }),
        },
      )
      .pipe(
        retry({ count: 1, delay: 1000 }),
        map((response: Ibins) => {
          return response['record']['tasks'];
        }),
        catchError(() => throwError(() => new Error('please try again later'))),
      );
  }
}
