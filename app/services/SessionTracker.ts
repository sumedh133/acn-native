import { AppState, AppStateStatus } from 'react-native';
import { analytics } from '../config/firebase';
import { logEvent } from '@react-native-firebase/analytics';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

class SessionTracker {
  private static instance: SessionTracker;
  private sessionStartTime: number = 0;
  private lastActiveTime: number = 0;
  private sessionCount: number = 0;
  private timeoutId: NodeJS.Timeout | null = null;
  private userType: string = 'free';
  private userId: string = '';
  private userName: string = '';
  private appStateSubscription: any = null;

  private constructor() {
    this.setupAppStateListener();
  }

  public static getInstance(): SessionTracker {
    if (!SessionTracker.instance) {
      SessionTracker.instance = new SessionTracker();
    }
    return SessionTracker.instance;
  }

  public setUserInfo(userType: string, userId: string, userName: string) {
    this.userType = userType;
    this.userId = userId;
    this.userName = userName;
  }

  private setupAppStateListener() {
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
  }

  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    const now = Date.now();

    if (nextAppState === 'active') {
      // App came to foreground
      if (this.lastActiveTime === 0) {
        // First time app becomes active
        this.startNewSession();
      } else {
        const inactiveTime = now - this.lastActiveTime;
        if (inactiveTime >= SESSION_TIMEOUT) {
          // If inactive for more than session timeout, start new session
          this.endSession('timeout');
          this.startNewSession();
        }
      }
      this.lastActiveTime = now;
      this.scheduleSessionCheck();
    } else if (nextAppState === 'background' || nextAppState === 'inactive') {
      // App went to background
      this.lastActiveTime = now;
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
      this.endSession('background');
    }
  };

  private startNewSession() {
    this.sessionStartTime = Date.now();
    this.sessionCount++;
    
    try {
      logEvent(analytics, 'start_session', {
        event_category: 'session',
        event_label: 'start',
        session_number: this.sessionCount,
        user_type: this.userType,
        user_id: this.userId,
        user_name: this.userName
      });
    } catch (error) {
      console.error('Error logging session start:', error);
    }
  }

  private endSession(reason: 'timeout' | 'background') {
    if (this.sessionStartTime === 0) return;

    const sessionDuration = Math.floor((Date.now() - this.sessionStartTime) / 1000); // Duration in seconds
    
    try {
      logEvent(analytics, 'end_session', {
        event_category: 'session',
        event_label: 'end',
        session_number: this.sessionCount,
        session_duration: sessionDuration,
        end_reason: reason,
        user_type: this.userType,
        user_id: this.userId,
        user_name: this.userName
      });
    } catch (error) {
      console.error('Error logging session end:', error);
    }

    this.sessionStartTime = 0;
  }

  private scheduleSessionCheck() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      const now = Date.now();
      const sessionDuration = now - this.sessionStartTime;
      
      if (sessionDuration >= SESSION_TIMEOUT) {
        this.endSession('timeout');
        this.startNewSession();
      } else {
        this.scheduleSessionCheck();
      }
    }, SESSION_TIMEOUT);
  }

  public cleanup() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }
  }
}

export default SessionTracker;