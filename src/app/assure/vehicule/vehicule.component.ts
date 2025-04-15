import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-vehicule',
  standalone: false,
  templateUrl: './vehicule.component.html',
  styleUrl: './vehicule.component.css'
})


  export class VehiculeComponent implements OnInit {

    @Input() driverPrefix: string = 'A'; // Valeur par défaut
    @Output() formSubmitted = new EventEmitter<any>();
  
    vehiculeForm!: FormGroup;
    chocMode = false;
    activeVehicle: string | null = null;
    damagePoints: { x: number; y: number }[] = [];
    lastChocAdded = false;
  
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
        vehiculeAssure: ['', Validators.required],
        agence: ['', Validators.required],
        contratAssurance: ['', Validators.required],
        dateDebut: ['', Validators.required],
        dateFin: ['', Validators.required],
        
        nomAssure: ['', Validators.required],
        prenomAssure: ['', Validators.required],
        isAssureConducteur: [true],
        numSocietaire: ['', Validators.required],
        emailAssure: ['', [Validators.email, Validators.required]],
        telAssure: ['', [Validators.pattern(/^[0-9]{8,15}$/), Validators.required]],
        villeAssure: ['', Validators.required],
        rueAssure: ['', Validators.required],
        codePostalAssure: ['', [Validators.pattern(/^[0-9]{4}$/), Validators.required]],
        
        nomConducteur: [''],  // Sans 'Validators.required'
        prenomConducteur: [''],  // Sans 'Validators.required'
        emailConducteur: ['', [Validators.email]],  // Pas 'Validators.required'
        numPermis: [''],  // Sans 'Validators.required'
        dateDelivrance: [''],  // Sans 'Validators.required'
        villeConducteur: [''],  // Sans 'Validators.required'
        rueConducteur: [''],  // Sans 'Validators.required'
        codePostalConducteur: ['', [Validators.pattern(/^[0-9]{4}$/)]],
        
        numImmatriculation: ['', Validators.required],
        typeVehicule: ['', Validators.required],
        marqueVehicule: ['', Validators.required],
        modeleVehicule: ['', Validators.required],
        
        venantDe: ['', Validators.required],
        allantA: ['', Validators.required],
        
        observation: ['', [Validators.minLength(20)]], // pas required ici
        degatsApparents: ['', [Validators.minLength(20)]], // pas required ici
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
  
    // Gestion du croquis
    selectVehicle(vehicle: string): void {
      this.activeVehicle = vehicle;
      this.chocMode = false;
    }
  
    toggleChocMode(): void {
      if (this.activeVehicle) {
        this.chocMode = !this.chocMode;
      }
    }
  
    addChocPoint(event: MouseEvent): void {
      if (!this.activeVehicle || !this.chocMode) return;
  
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
  
      this.damagePoints.push({ x, y });
      this.lastChocAdded = true;
  
      setTimeout(() => {
        this.lastChocAdded = false;
      }, 2000);
    }
  
    clearLastChoc(): void {
      if (this.damagePoints.length > 0) {
        this.damagePoints.pop();
      }
    }
  
    getVehicleIconClass(): string {
      switch (this.activeVehicle) {
        case 'car': return 'fas fa-car text-teal-600';
        case 'truck': return 'fas fa-truck text-amber-500';
        case 'bike': return 'fas fa-bicycle text-green-500';
        default: return '';
      }
    }
   
   
    
  }
  