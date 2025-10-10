import { UserEventPublisher } from '../../../src/events/publisher';
import { publishEvent } from '../../../src/config/rabbitmq';

// Mock the RabbitMQ configuration
jest.mock('../../../src/config/rabbitmq', () => ({
  publishEvent: jest.fn()
}));

const mockPublishEvent = publishEvent as jest.MockedFunction<typeof publishEvent>;

describe('UserEventPublisher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('publishUserRegistered', () => {
    it('should publish user registration event with correct data', async () => {
      const userData = {
        userId: 'user_123',
        email: 'test@example.com',
        role: 'STUDENT',
        firstName: 'John',
        lastName: 'Doe'
      };

      await UserEventPublisher.publishUserRegistered(userData);

      expect(mockPublishEvent).toHaveBeenCalledWith('user.registered', {
        type: 'user.registered',
        ...userData,
        timestamp: expect.any(Date)
      });
    });

    it('should handle optional fields correctly', async () => {
      const userData = {
        userId: 'user_456',
        email: 'student@example.com',
        role: 'STUDENT'
      };

      await UserEventPublisher.publishUserRegistered(userData);

      expect(mockPublishEvent).toHaveBeenCalledWith('user.registered', {
        type: 'user.registered',
        ...userData,
        timestamp: expect.any(Date)
      });
    });
  });

  describe('publishUserProfileUpdated', () => {
    it('should publish profile update event with changes', async () => {
      const updateData = {
        userId: 'user_123',
        email: 'test@example.com',
        changes: {
          firstName: 'Jane',
          lastName: 'Smith',
          profilePicture: 'new-avatar.jpg'
        }
      };

      await UserEventPublisher.publishUserProfileUpdated(updateData);

      expect(mockPublishEvent).toHaveBeenCalledWith('user.profile_updated', {
        type: 'user.profile_updated',
        ...updateData,
        timestamp: expect.any(Date)
      });
    });
  });

  describe('publishUserDeactivated', () => {
    it('should publish user deactivation event', async () => {
      const userData = {
        userId: 'user_789',
        email: 'deactivated@example.com'
      };

      await UserEventPublisher.publishUserDeactivated(userData);

      expect(mockPublishEvent).toHaveBeenCalledWith('user.deactivated', {
        type: 'user.deactivated',
        ...userData,
        timestamp: expect.any(Date)
      });
    });
  });

  describe('publishUserReactivated', () => {
    it('should publish user reactivation event', async () => {
      const userData = {
        userId: 'user_789',
        email: 'reactivated@example.com'
      };

      await UserEventPublisher.publishUserReactivated(userData);

      expect(mockPublishEvent).toHaveBeenCalledWith('user.reactivated', {
        type: 'user.reactivated',
        ...userData,
        timestamp: expect.any(Date)
      });
    });
  });

  describe('publishUserRoleChanged', () => {
    it('should publish role change event', async () => {
      const roleChangeData = {
        userId: 'user_123',
        email: 'test@example.com',
        oldRole: 'STUDENT',
        newRole: 'INSTRUCTOR'
      };

      await UserEventPublisher.publishUserRoleChanged(roleChangeData);

      expect(mockPublishEvent).toHaveBeenCalledWith('user.role_changed', {
        type: 'user.role_changed',
        ...roleChangeData,
        timestamp: expect.any(Date)
      });
    });
  });

  describe('error handling', () => {
    it('should handle event publishing failures gracefully', async () => {
      mockPublishEvent.mockRejectedValueOnce(new Error('RabbitMQ connection failed'));

      const userData = {
        userId: 'user_error',
        email: 'error@example.com',
        role: 'STUDENT'
      };

      // Should not throw an error
      await expect(UserEventPublisher.publishUserRegistered(userData)).resolves.toBeUndefined();
      
      expect(mockPublishEvent).toHaveBeenCalledWith('user.registered', {
        type: 'user.registered',
        ...userData,
        timestamp: expect.any(Date)
      });
    });
  });
});