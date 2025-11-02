// Main Application Logic

const App = {
  currentView: 'landing',
  currentItem: null,
  currentConversation: null,
  currentOTP: null,
  resetEmail: null,
  
  // Initialize application
  init() {
    console.log('App initializing...');
    console.log('Current view:', this.currentView);
    
    this.setupEventListeners();
    this.updateUI();
    this.checkAuth();
    this.setupBackButton();
    this.setupSidebar();
    
    console.log('App initialization complete');
    
    // Verify critical elements exist
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    console.log('Login form exists:', !!loginForm);
    console.log('Register form exists:', !!registerForm);
  },
  
  // Check authentication and update UI
  checkAuth() {
    if (Auth.isAuthenticated()) {
      const user = Auth.getCurrentUser();
      if (user.role === 'admin') {
        this.showView('admin-dashboard');
      } else {
        this.showView('dashboard');
      }
    }
  },
  
  // Setup all event listeners
  setupEventListeners() {
    // Logo click handler
    const logo = document.querySelector('.logo');
    if (logo) {
      logo.addEventListener('click', () => {
        if (Auth.isAuthenticated()) {
          if (Auth.isAdmin()) {
            this.showView('admin-dashboard');
          } else {
            this.showView('dashboard');
          }
        } else {
          this.showView('landing');
        }
      });
    }
    
    // Navigation - ALL elements with data-view attribute
    document.querySelectorAll('[data-view]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const view = e.currentTarget.getAttribute('data-view');
        console.log('Navigation clicked:', view); // Debug log
        this.showView(view);
      });
    });
    
    // Explicit handlers for login and register buttons to ensure they work
    this.setupLoginRegisterButtons();
    
    // Mobile menu toggle
    const menuToggle = document.getElementById('mobileMenuToggle');
    const mainNav = document.getElementById('main-nav');
    if (menuToggle && mainNav) {
      menuToggle.addEventListener('click', () => {
        mainNav.classList.toggle('active');
        const expanded = mainNav.classList.contains('active');
        menuToggle.setAttribute('aria-expanded', expanded);
      });
    }
    
    // Forms
    this.setupLoginForm();
    this.setupRegisterForm();
    this.setupResetPasswordForms();
    this.setupReportLostForm();
    this.setupReportFoundForm();
    this.setupProfileForm();
    this.setupSearchAndFilters();
    this.setupContactForm();
    this.setupAdminForms();
    this.setupReportForms();
    this.setupComposeForm();
    this.setupMyPostsFilters();
    this.setupEditPostForm();
    
    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.logout());
    }
    
    // Sidebar logout buttons
    const sidebarLogout = document.getElementById('sidebarLogout');
    if (sidebarLogout) {
      sidebarLogout.addEventListener('click', () => this.logout());
    }
    
    const sidebarAdminLogout = document.getElementById('sidebarAdminLogout');
    if (sidebarAdminLogout) {
      sidebarAdminLogout.addEventListener('click', () => this.logout());
    }
    
    // Message view tabs
    document.querySelectorAll('[data-message-view]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = e.currentTarget.getAttribute('data-message-view');
        this.showMessageView(view);
      });
    });
    
    // Notification banner buttons
    const viewNotifBtn = document.getElementById('viewNotificationBtn');
    if (viewNotifBtn) {
      viewNotifBtn.addEventListener('click', () => this.showView('notifications'));
    }
    
    const dismissNotifBtn = document.getElementById('dismissNotificationBtn');
    if (dismissNotifBtn) {
      dismissNotifBtn.addEventListener('click', () => this.dismissNotificationBanner());
    }
    
    // Compose message form
    this.setupComposeForm();
    
    // Modal close
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        this.closeModal();
        this.closeReportItemModal();
        this.closeReportUserModal();
        this.closeEditPostModal();
      });
    });
    
    // Image preview handlers
    this.setupImagePreview('lostImage', 'lostImagePreview');
    this.setupImagePreview('foundImage', 'foundImagePreview');
    
    // Setup real-time validation
    Validator.setupRealTimeValidation('loginEmail', 'email');
    Validator.setupRealTimeValidation('loginPassword', 'password');
    Validator.setupRealTimeValidation('registerEmail', 'email', true); // Check if email exists
    Validator.setupRealTimeValidation('registerPassword', 'password');
    Validator.setupRealTimeValidation('registerPhone', 'phone');
    Validator.setupRealTimeValidation('registerName', 'name');
    
    // Setup real-time validation for contact/phone fields
    Validator.setupRealTimeValidation('lostContact', 'phone');
    Validator.setupRealTimeValidation('foundContact', 'phone');
    Validator.setupRealTimeValidation('editPostContact', 'phone');
    Validator.setupRealTimeValidation('profilePhone', 'phone');
  },
  
  // Setup Login and Register Buttons explicitly
  setupLoginRegisterButtons() {
    // Find all login buttons/links
    const loginButtons = document.querySelectorAll('[data-view="login"]');
    loginButtons.forEach(btn => {
      // Remove any existing listeners by cloning
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      
      // Add fresh event listener
      newBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Login button clicked'); // Debug
        this.showView('login');
      });
    });
    
    // Find all register buttons/links
    const registerButtons = document.querySelectorAll('[data-view="register"]');
    registerButtons.forEach(btn => {
      // Remove any existing listeners by cloning
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      
      // Add fresh event listener
      newBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Register button clicked'); // Debug
        this.showView('register');
      });
    });
    
    console.log('Login/Register buttons setup complete');
    console.log('Login buttons found:', loginButtons.length);
    console.log('Register buttons found:', registerButtons.length);
  },
  
  // Show view and update navigation
  showView(viewName) {
    console.log('showView called with:', viewName); // Debug
    
    // Authentication gating for protected views
    const protectedViews = ['dashboard', 'report-lost', 'report-found', 'browse', 'inbox', 'sent', 'compose', 'notifications', 'messages', 'profile'];
    if (protectedViews.includes(viewName) && !Auth.isAuthenticated()) {
      this.showToast('Please login first to access this page.', 'error');
      this.showView('login');
      return;
    }
    
    // Check admin access
    if (viewName.startsWith('admin-') && !Auth.isAdmin()) {
      this.showToast('Access denied. Admin privileges required.', 'error');
      if (Auth.isAuthenticated()) {
        this.showView('dashboard');
      } else {
        this.showView('login');
      }
      return;
    }
    
    // Prevent users from accessing report/browse if they're admin (but allow messages)
    if (Auth.isAdmin() && ['report-lost', 'report-found', 'browse', 'notifications'].includes(viewName)) {
      this.showToast('This feature is not available for admin users.', 'error');
      this.showView('admin-dashboard');
      return;
    }
    
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
      view.classList.remove('active');
    });
    
    // Show requested view
    const view = document.getElementById(viewName);
    if (view) {
      view.classList.add('active');
      
      // Add to history
      if (this.currentView !== viewName) {
        AppStorage.addToHistory(viewName);
      }
      this.currentView = viewName;
      
      // Update navigation
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-view') === viewName) {
          link.classList.add('active');
        }
      });
      
      // Clear forms when showing login/register views
      if (viewName === 'login') {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
          loginForm.reset();
          Validator.clearFormErrors('loginForm');
        }
      } else if (viewName === 'register') {
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
          registerForm.reset();
          Validator.clearFormErrors('registerForm');
        }
      }
      
      // Load view-specific data
      this.loadViewData(viewName);
      
      // Close mobile menu
      const mainNav = document.getElementById('main-nav');
      if (mainNav) {
        mainNav.classList.remove('active');
      }
      
      // Scroll to top
      window.scrollTo(0, 0);
      
      // Update back button visibility
      this.updateBackButton();
      
      // Update sidebar active link
      this.updateSidebarActiveLink();
      
      // Close sidebar on mobile after navigation
      if (window.innerWidth <= 768) {
        this.closeSidebar();
      }
    }
  },
  
  // Load data for specific view
  loadViewData(viewName) {
    switch(viewName) {
      case 'dashboard':
        this.loadDashboard();
        break;
      case 'browse':
        this.loadBrowseItems();
        break;
      case 'messages':
        this.loadMessages();
        break;
      case 'profile':
        this.loadProfile();
        break;
      case 'admin-dashboard':
        this.loadAdminDashboard();
        break;
      case 'admin-users':
        this.loadAdminUsers();
        break;
      case 'admin-posts':
        this.loadAdminPosts();
        break;
      case 'admin-categories':
        this.loadAdminCategories();
        break;
      case 'admin-reported-users':
        this.loadAdminReportedUsers();
        break;
      case 'notifications':
        this.loadNotifications();
        break;
      case 'inbox':
        this.loadInbox();
        break;
      case 'sent':
        this.loadSent();
        break;
      case 'compose':
        // CHANGE 2: Pre-fill admin email for users and make it readonly
        if (!Auth.isAdmin()) {
          const adminUser = AppStorage.getUsers().find(u => u.role === 'admin');
          if (adminUser) {
            const recipientField = document.getElementById('composeRecipient');
            if (recipientField) {
              recipientField.value = adminUser.email;
              recipientField.setAttribute('readonly', 'true');
              recipientField.style.backgroundColor = 'var(--color-secondary)';
              recipientField.style.cursor = 'not-allowed';
            }
          }
        } else {
          // Admin can send to anyone
          const recipientField = document.getElementById('composeRecipient');
          if (recipientField) {
            recipientField.removeAttribute('readonly');
            recipientField.style.backgroundColor = '';
            recipientField.style.cursor = '';
          }
        }
        break;
      case 'my-posts':
        this.loadMyPosts();
        break;
    }
  },
  
  // Setup Sidebar
  setupSidebar() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarClose = document.getElementById('sidebarClose');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', () => this.toggleSidebar());
    }
    
    if (sidebarClose) {
      sidebarClose.addEventListener('click', () => this.closeSidebar());
    }
    
    if (sidebarOverlay) {
      sidebarOverlay.addEventListener('click', () => this.closeSidebar());
    }
    
    // Add keyboard navigation for sidebar links
    document.querySelectorAll('.sidebar-link').forEach(link => {
      link.addEventListener('click', (e) => {
        const view = e.currentTarget.getAttribute('data-view');
        if (view) {
          e.preventDefault();
          this.showView(view);
        }
      });
      
      link.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const view = e.currentTarget.getAttribute('data-view');
          if (view) {
            this.showView(view);
          } else {
            e.currentTarget.click();
          }
        }
      });
    });
    
    // Close sidebar on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sidebar && sidebar.classList.contains('active')) {
        this.closeSidebar();
      }
    });
  },
  
  // Toggle Sidebar
  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    
    if (sidebar) {
      const isActive = sidebar.classList.toggle('active');
      
      if (sidebarToggle) {
        sidebarToggle.setAttribute('aria-expanded', isActive);
      }
      
      // Prevent body scroll when sidebar is open on mobile
      if (window.innerWidth <= 768) {
        document.body.style.overflow = isActive ? 'hidden' : '';
      }
    }
  },
  
  // Close Sidebar
  closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    
    if (sidebar) {
      sidebar.classList.remove('active');
      
      if (sidebarToggle) {
        sidebarToggle.setAttribute('aria-expanded', 'false');
      }
      
      document.body.style.overflow = '';
    }
  },
  
  // Update Sidebar Active Link
  updateSidebarActiveLink() {
    document.querySelectorAll('.sidebar-link').forEach(link => {
      link.classList.remove('active');
      const view = link.getAttribute('data-view');
      if (view === this.currentView) {
        link.classList.add('active');
      }
    });
  },
  
  // Update Sidebar User Info
  updateSidebarUserInfo() {
    if (!Auth.isAuthenticated()) return;
    
    const user = Auth.getCurrentUser();
    const sidebarUserName = document.getElementById('sidebarUserName');
    const sidebarUserEmail = document.getElementById('sidebarUserEmail');
    
    if (sidebarUserName) {
      sidebarUserName.textContent = user.name;
    }
    
    if (sidebarUserEmail) {
      sidebarUserEmail.textContent = user.email;
    }
    
    // Update sidebar badge counts for both admin and users
    this.updateSidebarBadges();
  },
  
  // Update Sidebar Badges
  updateSidebarBadges() {
    if (!Auth.isAuthenticated()) return;
    
    const user = Auth.getCurrentUser();
    const unreadMessages = AppStorage.getUnreadMessageCount(user.id);
    
    if (Auth.isAdmin()) {
      // Update admin message badge
      const adminMessageBadge = document.getElementById('sidebarAdminMessageCount');
      if (adminMessageBadge) {
        adminMessageBadge.textContent = unreadMessages;
        if (unreadMessages === 0) {
          adminMessageBadge.style.display = 'none';
        } else {
          adminMessageBadge.style.display = 'inline-block';
        }
      }
    } else {
      // Update user badges
      const unreadNotifications = AppStorage.getUnreadNotificationCount(user.id);
      
      const sidebarMessageCount = document.getElementById('sidebarMessageCount');
      const sidebarNotifCount = document.getElementById('sidebarNotifCount');
      
      if (sidebarMessageCount) {
        sidebarMessageCount.textContent = unreadMessages;
        if (unreadMessages === 0) {
          sidebarMessageCount.style.display = 'none';
        } else {
          sidebarMessageCount.style.display = 'inline-block';
        }
      }
      
      if (sidebarNotifCount) {
        sidebarNotifCount.textContent = unreadNotifications;
        if (unreadNotifications === 0) {
          sidebarNotifCount.style.display = 'none';
        } else {
          sidebarNotifCount.style.display = 'inline-block';
        }
      }
    }
  },
  
  // Update UI based on authentication state
  updateUI() {
    const isAuth = Auth.isAuthenticated();
    const isAdmin = Auth.isAdmin();
    
    document.querySelectorAll('.auth-only').forEach(el => {
      el.classList.toggle('hidden', !isAuth);
    });
    
    document.querySelectorAll('.guest-only').forEach(el => {
      el.classList.toggle('hidden', isAuth);
    });
    
    document.querySelectorAll('.admin-only').forEach(el => {
      el.classList.toggle('hidden', !isAdmin);
    });
    
    // Hide user-only features from admin
    document.querySelectorAll('.user-only').forEach(el => {
      el.classList.toggle('hidden', isAdmin);
    });
    
    // Update message count
    if (isAuth) {
      const user = Auth.getCurrentUser();
      const unreadCount = AppStorage.getUnreadMessageCount(user.id);
      
      if (!isAdmin) {
        const badge = document.getElementById('messageCount');
        if (badge) {
          badge.textContent = unreadCount;
          badge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
        }
        
        // Update notification count
        const unreadNotifs = AppStorage.getUnreadNotificationCount(user.id);
        const notifBadge = document.getElementById('notificationCount');
        if (notifBadge) {
          notifBadge.textContent = unreadNotifs;
          notifBadge.style.display = unreadNotifs > 0 ? 'inline-block' : 'none';
        }
        
        // Show notification banner if there are unread notifications
        this.showNotificationBanner();
        
        // Update sidebar user info and badges
        this.updateSidebarUserInfo();
      } else {
        // Admin - update sidebar badges and user info
        this.updateSidebarUserInfo();
      }
    }
    
    // Update sidebar active link
    this.updateSidebarActiveLink();
  },
  
  // Login Form
  setupLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) {
      console.error('Login form not found!');
      return;
    }
    
    console.log('Login form setup complete');
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      
      // Validate
      Validator.clearFormErrors('loginForm');
      const validation = Validator.validateForm('loginForm', {
        loginEmail: [{ type: 'required' }, { type: 'email' }],
        loginPassword: [{ type: 'required' }]
      });
      
      if (!validation.valid) return;
      
      // Attempt login
      const result = Auth.login(email, password);
      
      if (result.success) {
        this.showToast('Login successful! Welcome back.', 'success');
        this.updateUI();
        this.updateSidebarUserInfo();
        // Redirect based on role
        if (result.user.role === 'admin') {
          this.showView('admin-dashboard');
        } else {
          this.showView('dashboard');
        }
        form.reset();
      } else {
        this.showToast(result.message, 'error');
      }
    });
  },
  
  // Register Form
  setupRegisterForm() {
    const form = document.getElementById('registerForm');
    if (!form) {
      console.error('Register form not found!');
      return;
    }
    
    console.log('Register form setup complete');
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('registerName').value;
      const email = document.getElementById('registerEmail').value;
      const phone = document.getElementById('registerPhone').value;
      const password = document.getElementById('registerPassword').value;
      const confirmPassword = document.getElementById('registerConfirmPassword').value;
      
      // Validate
      Validator.clearFormErrors('registerForm');
      const validation = Validator.validateForm('registerForm', {
        registerName: [{ type: 'required' }, { type: 'name' }],
        registerEmail: [{ type: 'required' }, { type: 'email' }],
        registerPhone: [{ type: 'required' }, { type: 'phone' }],
        registerPassword: [{ type: 'required' }, { type: 'password' }],
        registerConfirmPassword: [{ type: 'required' }]
      });
      
      if (!validation.valid) return;
      
      // Check password match
      const passwordMatch = Validator.validatePasswordMatch(password, confirmPassword);
      if (!passwordMatch.valid) {
        Validator.showError('registerConfirmPassword', passwordMatch.message);
        return;
      }
      
      // Final check if email exists
      const existingUser = AppStorage.getUserByEmail(email);
      if (existingUser) {
        Validator.showError('registerEmail', 'This email address is already registered');
        return;
      }
      
      // Register user
      const result = Auth.register({ name, email, phone, password });
      
      if (result.success) {
        this.showToast('Registration successful! Welcome to Found It Fast.', 'success');
        this.updateUI();
        this.updateSidebarUserInfo();
        // New users are always regular users, not admin
        this.showView('dashboard');
        form.reset();
      } else {
        this.showToast(result.message, 'error');
      }
    });
  },
  
  // Reset Password Forms
  setupResetPasswordForms() {
    // Step 1: Email form
    const emailForm = document.getElementById('resetEmailForm');
    if (emailForm) {
      emailForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('resetEmail').value;
        
        // Validate
        Validator.clearFormErrors('resetEmailForm');
        const emailValidation = Validator.validateEmail(email);
        
        if (!emailValidation.valid) {
          Validator.showError('resetEmail', emailValidation.message);
          return;
        }
        
        // Check if user exists
        const user = AppStorage.getUserByEmail(email);
        if (!user) {
          Validator.showError('resetEmail', 'No account found with this email address');
          return;
        }
        
        // Generate OTP
        this.currentOTP = Auth.generateOTP();
        this.resetEmail = email;
        
        // Show step 2
        document.getElementById('resetStep1').classList.add('hidden');
        document.getElementById('resetStep2').classList.remove('hidden');
        document.getElementById('otpValue').textContent = this.currentOTP;
        
        this.showToast('OTP generated! (In production, this would be sent to your email)', 'info');
      });
    }
    
    // Step 2: Password reset form
    const passwordForm = document.getElementById('resetPasswordForm');
    if (passwordForm) {
      passwordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const otp = document.getElementById('resetOTP').value;
        const newPassword = document.getElementById('resetNewPassword').value;
        
        // Validate
        Validator.clearFormErrors('resetPasswordForm');
        
        if (!otp) {
          Validator.showError('resetOTP', 'Please enter the OTP code');
          return;
        }
        
        if (!Auth.verifyOTP(otp, this.currentOTP)) {
          Validator.showError('resetOTP', 'Invalid OTP code');
          return;
        }
        
        const passwordValidation = Validator.validatePassword(newPassword);
        if (!passwordValidation.valid) {
          Validator.showError('resetNewPassword', passwordValidation.message);
          return;
        }
        
        // Reset password
        const result = Auth.resetPassword(this.resetEmail, newPassword);
        
        if (result.success) {
          this.showToast('Password reset successfully! You can now login.', 'success');
          this.showView('login');
          passwordForm.reset();
          document.getElementById('resetStep1').classList.remove('hidden');
          document.getElementById('resetStep2').classList.add('hidden');
          this.currentOTP = null;
          this.resetEmail = null;
        } else {
          this.showToast(result.message, 'error');
        }
      });
    }
  },
  
  // Report Lost Item Form
  setupReportLostForm() {
    const form = document.getElementById('reportLostForm');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (!Auth.requireAuth()) {
        this.showToast('Please login to report items', 'error');
        this.showView('login');
        return;
      }
      
      const title = document.getElementById('lostTitle').value;
      const category = document.getElementById('lostCategory').value;
      const description = document.getElementById('lostDescription').value;
      const location = document.getElementById('lostLocation').value;
      const date = document.getElementById('lostDate').value;
      const contactInfo = document.getElementById('lostContact').value;
      const imageFile = document.getElementById('lostImage').files[0];
      
      // Validate
      Validator.clearFormErrors('reportLostForm');
      const validation = Validator.validateForm('reportLostForm', {
        lostTitle: [{ type: 'required' }],
        lostCategory: [{ type: 'custom', validator: (val) => val ? { valid: true } : { valid: false, message: 'Please select a category' } }],
        lostDescription: [{ type: 'required' }],
        lostLocation: [{ type: 'required' }],
        lostDate: [{ type: 'required' }, { type: 'date' }],
        lostContact: [{ type: 'required' }]
      });
      
      if (!validation.valid) return;
      
      // Validate image if provided
      if (imageFile) {
        const imageValidation = Validator.validateImageFile(imageFile);
        if (!imageValidation.valid) {
          this.showToast(imageValidation.message, 'error');
          return;
        }
      }
      
      const user = Auth.getCurrentUser();
      
      // Create post
      const post = AppStorage.addPost({
        userId: user.id,
        type: 'lost',
        title,
        category,
        description,
        location,
        date,
        contactInfo,
        image: imageFile ? imageFile.name : null
      });
      
      this.showToast('Lost item reported successfully!', 'success');
      this.showView('dashboard');
      form.reset();
      document.getElementById('lostImagePreview').classList.add('hidden');
    });
  },
  
  // Report Found Item Form
  setupReportFoundForm() {
    const form = document.getElementById('reportFoundForm');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (!Auth.requireAuth()) {
        this.showToast('Please login to report items', 'error');
        this.showView('login');
        return;
      }
      
      const title = document.getElementById('foundTitle').value;
      const category = document.getElementById('foundCategory').value;
      const description = document.getElementById('foundDescription').value;
      const location = document.getElementById('foundLocation').value;
      const date = document.getElementById('foundDate').value;
      const contactInfo = document.getElementById('foundContact').value;
      const imageFile = document.getElementById('foundImage').files[0];
      
      // Validate
      Validator.clearFormErrors('reportFoundForm');
      const validation = Validator.validateForm('reportFoundForm', {
        foundTitle: [{ type: 'required' }],
        foundCategory: [{ type: 'custom', validator: (val) => val ? { valid: true } : { valid: false, message: 'Please select a category' } }],
        foundDescription: [{ type: 'required' }],
        foundLocation: [{ type: 'required' }],
        foundDate: [{ type: 'required' }, { type: 'date' }],
        foundContact: [{ type: 'required' }]
      });
      
      if (!validation.valid) return;
      
      // Validate image if provided
      if (imageFile) {
        const imageValidation = Validator.validateImageFile(imageFile);
        if (!imageValidation.valid) {
          this.showToast(imageValidation.message, 'error');
          return;
        }
      }
      
      const user = Auth.getCurrentUser();
      
      // Create post
      const post = AppStorage.addPost({
        userId: user.id,
        type: 'found',
        title,
        category,
        description,
        location,
        date,
        contactInfo,
        image: imageFile ? imageFile.name : null
      });
      
      // Run matching algorithm to find potential lost items
      const matches = this.findMatches(post);
      
      if (matches.length > 0) {
        // Create notifications for lost item owners
        matches.forEach(match => {
          const notification = AppStorage.addNotification({
            userId: match.lostItem.userId,
            type: 'match',
            title: `Your lost item '${match.lostItem.title}' may match with a found item!`,
            message: `${user.name} found an item that matches your lost ${match.lostItem.title} at ${location}`,
            lostItemId: match.lostItem.id,
            foundItemId: post.id,
            finderName: user.name,
            finderEmail: user.email,
            finderContact: contactInfo,
            matchPercentage: match.percentage,
            matchReason: match.reason,
            status: 'pending',
            read: false,
            finderMessage: `I found this item at ${location}. Please contact me if it's yours!`
          });
          
          // Create matched item record
          AppStorage.addMatchedItem({
            lostItemId: match.lostItem.id,
            lostItemTitle: match.lostItem.title,
            lostItemOwnerId: match.lostItem.userId,
            lostItemOwnerName: AppStorage.getUserById(match.lostItem.userId).name,
            foundItemId: post.id,
            foundItemTitle: title,
            foundItemOwnerId: user.id,
            foundItemOwnerName: user.name,
            matchPercentage: match.percentage,
            matchReason: match.reason,
            status: 'pending'
          });
        });
        
        const firstMatch = matches[0];
        const lostItemOwner = AppStorage.getUserById(firstMatch.lostItem.userId);
        this.showToast(`Your item may match with '${firstMatch.lostItem.title}' reported by ${lostItemOwner.name}. A notification has been sent to them.`, 'info');
      } else {
        this.showToast('Found item reported successfully!', 'success');
      }
      
      this.showView('dashboard');
      form.reset();
      document.getElementById('foundImagePreview').classList.add('hidden');
    });
  },
  
  // Profile Form
  setupProfileForm() {
    const form = document.getElementById('profileForm');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('profileName').value;
      const phone = document.getElementById('profilePhone').value;
      
      // Validate
      Validator.clearFormErrors('profileForm');
      const validation = Validator.validateForm('profileForm', {
        profileName: [{ type: 'required' }, { type: 'name' }],
        profilePhone: [{ type: 'required' }, { type: 'phone' }]
      });
      
      if (!validation.valid) return;
      
      const user = Auth.getCurrentUser();
      const result = Auth.updateProfile(user.id, { name, phone });
      
      if (result.success) {
        this.showToast('Profile updated successfully!', 'success');
        this.loadProfile();
      } else {
        this.showToast(result.message, 'error');
      }
    });
  },
  
  // Search and Filters
  setupSearchAndFilters() {
    const searchInput = document.getElementById('searchInput');
    const filterType = document.getElementById('filterType');
    const filterCategory = document.getElementById('filterCategory');
    const sortBy = document.getElementById('sortBy');
    
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.loadBrowseItems();
        }, 300);
      });
    }
    
    if (filterType) {
      filterType.addEventListener('change', () => this.loadBrowseItems());
    }
    
    if (filterCategory) {
      filterCategory.addEventListener('change', () => this.loadBrowseItems());
    }
    
    if (sortBy) {
      sortBy.addEventListener('change', () => this.loadBrowseItems());
    }
  },
  
  // Contact Form (Modal)
  setupContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (!Auth.requireAuth()) {
        this.showToast('Please login to send messages', 'error');
        this.closeModal();
        this.showView('login');
        return;
      }
      
      const subject = document.getElementById('contactSubject').value;
      const message = document.getElementById('contactMessage').value;
      
      // Validate
      Validator.clearFormErrors('contactForm');
      const validation = Validator.validateForm('contactForm', {
        contactSubject: [{ type: 'required' }],
        contactMessage: [{ type: 'required' }]
      });
      
      if (!validation.valid) return;
      
      const currentUser = Auth.getCurrentUser();
      const item = this.currentItem;
      
      if (!item) {
        this.showToast('Error: Item not found', 'error');
        return;
      }
      
      // Create message
      AppStorage.addMessage({
        fromUserId: currentUser.id,
        toUserId: item.userId,
        subject,
        message,
        postId: item.id
      });
      
      this.showToast('Message sent successfully!', 'success');
      this.closeModal();
      form.reset();
      this.updateUI();
      this.updateSidebarBadges();
    });
  },
  
  // Admin Forms
  setupAdminForms() {
    // Admin navigation
    document.querySelectorAll('[data-admin-view]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = e.currentTarget.getAttribute('data-admin-view');
        this.showAdminSection(view);
      });
    });
    
    // Add category form
    const categoryForm = document.getElementById('addCategoryForm');
    if (categoryForm) {
      categoryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('newCategoryName').value;
        
        if (!name.trim()) {
          this.showToast('Please enter a category name', 'error');
          return;
        }
        
        AppStorage.addCategory({ name, description: '' });
        this.showToast('Category added successfully!', 'success');
        this.loadAdminCategories();
        categoryForm.reset();
      });
    }
  },
  
  // Setup Back Button
  setupBackButton() {
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.goBack();
      });
    }
  },
  
  // Update Back Button Visibility
  updateBackButton() {
    const backBtn = document.getElementById('backBtn');
    if (!backBtn) return;
    
    const history = AppStorage.navigationHistory;
    const noBackViews = ['landing', 'login', 'register'];
    
    if (history.length > 1 && !noBackViews.includes(this.currentView)) {
      backBtn.classList.remove('hidden');
    } else {
      backBtn.classList.add('hidden');
    }
  },
  
  // Go Back
  goBack() {
    const lastView = AppStorage.popHistory();
    if (lastView) {
      // Remove the flag to prevent double adding to history
      const tempView = this.currentView;
      this.currentView = lastView;
      this.showView(lastView);
      this.currentView = lastView;
    } else {
      // Default back behavior
      if (Auth.isAuthenticated()) {
        this.showView(Auth.isAdmin() ? 'admin-dashboard' : 'dashboard');
      } else {
        this.showView('landing');
      }
    }
  },
  
  // Show Notification Banner
  showNotificationBanner() {
    if (!Auth.isAuthenticated() || Auth.isAdmin()) return;
    
    const user = Auth.getCurrentUser();
    const notifications = AppStorage.getNotificationsByUserId(user.id);
    const unreadNotifs = notifications.filter(n => !n.read);
    
    if (unreadNotifs.length > 0) {
      const firstNotif = unreadNotifs[0];
      const banner = document.getElementById('notificationBanner');
      const title = document.getElementById('notificationTitle');
      const message = document.getElementById('notificationMessage');
      
      if (banner && title && message) {
        title.textContent = firstNotif.title;
        message.textContent = firstNotif.message;
        banner.classList.remove('hidden');
      }
    }
  },
  
  // Dismiss Notification Banner
  dismissNotificationBanner() {
    const banner = document.getElementById('notificationBanner');
    if (banner) {
      banner.classList.add('hidden');
    }
  },
  
  // Load Notifications
  loadNotifications() {
    if (!Auth.requireAuth()) return;
    
    const user = Auth.getCurrentUser();
    const notifications = AppStorage.getNotificationsByUserId(user.id);
    const matchedItems = AppStorage.getMatchedItemsByUserId(user.id);
    
    // Render notifications
    const notifsList = document.getElementById('notificationsList');
    if (notifsList) {
      if (notifications.length === 0) {
        notifsList.innerHTML = '<p class="text-center">No notifications yet.</p>';
      } else {
        notifsList.innerHTML = notifications.map(notif => `
          <div class="notification-item ${notif.read ? '' : 'unread'} ${notif.type}" role="listitem">
            <div class="notification-header">
              <span class="notification-title">${this.escapeHtml(notif.title)}</span>
              <span class="notification-time">${this.formatDateTime(notif.timestamp)}</span>
            </div>
            <p class="notification-message">${this.escapeHtml(notif.message)}</p>
            <div class="notification-actions">
              ${!notif.read ? `<button class="btn btn--sm btn--primary" onclick="App.markNotificationRead('${notif.id}')">Mark as Read</button>` : ''}
              <button class="btn btn--sm btn--secondary" onclick="App.deleteNotification('${notif.id}')">Delete</button>
            </div>
          </div>
        `).join('');
      }
    }
    
    // Render matched items - separate pending and resolved
    const matchedList = document.getElementById('matchedItemsList');
    if (matchedList) {
      const pendingMatches = matchedItems.filter(m => m.status === 'pending');
      const resolvedMatches = matchedItems.filter(m => m.status === 'resolved');
      
      let html = '';
      
      if (pendingMatches.length === 0 && resolvedMatches.length === 0) {
        html = '<p class="text-center">No matched items yet.</p>';
      } else {
        // Pending matches
        if (pendingMatches.length > 0) {
          html += '<h4 style="margin-bottom: 1rem;">Active Matches</h4>';
          html += pendingMatches.map(match => `
            <div class="matched-item" role="listitem" id="match-${match.id}">
              <div class="matched-item-header">
                <h3>Potential Match Found!</h3>
                <span class="match-percentage">${match.matchPercentage}% Match</span>
              </div>
              <div class="matched-items-grid">
                <div class="matched-item-card">
                  <h4>Lost Item</h4>
                  <p><strong>${this.escapeHtml(match.lostItemTitle)}</strong></p>
                  <p>Owner: ${this.escapeHtml(match.lostItemOwnerName)}</p>
                </div>
                <div class="matched-item-card">
                  <h4>Found Item</h4>
                  <p><strong>${this.escapeHtml(match.foundItemTitle)}</strong></p>
                  <p>Found by: ${this.escapeHtml(match.foundItemOwnerName)}</p>
                </div>
              </div>
              <div class="match-reason">
                <strong>Match Reason:</strong> ${this.escapeHtml(match.matchReason)}
              </div>
              <div class="matched-item-actions" id="match-actions-${match.id}">
                <button class="btn btn--primary" onclick="App.contactMatchOwner('${match.id}')">Contact ${user.id === match.lostItemOwnerId ? this.escapeHtml(match.foundItemOwnerName) : this.escapeHtml(match.lostItemOwnerName)}</button>
                ${user.id === match.lostItemOwnerId ? `<button class="btn btn--success" id="resolve-btn-${match.id}" onclick="markAsResolved('${match.id}')">Mark as Resolved</button>` : ''}
              </div>
            </div>
          `).join('');
        } else {
          html += '<div style="background-color: var(--color-bg-2); padding: 1rem; border-radius: var(--radius-lg); margin-bottom: 1rem; text-align: center;"><p style="margin: 0;">No active matches. All matches have been resolved.</p></div>';
        }
        
        // Resolved matches
        if (resolvedMatches.length > 0) {
          html += '<h4 style="margin-top: 2rem; margin-bottom: 1rem;">Resolved Matches</h4>';
          html += resolvedMatches.map(match => `
            <div class="matched-item" style="opacity: 0.7;" role="listitem">
              <div class="matched-item-header">
                <h3>Match Resolved</h3>
                <span class="status status--success">Resolved</span>
              </div>
              <div class="matched-items-grid">
                <div class="matched-item-card">
                  <h4>Lost Item</h4>
                  <p><strong>${this.escapeHtml(match.lostItemTitle)}</strong></p>
                  <p>Owner: ${this.escapeHtml(match.lostItemOwnerName)}</p>
                </div>
                <div class="matched-item-card">
                  <h4>Found Item</h4>
                  <p><strong>${this.escapeHtml(match.foundItemTitle)}</strong></p>
                  <p>Found by: ${this.escapeHtml(match.foundItemOwnerName)}</p>
                </div>
              </div>
              <div class="match-reason">
                <strong>Match Reason:</strong> ${this.escapeHtml(match.matchReason)}
              </div>
              <div class="matched-item-actions">
                <button class="btn btn--secondary" disabled>Resolved</button>
              </div>
            </div>
          `).join('');
        }
      }
      
      matchedList.innerHTML = html;
    }
    
    // Mark all notifications as read after viewing
    setTimeout(() => {
      AppStorage.markAllNotificationsAsRead(user.id);
      this.updateUI();
      this.updateSidebarBadges();
      this.dismissNotificationBanner();
    }, 1000);
  },
  
  // Mark Notification as Read
  markNotificationRead(notifId) {
    AppStorage.markNotificationAsRead(notifId);
    this.loadNotifications();
    this.updateUI();
    this.updateSidebarBadges();
  },
  
  // Delete Notification
  deleteNotification(notifId) {
    if (confirm('Delete this notification?')) {
      AppStorage.deleteNotification(notifId);
      this.loadNotifications();
      this.updateUI();
    }
  },
  
  // Contact Match Owner
  contactMatchOwner(matchId) {
    const match = AppStorage.matchedItems.find(m => m.id === matchId);
    if (!match) return;
    
    const user = Auth.getCurrentUser();
    const otherUserId = user.id === match.lostItemOwnerId ? match.foundItemOwnerId : match.lostItemOwnerId;
    const otherUser = AppStorage.getUserById(otherUserId);
    
    if (otherUser) {
      document.getElementById('composeRecipient').value = otherUser.email;
      document.getElementById('composeSubject').value = `Regarding Matched Item: ${match.lostItemTitle}`;
      this.showView('compose');
    }
  },
  
  // Resolve Match
  resolveMatch(matchId) {
    console.log('resolveMatch called with matchId:', matchId);
    
    if (!confirm('Mark this match as resolved?')) {
      return;
    }
    
    console.log('User confirmed, processing...');
    
    // Find the match
    const match = AppStorage.matchedItems.find(m => m.id === matchId);
    console.log('Found match:', match);
    
    if (!match) {
      console.error('Match not found for ID:', matchId);
      this.showToast('Match not found', 'error');
      return;
    }
    
    // Update match status directly
    match.status = 'resolved';
    console.log('Updated match status to resolved');
    
    // Update item statuses
    const lostItem = AppStorage.posts.find(p => p.id === match.lostItemId);
    if (lostItem) {
      lostItem.status = 'resolved';
      console.log('Updated lost item status');
    }
    
    const foundItem = AppStorage.posts.find(p => p.id === match.foundItemId);
    if (foundItem) {
      foundItem.status = 'resolved';
      console.log('Updated found item status');
    }
    
    // Update notification status for this match
    AppStorage.notifications.forEach(notif => {
      if ((notif.lostItemId === match.lostItemId || notif.foundItemId === match.foundItemId) && notif.type === 'match') {
        notif.status = 'resolved';
        notif.read = true;
        console.log('Updated notification status');
      }
    });
    
    console.log('All updates complete, showing toast');
    this.showToast('Item marked as resolved!', 'success');
    
    // Reload the notifications view immediately
    console.log('Reloading notifications view');
    this.loadNotifications();
    this.updateUI();
    this.updateSidebarBadges();
  },
  
  // Find matching lost items for a found item
  findMatches(foundItem) {
    const lostItems = AppStorage.getPostsByType('lost');
    const matches = [];
    
    lostItems.forEach(lostItem => {
      let matchScore = 0;
      let matchReasons = [];
      
      // Category match (40% weight)
      if (lostItem.category === foundItem.category) {
        matchScore += 40;
        matchReasons.push(`Same category (${lostItem.category})`);
      }
      
      // Location match (35% weight)
      const lostLocation = lostItem.location.toLowerCase();
      const foundLocation = foundItem.location.toLowerCase();
      
      // Check if locations contain common words
      const lostWords = lostLocation.split(/\s+/);
      const foundWords = foundLocation.split(/\s+/);
      const commonWords = lostWords.filter(word => 
        word.length > 3 && foundWords.some(fw => fw.includes(word) || word.includes(fw))
      );
      
      if (commonWords.length > 0) {
        matchScore += 35;
        matchReasons.push(`Similar location (${lostLocation})`);
      }
      
      // Description keyword match (25% weight)
      const lostDesc = lostItem.description.toLowerCase();
      const foundDesc = foundItem.description.toLowerCase();
      
      const lostKeywords = lostDesc.split(/\s+/).filter(w => w.length > 3);
      const foundKeywords = foundDesc.split(/\s+/).filter(w => w.length > 3);
      const commonKeywords = lostKeywords.filter(word => 
        foundKeywords.some(fw => fw.includes(word) || word.includes(fw))
      );
      
      if (commonKeywords.length > 0) {
        const keywordScore = Math.min(25, commonKeywords.length * 8);
        matchScore += keywordScore;
        matchReasons.push('Similar description keywords');
      }
      
      // If match score is above threshold (75%)
      if (matchScore >= 75) {
        matches.push({
          lostItem: lostItem,
          percentage: Math.round(matchScore),
          reason: matchReasons.join(', ')
        });
      }
    });
    
    // Sort by match percentage (highest first)
    matches.sort((a, b) => b.percentage - a.percentage);
    
    return matches;
  },
  
  // Load Inbox
  loadInbox() {
    if (!Auth.requireAuth()) return;
    
    const user = Auth.getCurrentUser();
    const messages = AppStorage.getInboxMessages(user.id);
    
    const list = document.getElementById('inboxList');
    if (!list) return;
    
    if (messages.length === 0) {
      list.innerHTML = '<p class="text-center">No messages in inbox.</p>';
      return;
    }
    
    list.innerHTML = messages.map(msg => `
      <div class="message-list-item ${msg.read ? '' : 'unread'}" role="listitem">
        <div class="message-list-header">
          <span class="message-list-sender">From: ${this.escapeHtml(msg.fromUserName)}</span>
          <span class="message-list-time">${this.formatDateTime(msg.timestamp)}</span>
        </div>
        <div class="message-list-subject">${this.escapeHtml(msg.subject)}</div>
        <div class="message-list-preview">${this.escapeHtml(msg.message)}</div>
        <div class="message-list-actions">
          ${!msg.read ? 
            `<button class="btn btn--sm btn--primary" onclick="App.markMessageRead('${msg.id}')">Mark as Read</button>` : 
            `<button class="btn btn--sm btn--secondary" onclick="App.markMessageUnread('${msg.id}')">Mark as Unread</button>`
          }
          <button class="btn btn--sm btn--secondary" onclick="App.replyToMessage('${msg.id}')">Reply</button>
          <button class="btn btn--sm btn--secondary" onclick="App.deleteMessage('${msg.id}', 'inbox')">Delete</button>
        </div>
      </div>
    `).join('');
  },
  
  // Load Sent Messages
  loadSent() {
    if (!Auth.requireAuth()) return;
    
    const user = Auth.getCurrentUser();
    const messages = AppStorage.getSentMessages(user.id);
    
    const list = document.getElementById('sentList');
    if (!list) return;
    
    if (messages.length === 0) {
      list.innerHTML = '<p class="text-center">No sent messages.</p>';
      return;
    }
    
    list.innerHTML = messages.map(msg => `
      <div class="message-list-item" role="listitem">
        <div class="message-list-header">
          <span class="message-list-sender">To: ${this.escapeHtml(msg.toUserName)}</span>
          <span class="message-list-time">${this.formatDateTime(msg.timestamp)}</span>
        </div>
        <div class="message-list-subject">${this.escapeHtml(msg.subject)}</div>
        <div class="message-list-preview">${this.escapeHtml(msg.message)}</div>
        <div class="message-list-actions">
          <button class="btn btn--sm btn--secondary" onclick="App.deleteMessage('${msg.id}', 'sent')">Delete</button>
        </div>
      </div>
    `).join('');
  },
  
  // Show Message View (Inbox/Sent)
  showMessageView(view) {
    if (view === 'inbox') {
      this.showView('inbox');
    } else if (view === 'sent') {
      this.showView('sent');
    }
  },
  
  // Mark Message as Read
  markMessageRead(msgId) {
    AppStorage.markMessageAsRead(msgId);
    this.loadInbox();
    this.updateUI();
    this.updateSidebarBadges();
  },
  
  // Mark Message as Unread
  markMessageUnread(msgId) {
    AppStorage.markMessageAsUnread(msgId);
    this.loadInbox();
    this.updateUI();
    this.updateSidebarBadges();
  },
  
  // Toggle Message Read Status
  toggleMessageRead(msgId) {
    const newStatus = AppStorage.toggleMessageReadStatus(msgId);
    if (newStatus !== null) {
      this.loadInbox();
      this.updateUI();
      this.updateSidebarBadges();
      this.showToast(newStatus ? 'Marked as read' : 'Marked as unread', 'success');
    }
  },
  
  // Reply to Message
  replyToMessage(msgId) {
    const msg = AppStorage.getMessageById(msgId);
    if (!msg) return;
    
    const fromUser = AppStorage.getUserById(msg.fromUserId);
    if (fromUser) {
      document.getElementById('composeRecipient').value = fromUser.email;
      document.getElementById('composeSubject').value = 'Re: ' + msg.subject;
      this.showView('compose');
    }
  },
  
  // Delete Message
  deleteMessage(msgId, source) {
    if (confirm('Delete this message?')) {
      AppStorage.deleteMessage(msgId);
      this.showToast('Message deleted', 'success');
      if (source === 'inbox') {
        this.loadInbox();
      } else {
        this.loadSent();
      }
      this.updateUI();
      this.updateSidebarBadges();
    }
  },
  
  // Setup Report Forms
  setupReportForms() {
    // Report Item Form (Admin only)
    const reportItemForm = document.getElementById('reportItemForm');
    if (reportItemForm) {
      reportItemForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!Auth.requireAdmin()) {
          this.showToast('Access denied', 'error');
          return;
        }
        
        const reason = document.getElementById('reportItemReason').value;
        const notes = document.getElementById('reportItemNotes').value;
        
        // Validate
        Validator.clearFormErrors('reportItemForm');
        if (!reason) {
          Validator.showError('reportItemReason', 'Please select a reason');
          return;
        }
        
        const post = AppStorage.getPostById(this.currentReportPostId);
        if (!post) {
          this.showToast('Post not found', 'error');
          return;
        }
        
        // Create item report
        const admin = Auth.getCurrentUser();
        AppStorage.addItemReport({
          postId: this.currentReportPostId,
          postTitle: post.title,
          reportedBy: admin.id,
          reporterName: admin.name,
          reason: reason,
          notes: notes
        });
        
        // Mark post as reported
        AppStorage.updatePost(this.currentReportPostId, { status: 'reported' });
        
        this.showToast('Item reported successfully', 'success');
        this.closeReportItemModal();
        this.loadAdminPosts();
      });
    }
    
    // Report User Form (Both admin and regular users)
    const reportUserForm = document.getElementById('reportUserForm');
    if (reportUserForm) {
      reportUserForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!Auth.isAuthenticated()) {
          this.showToast('Please login to report users', 'error');
          return;
        }
        
        const currentUser = Auth.getCurrentUser();
        const reason = document.getElementById('reportUserReason').value;
        const notes = document.getElementById('reportUserNotes').value;
        
        // Validate
        Validator.clearFormErrors('reportUserForm');
        if (!reason) {
          Validator.showError('reportUserReason', 'Please select a reason');
          return;
        }
        
        const reportedUser = AppStorage.getUserById(this.currentReportUserId);
        if (!reportedUser) {
          this.showToast('User not found', 'error');
          return;
        }
        
        // Check if user is trying to report themselves (only for non-admin)
        if (!Auth.isAdmin() && currentUser.id === this.currentReportUserId) {
          this.showToast('You cannot report yourself', 'error');
          return;
        }
        
        // Check if already reported (only for non-admin)
        if (!Auth.isAdmin()) {
          const alreadyReported = AppStorage.hasUserReported(currentUser.id, this.currentReportUserId);
          
          if (alreadyReported) {
            this.showToast('You have already reported this user', 'info');
            this.closeReportUserModal();
            return;
          }
        }
        
        // Get post context if available
        const post = this.currentReportPostId ? AppStorage.getPostById(this.currentReportPostId) : null;
        
        // Create user report
        AppStorage.addUserReport({
          reportedUserId: this.currentReportUserId,
          reportedUserName: reportedUser.name,
          reportedUserEmail: reportedUser.email,
          contextPostId: this.currentReportPostId,
          contextPostTitle: post ? post.title : 'Direct Report',
          reportedByUserId: currentUser.id,
          reportedByUserName: currentUser.name,
          reason: reason,
          notes: notes,
          status: 'pending',
          reportType: Auth.isAdmin() ? 'admin' : 'user'
        });
        
        this.showToast('User reported successfully. Our team will review this.', 'success');
        this.closeReportUserModal();
        
        // Reload appropriate view
        if (Auth.isAdmin()) {
          this.loadAdminUsers();
          this.loadAdminReportedUsers();
        } else {
          // Reload current view
          if (this.currentView === 'browse') {
            this.loadBrowseItems();
          } else if (this.currentView === 'item-details') {
            this.showItemDetails(this.currentReportPostId);
          }
        }
      });
    }
  },
  
  // Setup My Posts Filters
  setupMyPostsFilters() {
    const filterSelect = document.getElementById('myPostsFilter');
    const sortSelect = document.getElementById('myPostsSort');
    
    if (filterSelect) {
      filterSelect.addEventListener('change', () => this.loadMyPosts());
    }
    
    if (sortSelect) {
      sortSelect.addEventListener('change', () => this.loadMyPosts());
    }
  },
  
  // Load My Posts
  loadMyPosts() {
    if (!Auth.requireAuth()) return;
    
    const user = Auth.getCurrentUser();
    const userPosts = AppStorage.getPostsByUserId(user.id);
    
    // Get filter and sort values
    const filterType = document.getElementById('myPostsFilter')?.value || 'all';
    const sortBy = document.getElementById('myPostsSort')?.value || 'newest';
    
    // Filter posts
    let filteredPosts = userPosts;
    if (filterType !== 'all') {
      filteredPosts = userPosts.filter(p => p.type === filterType);
    }
    
    // Sort posts
    if (sortBy === 'newest') {
      filteredPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'oldest') {
      filteredPosts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'status') {
      const statusOrder = { active: 0, matched: 1, resolved: 2, reported: 3 };
      filteredPosts.sort((a, b) => (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99));
    }
    
    const container = document.getElementById('myPostsList');
    const emptyState = document.getElementById('myPostsEmpty');
    
    if (!container || !emptyState) return;
    
    if (filteredPosts.length === 0) {
      container.innerHTML = '';
      emptyState.classList.remove('hidden');
    } else {
      emptyState.classList.add('hidden');
      container.innerHTML = filteredPosts.map(post => this.renderMyPostCard(post)).join('');
    }
  },
  
  // Render My Post Card
  renderMyPostCard(post) {
    const statusColors = {
      active: 'status--success',
      matched: 'status--warning',
      resolved: 'status--info',
      reported: 'status--error'
    };
    
    const statusColor = statusColors[post.status] || 'status--info';
    const typeColor = post.type === 'lost' ? 'status--error' : 'status--success';
    
    // Check if post is matched
    const matchedItems = AppStorage.getMatchedItemsByUserId(Auth.getCurrentUser().id);
    const isMatched = matchedItems.some(m => 
      (m.lostItemId === post.id || m.foundItemId === post.id) && m.status === 'pending'
    );
    
    let deleteWarning = '';
    if (isMatched) {
      deleteWarning = 'This post is matched. Deleting it will affect the match.';
    }
    
    return `
      <div class="my-post-card" role="listitem">
        <div class="my-post-card-header">
          <div class="my-post-card-title">
            <h3>${this.escapeHtml(post.title)}</h3>
            <div class="my-post-card-meta">
              <span class="status ${typeColor}">${post.type.toUpperCase()}</span>
              <span class="status status--info">${this.escapeHtml(post.category)}</span>
              <span class="status ${statusColor}">${post.status.toUpperCase()}</span>
            </div>
          </div>
        </div>
        
        <div class="my-post-card-content">
          <div class="my-post-card-info">
            <div class="my-post-card-info-item">
              <span class="my-post-card-info-label">Location</span>
              <span class="my-post-card-info-value">${this.escapeHtml(post.location)}</span>
            </div>
            <div class="my-post-card-info-item">
              <span class="my-post-card-info-label">Date ${post.type === 'lost' ? 'Lost' : 'Found'}</span>
              <span class="my-post-card-info-value">${this.formatDate(post.date)}</span>
            </div>
            <div class="my-post-card-info-item">
              <span class="my-post-card-info-label">Posted On</span>
              <span class="my-post-card-info-value">${this.formatDate(post.createdAt)}</span>
            </div>
            <div class="my-post-card-info-item">
              <span class="my-post-card-info-label">Contact</span>
              <span class="my-post-card-info-value">${this.escapeHtml(post.contactInfo)}</span>
            </div>
          </div>
          
          <div class="my-post-card-description">
            <strong>Description:</strong><br>
            ${this.escapeHtml(post.description)}
          </div>
        </div>
        
        <div class="my-post-card-actions">
          <button class="btn btn--primary btn--sm" onclick="App.viewPostDetails('${post.id}')" aria-label="View details for ${this.escapeHtml(post.title)}">
            View Details
          </button>
          <button class="btn btn--secondary btn--sm" onclick="App.openEditPostModal('${post.id}')" aria-label="Edit ${this.escapeHtml(post.title)}">
            Edit
          </button>
          <button class="btn btn--error btn--sm" onclick="App.deleteMyPost('${post.id}', '${isMatched}', '${deleteWarning}')" aria-label="Delete ${this.escapeHtml(post.title)}">
            Delete
          </button>
        </div>
      </div>
    `;
  },
  
  // View Post Details from My Posts
  viewPostDetails(postId) {
    this.showItemDetails(postId);
  },
  
  // Open Edit Post Modal
  openEditPostModal(postId) {
    const post = AppStorage.getPostById(postId);
    if (!post) {
      this.showToast('Post not found', 'error');
      return;
    }
    
    // Check if user owns this post
    const user = Auth.getCurrentUser();
    if (post.userId !== user.id) {
      this.showToast('You can only edit your own posts', 'error');
      return;
    }
    
    // Store current post ID
    this.currentEditPostId = postId;
    
    // Pre-fill form
    document.getElementById('editPostTitle').value = post.title;
    document.getElementById('editPostCategory').value = post.category;
    document.getElementById('editPostDescription').value = post.description;
    document.getElementById('editPostLocation').value = post.location;
    document.getElementById('editPostContact').value = post.contactInfo;
    
    // Show modal
    const modal = document.getElementById('editPostModal');
    if (modal) {
      modal.removeAttribute('hidden');
      modal.setAttribute('aria-hidden', 'false');
      document.getElementById('editPostTitle').focus();
    }
  },
  
  // Close Edit Post Modal
  closeEditPostModal() {
    const modal = document.getElementById('editPostModal');
    if (modal) {
      modal.setAttribute('hidden', 'true');
      modal.setAttribute('aria-hidden', 'true');
      document.getElementById('editPostForm').reset();
      Validator.clearFormErrors('editPostForm');
      this.currentEditPostId = null;
    }
  },
  
  // Setup Edit Post Form
  setupEditPostForm() {
    const form = document.getElementById('editPostForm');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (!Auth.requireAuth()) {
        this.showToast('Please login to edit posts', 'error');
        this.closeEditPostModal();
        this.showView('login');
        return;
      }
      
      const title = document.getElementById('editPostTitle').value;
      const category = document.getElementById('editPostCategory').value;
      const description = document.getElementById('editPostDescription').value;
      const location = document.getElementById('editPostLocation').value;
      const contactInfo = document.getElementById('editPostContact').value;
      
      // Validate
      Validator.clearFormErrors('editPostForm');
      const validation = Validator.validateForm('editPostForm', {
        editPostTitle: [{ type: 'required' }],
        editPostCategory: [{ type: 'custom', validator: (val) => val ? { valid: true } : { valid: false, message: 'Please select a category' } }],
        editPostDescription: [{ type: 'required' }],
        editPostLocation: [{ type: 'required' }],
        editPostContact: [{ type: 'required' }]
      });
      
      if (!validation.valid) return;
      
      // Get post and verify ownership
      const post = AppStorage.getPostById(this.currentEditPostId);
      if (!post) {
        this.showToast('Post not found', 'error');
        this.closeEditPostModal();
        return;
      }
      
      const user = Auth.getCurrentUser();
      if (post.userId !== user.id) {
        this.showToast('You can only edit your own posts', 'error');
        this.closeEditPostModal();
        return;
      }
      
      // Update post
      const updated = AppStorage.updatePost(this.currentEditPostId, {
        title,
        category,
        description,
        location,
        contactInfo
      });
      
      if (updated) {
        this.showToast('Post updated successfully!', 'success');
        this.closeEditPostModal();
        this.loadMyPosts();
      } else {
        this.showToast('Failed to update post', 'error');
      }
    });
  },
  
  // Delete My Post
  deleteMyPost(postId, isMatched, deleteWarning) {
    const post = AppStorage.getPostById(postId);
    if (!post) {
      this.showToast('Post not found', 'error');
      return;
    }
    
    // Check if user owns this post
    const user = Auth.getCurrentUser();
    if (post.userId !== user.id) {
      this.showToast('You can only delete your own posts', 'error');
      return;
    }
    
    let confirmMessage = `Are you sure you want to delete "${post.title}"?`;
    if (isMatched === 'true' && deleteWarning) {
      confirmMessage += '\n\n⚠️ ' + deleteWarning;
    }
    
    if (confirm(confirmMessage)) {
      const deleted = AppStorage.deletePost(postId);
      if (deleted) {
        this.showToast('Post deleted successfully!', 'success');
        this.loadMyPosts();
        this.updateUI();
      } else {
        this.showToast('Failed to delete post', 'error');
      }
    }
  },
  
  // Setup Compose Form
  setupComposeForm() {
    const form = document.getElementById('composeForm');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (!Auth.requireAuth()) {
        this.showToast('Please login to send messages', 'error');
        this.showView('login');
        return;
      }
      
      const recipientEmail = document.getElementById('composeRecipient').value;
      const subject = document.getElementById('composeSubject').value;
      const message = document.getElementById('composeMessage').value;
      
      // Validate
      Validator.clearFormErrors('composeForm');
      const validation = Validator.validateForm('composeForm', {
        composeRecipient: [{ type: 'required' }, { type: 'email' }],
        composeSubject: [{ type: 'required' }],
        composeMessage: [{ type: 'required' }]
      });
      
      if (!validation.valid) return;
      
      const currentUser = Auth.getCurrentUser();
      
      // CHANGE 2: For non-admin users, always send to admin with "Contact:" prefix
      let recipient;
      let messageSubject = subject;
      
      if (!Auth.isAdmin()) {
        // Force message to go to admin only
        recipient = AppStorage.getUsers().find(u => u.role === 'admin');
        if (!recipient) {
          this.showToast('Admin contact not available', 'error');
          return;
        }
        messageSubject = `Contact: ${subject}`;
      } else {
        // Admin can send to anyone
        recipient = AppStorage.getUserByEmail(recipientEmail);
        if (!recipient) {
          Validator.showError('composeRecipient', 'User not found with this email');
          return;
        }
      }
      
      AppStorage.addMessage({
        fromUserId: currentUser.id,
        fromUserName: currentUser.name,
        toUserId: recipient.id,
        toUserName: recipient.name,
        subject: messageSubject,
        message: message,
        postId: null
      });
      
      if (!Auth.isAdmin()) {
        this.showToast('Your message has been sent to the admin team!', 'success');
      } else {
        this.showToast('Message sent successfully!', 'success');
      }
      
      this.showView('inbox');
      form.reset();
      this.updateUI();
      this.updateSidebarBadges();
      
      // Reload admin dashboard if admin is viewing it
      if (Auth.isAdmin() && this.currentView === 'admin-dashboard') {
        this.loadAdminOverview();
      }
    });
  },
  
  // Load Dashboard
  loadDashboard() {
    if (!Auth.requireAuth()) return;
    
    const user = Auth.getCurrentUser();
    
    // Redirect admin to admin dashboard
    if (Auth.isAdmin()) {
      this.showView('admin-dashboard');
      return;
    }
    
    // Update user name
    const nameEl = document.getElementById('dashboardUserName');
    if (nameEl) nameEl.textContent = user.name;
    
    // Get user posts
    const userPosts = AppStorage.getPostsByUserId(user.id);
    const lostItems = userPosts.filter(p => p.type === 'lost');
    const foundItems = userPosts.filter(p => p.type === 'found');
    const messages = AppStorage.getMessagesByUserId(user.id);
    
    // Update stats
    document.getElementById('myLostCount').textContent = lostItems.length;
    document.getElementById('myFoundCount').textContent = foundItems.length;
    document.getElementById('totalMessages').textContent = messages.length;
    
    // Load recent posts
    const recentPosts = userPosts.slice(0, 5);
    this.renderPosts(recentPosts, 'recentPostsList', true);
  },
  
  // Load Browse Items
  loadBrowseItems() {
    const searchInput = document.getElementById('searchInput');
    const filterType = document.getElementById('filterType');
    const filterCategory = document.getElementById('filterCategory');
    const sortBy = document.getElementById('sortBy');
    
    const query = searchInput ? searchInput.value : '';
    const filters = {
      type: filterType ? filterType.value : 'all',
      category: filterCategory ? filterCategory.value : 'all',
      sort: sortBy ? sortBy.value : 'newest'
    };
    
    const posts = AppStorage.searchPosts(query, filters);
    
    const grid = document.getElementById('itemsGrid');
    const noResults = document.getElementById('noResults');
    
    if (posts.length === 0) {
      grid.innerHTML = '';
      noResults.classList.remove('hidden');
    } else {
      noResults.classList.add('hidden');
      this.renderPosts(posts, 'itemsGrid', false);
    }
  },
  
  // Render Posts
  renderPosts(posts, containerId, isSimple = false) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (posts.length === 0) {
      container.innerHTML = '<p class="text-center">No posts found.</p>';
      return;
    }
    
    container.innerHTML = posts.map(post => {
      const user = AppStorage.getUserById(post.userId);
      const userName = user ? user.name : 'Unknown User';
      
      if (isSimple) {
        return `
          <div class="card" style="margin-bottom: 1rem;" role="listitem">
            <div class="card__body">
              <h4>${this.escapeHtml(post.title)}</h4>
              <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                <span class="status ${post.type === 'lost' ? 'status--error' : 'status--success'}">${post.type.toUpperCase()}</span>
                <span class="status status--info">${this.escapeHtml(post.category)}</span>
              </div>
              <p style="color: var(--color-text-secondary); font-size: var(--font-size-sm);">${this.escapeHtml(post.location)} • ${this.formatDate(post.date)}</p>
            </div>
          </div>
        `;
      } else {
        const currentUser = Auth.getCurrentUser();
        const canReport = currentUser && !Auth.isAdmin() && currentUser.id !== post.userId;
        const alreadyReported = canReport ? AppStorage.hasUserReported(currentUser.id, post.userId) : false;
        
        return `
          <div class="item-card" role="listitem" tabindex="0" aria-label="View details for ${this.escapeHtml(post.title)}">
            <div class="item-card-image" role="img" aria-label="Item image placeholder">📷</div>
            <div class="item-card-content">
              <h3 class="item-card-title">${this.escapeHtml(post.title)}</h3>
              <div class="item-card-meta">
                <span class="status ${post.type === 'lost' ? 'status--error' : 'status--success'}">${post.type.toUpperCase()}</span>
                <span class="status status--info">${this.escapeHtml(post.category)}</span>
              </div>
              <p class="item-card-description">${this.escapeHtml(post.description)}</p>
              <p class="item-card-location">📍 ${this.escapeHtml(post.location)}</p>
              <div class="item-card-meta" style="margin-top: 8px; gap: 4px;">
                <button class="btn btn--sm btn--secondary" onclick="event.stopPropagation(); App.showItemDetails('${post.id}');">View Details</button>
                ${canReport ? `
                  <button class="btn btn--sm btn--error" onclick="event.stopPropagation(); App.openUserReportModal(AppStorage.getPostById('${post.id}'));" ${alreadyReported ? 'disabled' : ''}>
                    ${alreadyReported ? 'Reported' : 'Report User'}
                  </button>
                ` : ''}
              </div>
            </div>
          </div>
        `;
      }
    }).join('');
    
    // Add keyboard support for item cards
    if (!isSimple) {
      container.querySelectorAll('.item-card').forEach((card, index) => {
        card.addEventListener('keypress', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const postId = posts[index].id;
            this.showItemDetails(postId);
          }
        });
      });
    }
  },
  
  // Show Item Details
  showItemDetails(postId) {
    const post = AppStorage.getPostById(postId);
    if (!post) {
      this.showToast('Item not found', 'error');
      return;
    }
    
    this.currentItem = post;
    
    // Update UI
    document.getElementById('item-details-title').textContent = post.title;
    document.getElementById('itemDetailsType').textContent = post.type.toUpperCase();
    document.getElementById('itemDetailsType').className = `status ${post.type === 'lost' ? 'status--error' : 'status--success'}`;
    document.getElementById('itemDetailsCategory').textContent = post.category;
    document.getElementById('itemDetailsDescription').textContent = post.description;
    document.getElementById('itemDetailsLocation').textContent = post.location;
    document.getElementById('itemDetailsDate').textContent = this.formatDate(post.date);
    document.getElementById('itemDetailsContact').textContent = post.contactInfo;
    document.getElementById('itemDetailsImage').textContent = '📷';
    
    // Contact button
    const contactBtn = document.getElementById('contactOwnerBtn');
    const reportUserBtn = document.getElementById('reportUserBtn');
    const currentUser = Auth.getCurrentUser();
    
    if (contactBtn) {
      if (currentUser && currentUser.id === post.userId) {
        contactBtn.style.display = 'none';
      } else {
        contactBtn.style.display = 'inline-flex';
        contactBtn.onclick = () => this.openContactModal(post);
      }
    }
    
    // Report User button - only show for logged-in users viewing other users' posts
    if (reportUserBtn) {
      if (!currentUser || currentUser.id === post.userId || Auth.isAdmin()) {
        reportUserBtn.style.display = 'none';
      } else {
        // Check if user already reported this person
        const alreadyReported = AppStorage.hasUserReported(currentUser.id, post.userId);
        
        if (alreadyReported) {
          reportUserBtn.disabled = true;
          reportUserBtn.textContent = 'Already Reported';
          reportUserBtn.style.display = 'inline-flex';
        } else {
          reportUserBtn.disabled = false;
          reportUserBtn.textContent = 'Report User';
          reportUserBtn.style.display = 'inline-flex';
          reportUserBtn.onclick = () => this.openUserReportModal(post);
        }
      }
    }
    
    this.showView('item-details');
  },
  
  // Open Contact Modal
  openContactModal(item) {
    if (!Auth.requireAuth()) {
      this.showToast('Please login to send messages', 'error');
      this.showView('login');
      return;
    }
    
    this.currentItem = item;
    const modal = document.getElementById('contactModal');
    if (modal) {
      modal.removeAttribute('hidden');
      modal.setAttribute('aria-hidden', 'false');
      document.getElementById('contactSubject').value = `Regarding: ${item.title}`;
      document.getElementById('contactSubject').focus();
    }
  },
  
  // Close Modal
  closeModal() {
    const modal = document.getElementById('contactModal');
    if (modal) {
      modal.setAttribute('hidden', 'true');
      modal.setAttribute('aria-hidden', 'true');
      document.getElementById('contactForm').reset();
      Validator.clearFormErrors('contactForm');
    }
  },
  
  // Open Report Item Modal
  openReportItemModal(postId, postTitle) {
    this.currentReportPostId = postId;
    const modal = document.getElementById('reportItemModal');
    if (modal) {
      document.getElementById('reportItemTitle').textContent = postTitle;
      modal.removeAttribute('hidden');
      modal.setAttribute('aria-hidden', 'false');
      document.getElementById('reportItemReason').focus();
    }
  },
  
  // Close Report Item Modal
  closeReportItemModal() {
    const modal = document.getElementById('reportItemModal');
    if (modal) {
      modal.setAttribute('hidden', 'true');
      modal.setAttribute('aria-hidden', 'true');
      document.getElementById('reportItemForm').reset();
      Validator.clearFormErrors('reportItemForm');
      this.currentReportPostId = null;
    }
  },
  
  // Open Report User Modal
  openReportUserModal(postId, userId, userName, postTitle) {
    this.currentReportPostId = postId;
    this.currentReportUserId = userId;
    const modal = document.getElementById('reportUserModal');
    if (modal) {
      document.getElementById('reportUserName').textContent = userName;
      document.getElementById('reportUserPostTitle').textContent = postTitle;
      modal.removeAttribute('hidden');
      modal.setAttribute('aria-hidden', 'false');
      document.getElementById('reportUserReason').focus();
    }
  },
  
  // Close Report User Modal
  closeReportUserModal() {
    const modal = document.getElementById('reportUserModal');
    if (modal) {
      modal.setAttribute('hidden', 'true');
      modal.setAttribute('aria-hidden', 'true');
      document.getElementById('reportUserForm').reset();
      Validator.clearFormErrors('reportUserForm');
      this.currentReportPostId = null;
      this.currentReportUserId = null;
    }
  },
  
  // Open User Report Modal (for regular users)
  openUserReportModal(post) {
    if (!Auth.isAuthenticated() || Auth.isAdmin()) {
      this.showToast('Please login as a user to report', 'error');
      return;
    }
    
    const currentUser = Auth.getCurrentUser();
    
    // Check if user is trying to report themselves
    if (currentUser.id === post.userId) {
      this.showToast('You cannot report yourself', 'error');
      return;
    }
    
    // Check if already reported
    const alreadyReported = AppStorage.hasUserReported(currentUser.id, post.userId);
    
    if (alreadyReported) {
      this.showToast('You have already reported this user', 'info');
      return;
    }
    
    const reportedUser = AppStorage.getUserById(post.userId);
    if (!reportedUser) {
      this.showToast('User not found', 'error');
      return;
    }
    
    this.currentReportPostId = post.id;
    this.currentReportUserId = post.userId;
    
    const modal = document.getElementById('reportUserModal');
    if (modal) {
      document.getElementById('reportUserName').textContent = reportedUser.name;
      document.getElementById('reportUserPostTitle').textContent = post.title;
      modal.removeAttribute('hidden');
      modal.setAttribute('aria-hidden', 'false');
      document.getElementById('reportUserReason').focus();
    }
  },
  
  // Open Admin Report User Modal (for admins from User Management)
  openAdminReportUserModal(userId) {
    if (!Auth.requireAdmin()) {
      this.showToast('Access denied', 'error');
      return;
    }
    
    const reportedUser = AppStorage.getUserById(userId);
    if (!reportedUser) {
      this.showToast('User not found', 'error');
      return;
    }
    
    this.currentReportUserId = userId;
    this.currentReportPostId = null; // No specific post context
    
    const modal = document.getElementById('reportUserModal');
    if (modal) {
      document.getElementById('reportUserName').textContent = reportedUser.name;
      document.getElementById('reportUserPostTitle').textContent = 'Direct Admin Report';
      modal.removeAttribute('hidden');
      modal.setAttribute('aria-hidden', 'false');
      document.getElementById('reportUserReason').focus();
    }
  },
  
  // Open User Report Modal from Browse page
  openUserReportModalFromBrowse(postId, userId, userName, postTitle) {
    if (!Auth.isAuthenticated() || Auth.isAdmin()) {
      this.showToast('Please login as a user to report', 'error');
      return;
    }
    
    const currentUser = Auth.getCurrentUser();
    
    // Check if user is trying to report themselves
    if (currentUser.id === userId) {
      this.showToast('You cannot report yourself', 'error');
      return;
    }
    
    // Check if already reported
    const alreadyReported = AppStorage.userReports.some(r => 
      r.reportedByUserId === currentUser.id && r.reportedUserId === userId
    );
    
    if (alreadyReported) {
      this.showToast('You have already reported this user', 'info');
      return;
    }
    
    this.currentReportPostId = postId;
    this.currentReportUserId = userId;
    
    const modal = document.getElementById('reportUserModal');
    if (modal) {
      document.getElementById('reportUserName').textContent = userName;
      document.getElementById('reportUserPostTitle').textContent = postTitle;
      modal.removeAttribute('hidden');
      modal.setAttribute('aria-hidden', 'false');
      document.getElementById('reportUserReason').focus();
    }
  },
  
  // Load Messages
  loadMessages() {
    if (!Auth.requireAuth()) return;
    
    const user = Auth.getCurrentUser();
    const conversations = AppStorage.getConversations(user.id);
    
    const conversationsList = document.getElementById('conversationsList');
    if (!conversationsList) return;
    
    const userIds = Object.keys(conversations);
    
    if (userIds.length === 0) {
      conversationsList.innerHTML = '<p class="text-center">No messages yet</p>';
      return;
    }
    
    conversationsList.innerHTML = userIds.map(userId => {
      const otherUser = AppStorage.getUserById(userId);
      const messages = conversations[userId];
      const lastMessage = messages[messages.length - 1];
      const unreadCount = messages.filter(m => m.toUserId === user.id && !m.read).length;
      
      return `
        <div class="conversation-item" onclick="App.loadConversation('${userId}')" role="listitem" tabindex="0" aria-label="Conversation with ${this.escapeHtml(otherUser.name)}">
          <strong>${this.escapeHtml(otherUser.name)}</strong>
          ${unreadCount > 0 ? `<span class="badge">${unreadCount}</span>` : ''}
          <p style="margin: 0; font-size: var(--font-size-sm); color: var(--color-text-secondary);">${this.escapeHtml(lastMessage.subject)}</p>
        </div>
      `;
    }).join('');
  },
  
  // Load Conversation
  loadConversation(userId) {
    const user = Auth.getCurrentUser();
    const conversations = AppStorage.getConversations(user.id);
    const messages = conversations[userId];
    
    if (!messages) return;
    
    this.currentConversation = userId;
    
    // Mark messages as read
    messages.forEach(msg => {
      if (msg.toUserId === user.id && !msg.read) {
        AppStorage.markMessageAsRead(msg.id);
      }
    });
    
    const messageThread = document.getElementById('messageThread');
    const otherUser = AppStorage.getUserById(userId);
    
    if (messageThread) {
      messageThread.innerHTML = messages.map(msg => {
        const isFromMe = msg.fromUserId === user.id;
        return `
          <div class="message-item">
            <div class="message-header">
              <span class="message-sender">${isFromMe ? 'You' : this.escapeHtml(otherUser.name)}</span>
              <span class="message-time">${this.formatDateTime(msg.timestamp)}</span>
            </div>
            <div class="message-body">${this.escapeHtml(msg.message)}</div>
          </div>
        `;
      }).join('');
    }
    
    document.getElementById('messageReply').classList.remove('hidden');
    this.updateUI();
    
    // Setup reply form
    const replyForm = document.getElementById('replyMessageForm');
    if (replyForm) {
      replyForm.onsubmit = (e) => {
        e.preventDefault();
        const message = document.getElementById('replyMessage').value;
        
        if (!message.trim()) {
          Validator.showError('replyMessage', 'Message is required');
          return;
        }
        
        AppStorage.addMessage({
          fromUserId: user.id,
          toUserId: userId,
          subject: 'Re: ' + messages[0].subject,
          message: message,
          postId: messages[0].postId
        });
        
        this.showToast('Reply sent!', 'success');
        document.getElementById('replyMessage').value = '';
        this.loadConversation(userId);
        this.updateSidebarBadges();
      };
    }
  },
  
  // Load Profile
  loadProfile() {
    if (!Auth.requireAuth()) return;
    
    const user = Auth.getCurrentUser();
    
    document.getElementById('profileName').value = user.name;
    document.getElementById('profileEmail').value = user.email;
    document.getElementById('profilePhone').value = user.phone;
    
    // Load user posts
    const userPosts = AppStorage.getPostsByUserId(user.id);
    this.renderPosts(userPosts, 'userPostsList', true);
  },
  
  // Admin Dashboard
  loadAdminDashboard() {
    if (!Auth.requireAdmin()) return;
    
    this.loadAdminOverview();
  },
  

  
  // Load Admin Overview
  loadAdminOverview() {
    const stats = AppStorage.getStats();
    const userReports = AppStorage.getUserReports();
    const itemReports = AppStorage.getItemReports();
    const reportedItemsCount = AppStorage.getPosts().filter(p => p.status === 'reported').length;
    
    document.getElementById('adminTotalUsers').textContent = stats.totalUsers;
    document.getElementById('adminReportedUsers').textContent = userReports.filter(r => r.status === 'pending').length;
    document.getElementById('adminReportedItems').textContent = reportedItemsCount;
    document.getElementById('adminActivePosts').textContent = stats.activePosts;
    
    // CHANGE 2: Add contact messages widget
    const adminUser = Auth.getCurrentUser();
    if (adminUser) {
      const allMessages = AppStorage.getInboxMessages(adminUser.id);
      const contactMessages = allMessages.filter(m => m.subject.startsWith('Contact:'));
      const unreadContactMessages = contactMessages.filter(m => !m.read);
      
      const contactCountEl = document.getElementById('adminContactMessages');
      if (contactCountEl) {
        contactCountEl.textContent = unreadContactMessages.length;
      }
    }
  },
  
  // Load Admin Users
  loadAdminUsers() {
    if (!Auth.requireAdmin()) return;
    
    const users = AppStorage.getUsers().filter(u => u.role !== 'admin');
    const tbody = document.getElementById('adminUsersTable');
    
    if (!tbody) {
      console.error('adminUsersTable element not found');
      return;
    }
    
    if (users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No users found.</td></tr>';
      return;
    }
    
    tbody.innerHTML = users.map(user => `
      <tr role="row">
        <td role="cell">${this.escapeHtml(user.name)}</td>
        <td role="cell">${this.escapeHtml(user.email)}</td>
        <td role="cell">${this.escapeHtml(user.phone)}</td>
        <td role="cell"><span class="status status--info">${user.role}</span></td>
        <td role="cell"><span class="status ${user.status === 'active' ? 'status--success' : 'status--error'}">${user.status}</span></td>
        <td role="cell">
          <button class="btn btn--sm btn--secondary" onclick="App.toggleUserStatus('${user.id}')" aria-label="Toggle status for ${this.escapeHtml(user.name)}">
            ${user.status === 'active' ? 'Block' : 'Activate'}
          </button>
          <button class="btn btn--sm btn--secondary" onclick="App.openAdminReportUserModal('${user.id}')" aria-label="Report user ${this.escapeHtml(user.name)}" style="margin-left: 4px;">
            Report User
          </button>
        </td>
      </tr>
    `).join('');
  },
  
  // Load Admin Posts
  loadAdminPosts() {
    const posts = AppStorage.getPosts();
    const tbody = document.getElementById('adminPostsTable');
    
    if (!tbody) return;
    
    tbody.innerHTML = posts.map(post => {
      const user = AppStorage.getUserById(post.userId);
      const isReported = post.status === 'reported';
      return `
        <tr role="row">
          <td role="cell">${this.escapeHtml(post.title)}</td>
          <td role="cell"><span class="status ${post.type === 'lost' ? 'status--error' : 'status--success'}">${post.type}</span></td>
          <td role="cell">${this.escapeHtml(post.category)}</td>
          <td role="cell">${user ? this.escapeHtml(user.name) : 'Unknown'}</td>
          <td role="cell">${this.formatDate(post.createdAt)}</td>
          <td role="cell"><span class="status ${isReported ? 'status--warning' : post.status === 'active' ? 'status--success' : 'status--error'}">${post.status}</span></td>
          <td role="cell">
            <button class="btn btn--sm btn--secondary delete-post-btn" data-post-id="${post.id}" data-post-title="${this.escapeHtml(post.title)}" aria-label="Delete post ${this.escapeHtml(post.title)}">
              Delete
            </button>
            <button class="btn btn--sm btn--secondary report-item-btn" data-post-id="${post.id}" data-post-title="${this.escapeHtml(post.title)}" aria-label="Report item ${this.escapeHtml(post.title)}">
              Report Item
            </button>
            <button class="btn btn--sm btn--secondary report-user-btn" data-post-id="${post.id}" data-user-id="${post.userId}" data-user-name="${user ? this.escapeHtml(user.name) : 'Unknown'}" data-post-title="${this.escapeHtml(post.title)}" aria-label="Report user ${user ? this.escapeHtml(user.name) : 'Unknown'}">
              Report User
            </button>
          </td>
        </tr>
      `;
    }).join('');
    
    // Setup event delegation for delete buttons
    this.setupPostManagementButtons();
  },
  
  // Load Admin Reported Users
  loadAdminReportedUsers() {
    if (!Auth.requireAdmin()) return;
    
    const allReports = AppStorage.getUserReports();
    // Filter out dismissed reports - only show pending and reviewed
    const userReports = allReports.filter(r => r.status !== 'dismissed');
    const tbody = document.getElementById('adminReportedUsersTable');
    
    if (!tbody) return;
    
    if (userReports.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem;">No reported users. All reports have been resolved or dismissed.</td></tr>';
      return;
    }
    
    tbody.innerHTML = userReports.map(report => {
      const isPending = report.status === 'pending';
      
      const reportedUserId = report.reportedUserId || report.userId;
      const reportedUser = AppStorage.getUserById(reportedUserId);
      const reporterUserId = report.reportedByUserId || report.reportedBy;
      const reporter = AppStorage.getUserById(reporterUserId);
      const postTitle = report.contextPostTitle || report.postTitle || 'N/A';
      
      // Determine who reported
      let reportedBy = 'Unknown';
      if (report.reportType === 'admin') {
        reportedBy = 'Admin';
      } else if (reporter) {
        reportedBy = `User: ${this.escapeHtml(reporter.name)}`;
      } else if (report.reportedByUserName) {
        reportedBy = `User: ${this.escapeHtml(report.reportedByUserName)}`;
      }
      
      const isBlocked = reportedUser && reportedUser.status === 'blocked';
      const isReviewed = report.status === 'reviewed';
      
      return `
        <tr role="row">
          <td role="cell">
            ${reportedUser ? this.escapeHtml(reportedUser.name) : this.escapeHtml(report.reportedUserName || 'Unknown')}
            ${isBlocked ? '<br><span class="status status--error" style="margin-top: 4px;">BLOCKED</span>' : ''}
          </td>
          <td role="cell">${reportedUser ? this.escapeHtml(reportedUser.email) : this.escapeHtml(report.reportedUserEmail || 'Unknown')}</td>
          <td role="cell">${this.escapeHtml(postTitle)}</td>
          <td role="cell"><span class="status status--warning">${this.escapeHtml(report.reason)}</span></td>
          <td role="cell">${reportedBy}</td>
          <td role="cell">${this.formatDate(report.reportedAt)}</td>
          <td role="cell">
            <span class="status ${isPending ? 'status--warning' : 'status--info'}">${report.status || 'pending'}</span>
            ${isReviewed && report.actionTakenBy ? `<br><small style="color: var(--color-text-secondary);">By: ${this.escapeHtml(report.actionTakenBy)}</small>` : ''}
            ${isReviewed && report.actionTakenAt ? `<br><small style="color: var(--color-text-secondary);">${this.formatDate(report.actionTakenAt)}</small>` : ''}
          </td>
          <td role="cell">
            <button class="btn btn--sm btn--secondary" onclick="App.viewReportDetails('${report.id}')" aria-label="View report details">View Details</button>
            ${isPending ? `
              ${isBlocked ? `
                <button class="btn btn--sm btn--secondary" onclick="App.unblockUser('${reportedUserId}', '${report.id}')" aria-label="Unblock user">Unblock User</button>
              ` : `
                <button class="btn btn--sm btn--error" onclick="App.blockReportedUser('${reportedUserId}', '${report.id}')" aria-label="Block user">Block User</button>
              `}
              <button class="btn btn--sm btn--secondary" onclick="App.dismissUserReport('${report.id}')" aria-label="Dismiss report">Dismiss</button>
            ` : `
              ${isBlocked ? `
                <button class="btn btn--sm btn--secondary" onclick="App.unblockUser('${reportedUserId}', '${report.id}')" aria-label="Unblock user">Unblock User</button>
              ` : ''}
            `}
          </td>
        </tr>
      `;
    }).join('');
  },
  
  // View Report Details
  viewReportDetails(reportId) {
    const report = AppStorage.userReports.find(r => r.id === reportId);
    if (!report) {
      this.showToast('Report not found', 'error');
      return;
    }
    
    const reportedUserId = report.reportedUserId || report.userId;
    const reportedUser = AppStorage.getUserById(reportedUserId);
    const reporterUserId = report.reportedByUserId || report.reportedBy;
    const reporter = AppStorage.getUserById(reporterUserId);
    const postTitle = report.contextPostTitle || report.postTitle || 'N/A';
    
    // Determine who reported
    let reportedBy = 'Unknown';
    if (report.reportType === 'admin') {
      reportedBy = 'Admin';
    } else if (reporter) {
      reportedBy = reporter.name;
    } else if (report.reportedByUserName) {
      reportedBy = report.reportedByUserName;
    }
    
    let details = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    details += `REPORT DETAILS\n`;
    details += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    details += `👤 Reported User:\n`;
    details += `   Name: ${reportedUser ? reportedUser.name : report.reportedUserName || 'Unknown'}\n`;
    details += `   Email: ${reportedUser ? reportedUser.email : report.reportedUserEmail || 'Unknown'}\n\n`;
    details += `📝 Context Post: ${postTitle}\n\n`;
    details += `⚠️  Report Reason: ${report.reason}\n\n`;
    details += `👮 Reported By: ${reportedBy}\n\n`;
    details += `📅 Date Reported: ${this.formatDateTime(report.reportedAt)}\n\n`;
    details += `📊 Current Status: ${(report.status || 'pending').toUpperCase()}\n\n`;
    if (report.notes) {
      details += `📄 Additional Notes:\n${report.notes}\n\n`;
    }
    details += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    
    alert(details);
  },
  
  // Block Reported User
  blockReportedUser(userId, reportId) {
    if (!Auth.requireAdmin()) {
      this.showToast('Access denied', 'error');
      return;
    }
    
    const user = AppStorage.getUserById(userId);
    if (!user) {
      this.showToast('User not found', 'error');
      return;
    }
    
    const report = AppStorage.userReports.find(r => r.id === reportId);
    if (!report) {
      this.showToast('Report not found', 'error');
      return;
    }
    
    if (confirm(`Are you sure you want to block ${user.name}?\n\nThis will:\n• Disable their account\n• Prevent them from logging in\n• Send them a notification\n• Mark this report as reviewed`)) {
      // Update user status
      AppStorage.updateUser(userId, { status: 'blocked' });
      
      // Mark report as reviewed
      report.status = 'reviewed';
      report.actionTakenAt = new Date().toISOString();
      report.actionTakenBy = Auth.getCurrentUser().name;
      
      const admin = Auth.getCurrentUser();
      
      // Send notification to blocked user (generic message without revealing reason or reporter)
      AppStorage.addMessage({
        fromUserId: admin.id,
        fromUserName: 'Admin',
        toUserId: userId,
        toUserName: user.name,
        subject: 'Your Account Has Been Blocked',
        message: 'Your account has been blocked due to community guidelines violations.\n\nIf you believe this is a mistake, please contact support.',
        postId: null
      });
      
      // Send notification to reporter (person who reported)
      const reporterId = report.reportedByUserId;
      if (reporterId && reporterId !== admin.id) {
        const reporter = AppStorage.getUserById(reporterId);
        if (reporter) {
          AppStorage.addMessage({
            fromUserId: admin.id,
            fromUserName: 'Admin',
            toUserId: reporterId,
            toUserName: reporter.name,
            subject: 'Action Taken on Your Report',
            message: 'Thank you for your report. Our admin team has reviewed it and taken action against the reported account. The account has been blocked.',
            postId: null
          });
        }
      }
      
      this.showToast(`User ${user.name} has been blocked. Reporter has been notified.`, 'success');
      this.loadAdminReportedUsers();
      this.loadAdminUsers();
      this.loadAdminOverview();
    }
  },
  
  // Dismiss User Report
  dismissUserReport(reportId) {
    if (!Auth.requireAdmin()) {
      this.showToast('Access denied', 'error');
      return;
    }
    
    const report = AppStorage.userReports.find(r => r.id === reportId);
    if (!report) {
      this.showToast('Report not found', 'error');
      return;
    }
    
    const reportedUserId = report.reportedUserId || report.userId;
    const reportedUser = AppStorage.getUserById(reportedUserId);
    
    if (!reportedUser) {
      this.showToast('Reported user not found', 'error');
      return;
    }
    
    if (confirm(`Are you sure you want to dismiss this report against ${reportedUser.name}?\n\nThis will:\n• Remove the report from the list\n• Send a notification to the user\n• Mark the report as dismissed`)) {
      // Mark report as dismissed
      report.status = 'dismissed';
      report.actionTakenAt = new Date().toISOString();
      report.actionTakenBy = Auth.getCurrentUser().name;
      
      const admin = Auth.getCurrentUser();
      
      // DO NOT send notification to reported user - they should not know they were reported
      
      // Send notification to reporter (person who reported)
      const reporterId = report.reportedByUserId;
      if (reporterId && reporterId !== admin.id) {
        const reporter = AppStorage.getUserById(reporterId);
        if (reporter) {
          AppStorage.addMessage({
            fromUserId: admin.id,
            fromUserName: 'Admin',
            toUserId: reporterId,
            toUserName: reporter.name,
            subject: 'Report Update',
            message: 'Your report has been reviewed by our admin team. After investigation, we determined that no action was necessary at this time. Thank you for helping keep our community safe.',
            postId: null
          });
        }
      }
      
      this.showToast('Report dismissed. Reporter has been notified.', 'success');
      this.loadAdminReportedUsers();
      this.loadAdminOverview();
    }
  },
  
  // Load Admin Categories
  loadAdminCategories() {
    const categories = AppStorage.getCategories();
    const container = document.getElementById('categoriesList');
    
    if (!container) return;
    
    container.innerHTML = categories.map(cat => `
      <div class="category-item" role="listitem">
        <span><strong>${this.escapeHtml(cat.name)}</strong> - ${this.escapeHtml(cat.description)}</span>
        <button class="btn btn--sm btn--secondary" onclick="App.deleteCategory('${cat.id}')" aria-label="Delete category ${this.escapeHtml(cat.name)}">
          Delete
        </button>
      </div>
    `).join('');
  },
  
  // Toggle User Status
  toggleUserStatus(userId) {
    if (!Auth.requireAdmin()) {
      this.showToast('Access denied', 'error');
      return;
    }
    
    const user = AppStorage.getUserById(userId);
    if (!user) {
      this.showToast('User not found', 'error');
      return;
    }
    
    const newStatus = user.status === 'active' ? 'blocked' : 'active';
    const updated = AppStorage.updateUser(userId, { status: newStatus });
    
    if (updated) {
      this.showToast(`User ${newStatus === 'active' ? 'activated' : 'blocked'} successfully`, 'success');
      // Reload the user management table
      this.loadAdminUsers();
    } else {
      this.showToast('Failed to update user status', 'error');
    }
  },
  
  // Setup Post Management Buttons with Event Delegation
  setupPostManagementButtons() {
    const tbody = document.getElementById('adminPostsTable');
    if (!tbody) return;
    
    // Remove old event listeners by cloning and replacing
    const newTbody = tbody.cloneNode(true);
    tbody.parentNode.replaceChild(newTbody, tbody);
    
    // Delete button handler
    newTbody.addEventListener('click', (e) => {
      if (e.target.classList.contains('delete-post-btn')) {
        const postId = e.target.getAttribute('data-post-id');
        const postTitle = e.target.getAttribute('data-post-title');
        this.deletePost(postId, postTitle);
      }
    });
    
    // Report Item button handler
    newTbody.addEventListener('click', (e) => {
      if (e.target.classList.contains('report-item-btn')) {
        const postId = e.target.getAttribute('data-post-id');
        const postTitle = e.target.getAttribute('data-post-title');
        this.openReportItemModal(postId, postTitle);
      }
    });
    
    // Report User button handler
    newTbody.addEventListener('click', (e) => {
      if (e.target.classList.contains('report-user-btn')) {
        const postId = e.target.getAttribute('data-post-id');
        const userId = e.target.getAttribute('data-user-id');
        const userName = e.target.getAttribute('data-user-name');
        const postTitle = e.target.getAttribute('data-post-title');
        this.openReportUserModal(postId, userId, userName, postTitle);
      }
    });
  },
  
  // Delete Post (Admin)
  deletePost(postId, postTitle) {
    if (!Auth.requireAdmin()) {
      this.showToast('Access denied', 'error');
      return;
    }
    
    if (confirm(`Are you sure you want to delete the post "${postTitle}"?`)) {
      const deleted = AppStorage.deletePost(postId);
      if (deleted) {
        this.showToast('Post deleted successfully', 'success');
        this.loadAdminPosts();
      } else {
        this.showToast('Failed to delete post', 'error');
      }
    }
  },
  
  // Delete Category (Admin)
  deleteCategory(categoryId) {
    if (confirm('Are you sure you want to delete this category?')) {
      AppStorage.deleteCategory(categoryId);
      this.showToast('Category deleted successfully', 'success');
      this.loadAdminCategories();
    }
  },
  
  // Unblock User
  unblockUser(userId, reportId) {
    if (!Auth.requireAdmin()) {
      this.showToast('Access denied', 'error');
      return;
    }
    
    const user = AppStorage.getUserById(userId);
    if (!user) {
      this.showToast('User not found', 'error');
      return;
    }
    
    if (confirm(`Are you sure you want to unblock ${user.name}?\n\nThis will:\n• Reactivate their account\n• Allow them to log in again\n• Send them a notification`)) {
      // Update user status
      AppStorage.updateUser(userId, { status: 'active' });
      
      // Send notification to unblocked user
      const admin = Auth.getCurrentUser();
      AppStorage.addMessage({
        fromUserId: admin.id,
        fromUserName: 'Admin',
        toUserId: userId,
        toUserName: user.name,
        subject: 'Your Account Has Been Unblocked',
        message: `Good news! Your account has been unblocked and reactivated.\n\nYou can now log in and use all features normally. Please ensure you follow our community guidelines.`,
        postId: null
      });
      
      this.showToast(`User ${user.name} has been unblocked. Notification sent.`, 'success');
      this.loadAdminReportedUsers();
      this.loadAdminUsers();
      this.loadAdminOverview();
    }
  },
  
  // Logout
  logout() {
    Auth.logout();
    this.showToast('Logged out successfully', 'info');
    // Clear navigation history
    AppStorage.navigationHistory = [];
    this.closeSidebar();
    this.updateUI();
    this.dismissNotificationBanner();
    this.showView('landing');
  },
  
  // Image Preview
  setupImagePreview(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    
    if (!input || !preview) return;
    
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          preview.innerHTML = `<img src="${event.target.result}" alt="Image preview" />`;
          preview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
      } else {
        preview.innerHTML = '';
        preview.classList.add('hidden');
      }
    });
  },
  
  // Show Toast Notification
  showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = 'toast ' + type;
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  },
  
  // Utility: Escape HTML
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },
  
  // Utility: Format Date
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  },
  
  // Utility: Format Date Time
  formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
};

// Make resolveMatch globally accessible for onclick handlers
window.markAsResolved = function(matchId) {
  console.log('Global markAsResolved called with:', matchId);
  App.resolveMatch(matchId);
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}
// ============================================
// KEYBOARD SHORTCUTS HANDLER
// ============================================
document.addEventListener('keydown', function(e) {
  
  // Ctrl+S - Go to Search
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault();
    const searchInput = document.getElementById('searchInput') || document.querySelector('[data-view="browse"]');
    if (searchInput) {
      if (searchInput.tagName === 'INPUT') {
        searchInput.focus();
      } else {
        searchInput.click();
      }
    }
  }
  
  // Ctrl+L - Go to Login
  if (e.ctrlKey && e.key === 'l') {
    e.preventDefault();
    const loginBtn = document.querySelector('[data-view="login"]');
    if (loginBtn) loginBtn.click();
  }
  
  // Ctrl+R - Go to Register
  if (e.ctrlKey && e.key === 'r') {
    e.preventDefault();
    const registerBtn = document.querySelector('[data-view="register"]');
    if (registerBtn) registerBtn.click();
  }
  
  // Ctrl+H - Go to Home
  if (e.ctrlKey && e.key === 'h') {
    e.preventDefault();
    const homeBtn = document.querySelector('[data-view="landing"]') || document.querySelector('[data-view="dashboard"]');
    if (homeBtn) homeBtn.click();
  }
  
  // Ctrl+B - Browse Items
  if (e.ctrlKey && e.key === 'b') {
    e.preventDefault();
    const browseBtn = document.querySelector('[data-view="browse"]');
    if (browseBtn) browseBtn.click();
  }
  
  // Ctrl+P - Go to Profile
  if (e.ctrlKey && e.key === 'p') {
    e.preventDefault();
    const profileBtn = document.querySelector('[data-view="profile"]');
    if (profileBtn) profileBtn.click();
  }
  
  // Ctrl+M - View Messages
  if (e.ctrlKey && e.key === 'm') {
    e.preventDefault();
    const messagesBtn = document.querySelector('[data-view="messages"]');
    if (messagesBtn) messagesBtn.click();
  }
  
  // Ctrl+? - Show Help
  if (e.ctrlKey && e.shiftKey && e.key === '?') {
    e.preventDefault();
    const modal = document.getElementById('shortcutsModal');
    if (modal) modal.style.display = 'block';
  }
  
  // Escape - Close All Modals
  if (e.key === 'Escape') {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(function(modal) {
      if (modal.style.display === 'block') {
        modal.style.display = 'none';
      }
    });
  }
});

// Close shortcuts modal button
document.addEventListener('DOMContentLoaded', function() {
  const closeBtn = document.getElementById('closeShortcutsModal');
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      const modal = document.getElementById('shortcutsModal');
      if (modal) modal.style.display = 'none';
    });
  }
});
