import { 
  User, InsertUser, 
  Voter, InsertVoter, 
  QueueItem, InsertQueueItem, 
  Station, InsertStation, 
  Issue, InsertIssue, 
  SystemStatus, InsertSystemStatus, 
  Alert, InsertAlert, 
  Message, InsertMessage, 
  Stat, InsertStat,
  Biometric, InsertBiometric,
  AccessibilityPreference, InsertAccessibilityPreference,
  MobileNotification, InsertMobileNotification,
  Anomaly, InsertAnomaly,
  PredictiveAnalytic, InsertPredictiveAnalytic,
  BlockchainTransaction, InsertBlockchainTransaction
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Voter methods
  getVoter(id: number): Promise<Voter | undefined>;
  getVoterByVoterId(voterId: string): Promise<Voter | undefined>;
  createVoter(voter: InsertVoter): Promise<Voter>;
  getAllVoters(): Promise<Voter[]>;
  checkInVoter(id: number, userId: number): Promise<Voter>;
  
  // Queue methods
  getQueueItem(id: number): Promise<QueueItem | undefined>;
  createQueueItem(queueItem: InsertQueueItem): Promise<QueueItem>;
  getAllQueueItems(): Promise<QueueItem[]>;
  updateQueueItemStatus(id: number, status: string, userId?: number): Promise<QueueItem>;
  getQueueStats(): Promise<{ waiting: number, inProgress: number, completed: number }>;
  
  // Station methods
  getStation(id: number): Promise<Station | undefined>;
  createStation(station: InsertStation): Promise<Station>;
  getAllStations(): Promise<Station[]>;
  updateStationStatus(id: number, status: string, operatorId?: number): Promise<Station>;
  incrementStationVotersProcessed(id: number): Promise<Station>;
  
  // Issue methods
  getIssue(id: number): Promise<Issue | undefined>;
  createIssue(issue: InsertIssue): Promise<Issue>;
  getAllIssues(): Promise<Issue[]>;
  resolveIssue(id: number, userId: number): Promise<Issue>;
  
  // System Status methods
  getSystemStatus(id: number): Promise<SystemStatus | undefined>;
  getSystemStatusByComponent(component: string): Promise<SystemStatus | undefined>;
  createSystemStatus(systemStatus: InsertSystemStatus): Promise<SystemStatus>;
  getAllSystemStatuses(): Promise<SystemStatus[]>;
  updateSystemStatus(id: number, status: string, notes?: string): Promise<SystemStatus>;
  
  // Alert methods
  getAlert(id: number): Promise<Alert | undefined>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  getAllAlerts(): Promise<Alert[]>;
  
  // Message methods
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  getAllMessages(): Promise<Message[]>;
  
  // Stats methods
  getStat(id: number): Promise<Stat | undefined>;
  createStat(stat: InsertStat): Promise<Stat>;
  getTodayStats(): Promise<Stat[]>;
  
  // Biometric methods
  getBiometric(id: number): Promise<Biometric | undefined>;
  getBiometricByVoterId(voterId: number): Promise<Biometric | undefined>;
  createBiometric(biometric: InsertBiometric): Promise<Biometric>;
  verifyBiometric(id: number, userId: number): Promise<Biometric>;
  
  // Accessibility methods
  getAccessibilityPreference(id: number): Promise<AccessibilityPreference | undefined>;
  getAccessibilityPreferenceByVoterId(voterId: number): Promise<AccessibilityPreference | undefined>;
  createAccessibilityPreference(preference: InsertAccessibilityPreference): Promise<AccessibilityPreference>;
  updateAccessibilityPreference(id: number, preference: Partial<InsertAccessibilityPreference>): Promise<AccessibilityPreference>;
  
  // Mobile Notification methods
  getMobileNotification(id: number): Promise<MobileNotification | undefined>;
  getMobileNotificationByVoterId(voterId: number): Promise<MobileNotification | undefined>;
  createMobileNotification(notification: InsertMobileNotification): Promise<MobileNotification>;
  verifyMobileNotification(id: number, verificationCode: string): Promise<MobileNotification>;
  sendNotification(id: number, message: string): Promise<boolean>;
  
  // Anomaly Detection methods
  getAnomaly(id: number): Promise<Anomaly | undefined>;
  createAnomaly(anomaly: InsertAnomaly): Promise<Anomaly>;
  getAllAnomalies(): Promise<Anomaly[]>;
  resolveAnomaly(id: number, userId: number, resolution: string): Promise<Anomaly>;
  
  // Predictive Analytics methods
  getPredictiveAnalytic(id: number): Promise<PredictiveAnalytic | undefined>;
  createPredictiveAnalytic(analytic: InsertPredictiveAnalytic): Promise<PredictiveAnalytic>;
  getAllPredictiveAnalytics(): Promise<PredictiveAnalytic[]>;
  updatePredictiveAnalyticWithActual(id: number, actualVoterVolume: number, actualWaitTime: number): Promise<PredictiveAnalytic>;
  getPredictionForTimeSlot(hourOfDay: number, dayOfWeek: number): Promise<PredictiveAnalytic | undefined>;
  
  // Blockchain Transaction methods
  getBlockchainTransaction(id: number): Promise<BlockchainTransaction | undefined>;
  getBlockchainTransactionByHash(transactionHash: string): Promise<BlockchainTransaction | undefined>;
  createBlockchainTransaction(transaction: InsertBlockchainTransaction): Promise<BlockchainTransaction>;
  getAllBlockchainTransactions(): Promise<BlockchainTransaction[]>;
  verifyBlockchainTransaction(id: number): Promise<BlockchainTransaction>;
  getVoterTransactions(voterId: number): Promise<BlockchainTransaction[]>;
  
  // System methods
  initializeSystem(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private voters: Map<number, Voter>;
  private queueItems: Map<number, QueueItem>;
  private stations: Map<number, Station>;
  private issues: Map<number, Issue>;
  private systemStatuses: Map<number, SystemStatus>;
  private alerts: Map<number, Alert>;
  private messages: Map<number, Message>;
  private stats: Map<number, Stat>;
  
  // Maps for new features
  private biometrics: Map<number, Biometric>;
  private accessibilityPreferences: Map<number, AccessibilityPreference>;
  private mobileNotifications: Map<number, MobileNotification>;
  private anomalies: Map<number, Anomaly>;
  private predictiveAnalytics: Map<number, PredictiveAnalytic>;
  private blockchainTransactions: Map<number, BlockchainTransaction>;
  
  private currentUserId: number;
  private currentVoterId: number;
  private currentQueueId: number;
  private currentStationId: number;
  private currentIssueId: number;
  private currentSystemStatusId: number;
  private currentAlertId: number;
  private currentMessageId: number;
  private currentStatId: number;
  
  // ID counters for new features
  private currentBiometricId: number;
  private currentAccessibilityPreferenceId: number;
  private currentMobileNotificationId: number;
  private currentAnomalyId: number;
  private currentPredictiveAnalyticId: number;
  private currentBlockchainTransactionId: number;

  constructor() {
    this.users = new Map();
    this.voters = new Map();
    this.queueItems = new Map();
    this.stations = new Map();
    this.issues = new Map();
    this.systemStatuses = new Map();
    this.alerts = new Map();
    this.messages = new Map();
    this.stats = new Map();
    
    // Initialize maps for new features
    this.biometrics = new Map();
    this.accessibilityPreferences = new Map();
    this.mobileNotifications = new Map();
    this.anomalies = new Map();
    this.predictiveAnalytics = new Map();
    this.blockchainTransactions = new Map();
    
    this.currentUserId = 1;
    this.currentVoterId = 1;
    this.currentQueueId = 1;
    this.currentStationId = 1;
    this.currentIssueId = 1;
    this.currentSystemStatusId = 1;
    this.currentAlertId = 1;
    this.currentMessageId = 1;
    this.currentStatId = 1;
    
    // Initialize ID counters for new features
    this.currentBiometricId = 1;
    this.currentAccessibilityPreferenceId = 1;
    this.currentMobileNotificationId = 1;
    this.currentAnomalyId = 1;
    this.currentPredictiveAnalyticId = 1;
    this.currentBlockchainTransactionId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Voter methods
  async getVoter(id: number): Promise<Voter | undefined> {
    return this.voters.get(id);
  }

  async getVoterByVoterId(voterId: string): Promise<Voter | undefined> {
    return Array.from(this.voters.values()).find(
      (voter) => voter.voterId === voterId,
    );
  }

  async createVoter(insertVoter: InsertVoter): Promise<Voter> {
    const id = this.currentVoterId++;
    const voter: Voter = { 
      ...insertVoter, 
      id, 
      checkedIn: false, 
      checkedInAt: null, 
      checkedInBy: null 
    };
    this.voters.set(id, voter);
    return voter;
  }

  async getAllVoters(): Promise<Voter[]> {
    return Array.from(this.voters.values());
  }

  async checkInVoter(id: number, userId: number): Promise<Voter> {
    const voter = await this.getVoter(id);
    if (!voter) {
      throw new Error(`Voter with id ${id} not found`);
    }
    
    const updatedVoter: Voter = {
      ...voter,
      checkedIn: true,
      checkedInAt: new Date(),
      checkedInBy: userId
    };
    
    this.voters.set(id, updatedVoter);
    return updatedVoter;
  }

  // Queue methods
  async getQueueItem(id: number): Promise<QueueItem | undefined> {
    return this.queueItems.get(id);
  }

  async createQueueItem(insertQueueItem: InsertQueueItem): Promise<QueueItem> {
    const id = this.currentQueueId++;
    const queueItem: QueueItem = {
      ...insertQueueItem,
      id,
      enteredAt: new Date(),
      processedAt: null,
      processedBy: null
    };
    this.queueItems.set(id, queueItem);
    return queueItem;
  }

  async getAllQueueItems(): Promise<QueueItem[]> {
    return Array.from(this.queueItems.values());
  }

  async updateQueueItemStatus(id: number, status: string, userId?: number): Promise<QueueItem> {
    const queueItem = await this.getQueueItem(id);
    if (!queueItem) {
      throw new Error(`Queue item with id ${id} not found`);
    }
    
    const updatedQueueItem: QueueItem = {
      ...queueItem,
      status,
      ...(status === 'completed' || status === 'issue' ? {
        processedAt: new Date(),
        processedBy: userId || null
      } : {})
    };
    
    this.queueItems.set(id, updatedQueueItem);
    return updatedQueueItem;
  }

  async getQueueStats(): Promise<{ waiting: number, inProgress: number, completed: number }> {
    const queueItems = await this.getAllQueueItems();
    const waiting = queueItems.filter(item => item.status === 'waiting').length;
    const inProgress = queueItems.filter(item => item.status === 'in_progress').length;
    const completed = queueItems.filter(item => item.status === 'completed').length;
    
    return { waiting, inProgress, completed };
  }

  // Station methods
  async getStation(id: number): Promise<Station | undefined> {
    return this.stations.get(id);
  }

  async createStation(insertStation: InsertStation): Promise<Station> {
    const id = this.currentStationId++;
    const station: Station = {
      ...insertStation,
      id,
      votersProcessed: 0
    };
    this.stations.set(id, station);
    return station;
  }

  async getAllStations(): Promise<Station[]> {
    return Array.from(this.stations.values());
  }

  async updateStationStatus(id: number, status: string, operatorId?: number): Promise<Station> {
    const station = await this.getStation(id);
    if (!station) {
      throw new Error(`Station with id ${id} not found`);
    }
    
    const updatedStation: Station = {
      ...station,
      status,
      ...(operatorId ? { operatorId } : {})
    };
    
    this.stations.set(id, updatedStation);
    return updatedStation;
  }

  async incrementStationVotersProcessed(id: number): Promise<Station> {
    const station = await this.getStation(id);
    if (!station) {
      throw new Error(`Station with id ${id} not found`);
    }
    
    const updatedStation: Station = {
      ...station,
      votersProcessed: station.votersProcessed + 1
    };
    
    this.stations.set(id, updatedStation);
    return updatedStation;
  }

  // Issue methods
  async getIssue(id: number): Promise<Issue | undefined> {
    return this.issues.get(id);
  }

  async createIssue(insertIssue: InsertIssue): Promise<Issue> {
    const id = this.currentIssueId++;
    const issue: Issue = {
      ...insertIssue,
      id,
      status: 'open',
      reportedAt: new Date(),
      resolvedAt: null,
      resolvedBy: null,
      resolutionTime: null
    };
    this.issues.set(id, issue);
    return issue;
  }

  async getAllIssues(): Promise<Issue[]> {
    return Array.from(this.issues.values());
  }

  async resolveIssue(id: number, userId: number): Promise<Issue> {
    const issue = await this.getIssue(id);
    if (!issue) {
      throw new Error(`Issue with id ${id} not found`);
    }
    
    const resolvedAt = new Date();
    const resolutionTime = Math.floor((resolvedAt.getTime() - issue.reportedAt.getTime()) / 60000); // in minutes
    
    const updatedIssue: Issue = {
      ...issue,
      status: 'resolved',
      resolvedAt,
      resolvedBy: userId,
      resolutionTime
    };
    
    this.issues.set(id, updatedIssue);
    return updatedIssue;
  }

  // System Status methods
  async getSystemStatus(id: number): Promise<SystemStatus | undefined> {
    return this.systemStatuses.get(id);
  }

  async getSystemStatusByComponent(component: string): Promise<SystemStatus | undefined> {
    return Array.from(this.systemStatuses.values()).find(
      (status) => status.component === component,
    );
  }

  async createSystemStatus(insertSystemStatus: InsertSystemStatus): Promise<SystemStatus> {
    const id = this.currentSystemStatusId++;
    const systemStatus: SystemStatus = {
      ...insertSystemStatus,
      id,
      lastChecked: new Date()
    };
    this.systemStatuses.set(id, systemStatus);
    return systemStatus;
  }

  async getAllSystemStatuses(): Promise<SystemStatus[]> {
    return Array.from(this.systemStatuses.values());
  }

  async updateSystemStatus(id: number, status: string, notes?: string): Promise<SystemStatus> {
    const systemStatus = await this.getSystemStatus(id);
    if (!systemStatus) {
      throw new Error(`System status with id ${id} not found`);
    }
    
    const updatedSystemStatus: SystemStatus = {
      ...systemStatus,
      status,
      lastChecked: new Date(),
      ...(notes ? { notes } : {})
    };
    
    this.systemStatuses.set(id, updatedSystemStatus);
    return updatedSystemStatus;
  }

  // Alert methods
  async getAlert(id: number): Promise<Alert | undefined> {
    return this.alerts.get(id);
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = this.currentAlertId++;
    const alert: Alert = {
      ...insertAlert,
      id,
      timestamp: new Date()
    };
    this.alerts.set(id, alert);
    return alert;
  }

  async getAllAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values());
  }

  // Message methods
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = {
      ...insertMessage,
      id,
      timestamp: new Date()
    };
    this.messages.set(id, message);
    return message;
  }

  async getAllMessages(): Promise<Message[]> {
    return Array.from(this.messages.values());
  }

  // Stats methods
  async getStat(id: number): Promise<Stat | undefined> {
    return this.stats.get(id);
  }

  async createStat(insertStat: InsertStat): Promise<Stat> {
    const id = this.currentStatId++;
    const stat: Stat = {
      ...insertStat,
      id,
      date: new Date()
    };
    this.stats.set(id, stat);
    return stat;
  }

  async getTodayStats(): Promise<Stat[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return Array.from(this.stats.values()).filter(
      (stat) => stat.date >= today
    );
  }
  
  // Biometric methods
  async getBiometric(id: number): Promise<Biometric | undefined> {
    return this.biometrics.get(id);
  }

  async getBiometricByVoterId(voterId: number): Promise<Biometric | undefined> {
    return Array.from(this.biometrics.values()).find(
      (biometric) => biometric.voterId === voterId
    );
  }

  async createBiometric(insertBiometric: InsertBiometric): Promise<Biometric> {
    const id = this.currentBiometricId++;
    const biometric: Biometric = {
      ...insertBiometric,
      id,
      verified: false,
      verifiedAt: null,
      verifiedBy: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.biometrics.set(id, biometric);
    return biometric;
  }

  async verifyBiometric(id: number, userId: number): Promise<Biometric> {
    const biometric = await this.getBiometric(id);
    if (!biometric) {
      throw new Error(`Biometric with id ${id} not found`);
    }
    
    const updatedBiometric: Biometric = {
      ...biometric,
      verified: true,
      verifiedAt: new Date(),
      verifiedBy: userId,
      updatedAt: new Date()
    };
    
    this.biometrics.set(id, updatedBiometric);
    return updatedBiometric;
  }
  
  // Accessibility methods
  async getAccessibilityPreference(id: number): Promise<AccessibilityPreference | undefined> {
    return this.accessibilityPreferences.get(id);
  }

  async getAccessibilityPreferenceByVoterId(voterId: number): Promise<AccessibilityPreference | undefined> {
    return Array.from(this.accessibilityPreferences.values()).find(
      (preference) => preference.voterId === voterId
    );
  }

  async createAccessibilityPreference(preference: InsertAccessibilityPreference): Promise<AccessibilityPreference> {
    const id = this.currentAccessibilityPreferenceId++;
    const accessibilityPreference: AccessibilityPreference = {
      ...preference,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.accessibilityPreferences.set(id, accessibilityPreference);
    return accessibilityPreference;
  }

  async updateAccessibilityPreference(id: number, preference: Partial<InsertAccessibilityPreference>): Promise<AccessibilityPreference> {
    const existingPreference = await this.getAccessibilityPreference(id);
    if (!existingPreference) {
      throw new Error(`Accessibility preference with id ${id} not found`);
    }
    
    const updatedPreference: AccessibilityPreference = {
      ...existingPreference,
      ...preference,
      updatedAt: new Date()
    };
    
    this.accessibilityPreferences.set(id, updatedPreference);
    return updatedPreference;
  }
  
  // Mobile Notification methods
  async getMobileNotification(id: number): Promise<MobileNotification | undefined> {
    return this.mobileNotifications.get(id);
  }

  async getMobileNotificationByVoterId(voterId: number): Promise<MobileNotification | undefined> {
    return Array.from(this.mobileNotifications.values()).find(
      (notification) => notification.voterId === voterId
    );
  }

  async createMobileNotification(notification: InsertMobileNotification): Promise<MobileNotification> {
    const id = this.currentMobileNotificationId++;
    // Generate a random 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    const mobileNotification: MobileNotification = {
      ...notification,
      id,
      verificationCode,
      verified: false,
      lastNotified: null,
      createdAt: new Date()
    };
    this.mobileNotifications.set(id, mobileNotification);
    return mobileNotification;
  }

  async verifyMobileNotification(id: number, verificationCode: string): Promise<MobileNotification> {
    const notification = await this.getMobileNotification(id);
    if (!notification) {
      throw new Error(`Mobile notification with id ${id} not found`);
    }
    
    if (notification.verificationCode !== verificationCode) {
      throw new Error('Invalid verification code');
    }
    
    const updatedNotification: MobileNotification = {
      ...notification,
      verified: true
    };
    
    this.mobileNotifications.set(id, updatedNotification);
    return updatedNotification;
  }

  async sendNotification(id: number, message: string): Promise<boolean> {
    const notification = await this.getMobileNotification(id);
    if (!notification) {
      throw new Error(`Mobile notification with id ${id} not found`);
    }
    
    if (!notification.verified) {
      throw new Error('Mobile number is not verified for notifications');
    }
    
    // In a real implementation, this would make an API call to Twilio, SendGrid, etc.
    // This is just a mock implementation
    const updatedNotification: MobileNotification = {
      ...notification,
      lastNotified: new Date()
    };
    
    this.mobileNotifications.set(id, updatedNotification);
    return true;
  }
  
  // Anomaly Detection methods
  async getAnomaly(id: number): Promise<Anomaly | undefined> {
    return this.anomalies.get(id);
  }

  async createAnomaly(anomaly: InsertAnomaly): Promise<Anomaly> {
    const id = this.currentAnomalyId++;
    const newAnomaly: Anomaly = {
      ...anomaly,
      id,
      status: 'detected',
      detectedAt: new Date(),
      resolvedAt: null,
      resolvedBy: null,
      actions: []
    };
    this.anomalies.set(id, newAnomaly);
    return newAnomaly;
  }

  async getAllAnomalies(): Promise<Anomaly[]> {
    return Array.from(this.anomalies.values());
  }

  async resolveAnomaly(id: number, userId: number, resolution: string): Promise<Anomaly> {
    const anomaly = await this.getAnomaly(id);
    if (!anomaly) {
      throw new Error(`Anomaly with id ${id} not found`);
    }
    
    const updatedAnomaly: Anomaly = {
      ...anomaly,
      status: 'resolved',
      resolvedAt: new Date(),
      resolvedBy: userId,
      actions: [...(anomaly.actions || []), resolution]
    };
    
    this.anomalies.set(id, updatedAnomaly);
    return updatedAnomaly;
  }
  
  // Predictive Analytics methods
  async getPredictiveAnalytic(id: number): Promise<PredictiveAnalytic | undefined> {
    return this.predictiveAnalytics.get(id);
  }

  async createPredictiveAnalytic(analytic: InsertPredictiveAnalytic): Promise<PredictiveAnalytic> {
    const id = this.currentPredictiveAnalyticId++;
    const predictiveAnalytic: PredictiveAnalytic = {
      ...analytic,
      id,
      date: new Date(),
      actualVoterVolume: null,
      actualWaitTime: null,
      accuracyPercentage: null,
      createdAt: new Date()
    };
    this.predictiveAnalytics.set(id, predictiveAnalytic);
    return predictiveAnalytic;
  }

  async getAllPredictiveAnalytics(): Promise<PredictiveAnalytic[]> {
    return Array.from(this.predictiveAnalytics.values());
  }

  async updatePredictiveAnalyticWithActual(id: number, actualVoterVolume: number, actualWaitTime: number): Promise<PredictiveAnalytic> {
    const analytic = await this.getPredictiveAnalytic(id);
    if (!analytic) {
      throw new Error(`Predictive analytic with id ${id} not found`);
    }
    
    // Calculate accuracy as percentage difference between predicted and actual
    const volumeAccuracy = analytic.predictedVoterVolume ? 
      Math.round((1 - Math.abs(analytic.predictedVoterVolume - actualVoterVolume) / analytic.predictedVoterVolume) * 100) : 0;
    
    const waitTimeAccuracy = analytic.predictedWaitTime ? 
      Math.round((1 - Math.abs(analytic.predictedWaitTime - actualWaitTime) / analytic.predictedWaitTime) * 100) : 0;
    
    // Average of volume and wait time accuracy
    const overallAccuracy = Math.round((volumeAccuracy + waitTimeAccuracy) / 2);
    
    const updatedAnalytic: PredictiveAnalytic = {
      ...analytic,
      actualVoterVolume,
      actualWaitTime,
      accuracyPercentage: overallAccuracy
    };
    
    this.predictiveAnalytics.set(id, updatedAnalytic);
    return updatedAnalytic;
  }

  async getPredictionForTimeSlot(hourOfDay: number, dayOfWeek: number): Promise<PredictiveAnalytic | undefined> {
    return Array.from(this.predictiveAnalytics.values()).find(
      (analytic) => analytic.hourOfDay === hourOfDay && analytic.dayOfWeek === dayOfWeek
    );
  }
  
  // Blockchain Transaction methods
  async getBlockchainTransaction(id: number): Promise<BlockchainTransaction | undefined> {
    return this.blockchainTransactions.get(id);
  }

  async getBlockchainTransactionByHash(transactionHash: string): Promise<BlockchainTransaction | undefined> {
    return Array.from(this.blockchainTransactions.values()).find(
      (transaction) => transaction.transactionHash === transactionHash
    );
  }

  async createBlockchainTransaction(transaction: InsertBlockchainTransaction): Promise<BlockchainTransaction> {
    const id = this.currentBlockchainTransactionId++;
    const blockchainTransaction: BlockchainTransaction = {
      ...transaction,
      id,
      timestamp: new Date(),
      verified: false
    };
    this.blockchainTransactions.set(id, blockchainTransaction);
    return blockchainTransaction;
  }

  async getAllBlockchainTransactions(): Promise<BlockchainTransaction[]> {
    return Array.from(this.blockchainTransactions.values());
  }

  async verifyBlockchainTransaction(id: number): Promise<BlockchainTransaction> {
    const transaction = await this.getBlockchainTransaction(id);
    if (!transaction) {
      throw new Error(`Blockchain transaction with id ${id} not found`);
    }
    
    const updatedTransaction: BlockchainTransaction = {
      ...transaction,
      verified: true
    };
    
    this.blockchainTransactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  async getVoterTransactions(voterId: number): Promise<BlockchainTransaction[]> {
    return Array.from(this.blockchainTransactions.values()).filter(
      (transaction) => transaction.voterId === voterId
    );
  }

  // System initialization
  async initializeSystem(): Promise<void> {
    // Create default admin user
    if ((await this.getUserByUsername('admin')) === undefined) {
      await this.createUser({
        username: 'admin',
        password: 'admin123', // In a real app, this would be hashed
        fullName: 'Administrator',
        station: null,
        role: 'admin'
      });
    }

    // Create default poll worker
    if ((await this.getUserByUsername('pollworker')) === undefined) {
      await this.createUser({
        username: 'pollworker',
        password: 'poll123', // In a real app, this would be hashed
        fullName: 'Alex Thomas',
        station: 1,
        role: 'poll_worker'
      });
    }

    // Create stations
    if ((await this.getAllStations()).length === 0) {
      for (let i = 1; i <= 5; i++) {
        const status = i <= 4 ? 'active' : 'inactive';
        const operatorId = i <= 4 ? 2 : null; // Assign poll worker to first 4 stations
        await this.createStation({
          number: i,
          status,
          operatorId
        });
      }
    }

    // Create system status components
    const components = ['voter_database', 'id_scanner', 'internet', 'central_election_system', 'biometric_scanner', 'blockchain_verification'];
    for (const component of components) {
      if ((await this.getSystemStatusByComponent(component)) === undefined) {
        let status = 'operational';
        let notes = 'Normal operations';
        
        if (component === 'internet') {
          status = 'degraded';
          notes = 'Slow connection speeds';
        } else if (component === 'biometric_scanner') {
          status = 'operational';
          notes = 'Fingerprint and facial recognition active';
        } else if (component === 'blockchain_verification') {
          status = 'operational';
          notes = 'Blockchain validation subsystem online';
        }
        
        await this.createSystemStatus({
          component,
          status,
          notes
        });
      }
    }

    // Create sample alerts
    if ((await this.getAllAlerts()).length === 0) {
      await this.createAlert({
        type: 'warning',
        title: 'Internet Connection Slow',
        message: 'Backup connection active. Some operations may be delayed.'
      });

      await this.createAlert({
        type: 'info',
        title: 'System Update Available',
        message: 'Update will be automatically applied after closing hours.'
      });
      
      await this.createAlert({
        type: 'info',
        title: 'Biometric System Calibrated',
        message: 'Facial recognition system has been calibrated for optimal performance.'
      });
      
      await this.createAlert({
        type: 'warning',
        title: 'AI Anomaly Detection Alert',
        message: 'Unusual pattern detected in voter check-in rate. Monitoring situation.'
      });
    }

    // Create sample messages
    if ((await this.getAllMessages()).length === 0) {
      await this.createMessage({
        sender: 'County Election Office',
        message: 'Please remind voters to check ballot completion before submission.'
      });

      await this.createMessage({
        sender: 'District Coordinator',
        message: 'Expected increase in turnout between 4-6 PM. Additional support on standby.'
      });
      
      await this.createMessage({
        sender: 'IT Support',
        message: 'Biometric verification system update completed. New features available.'
      });
      
      await this.createMessage({
        sender: 'Accessibility Coordinator',
        message: 'New language options available in the accessibility interface.'
      });
    }

    // Create sample voters
    if ((await this.getAllVoters()).length === 0) {
      // Create sample voters with IDs starting with 1 (valid) and some with other numbers (invalid)
      const sampleVoters = [
        {
          voterId: '100123', name: 'Sarah Johnson', dateOfBirth: '05/12/1985',
          address: '123 Main St, Cityville', precinct: 'East District 4'
        },
        {
          voterId: '100456', name: 'Michael Brown', dateOfBirth: '11/03/1972',
          address: '456 Oak Ave, Townsville', precinct: 'West District 2'
        },
        {
          voterId: '100789', name: 'Jennifer Smith', dateOfBirth: '07/25/1990',
          address: '789 Pine Rd, Villageton', precinct: 'North District 1'
        },
        {
          voterId: '101012', name: 'Robert Williams', dateOfBirth: '02/18/1965',
          address: '101 Cedar Ln, Hamletville', precinct: 'South District 3'
        },
        {
          voterId: '101345', name: 'Patricia Brown', dateOfBirth: '09/30/1988',
          address: '234 Birch St, Boroughville', precinct: 'Central District 5'
        }
      ];

      for (const voter of sampleVoters) {
        await this.createVoter(voter);
      }
    }

    // Create stats for today
    if ((await this.getTodayStats()).length === 0) {
      const now = new Date();
      const currentHour = now.getHours();
      
      // Create stats for past hours
      for (let hour = 8; hour <= currentHour; hour++) {
        const votersProcessed = Math.floor(Math.random() * 10) + 5; // 5-15 voters per hour
        const averageProcessingTime = Math.floor(Math.random() * 60) + 120; // 2-3 minutes in seconds
        const waitTime = Math.floor(Math.random() * 5) + 8; // 8-12 minutes
        const throughput = Math.floor(Math.random() * 3) + 5; // 5-7 voters per hour
        
        await this.createStat({
          hour,
          votersProcessed,
          averageProcessingTime,
          waitTime,
          throughput
        });
      }
    }
    
    // Create sample biometric data
    if (this.biometrics.size === 0) {
      // Add biometric data for some of the sample voters
      const biometricTypes = ['fingerprint', 'facial_recognition'];
      
      // For the first 3 voters
      for (let i = 1; i <= 3; i++) {
        const voter = await this.getVoter(i);
        if (voter) {
          const type = biometricTypes[i % biometricTypes.length];
          const dataReference = `${type}_data_id_${i}_reference`;
          
          await this.createBiometric({
            voterId: i,
            type,
            dataReference
          });
          
          // Verify biometric for voter 1 to demonstrate the flow
          if (i === 1) {
            const biometric = await this.getBiometricByVoterId(i);
            if (biometric) {
              await this.verifyBiometric(biometric.id, 2); // Verified by poll worker
            }
          }
        }
      }
    }
    
    // Create sample accessibility preferences
    if (this.accessibilityPreferences.size === 0) {
      const accessibilityOptions = [
        { 
          voterId: 1,
          visualAssistance: true,
          hearingAssistance: false,
          mobilityAssistance: false,
          languagePreference: 'english',
          otherNeeds: 'Larger text on screen'
        },
        { 
          voterId: 3,
          visualAssistance: false,
          hearingAssistance: true,
          mobilityAssistance: false,
          languagePreference: 'english',
          otherNeeds: 'Audio instructions'
        },
        { 
          voterId: 4,
          visualAssistance: false,
          hearingAssistance: false,
          mobilityAssistance: true,
          languagePreference: 'spanish',
          otherNeeds: 'Wheelchair accessible booth'
        }
      ];
      
      for (const option of accessibilityOptions) {
        await this.createAccessibilityPreference(option);
      }
    }
    
    // Create sample mobile notifications
    if (this.mobileNotifications.size === 0) {
      const notifications = [
        {
          voterId: 1,
          phoneNumber: '+15551234567',
          email: 'voter1@example.com',
          optedIn: true,
          notificationType: 'sms'
        },
        {
          voterId: 2,
          phoneNumber: '+15559876543',
          email: 'voter2@example.com',
          optedIn: true,
          notificationType: 'email'
        }
      ];
      
      for (const notification of notifications) {
        const created = await this.createMobileNotification(notification);
        // Verify the first notification to demonstrate the flow
        if (created.voterId === 1) {
          await this.verifyMobileNotification(created.id, created.verificationCode);
        }
      }
    }
    
    // Create sample anomalies
    if (this.anomalies.size === 0) {
      const anomalies = [
        {
          type: 'unusual_pattern',
          description: 'Unusual spike in check-in rate detected at station 3',
          severity: 'medium',
          metadata: { stationId: 3, timeDetected: new Date().toISOString() }
        },
        {
          type: 'security_threat',
          description: 'Multiple failed biometric verification attempts for same voter ID',
          severity: 'high',
          metadata: { voterId: 5, attempts: 3, timeSpan: '5 minutes' }
        },
        {
          type: 'performance_issue',
          description: 'Station 2 processing time significantly higher than average',
          severity: 'low',
          metadata: { stationId: 2, avgTime: '5.2 minutes', systemAvg: '2.8 minutes' }
        }
      ];
      
      for (const anomaly of anomalies) {
        await this.createAnomaly(anomaly);
      }
      
      // Resolve one anomaly to demonstrate the flow
      const firstAnomaly = await this.getAnomaly(1);
      if (firstAnomaly) {
        await this.resolveAnomaly(1, 1, 'False positive - normal variation in check-in pattern');
      }
    }
    
    // Create sample predictive analytics
    if (this.predictiveAnalytics.size === 0) {
      const now = new Date();
      const currentHour = now.getHours();
      const dayOfWeek = now.getDay();
      
      // Create predictions for the day
      for (let hour = 8; hour <= 18; hour++) {
        const predictedVoterVolume = hour < 12 ? 10 + hour : (hour > 16 ? 30 - hour : 25);
        const predictedWaitTime = Math.max(5, Math.floor(predictedVoterVolume / 3));
        
        await this.createPredictiveAnalytic({
          hourOfDay: hour,
          dayOfWeek,
          predictedVoterVolume,
          predictedWaitTime,
          factorsConsidered: ['historical_data', 'weather', 'local_events']
        });
        
        // Update actuals for past hours to demonstrate the flow
        if (hour < currentHour) {
          const analytic = await this.getPredictionForTimeSlot(hour, dayOfWeek);
          if (analytic) {
            const actualVoterVolume = predictedVoterVolume + Math.floor(Math.random() * 5) - 2; // Slight variation
            const actualWaitTime = Math.max(1, predictedWaitTime + Math.floor(Math.random() * 3) - 1);
            
            await this.updatePredictiveAnalyticWithActual(analytic.id, actualVoterVolume, actualWaitTime);
          }
        }
      }
    }
    
    // Create sample blockchain transactions
    if (this.blockchainTransactions.size === 0) {
      const transactions = [
        {
          transactionType: 'voter_verification',
          transactionHash: '0x8f32d45a9e720a4d0e193ea21de9ee97e1971d2c3b7480cf',
          blockNumber: 12345678,
          voterId: 1,
          pollingStationId: 'station_1',
          metadata: { timestamp: new Date().toISOString(), method: 'biometric' }
        },
        {
          transactionType: 'check_in',
          transactionHash: '0x3e7a12c5b8e90d6f2a193ea9fe12d4c78e1234f5a6b7c8d9',
          blockNumber: 12345679,
          voterId: 1,
          pollingStationId: 'station_1',
          metadata: { timestamp: new Date().toISOString(), operator: 'poll_worker_2' }
        },
        {
          transactionType: 'vote_cast',
          transactionHash: '0x7b28e39fa4c1d5e6e193ea21de9ee97e1971d2c3b748012',
          blockNumber: 12345680,
          voterId: 1,
          pollingStationId: 'booth_3',
          metadata: { timestamp: new Date().toISOString(), ballot: 'encrypted_ballot_hash' }
        }
      ];
      
      for (const transaction of transactions) {
        const created = await this.createBlockchainTransaction(transaction);
        // Verify all transactions
        await this.verifyBlockchainTransaction(created.id);
      }
    }
  }
}

export const storage = new MemStorage();
