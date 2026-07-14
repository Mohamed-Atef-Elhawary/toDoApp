import { DatePipe } from '@angular/common';
import { Component, input, InputSignal, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-page-title-component',
  imports: [DatePipe],
  templateUrl: './page-title-component.html',
  styleUrl: './page-title-component.css',
})
export class PageTitleComponent implements OnChanges {
  category: InputSignal<string> = input.required<string>();
  title!: string;
  date = new Date();
  ngOnChanges(): void {
    this.title = `${this.category()[0].toUpperCase()}${this.category().slice(1)} Tasks`;
  }
}
