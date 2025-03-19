import { pgTable, text, serial, integer, boolean, timestamp, varchar, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User/Poll Worker Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  station: integer("station"),
  role: text("role").default("poll_worker"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  station: true,
  role: true,
});

// Voter Schema
export const voters = pgTable("voters", {
  id: serial("id").primaryKey(),
  voterId: text("voter_id").notNull().unique(),
  name: text("name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  address: text("address").notNull(),
  precinct: text("precinct").notNull(),
  checkedIn: boolean("checked_in").default(false),
  checkedInAt: timestamp("checked_in_at"),
  checkedInBy: integer("checked_in_by").references(() => users.id),
});

export const insertVoterSchema = createInsertSchema(voters).pick({
  voterId: true,
  name: true,
  dateOfBirth: true,
  address: true,
  precinct: true,
});

// Queue Schema
export const queue = pgTable("queue", {
  id: serial("id").primaryKey(),
  voterId: integer("voter_id").references(() => voters.id),
  number: integer("number").notNull(),
  status: text("status").default("waiting"), // waiting, in_progress, completed, issue
  type: text("type").default("standard"), // standard, provisional, special_assistance
  waitTimeMinutes: integer("wait_time_minutes"),
  enteredAt: timestamp("entered_at").defaultNow(),
  processedAt: timestamp("processed_at"),
  processedBy: integer("processed_by").references(() => users.id),
});

export const insertQueueSchema = createInsertSchema(queue).pick({
  voterId: true,
  number: true,
  status: true,
  type: true,
  waitTimeMinutes: true,
});

// Station Schema
export const stations = pgTable("stations", {
  id: serial("id").primaryKey(),
  number: integer("number").notNull().unique(),
  status: text("status").default("inactive"), // active, inactive
  operatorId: integer("operator_id").references(() => users.id),
  votersProcessed: integer("voters_processed").default(0),
});

export const insertStationSchema = createInsertSchema(stations).pick({
  number: true,
  status: true,
  operatorId: true,
});

// Issues Schema
export const issues = pgTable("issues", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // id_verification, address_discrepancy, scanner_malfunction, etc.
  description: text("description"),
  status: text("status").default("open"), // open, resolved
  reportedAt: timestamp("reported_at").defaultNow(),
  reportedBy: integer("reported_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: integer("resolved_by").references(() => users.id),
  resolutionTime: integer("resolution_time"), // in minutes
});

export const insertIssueSchema = createInsertSchema(issues).pick({
  type: true,
  description: true,
  reportedBy: true,
});

// System Status Schema
export const systemStatus = pgTable("system_status", {
  id: serial("id").primaryKey(),
  component: text("component").notNull().unique(), // voter_database, id_scanner, internet, central_election_system
  status: text("status").default("operational"), // operational, degraded, down
  lastChecked: timestamp("last_checked").defaultNow(),
  notes: text("notes"),
});

export const insertSystemStatusSchema = createInsertSchema(systemStatus).pick({
  component: true,
  status: true,
  notes: true,
});

// Alert Schema
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // warning, info, error
  title: text("title").notNull(),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertAlertSchema = createInsertSchema(alerts).pick({
  type: true,
  title: true,
  message: true,
});

// Message Schema
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  sender: text("sender").notNull(),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  sender: true,
  message: true,
});

// Stats Schema
export const stats = pgTable("stats", {
  id: serial("id").primaryKey(),
  date: timestamp("date").defaultNow(),
  hour: integer("hour").notNull(),
  votersProcessed: integer("voters_processed").default(0),
  averageProcessingTime: integer("average_processing_time"), // in seconds
  waitTime: integer("wait_time"), // in minutes
  throughput: integer("throughput"), // voters per hour
});

export const insertStatsSchema = createInsertSchema(stats).pick({
  hour: true,
  votersProcessed: true,
  averageProcessingTime: true,
  waitTime: true,
  throughput: true,
});

// Biometric Data Schema
export const biometrics = pgTable("biometrics", {
  id: serial("id").primaryKey(),
  voterId: integer("voter_id").references(() => voters.id).notNull(),
  type: text("type").notNull(), // fingerprint, facial_recognition
  dataReference: text("data_reference"), // Reference to where the data is stored (securely)
  verified: boolean("verified").default(false),
  verifiedAt: timestamp("verified_at"),
  verifiedBy: integer("verified_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBiometricSchema = createInsertSchema(biometrics).pick({
  voterId: true,
  type: true,
  dataReference: true,
});

// Accessibility Preferences Schema
export const accessibilityPreferences = pgTable("accessibility_preferences", {
  id: serial("id").primaryKey(),
  voterId: integer("voter_id").references(() => voters.id).notNull(),
  visualAssistance: boolean("visual_assistance").default(false),
  hearingAssistance: boolean("hearing_assistance").default(false),
  mobilityAssistance: boolean("mobility_assistance").default(false),
  languagePreference: text("language_preference").default("english"),
  otherNeeds: text("other_needs"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAccessibilityPreferenceSchema = createInsertSchema(accessibilityPreferences).pick({
  voterId: true,
  visualAssistance: true,
  hearingAssistance: true,
  mobilityAssistance: true,
  languagePreference: true,
  otherNeeds: true,
});

// Mobile Notifications Schema
export const mobileNotifications = pgTable("mobile_notifications", {
  id: serial("id").primaryKey(),
  voterId: integer("voter_id").references(() => voters.id).notNull(),
  phoneNumber: text("phone_number"),
  email: text("email"),
  optedIn: boolean("opted_in").default(false),
  verificationCode: text("verification_code"),
  verified: boolean("verified").default(false),
  notificationType: text("notification_type").default("sms"), // sms, email
  lastNotified: timestamp("last_notified"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMobileNotificationSchema = createInsertSchema(mobileNotifications).pick({
  voterId: true,
  phoneNumber: true,
  email: true,
  optedIn: true,
  notificationType: true,
});

// Anomaly Detection Schema
export const anomalies = pgTable("anomalies", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // unusual_pattern, security_threat, performance_issue
  description: text("description").notNull(),
  severity: text("severity").default("low"), // low, medium, high
  status: text("status").default("detected"), // detected, investigating, resolved, false_positive
  detectedAt: timestamp("detected_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: integer("resolved_by").references(() => users.id),
  metadata: json("metadata"), // Additional information about the anomaly
  actions: text("actions").array(), // Recommended or taken actions
});

export const insertAnomalySchema = createInsertSchema(anomalies).pick({
  type: true,
  description: true,
  severity: true,
  metadata: true,
});

// Analytics Data Schema for predictive modeling
export const predictiveAnalytics = pgTable("predictive_analytics", {
  id: serial("id").primaryKey(),
  date: timestamp("date").defaultNow(),
  hourOfDay: integer("hour_of_day").notNull(),
  dayOfWeek: integer("day_of_week").notNull(),
  predictedVoterVolume: integer("predicted_voter_volume"),
  actualVoterVolume: integer("actual_voter_volume"),
  predictedWaitTime: integer("predicted_wait_time"), // in minutes
  actualWaitTime: integer("actual_wait_time"), // in minutes
  factorsConsidered: text("factors_considered").array(),
  accuracyPercentage: integer("accuracy_percentage"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPredictiveAnalyticsSchema = createInsertSchema(predictiveAnalytics).pick({
  hourOfDay: true,
  dayOfWeek: true,
  predictedVoterVolume: true,
  predictedWaitTime: true,
  factorsConsidered: true,
});

// Blockchain Transaction Schema
export const blockchainTransactions = pgTable("blockchain_transactions", {
  id: serial("id").primaryKey(),
  transactionType: text("transaction_type").notNull(), // voter_verification, check_in, vote_cast
  transactionHash: text("transaction_hash").notNull(),
  blockNumber: integer("block_number"),
  voterId: integer("voter_id").references(() => voters.id),
  pollingStationId: text("polling_station_id"),
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: json("metadata"), // Transaction details (non-sensitive)
  verified: boolean("verified").default(false),
});

export const insertBlockchainTransactionSchema = createInsertSchema(blockchainTransactions).pick({
  transactionType: true,
  transactionHash: true,
  blockNumber: true,
  voterId: true,
  pollingStationId: true,
  metadata: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Voter = typeof voters.$inferSelect;
export type InsertVoter = z.infer<typeof insertVoterSchema>;

export type QueueItem = typeof queue.$inferSelect;
export type InsertQueueItem = z.infer<typeof insertQueueSchema>;

export type Station = typeof stations.$inferSelect;
export type InsertStation = z.infer<typeof insertStationSchema>;

export type Issue = typeof issues.$inferSelect;
export type InsertIssue = z.infer<typeof insertIssueSchema>;

export type SystemStatus = typeof systemStatus.$inferSelect;
export type InsertSystemStatus = z.infer<typeof insertSystemStatusSchema>;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Stat = typeof stats.$inferSelect;
export type InsertStat = z.infer<typeof insertStatsSchema>;

// New types for enhanced features
export type Biometric = typeof biometrics.$inferSelect;
export type InsertBiometric = z.infer<typeof insertBiometricSchema>;

export type AccessibilityPreference = typeof accessibilityPreferences.$inferSelect;
export type InsertAccessibilityPreference = z.infer<typeof insertAccessibilityPreferenceSchema>;

export type MobileNotification = typeof mobileNotifications.$inferSelect;
export type InsertMobileNotification = z.infer<typeof insertMobileNotificationSchema>;

export type Anomaly = typeof anomalies.$inferSelect;
export type InsertAnomaly = z.infer<typeof insertAnomalySchema>;

export type PredictiveAnalytic = typeof predictiveAnalytics.$inferSelect;
export type InsertPredictiveAnalytic = z.infer<typeof insertPredictiveAnalyticsSchema>;

export type BlockchainTransaction = typeof blockchainTransactions.$inferSelect;
export type InsertBlockchainTransaction = z.infer<typeof insertBlockchainTransactionSchema>;
