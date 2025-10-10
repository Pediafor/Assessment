import { publishEvent } from '../config/rabbitmq';

// User Event Types
export interface UserRegisteredEvent {
  type: 'user.registered';
  userId: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  timestamp: Date;
}

export interface UserProfileUpdatedEvent {
  type: 'user.profile_updated';
  userId: string;
  email: string;
  changes: {
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
    metadata?: any;
  };
  timestamp: Date;
}

export interface UserDeactivatedEvent {
  type: 'user.deactivated';
  userId: string;
  email: string;
  timestamp: Date;
}

export interface UserReactivatedEvent {
  type: 'user.reactivated';
  userId: string;
  email: string;
  timestamp: Date;
}

export interface UserRoleChangedEvent {
  type: 'user.role_changed';
  userId: string;
  email: string;
  oldRole: string;
  newRole: string;
  timestamp: Date;
}

/**
 * User Event Publisher Class
 */
export class UserEventPublisher {
  
  /**
   * Publish user registration event
   */
  static async publishUserRegistered(data: Omit<UserRegisteredEvent, 'type' | 'timestamp'>): Promise<void> {
    try {
      const event: UserRegisteredEvent = {
        type: 'user.registered',
        ...data,
        timestamp: new Date()
      };

      await publishEvent('user.registered', event);
    } catch (error) {
      console.error('Failed to publish user.registered event:', error);
      // Don't throw - service should continue working even if events fail
    }
  }

  /**
   * Publish user profile update event
   */
  static async publishUserProfileUpdated(data: Omit<UserProfileUpdatedEvent, 'type' | 'timestamp'>): Promise<void> {
    try {
      const event: UserProfileUpdatedEvent = {
        type: 'user.profile_updated',
        ...data,
        timestamp: new Date()
      };

      await publishEvent('user.profile_updated', event);
    } catch (error) {
      console.error('Failed to publish user.profile_updated event:', error);
      // Don't throw - service should continue working even if events fail
    }
  }

  /**
   * Publish user deactivation event
   */
  static async publishUserDeactivated(data: Omit<UserDeactivatedEvent, 'type' | 'timestamp'>): Promise<void> {
    try {
      const event: UserDeactivatedEvent = {
        type: 'user.deactivated',
        ...data,
        timestamp: new Date()
      };

      await publishEvent('user.deactivated', event);
    } catch (error) {
      console.error('Failed to publish user.deactivated event:', error);
      // Don't throw - service should continue working even if events fail
    }
  }

  /**
   * Publish user reactivation event
   */
  static async publishUserReactivated(data: Omit<UserReactivatedEvent, 'type' | 'timestamp'>): Promise<void> {
    try {
      const event: UserReactivatedEvent = {
        type: 'user.reactivated',
        ...data,
        timestamp: new Date()
      };

      await publishEvent('user.reactivated', event);
    } catch (error) {
      console.error('Failed to publish user.reactivated event:', error);
      // Don't throw - service should continue working even if events fail
    }
  }

  /**
   * Publish user role change event
   */
  static async publishUserRoleChanged(data: Omit<UserRoleChangedEvent, 'type' | 'timestamp'>): Promise<void> {
    try {
      const event: UserRoleChangedEvent = {
        type: 'user.role_changed',
        ...data,
        timestamp: new Date()
      };

      await publishEvent('user.role_changed', event);
    } catch (error) {
      console.error('Failed to publish user.role_changed event:', error);
      // Don't throw - service should continue working even if events fail
    }
  }
}

// Export event types for use in other services
export const USER_EVENTS = {
  REGISTERED: 'user.registered',
  PROFILE_UPDATED: 'user.profile_updated',
  DEACTIVATED: 'user.deactivated',
  REACTIVATED: 'user.reactivated',
  ROLE_CHANGED: 'user.role_changed'
} as const;