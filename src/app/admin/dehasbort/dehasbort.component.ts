import { Component } from '@angular/core';
import { UserDto } from '../../assure/models/user-dto';
import { jwtDecode } from 'jwt-decode';
import { UserService } from '../../assure/services/user-service.service';
import { NotificationService } from '../../agent-service/Services/notification.service';

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
