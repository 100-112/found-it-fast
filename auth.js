// Authentication Module

const Auth = {
  // Login
  login(email, password) {
    const user = AppStorage.getUserByEmail(email);
    
    if (!user) {
      return { success: false, message: 'Invalid email or password' };
    }
    
    if (user.password !== password) {
      return { success: false, message: 'Invalid email or password' };
    }
    
    if (user.status === 'blocked') {
      return { success: false, message: 'Your account has been blocked. Please contact support.' };
    }
    
    // Set current user
    AppStorage.setCurrentUser(user);
    
    return { success: true, user };
  },
  
  // Register
  register(userData) {
    // Check if email already exists
    const existingUser = AppStorage.getUserByEmail(userData.email);
    if (existingUser) {
      return { success: false, message: 'Email already registered' };
    }
    
    // Create new user
    const newUser = AppStorage.addUser(userData);
    
    // Auto login
    AppStorage.setCurrentUser(newUser);
    
    return { success: true, user: newUser };
  },
  
  // Logout
  logout() {
    AppStorage.clearCurrentUser();
  },
  
  // Check if authenticated
  isAuthenticated() {
    return AppStorage.isAuthenticated();
  },
  
  // Check if admin
  isAdmin() {
    return AppStorage.isAdmin();
  },
  
  // Get current user
  getCurrentUser() {
    return AppStorage.getCurrentUser();
  },
  
  // Require authentication
  requireAuth() {
    return this.isAuthenticated();
  },
  
  // Require admin
  requireAdmin() {
    return this.isAdmin();
  },
  
  // Update profile
  updateProfile(userId, updates) {
    const updated = AppStorage.updateUser(userId, updates);
    if (updated) {
      AppStorage.setCurrentUser(updated);
      return { success: true, user: updated };
    }
    return { success: false, message: 'Failed to update profile' };
  },
  
  // Generate OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },
  
  // Verify OTP
  verifyOTP(inputOTP, actualOTP) {
    return inputOTP === actualOTP;
  },
  
  // Reset Password
  resetPassword(email, newPassword) {
    const user = AppStorage.getUserByEmail(email);
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    
    const updated = AppStorage.updateUser(user.id, { password: newPassword });
    if (updated) {
      return { success: true };
    }
    return { success: false, message: 'Failed to reset password' };
  }
};
