// Form validation with Regular Expressions

const Validator = {
  // RegExp patterns
  patterns: {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
    phone: /^[0-9]{10}$/,
    name: /^[a-zA-Z\s]{2,}$/,
    notEmpty: /^.+$/
  },
  
  // Error messages
  messages: {
    email: 'Please enter a valid email address (e.g., user@example.com)',
    password: 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character',
    phone: 'Phone number must be exactly 10 digits (0-9)',
    name: 'Name must contain only letters and spaces (minimum 2 characters)',
    notEmpty: 'This field is required',
    passwordMatch: 'Passwords do not match',
    emailExists: 'This email address is already registered',
    invalidCredentials: 'Invalid email or password',
    invalidOTP: 'Invalid OTP code',
    dateInFuture: 'Date cannot be in the future',
    selectCategory: 'Please select a category'
  },
  
  // Validate individual field
  validateField(value, pattern, message) {
    if (pattern === 'notEmpty') {
      return this.patterns.notEmpty.test(value.trim()) ? 
        { valid: true } : 
        { valid: false, message: message || this.messages.notEmpty };
    }
    
    if (!this.patterns[pattern]) {
      return { valid: true };
    }
    
    return this.patterns[pattern].test(value) ? 
      { valid: true } : 
      { valid: false, message: message || this.messages[pattern] };
  },
  
  // Validate email
  validateEmail(email) {
    return this.validateField(email, 'email');
  },
  
  // Validate password
  validatePassword(password) {
    return this.validateField(password, 'password');
  },
  
  // Validate phone
  validatePhone(phone) {
    return this.validateField(phone, 'phone');
  },
  
  // Validate name
  validateName(name) {
    return this.validateField(name, 'name');
  },
  
  // Validate required field
  validateRequired(value, fieldName = 'This field') {
    const trimmed = value.trim();
    if (!trimmed) {
      return { valid: false, message: `${fieldName} is required` };
    }
    return { valid: true };
  },
  
  // Validate password match
  validatePasswordMatch(password, confirmPassword) {
    if (password !== confirmPassword) {
      return { valid: false, message: this.messages.passwordMatch };
    }
    return { valid: true };
  },
  
  // Validate date (not in future)
  validateDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    if (date > today) {
      return { valid: false, message: this.messages.dateInFuture };
    }
    return { valid: true };
  },
  
  // Validate file type (images only)
  validateImageFile(file) {
    if (!file) return { valid: true };
    
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return { valid: false, message: 'Please upload a valid image file (JPG, PNG, GIF, WEBP)' };
    }
    
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { valid: false, message: 'Image file size must be less than 5MB' };
    }
    
    return { valid: true };
  },
  
  // Show error message
  showError(inputId, message) {
    const errorSpan = document.getElementById(inputId + 'Error');
    const successSpan = document.getElementById(inputId + 'Success');
    const input = document.getElementById(inputId);
    
    if (errorSpan) {
      errorSpan.textContent = message;
      errorSpan.style.display = 'block';
    }
    
    if (successSpan) {
      successSpan.textContent = '';
      successSpan.style.display = 'none';
    }
    
    if (input) {
      input.setAttribute('aria-invalid', 'true');
      input.classList.add('invalid');
      input.classList.remove('valid');
    }
  },
  
  // Show success message
  showSuccess(inputId, message) {
    const errorSpan = document.getElementById(inputId + 'Error');
    const successSpan = document.getElementById(inputId + 'Success');
    const input = document.getElementById(inputId);
    
    if (errorSpan) {
      errorSpan.textContent = '';
      errorSpan.style.display = 'none';
    }
    
    if (successSpan) {
      successSpan.textContent = message || '✓ Valid';
      successSpan.style.display = 'block';
    }
    
    if (input) {
      input.setAttribute('aria-invalid', 'false');
      input.classList.add('valid');
      input.classList.remove('invalid');
    }
  },
  
  // Clear error message
  clearError(inputId) {
    const errorSpan = document.getElementById(inputId + 'Error');
    const successSpan = document.getElementById(inputId + 'Success');
    const input = document.getElementById(inputId);
    
    if (errorSpan) {
      errorSpan.textContent = '';
      errorSpan.style.display = 'none';
    }
    
    if (successSpan) {
      successSpan.textContent = '';
      successSpan.style.display = 'none';
    }
    
    if (input) {
      input.setAttribute('aria-invalid', 'false');
      input.classList.remove('invalid');
      input.classList.remove('valid');
    }
  },
  
  // Clear all errors in a form
  clearFormErrors(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    const errorSpans = form.querySelectorAll('.error-message');
    errorSpans.forEach(span => {
      span.textContent = '';
      span.style.display = 'none';
    });
    
    const inputs = form.querySelectorAll('.form-control');
    inputs.forEach(input => {
      input.setAttribute('aria-invalid', 'false');
      input.classList.remove('error');
    });
  },
  
  // Validate form
  validateForm(formId, validationRules) {
    let isValid = true;
    const errors = [];
    
    for (const [fieldId, rules] of Object.entries(validationRules)) {
      const input = document.getElementById(fieldId);
      if (!input) continue;
      
      const value = input.value;
      this.clearError(fieldId);
      
      for (const rule of rules) {
        let result;
        
        if (rule.type === 'email') {
          result = this.validateEmail(value);
        } else if (rule.type === 'password') {
          result = this.validatePassword(value);
        } else if (rule.type === 'phone') {
          result = this.validatePhone(value);
        } else if (rule.type === 'name') {
          result = this.validateName(value);
        } else if (rule.type === 'required') {
          result = this.validateRequired(value, rule.message);
        } else if (rule.type === 'date') {
          result = this.validateDate(value);
        } else if (rule.type === 'custom') {
          result = rule.validator(value);
        }
        
        if (!result.valid) {
          this.showError(fieldId, result.message);
          errors.push({ field: fieldId, message: result.message });
          isValid = false;
          break;
        }
      }
    }
    
    return { valid: isValid, errors };
  },
  
  // Real-time validation
  setupRealTimeValidation(inputId, validationType, checkExists = false) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    let validationTimeout;
    
    input.addEventListener('input', () => {
      clearTimeout(validationTimeout);
      this.clearError(inputId);
      
      const value = input.value;
      
      if (!value.trim()) {
        return;
      }
      
      validationTimeout = setTimeout(() => {
        let result;
        
        switch(validationType) {
          case 'email':
            result = this.validateEmail(value);
            if (result.valid && checkExists && typeof AppStorage !== 'undefined') {
              const existingUser = AppStorage.getUserByEmail(value);
              if (existingUser) {
                this.showError(inputId, this.messages.emailExists);
                return;
              }
            }
            break;
          case 'password':
            result = this.validatePassword(value);
            break;
          case 'phone':
            result = this.validatePhone(value);
            break;
          case 'name':
            result = this.validateName(value);
            break;
        }
        
        if (result) {
          if (!result.valid) {
            this.showError(inputId, result.message);
          } else {
            this.showSuccess(inputId);
          }
        }
      }, 500);
    });
    
    input.addEventListener('blur', () => {
      clearTimeout(validationTimeout);
      const value = input.value;
      
      if (!value.trim()) {
        this.clearError(inputId);
        return;
      }
      
      let result;
      
      switch(validationType) {
        case 'email':
          result = this.validateEmail(value);
          if (result.valid && checkExists && typeof AppStorage !== 'undefined') {
            const existingUser = AppStorage.getUserByEmail(value);
            if (existingUser) {
              this.showError(inputId, this.messages.emailExists);
              return;
            }
          }
          break;
        case 'password':
          result = this.validatePassword(value);
          break;
        case 'phone':
          result = this.validatePhone(value);
          break;
        case 'name':
          result = this.validateName(value);
          break;
      }
      
      if (result) {
        if (!result.valid) {
          this.showError(inputId, result.message);
        } else {
          this.showSuccess(inputId);
        }
      }
    });
  }
};