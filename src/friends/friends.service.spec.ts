import { Test, TestingModule } from '@nestjs/testing';
import { FriendsService } from './friends.service';
import {
  UserRepository,
  FriendRequestsRepository,
  FriendsRepository,
} from '../repositories';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { FRIEND_REQUESTS_ACTION, FRIEND_REQUESTS_STATUS } from './constants';
import { IFriendRequest } from '../interfaces';

describe('FriendsService', () => {
  let service: FriendsService;
  let userRepository: UserRepository;
  let friendRequestsRepository: FriendRequestsRepository;
  let friendsRepository: FriendsRepository;

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    first_name: 'John',
    last_name: 'Doe',
    age: 25,
    email: 'john@example.com',
    password: 'hashedPassword',
  };

  const mockReceiver = {
    id: '987fcdeb-a89b-12d3-a456-426614174000',
    first_name: 'Jane',
    last_name: 'Smith',
    age: 23,
    email: 'jane@example.com',
    password: 'hashedPassword',
  };

  const mockFriendRequest: IFriendRequest = {
    id: '456e4567-e89b-12d3-a456-426614174000',
    sender_id: mockUser.id,
    receiver_id: mockReceiver.id,
    status: FRIEND_REQUESTS_STATUS.PENDING,
  };

  const mockUserRepository = {
    findById: jest.fn(),
  };

  const mockFriendRequestsRepository = {
    findByQuery: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    getRequestsWithSenderDetails: jest.fn(),
  };

  const mockFriendsRepository = {
    create: jest.fn(),
    checkFriendshipStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendsService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: FriendRequestsRepository,
          useValue: mockFriendRequestsRepository,
        },
        {
          provide: FriendsRepository,
          useValue: mockFriendsRepository,
        },
      ],
    }).compile();

    service = module.get<FriendsService>(FriendsService);
    userRepository = module.get<UserRepository>(UserRepository);
    friendRequestsRepository = module.get<FriendRequestsRepository>(
      FriendRequestsRepository,
    );
    friendsRepository = module.get<FriendsRepository>(FriendsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendFriendRequest', () => {
    it('should create a friend request when valid data is provided', async () => {
      mockUserRepository.findById.mockResolvedValue(mockReceiver);
      mockFriendsRepository.checkFriendshipStatus.mockResolvedValue(false);
      mockFriendRequestsRepository.findByQuery.mockResolvedValue([]);

      await service.sendFriendRequest(mockReceiver.id, mockUser.id);

      expect(mockFriendRequestsRepository.create).toHaveBeenCalledWith({
        sender_id: mockUser.id,
        receiver_id: mockReceiver.id,
        status: FRIEND_REQUESTS_STATUS.PENDING,
      });
    });

    it('should throw ConflictException when trying to send request to yourself', async () => {
      await expect(
        service.sendFriendRequest(mockUser.id, mockUser.id),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when receiver does not exist', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(
        service.sendFriendRequest('non-existent-id', mockUser.id),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when users are already friends', async () => {
      mockUserRepository.findById.mockResolvedValue(mockReceiver);
      mockFriendsRepository.checkFriendshipStatus.mockResolvedValue(true);

      await expect(
        service.sendFriendRequest(mockReceiver.id, mockUser.id),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when friend request already exists', async () => {
      mockUserRepository.findById.mockResolvedValue(mockReceiver);
      mockFriendsRepository.checkFriendshipStatus.mockResolvedValue(false);
      mockFriendRequestsRepository.findByQuery.mockResolvedValue([
        mockFriendRequest,
      ]);

      await expect(
        service.sendFriendRequest(mockReceiver.id, mockUser.id),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getRequestsList', () => {
    it('should return list of pending friend requests', async () => {
      const mockRequests = [mockFriendRequest];
      mockFriendRequestsRepository.getRequestsWithSenderDetails.mockResolvedValue(
        mockRequests,
      );

      const result = await service.getRequestsList(mockReceiver.id);

      expect(result).toEqual(mockRequests);
      expect(
        mockFriendRequestsRepository.getRequestsWithSenderDetails,
      ).toHaveBeenCalledWith(mockReceiver.id);
    });
  });

  describe('updateRequestByAction', () => {
    it('should accept friend request and create friendship', async () => {
      mockFriendRequestsRepository.findByQuery.mockResolvedValue([
        mockFriendRequest,
      ]);
      mockFriendRequestsRepository.update.mockResolvedValue({
        ...mockFriendRequest,
        status: FRIEND_REQUESTS_STATUS.ACCEPTED,
      });

      await service.updateRequestByAction(
        mockFriendRequest.id,
        mockReceiver.id,
        FRIEND_REQUESTS_ACTION.ACCEPT,
      );

      expect(mockFriendRequestsRepository.update).toHaveBeenCalledWith(
        mockFriendRequest.id,
        {
          status: FRIEND_REQUESTS_STATUS.ACCEPTED,
        },
      );
      expect(mockFriendsRepository.create).toHaveBeenCalledWith({
        user_id_1: mockFriendRequest.sender_id,
        user_id_2: mockFriendRequest.receiver_id,
      });
    });

    it('should decline friend request', async () => {
      mockFriendRequestsRepository.findByQuery.mockResolvedValue([
        mockFriendRequest,
      ]);
      mockFriendRequestsRepository.update.mockResolvedValue({
        ...mockFriendRequest,
        status: FRIEND_REQUESTS_STATUS.DECLINED,
      });

      await service.updateRequestByAction(
        mockFriendRequest.id,
        mockReceiver.id,
        FRIEND_REQUESTS_ACTION.DECLINE,
      );

      expect(mockFriendRequestsRepository.update).toHaveBeenCalledWith(
        mockFriendRequest.id,
        {
          status: FRIEND_REQUESTS_STATUS.DECLINED,
        },
      );
      expect(mockFriendsRepository.create).toHaveBeenCalledWith({
        user_id_1: mockFriendRequest.sender_id,
        user_id_2: mockFriendRequest.receiver_id,
      });
    });

    it('should throw BadRequestException when request is not found or not pending', async () => {
      mockFriendRequestsRepository.findByQuery.mockResolvedValue([]);

      await expect(
        service.updateRequestByAction(
          mockFriendRequest.id,
          mockReceiver.id,
          FRIEND_REQUESTS_ACTION.ACCEPT,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when invalid action is provided', async () => {
      mockFriendRequestsRepository.findByQuery.mockResolvedValue([
        mockFriendRequest,
      ]);

      await expect(
        service.updateRequestByAction(
          mockFriendRequest.id,
          mockReceiver.id,
          'invalid-action' as FRIEND_REQUESTS_ACTION,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
