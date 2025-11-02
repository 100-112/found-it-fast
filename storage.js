// In-memory storage system (replaces localStorage due to sandbox restrictions)
// Note: Data will not persist across page refreshes in sandboxed environment

const AppStorage = {
  // Data stores
  users: [],
  posts: [],
  messages: [],
  categories: [],
  notifications: [],
  matchedItems: [],
  itemReports: [],
  userReports: [],
  currentUser: null,
  navigationHistory: [],
  
  // Initialize with sample data
  init() {
    // Sample Users
    this.users = [
      {
        id: 'user_001',
        name: 'John Doe',
        email: 'john.doe@email.com',
        phone: '1234567890',
        password: 'SecurePass123!',
        role: 'user',
        status: 'active',
        createdAt: new Date('2024-10-01').toISOString()
      },
      {
        id: 'user_002',
        name: 'Jane Smith',
        email: 'jane.smith@email.com',
        phone: '9876543210',
        password: 'MyPass456@',
        role: 'user',
        status: 'active',
        createdAt: new Date('2024-10-02').toISOString()
      },
      {
        id: 'user_003',
        name: 'Mike Johnson',
        email: 'mike.johnson@email.com',
        phone: '5555555555',
        password: 'MikePass789!',
        role: 'user',
        status: 'active',
        createdAt: new Date('2024-10-03').toISOString()
      },
      {
        id: 'admin_001',
        name: 'Admin User',
        email: 'admin@founditfast.com',
        phone: '1111111111',
        password: 'AdminPass789#',
        role: 'admin',
        status: 'active',
        createdAt: new Date('2024-01-01').toISOString()
      }
    ];
    
    // Sample Categories
    this.categories = [
      { id: 'cat_001', name: 'Electronics', description: 'Mobile phones, laptops, tablets, etc.' },
      { id: 'cat_002', name: 'Documents', description: 'ID cards, passports, certificates, etc.' },
      { id: 'cat_003', name: 'Personal Items', description: 'Wallets, keys, jewelry, etc.' },
      { id: 'cat_004', name: 'Bags & Accessories', description: 'Handbags, backpacks, watches, etc.' },
      { id: 'cat_005', name: 'Clothing', description: 'Jackets, shoes, scarves, etc.' }
    ];
    
    // Sample Posts
    this.posts = [
      {
        id: 'lost_001',
        userId: 'user_001',
        type: 'lost',
        title: 'Lost iPhone 13 Pro',
        description: 'Black iPhone 13 Pro with blue case. Lost at Central Park near the fountain.',
        category: 'Electronics',
        location: 'Central Park, NYC',
        date: '2024-10-25',
        contactInfo: 'john.doe@email.com',
        image: null,
        status: 'active',
        createdAt: new Date('2024-10-26').toISOString()
      },
      {
        id: 'lost_002',
        userId: 'user_002',
        type: 'lost',
        title: 'Missing Brown Wallet',
        description: 'Brown leather wallet with multiple cards and some cash. Lost near subway station.',
        category: 'Personal Items',
        location: 'Times Square Station, NYC',
        date: '2024-10-24',
        contactInfo: 'jane.smith@email.com',
        image: null,
        status: 'active',
        createdAt: new Date('2024-10-24').toISOString()
      },
      {
        id: 'found_001',
        userId: 'user_002',
        type: 'found',
        title: 'Found Silver Watch',
        description: 'Silver wrist watch found on park bench. Has initials R.M. engraved on back.',
        category: 'Bags & Accessories',
        location: 'Madison Square Park',
        date: '2024-10-23',
        contactInfo: 'jane.smith@email.com',
        image: null,
        status: 'active',
        createdAt: new Date('2024-10-23').toISOString()
      },
      {
        id: 'found_002',
        userId: 'user_001',
        type: 'found',
        title: 'Found Student ID Card',
        description: 'NYU student ID card found in library. Belongs to Sarah Johnson.',
        category: 'Documents',
        location: 'NYU Library',
        date: '2024-10-22',
        contactInfo: 'john.doe@email.com',
        image: null,
        status: 'active',
        createdAt: new Date('2024-10-22').toISOString()
      }
    ];
    
    // Sample Messages with Inbox/Sent separation
    this.messages = [
      {
        id: 'msg_001',
        fromUserId: 'user_001',
        fromUserName: 'John Doe',
        toUserId: 'user_002',
        toUserName: 'Jane Smith',
        subject: 'About the silver watch',
        message: 'Hi, I saw your post about the silver watch. My friend lost one just like that. Can you share more details?',
        timestamp: new Date('2024-10-26T10:30:00Z').toISOString(),
        read: true,
        postId: 'found_001'
      },
      {
        id: 'msg_002',
        fromUserId: 'user_002',
        fromUserName: 'Jane Smith',
        toUserId: 'user_001',
        toUserName: 'John Doe',
        subject: 'Re: About the silver watch',
        message: 'Sure! The watch has a leather strap and the initials R.M. on the back. Where did your friend lose it?',
        timestamp: new Date('2024-10-26T11:15:00Z').toISOString(),
        read: false,
        postId: 'found_001'
      },
      {
        id: 'msg_003',
        fromUserId: 'user_002',
        fromUserName: 'Jane Smith',
        toUserId: 'user_001',
        toUserName: 'John Doe',
        subject: 'Silver Watch Found',
        message: 'Hi John, I found a silver watch in the park with initials R.M. Do you know anyone who lost it?',
        timestamp: new Date('2024-10-26T08:00:00Z').toISOString(),
        read: false,
        postId: null
      },
      {
        id: 'msg_004',
        fromUserId: 'user_003',
        fromUserName: 'Mike Johnson',
        toUserId: 'user_001',
        toUserName: 'John Doe',
        subject: 'Your Lost Item Alert',
        message: 'Hi John, I think I might have seen your iPhone at Central Park yesterday. Please contact me!',
        timestamp: new Date('2024-10-26T11:30:00Z').toISOString(),
        read: false,
        postId: null
      },
      {
        id: 'msg_005',
        fromUserId: 'user_002',
        fromUserName: 'Jane Smith',
        toUserId: 'user_001',
        toUserName: 'John Doe',
        subject: 'Let\'s meet up!',
        message: 'I think the iPhone I saw might be yours. Can we meet at the park cafe to check it out?',
        timestamp: new Date('2024-10-26T13:15:00Z').toISOString(),
        read: false,
        postId: 'lost_001'
      }
    ];
    
    // Sample Notifications
    this.notifications = [
      {
        id: 'notif_001',
        userId: 'user_001',
        type: 'match',
        title: 'Lost Item Match Found!',
        message: 'Your lost item "Black iPhone 13 Pro" may match with a found item reported by Jane Smith!',
        relatedItemId: 'found_001',
        read: false,
        timestamp: new Date('2024-10-26T09:30:00Z').toISOString()
      },
      {
        id: 'notif_002',
        userId: 'user_002',
        type: 'match',
        title: 'Your Found Item Matched!',
        message: 'The item you found may match with John Doe\'s lost item!',
        relatedItemId: 'lost_001',
        read: false,
        timestamp: new Date('2024-10-26T10:15:00Z').toISOString()
      },
      {
        id: 'notif_003',
        userId: 'user_001',
        type: 'message',
        title: 'New Message',
        message: 'Jane Smith sent you a message about your lost iPhone',
        read: false,
        timestamp: new Date('2024-10-26T11:00:00Z').toISOString()
      }
    ];
    
    // Matched Items
    this.matchedItems = [
      {
        id: 'match_001',
        lostItemId: 'lost_001',
        lostItemTitle: 'Black iPhone 13 Pro',
        lostItemOwnerId: 'user_001',
        lostItemOwnerName: 'John Doe',
        foundItemId: 'found_001',
        foundItemTitle: 'Found Silver Watch',
        foundItemOwnerId: 'user_002',
        foundItemOwnerName: 'Jane Smith',
        matchPercentage: 95,
        matchReason: 'Similar category (Electronics), location (Central Park), and description',
        status: 'pending',
        dateMatched: new Date('2024-10-26T09:30:00Z').toISOString()
      },
      {
        id: 'match_002',
        lostItemId: 'lost_002',
        lostItemTitle: 'Brown Leather Wallet',
        lostItemOwnerId: 'user_002',
        lostItemOwnerName: 'Jane Smith',
        foundItemId: 'found_002',
        foundItemTitle: 'Found Student ID Card',
        foundItemOwnerId: 'user_001',
        foundItemOwnerName: 'John Doe',
        matchPercentage: 85,
        matchReason: 'Similar category (Personal Items), location (Times Square), and description',
        status: 'pending',
        dateMatched: new Date('2024-10-26T10:45:00Z').toISOString()
      }
    ];
  },
  
  // User Management
  getUsers() {
    return this.users;
  },
  
  getUserById(id) {
    return this.users.find(u => u.id === id);
  },
  
  getUserByEmail(email) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },
  
  addUser(userData) {
    const user = {
      id: 'user_' + Date.now(),
      ...userData,
      role: userData.role || 'user',
      status: 'active',
      createdAt: new Date().toISOString()
    };
    this.users.push(user);
    return user;
  },
  
  updateUser(id, updates) {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...updates };
      return this.users[index];
    }
    return null;
  },
  
  deleteUser(id) {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users.splice(index, 1);
      return true;
    }
    return false;
  },
  
  // Post Management
  getPosts() {
    return this.posts;
  },
  
  getPostById(id) {
    return this.posts.find(p => p.id === id);
  },
  
  getPostsByUserId(userId) {
    return this.posts.filter(p => p.userId === userId);
  },
  
  getPostsByType(type) {
    return this.posts.filter(p => p.type === type && p.status === 'active');
  },
  
  addPost(postData) {
    const post = {
      id: postData.type + '_' + Date.now(),
      ...postData,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    this.posts.push(post);
    return post;
  },
  
  updatePost(id, updates) {
    const index = this.posts.findIndex(p => p.id === id);
    if (index !== -1) {
      this.posts[index] = { ...this.posts[index], ...updates };
      return this.posts[index];
    }
    return null;
  },
  
  deletePost(id) {
    const index = this.posts.findIndex(p => p.id === id);
    if (index !== -1) {
      this.posts.splice(index, 1);
      return true;
    }
    return false;
  },
  
  searchPosts(query, filters = {}) {
    let results = this.posts.filter(p => p.status === 'active');
    
    // Text search
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(p => 
        p.title.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.location.toLowerCase().includes(lowerQuery)
      );
    }
    
    // Filter by type
    if (filters.type && filters.type !== 'all') {
      results = results.filter(p => p.type === filters.type);
    }
    
    // Filter by category
    if (filters.category && filters.category !== 'all') {
      results = results.filter(p => p.category === filters.category);
    }
    
    // Sort
    if (filters.sort === 'oldest') {
      results.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else {
      results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    return results;
  },
  
  // Message Management
  getMessages() {
    return this.messages;
  },
  
  getMessageById(id) {
    return this.messages.find(m => m.id === id);
  },
  
  getMessagesByUserId(userId) {
    return this.messages.filter(m => 
      m.fromUserId === userId || m.toUserId === userId
    );
  },
  
  getConversations(userId) {
    const userMessages = this.getMessagesByUserId(userId);
    const conversations = {};
    
    userMessages.forEach(msg => {
      const otherUserId = msg.fromUserId === userId ? msg.toUserId : msg.fromUserId;
      if (!conversations[otherUserId]) {
        conversations[otherUserId] = [];
      }
      conversations[otherUserId].push(msg);
    });
    
    return conversations;
  },
  
  addMessage(messageData) {
    // All messages start as unread (read: false) so users can mark them as read
    const message = {
      id: 'msg_' + Date.now(),
      ...messageData,
      timestamp: new Date().toISOString(),
      read: false  // All messages start as unread, including admin messages
    };
    this.messages.push(message);
    return message;
  },
  
  markMessageAsRead(id) {
    const message = this.getMessageById(id);
    if (message) {
      message.read = true;
      return true;
    }
    return false;
  },
  
  markMessageAsUnread(id) {
    const message = this.getMessageById(id);
    if (message) {
      message.read = false;
      return true;
    }
    return false;
  },
  
  toggleMessageReadStatus(id) {
    const message = this.getMessageById(id);
    if (message) {
      message.read = !message.read;
      return message.read;
    }
    return null;
  },
  
  getUnreadMessageCount(userId) {
    return this.messages.filter(m => m.toUserId === userId && !m.read).length;
  },
  
  getSentMessages(userId) {
    return this.messages.filter(m => m.fromUserId === userId).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },
  
  getInboxMessages(userId) {
    return this.messages.filter(m => m.toUserId === userId).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },
  
  deleteMessage(id) {
    const index = this.messages.findIndex(m => m.id === id);
    if (index !== -1) {
      this.messages.splice(index, 1);
      return true;
    }
    return false;
  },
  
  // Notification Management
  getNotifications() {
    return this.notifications;
  },
  
  getNotificationsByUserId(userId) {
    return this.notifications.filter(n => n.userId === userId).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },
  
  getUnreadNotificationCount(userId) {
    return this.notifications.filter(n => n.userId === userId && !n.read).length;
  },
  
  markNotificationAsRead(id) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      return true;
    }
    return false;
  },
  
  markAllNotificationsAsRead(userId) {
    this.notifications.forEach(n => {
      if (n.userId === userId) {
        n.read = true;
      }
    });
  },
  
  addNotification(notificationData) {
    const notification = {
      id: 'notif_' + Date.now(),
      ...notificationData,
      timestamp: new Date().toISOString(),
      read: false,
      status: notificationData.status || 'pending'
    };
    this.notifications.push(notification);
    return notification;
  },
  
  deleteNotification(id) {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notifications.splice(index, 1);
      return true;
    }
    return false;
  },
  
  // Matched Items Management
  getMatchedItems() {
    return this.matchedItems;
  },
  
  getMatchedItemsByUserId(userId) {
    return this.matchedItems.filter(m => 
      m.lostItemOwnerId === userId || m.foundItemOwnerId === userId
    );
  },
  
  markMatchAsResolved(matchId) {
    const match = this.matchedItems.find(m => m.id === matchId);
    if (match) {
      match.status = 'resolved';
      return true;
    }
    return false;
  },
  
  addMatchedItem(matchData) {
    const match = {
      id: 'match_' + Date.now(),
      ...matchData,
      dateMatched: new Date().toISOString(),
      status: matchData.status || 'pending'
    };
    this.matchedItems.push(match);
    return match;
  },
  
  // Navigation History
  addToHistory(view) {
    this.navigationHistory.push(view);
    if (this.navigationHistory.length > 20) {
      this.navigationHistory.shift();
    }
  },
  
  getLastView() {
    if (this.navigationHistory.length > 1) {
      return this.navigationHistory[this.navigationHistory.length - 2];
    }
    return null;
  },
  
  popHistory() {
    if (this.navigationHistory.length > 0) {
      this.navigationHistory.pop();
    }
    return this.getLastView();
  },
  
  // Category Management
  getCategories() {
    return this.categories;
  },
  
  getCategoryById(id) {
    return this.categories.find(c => c.id === id);
  },
  
  addCategory(categoryData) {
    const category = {
      id: 'cat_' + Date.now(),
      ...categoryData
    };
    this.categories.push(category);
    return category;
  },
  
  deleteCategory(id) {
    const index = this.categories.findIndex(c => c.id === id);
    if (index !== -1) {
      this.categories.splice(index, 1);
      return true;
    }
    return false;
  },
  
  // Current User
  setCurrentUser(user) {
    this.currentUser = user;
  },
  
  getCurrentUser() {
    return this.currentUser;
  },
  
  clearCurrentUser() {
    this.currentUser = null;
  },
  
  isAuthenticated() {
    return this.currentUser !== null;
  },
  
  isAdmin() {
    return this.currentUser && this.currentUser.role === 'admin';
  },
  
  // Statistics
  getStats() {
    return {
      totalUsers: this.users.filter(u => u.role === 'user').length,
      totalPosts: this.posts.length,
      activePosts: this.posts.filter(p => p.status === 'active').length,
      totalMessages: this.messages.length,
      lostItems: this.posts.filter(p => p.type === 'lost' && p.status === 'active').length,
      foundItems: this.posts.filter(p => p.type === 'found' && p.status === 'active').length
    };
  },
  
  // Item Report Management
  addItemReport(reportData) {
    const report = {
      id: 'item_report_' + Date.now(),
      ...reportData,
      reportedAt: new Date().toISOString()
    };
    this.itemReports.push(report);
    return report;
  },
  
  getItemReports() {
    return this.itemReports;
  },
  
  // User Report Management
  addUserReport(reportData) {
    const report = {
      id: 'user_report_' + Date.now(),
      reportedUserId: reportData.reportedUserId || reportData.userId,
      reportedUserName: reportData.reportedUserName || reportData.userName,
      reportedUserEmail: reportData.reportedUserEmail || reportData.userEmail,
      contextPostId: reportData.contextPostId || reportData.postId,
      contextPostTitle: reportData.contextPostTitle || reportData.postTitle,
      reportedByUserId: reportData.reportedByUserId || reportData.reportedBy,
      reportedByUserName: reportData.reportedByUserName || reportData.reporterName,
      reason: reportData.reason,
      notes: reportData.notes || '',
      reportedAt: new Date().toISOString(),
      status: reportData.status || 'pending',
      reportType: reportData.reportType || 'admin'
    };
    this.userReports.push(report);
    return report;
  },
  
  getUserReports() {
    return this.userReports;
  },
  
  // Check if user has already reported another user
  hasUserReported(reporterId, reportedUserId) {
    return this.userReports.some(r => 
      r.reportedByUserId === reporterId && r.reportedUserId === reportedUserId
    );
  }
};

// Initialize storage on load
AppStorage.init();