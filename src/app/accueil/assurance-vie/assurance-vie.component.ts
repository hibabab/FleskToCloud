import { Component } from '@angular/core';

@Component({
  selector: 'app-assurance-vie',
  standalone: false,
  templateUrl: './assurance-vie.component.html',
  styleUrl: './assurance-vie.component.css'
})
export class AssuranceVieComponent {
  activeQuestion: number | null = null;

  toggleQuestion(questionNumber: number) {
    if (this.activeQuestion === questionNumber) {
      this.activeQuestion = null;
    } else {
      this.activeQuestion = questionNumber;
    }
  }
}
