import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup;
  error: string = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  submit() {
    const { email, password } = this.loginForm.value;
    if (this.auth.login(email, password)) {
      const role = this.auth.getRole();
      if (role === 'driver') this.router.navigate(['/driver']);
      else this.router.navigate(['/passenger']);
    } else {
      this.error = 'Email or password is incorrect';
    }
  }
}
