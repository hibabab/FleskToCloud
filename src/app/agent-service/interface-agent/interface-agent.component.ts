import { Component } from '@angular/core';

@Component({
  selector: 'app-interface-agent',
  standalone: false,
  templateUrl: './interface-agent.component.html',
  styleUrl: './interface-agent.component.css'
})
export class InterfaceAgentComponent {
  activeTab: 'auto' | 'vie' = 'auto';

  constructor() { }
}
