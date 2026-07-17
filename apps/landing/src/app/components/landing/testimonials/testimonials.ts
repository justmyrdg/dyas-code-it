import { Component, signal } from '@angular/core';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  accent: string;
}

@Component({
  selector: 'app-testimonials',
  templateUrl: './testimonials.html',
})
export class Testimonials {
  readonly testimonials: Testimonial[] = [
    {
      quote:
        'I actually look forward to homework now. Dyas never just gives me the answer — it makes me feel like I figured it out myself.',
      name: 'Sarah',
      role: 'Student',
      accent: 'text-yellow-500',
    },
    {
      quote:
        "I set up my first class in five minutes. The dashboard shows me who's stuck before they even raise a hand.",
      name: 'John',
      role: 'Teacher',
      accent: 'text-blue-600',
    },
  ];

  readonly activeIndex = signal(0);

  select(index: number): void {
    this.activeIndex.set(index);
  }
}
