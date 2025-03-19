import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertVoterSchema, 
  insertQueueSchema, 
  insertIssueSchema, 
  insertStationSchema,
  insertSystemStatusSchema,
  insertAlertSchema,
  insertMessageSchema,
  insertStatsSchema,
  insertBiometricSchema,
  insertAccessibilityPreferenceSchema,
  insertMobileNotificationSchema,
  insertAnomalySchema,
  insertPredictiveAnalyticsSchema,
  insertBlockchainTransactionSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize the system with default data
  await storage.initializeSystem();

  // API routes - all prefixed with /api
  
  // User routes
  app.get("/api/users/current", async (req, res) => {
    // For demo purposes, return the default poll worker
    const user = await storage.getUserByUsername("pollworker");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Don't send the password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });
  
  // Biometric verification routes
  app.get("/api/biometrics/voter/:voterId", async (req, res) => {
    const { voterId } = req.params;
    
    try {
      const biometric = await storage.getBiometricByVoterId(Number(voterId));
      if (!biometric) {
        return res.status(404).json({ message: "No biometric data found for this voter" });
      }
      
      res.json(biometric);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.post("/api/biometrics", async (req, res) => {
    try {
      const biometricData = insertBiometricSchema.parse(req.body);
      const result = await storage.createBiometric(biometricData);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });
  
  app.put("/api/biometrics/:id/verify", async (req, res) => {
    const { id } = req.params;
    const userId = 2; // For demo purposes, use the default poll worker ID
    
    try {
      const biometric = await storage.verifyBiometric(Number(id), userId);
      res.json(biometric);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Accessibility settings routes
  app.get("/api/accessibility/voter/:voterId", async (req, res) => {
    const { voterId } = req.params;
    
    try {
      const preferences = await storage.getAccessibilityPreferenceByVoterId(Number(voterId));
      if (!preferences) {
        return res.status(404).json({ message: "No accessibility preferences found for this voter" });
      }
      
      res.json(preferences);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.post("/api/accessibility", async (req, res) => {
    try {
      const preferencesData = insertAccessibilityPreferenceSchema.parse(req.body);
      const result = await storage.createAccessibilityPreference(preferencesData);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });
  
  app.put("/api/accessibility/:id", async (req, res) => {
    const { id } = req.params;
    
    try {
      const updatedPreferences = await storage.updateAccessibilityPreference(Number(id), req.body);
      res.json(updatedPreferences);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Mobile notifications routes
  app.get("/api/mobile-notifications/voter/:voterId", async (req, res) => {
    const { voterId } = req.params;
    
    try {
      const notification = await storage.getMobileNotificationByVoterId(Number(voterId));
      if (!notification) {
        return res.status(404).json({ message: "No notification settings found for this voter" });
      }
      
      res.json(notification);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.post("/api/mobile-notifications", async (req, res) => {
    try {
      const notificationData = insertMobileNotificationSchema.parse(req.body);
      const result = await storage.createMobileNotification(notificationData);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });
  
  app.post("/api/mobile-notifications/:id/verify", async (req, res) => {
    const { id } = req.params;
    const { verificationCode } = req.body;
    
    try {
      const notification = await storage.verifyMobileNotification(Number(id), verificationCode);
      res.json(notification);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });
  
  app.post("/api/mobile-notifications/:id/send", async (req, res) => {
    const { id } = req.params;
    const { message } = req.body;
    
    try {
      const success = await storage.sendNotification(Number(id), message);
      if (success) {
        res.json({ success: true, message: "Notification sent successfully" });
      } else {
        res.status(400).json({ success: false, message: "Failed to send notification" });
      }
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Anomaly detection routes
  app.get("/api/anomalies", async (req, res) => {
    try {
      const anomalies = await storage.getAllAnomalies();
      res.json(anomalies);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.post("/api/anomalies", async (req, res) => {
    try {
      const anomalyData = insertAnomalySchema.parse(req.body);
      const result = await storage.createAnomaly(anomalyData);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });
  
  app.put("/api/anomalies/:id/resolve", async (req, res) => {
    const { id } = req.params;
    const { userId, resolution } = req.body;
    
    try {
      const anomaly = await storage.resolveAnomaly(Number(id), userId, resolution);
      res.json(anomaly);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Voter verification routes
  app.get("/api/voters/:voterId", async (req, res) => {
    const { voterId } = req.params;
    
    const voter = await storage.getVoterByVoterId(voterId);
    if (!voter) {
      return res.status(404).json({ message: "Voter not found" });
    }
    
    res.json(voter);
  });
  
  app.post("/api/voters/:id/check-in", async (req, res) => {
    const { id } = req.params;
    const userId = 2; // For demo purposes, use the default poll worker ID
    
    try {
      const voter = await storage.checkInVoter(parseInt(id), userId);
      
      // Update the queue stats by adding to completed count
      const queueStats = await storage.getQueueStats();
      const waitTime = Math.floor(Math.random() * 5) + 3; // 3-7 minutes
      
      // Update station statistics
      const station = await storage.getStation(1); // Default station
      if (station) {
        await storage.incrementStationVotersProcessed(station.id);
      }
      
      res.json({ 
        success: true, 
        voter,
        checkInTime: new Date().toLocaleTimeString()
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Queue management routes
  app.get("/api/queue", async (req, res) => {
    const queueItems = await storage.getAllQueueItems();
    
    // Join with voter data
    const queueWithVoters = await Promise.all(
      queueItems.map(async (item) => {
        const voter = await storage.getVoter(item.voterId);
        return {
          ...item,
          voter
        };
      })
    );
    
    res.json(queueWithVoters);
  });
  
  app.get("/api/queue/stats", async (req, res) => {
    const stats = await storage.getQueueStats();
    res.json(stats);
  });
  
  app.post("/api/queue", async (req, res) => {
    try {
      const queueData = insertQueueSchema.parse(req.body);
      const queueItem = await storage.createQueueItem(queueData);
      res.status(201).json(queueItem);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });
  
  app.put("/api/queue/:id/status", async (req, res) => {
    const { id } = req.params;
    const { status, userId } = req.body;
    
    try {
      const queueItem = await storage.updateQueueItemStatus(
        parseInt(id), 
        status, 
        userId ? parseInt(userId) : undefined
      );
      res.json(queueItem);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Station routes
  app.get("/api/stations", async (req, res) => {
    const stations = await storage.getAllStations();
    
    // Join with user/operator data
    const stationsWithOperators = await Promise.all(
      stations.map(async (station) => {
        if (station.operatorId) {
          const operator = await storage.getUser(station.operatorId);
          if (operator) {
            // Don't send the password
            const { password, ...operatorWithoutPassword } = operator;
            return {
              ...station,
              operator: operatorWithoutPassword
            };
          }
        }
        return station;
      })
    );
    
    res.json(stationsWithOperators);
  });
  
  app.put("/api/stations/:id/status", async (req, res) => {
    const { id } = req.params;
    const { status, operatorId } = req.body;
    
    try {
      const station = await storage.updateStationStatus(
        parseInt(id), 
        status, 
        operatorId ? parseInt(operatorId) : undefined
      );
      res.json(station);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // System status routes
  app.get("/api/system-status", async (req, res) => {
    const statuses = await storage.getAllSystemStatuses();
    res.json(statuses);
  });
  
  app.put("/api/system-status/:id", async (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    try {
      const systemStatus = await storage.updateSystemStatus(
        parseInt(id), 
        status, 
        notes
      );
      res.json(systemStatus);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Alert routes
  app.get("/api/alerts", async (req, res) => {
    const alerts = await storage.getAllAlerts();
    res.json(alerts);
  });
  
  app.post("/api/alerts", async (req, res) => {
    try {
      const alertData = insertAlertSchema.parse(req.body);
      const alert = await storage.createAlert(alertData);
      res.status(201).json(alert);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });
  
  // Message routes
  app.get("/api/messages", async (req, res) => {
    const messages = await storage.getAllMessages();
    res.json(messages);
  });
  
  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });
  
  // Stats routes
  app.get("/api/stats", async (req, res) => {
    const stats = await storage.getTodayStats();
    res.json(stats);
  });
  
  app.get("/api/stats/summary", async (req, res) => {
    const stats = await storage.getTodayStats();
    
    // Calculate summary statistics
    const totalVotersProcessed = stats.reduce((sum, stat) => sum + stat.votersProcessed, 0);
    
    const processingTimes = stats.filter(stat => stat.averageProcessingTime !== null)
      .map(stat => stat.averageProcessingTime as number);
    const avgProcessingTime = processingTimes.length > 0 
      ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length 
      : 0;
    
    const waitTimes = stats.filter(stat => stat.waitTime !== null)
      .map(stat => stat.waitTime as number);
    const currentWaitTime = waitTimes.length > 0 ? waitTimes[waitTimes.length - 1] : 0;
    
    const throughputs = stats.filter(stat => stat.throughput !== null)
      .map(stat => stat.throughput as number);
    const currentThroughput = throughputs.length > 0 ? throughputs[throughputs.length - 1] : 0;
    
    // Find peak hour
    let peakHour = 0;
    let maxVoters = 0;
    stats.forEach(stat => {
      if (stat.votersProcessed > maxVoters) {
        maxVoters = stat.votersProcessed;
        peakHour = stat.hour;
      }
    });
    
    res.json({
      totalVotersProcessed,
      avgProcessingTime: Math.round(avgProcessingTime / 60 * 10) / 10, // Convert to minutes with 1 decimal place
      currentWaitTime,
      currentThroughput,
      peakHour: `${peakHour}:00`,
      specialCases: 5 // Hardcoded for demo
    });
  });
  
  // Issue routes
  app.get("/api/issues", async (req, res) => {
    const issues = await storage.getAllIssues();
    res.json(issues);
  });
  
  app.post("/api/issues", async (req, res) => {
    try {
      const issueData = insertIssueSchema.parse(req.body);
      const issue = await storage.createIssue(issueData);
      res.status(201).json(issue);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });
  
  app.put("/api/issues/:id/resolve", async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;
    
    try {
      const issue = await storage.resolveIssue(
        parseInt(id), 
        parseInt(userId)
      );
      res.json(issue);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Connection status - offline mode toggle
  app.get("/api/connection-status", (req, res) => {
    res.json({ connected: true });
  });
  
  app.post("/api/connection-status/toggle", (req, res) => {
    const { connected } = req.body;
    res.json({ connected });
  });
  
  // Biometric verification routes
  app.get("/api/biometrics/voter/:voterId", async (req, res) => {
    const { voterId } = req.params;
    
    try {
      const biometric = await storage.getBiometricByVoterId(parseInt(voterId));
      if (!biometric) {
        return res.status(404).json({ message: "Biometric data not found for voter" });
      }
      
      res.json(biometric);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.post("/api/biometrics", async (req, res) => {
    try {
      const biometricData = insertBiometricSchema.parse(req.body);
      const biometric = await storage.createBiometric(biometricData);
      res.status(201).json(biometric);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });
  
  app.put("/api/biometrics/:id/verify", async (req, res) => {
    const { id } = req.params;
    const userId = 2; // For demo purposes, use the default poll worker ID
    
    try {
      const biometric = await storage.verifyBiometric(parseInt(id), userId);
      res.json(biometric);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Accessibility routes
  app.get("/api/accessibility/voter/:voterId", async (req, res) => {
    const { voterId } = req.params;
    
    try {
      const preferences = await storage.getAccessibilityPreferenceByVoterId(parseInt(voterId));
      if (!preferences) {
        return res.status(404).json({ message: "Accessibility preferences not found for voter" });
      }
      
      res.json(preferences);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.post("/api/accessibility", async (req, res) => {
    try {
      const accessibilityData = insertAccessibilityPreferenceSchema.parse(req.body);
      const preferences = await storage.createAccessibilityPreference(accessibilityData);
      res.status(201).json(preferences);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });
  
  app.put("/api/accessibility/:id", async (req, res) => {
    const { id } = req.params;
    
    try {
      const preferences = await storage.updateAccessibilityPreference(parseInt(id), req.body);
      res.json(preferences);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Mobile notification routes
  app.get("/api/mobile-notifications/voter/:voterId", async (req, res) => {
    const { voterId } = req.params;
    
    try {
      const notification = await storage.getMobileNotificationByVoterId(parseInt(voterId));
      if (!notification) {
        return res.status(404).json({ message: "Mobile notification settings not found for voter" });
      }
      
      res.json(notification);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.post("/api/mobile-notifications", async (req, res) => {
    try {
      const notificationData = insertMobileNotificationSchema.parse(req.body);
      const notification = await storage.createMobileNotification(notificationData);
      res.status(201).json(notification);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });
  
  app.post("/api/mobile-notifications/:id/verify", async (req, res) => {
    const { id } = req.params;
    const { verificationCode } = req.body;
    
    try {
      const notification = await storage.verifyMobileNotification(parseInt(id), verificationCode);
      res.json(notification);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });
  
  app.post("/api/mobile-notifications/:id/send", async (req, res) => {
    const { id } = req.params;
    const { message } = req.body;
    
    try {
      const success = await storage.sendNotification(parseInt(id), message);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Anomaly detection routes
  app.get("/api/anomalies", async (req, res) => {
    try {
      const anomalies = await storage.getAllAnomalies();
      res.json(anomalies);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.post("/api/anomalies", async (req, res) => {
    try {
      const anomalyData = insertAnomalySchema.parse(req.body);
      const anomaly = await storage.createAnomaly(anomalyData);
      res.status(201).json(anomaly);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });
  
  app.put("/api/anomalies/:id/resolve", async (req, res) => {
    const { id } = req.params;
    const { userId, resolution } = req.body;
    
    try {
      const anomaly = await storage.resolveAnomaly(parseInt(id), parseInt(userId), resolution);
      res.json(anomaly);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Predictive analytics routes
  app.get("/api/predictive-analytics", async (req, res) => {
    try {
      const analytics = await storage.getAllPredictiveAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.post("/api/predictive-analytics", async (req, res) => {
    try {
      const analyticData = insertPredictiveAnalyticsSchema.parse(req.body);
      const analytic = await storage.createPredictiveAnalytic(analyticData);
      res.status(201).json(analytic);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });
  
  app.put("/api/predictive-analytics/:id/update-actuals", async (req, res) => {
    const { id } = req.params;
    const { actualVoterVolume, actualWaitTime } = req.body;
    
    try {
      const analytic = await storage.updatePredictiveAnalyticWithActual(
        parseInt(id), 
        parseInt(actualVoterVolume), 
        parseInt(actualWaitTime)
      );
      res.json(analytic);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.get("/api/predictive-analytics/time-slot", async (req, res) => {
    const { hourOfDay, dayOfWeek } = req.query;
    
    try {
      const analytic = await storage.getPredictionForTimeSlot(
        parseInt(hourOfDay as string), 
        parseInt(dayOfWeek as string)
      );
      
      if (!analytic) {
        return res.status(404).json({ message: "No prediction found for the specified time slot" });
      }
      
      res.json(analytic);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Blockchain transaction routes
  app.get("/api/blockchain-transactions", async (req, res) => {
    try {
      const transactions = await storage.getAllBlockchainTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.get("/api/blockchain-transactions/voter/:voterId", async (req, res) => {
    const { voterId } = req.params;
    
    try {
      const transactions = await storage.getVoterTransactions(parseInt(voterId));
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.post("/api/blockchain-transactions", async (req, res) => {
    try {
      const transactionData = insertBlockchainTransactionSchema.parse(req.body);
      const transaction = await storage.createBlockchainTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });
  
  app.put("/api/blockchain-transactions/:id/verify", async (req, res) => {
    const { id } = req.params;
    
    try {
      const transaction = await storage.verifyBlockchainTransaction(parseInt(id));
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
