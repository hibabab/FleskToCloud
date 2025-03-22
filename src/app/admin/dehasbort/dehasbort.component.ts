import { Component } from '@angular/core';

@Component({
  selector: 'app-dehasbort',
  standalone: false,
  templateUrl: './dehasbort.component.html',
  styleUrl: './dehasbort.component.css'
})
export class DehasbortComponent {
  homeIcon = 'Home';
  usersIcon = 'Users';
  briefcaseIcon = 'Briefcase';
  userIcon = 'User';
  showUserListFlag: boolean = false;

  showUserList() {
    this.showUserListFlag = true;
  }
}
