// agent-service-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-agent-service-form',
  templateUrl: './agent-service-form.component.html',
  standalone:false,
  styleUrls: ['./agent-service-form.component.css']
})
export class AgentServiceFormComponent implements OnInit {
  agentServiceForm!: FormGroup;

  constructor(
    private fb: FormBuilder,

    private router: Router
  ) {}

  ngOnInit(): void {
    this.agentServiceForm = this.fb.group({
      // Informations de l'utilisateur
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      cin: ['', Validators.required],
      telephone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      dateNaissance: ['', Validators.required],
      password: ['', Validators.required],

      // Informations spécifiques à l'agent de service
      specialite: ['', Validators.required],
      dateEmbauche: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.agentServiceForm.valid) {
      const agentServiceData = this.agentServiceForm.value;
    }
  }
}
