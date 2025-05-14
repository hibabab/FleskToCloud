import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import html2canvas from 'html2canvas';

export interface ImpactPoint {
  x: number;
  y: number;
  label: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  photo?: string;
}
@Component({
  selector: 'app-vehicule',
  standalone: false,
  templateUrl: './vehicule.component.html',
  styleUrl: './vehicule.component.css'
})


  export class VehiculeComponent implements OnInit {
    @Input() driverPrefix: string = 'A';
    @Output() formSubmitted = new EventEmitter<any>();
    
  
    vehiculeForm!: FormGroup;
   
    activeVehicle: string | null = null;
    
    private subscriptions: Subscription[] = [];
  
    constructor(private fb: FormBuilder) {}
  
    ngOnInit(): void {
      this.initForm();
      this.setupFormListeners();
      this.vehiculeForm.valueChanges.subscribe(() => {
        if (this.vehiculeForm.valid) {
          this.formSubmitted.emit(this.vehiculeForm.value);
        }
      });
    }
    
  
  
  
    private initForm(): void {
      this.vehiculeForm = this.fb.group({
        vehiculeAssure: [''],
        agence: [''],
        contratAssurance: [''],
        dateDebut: [''],
        dateFin: [''],
        
        nomAssure: [''],
        prenomAssure: [''],
        isAssureConducteur: [true],
        numSocietaire: [''],
        emailAssure: ['', [Validators.email]], // Garde seulement Validators.email
        telAssure: ['', [Validators.pattern(/^[0-9]{8,15}$/)]], 
        gouvernatAssure:[''],// Garde seulement le pattern
        villeAssure: [''],
        rueAssure: [''],
        codePostalAssure: ['', [Validators.pattern(/^[0-9]{4}$/)]], // Garde seulement le pattern
        
        nomConducteur: [''],
        prenomConducteur: [''],
        emailConducteur: ['', [Validators.email]],
        numPermis: [''],
        dateDelivrance: [''],
        gouvernatConducteur:[''],
        villeConducteur: [''],
        rueConducteur: [''],
        codePostalConducteur: ['', [Validators.pattern(/^[0-9]{4}$/)]],
        
        numImmatriculation: [''],
        typeVehicule: [''],
        marqueVehicule: [''],
        modeleVehicule: [''],
        
        venantDe: [''],
        allantA: [''],
        
        observation: ['', [Validators.minLength(20)]],
        degatsApparents: ['', [Validators.minLength(20)]],
      }, { validators: this.dateRangeValidator });
    
      this.toggleConducteurFields(true);
    }
  
    private setupFormListeners(): void {
      const sub = this.vehiculeForm.get('isAssureConducteur')?.valueChanges.subscribe(value => {
        this.toggleConducteurFields(value);
      });
      if (sub) {
        this.subscriptions.push(sub);
      }
    }
  
    private toggleConducteurFields(isAssureConducteur: boolean): void {
      const fields = ['nomConducteur', 'prenomConducteur', 'emailConducteur', 'telConducteur', 'numPermis', 'dateDelivrance'];
      if (isAssureConducteur) {
        fields.forEach(field => this.vehiculeForm.get(field)?.disable());
      } else {
        fields.forEach(field => this.vehiculeForm.get(field)?.enable());
      }
    }
  
    
    
    private dateRangeValidator(group: AbstractControl): ValidationErrors | null {
      const dateDebut = group.get('dateDebut')?.value;
      const dateFin = group.get('dateFin')?.value;
  
      if (dateDebut && dateFin && new Date(dateDebut) > new Date(dateFin)) {
        return { dateRangeInvalid: true };
      }
      return null;
    }
  
   



}

