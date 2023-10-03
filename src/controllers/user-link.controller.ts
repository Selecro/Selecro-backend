import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors, del, get, param, post} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {User} from '../models';
import {UserLinkRepository, UserRepository} from '../repositories';
import {JWTService} from '../services';

export class UserLinkController {
  constructor(
    @inject('services.jwt.service')
    public jwtService: JWTService,
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @repository(UserRepository) public userRepository: UserRepository,
    @repository(UserLinkRepository)
    public userLinkRepository: UserLinkRepository,
  ) {}

  @authenticate('jwt')
  @post('/users/{id}/follow/{followeeId}', {
    responses: {
      '200': {
        description: 'Follow User',
        content: {
          'application/json': {
            schema: {
              type: 'boolean',
            },
          },
        },
      },
    },
  })
  async followUser(
    @param.path.string('followeeId') followeeId: string,
  ): Promise<boolean> {
    const user = await this.userRepository.findById(this.user.id);
    if (!user) {
      throw new HttpErrors.NotFound('User not found');
    }
    const followee = await this.userRepository.findById(followeeId);
    if (!followee) {
      throw new Error('Followee not found');
    }
    await this.userLinkRepository.create({
      followerId: this.user.id,
      followeeId: followeeId,
    });
    return true;
  }

  @authenticate('jwt')
  @del('/users/{id}/unfollow/{followeeId}', {
    responses: {
      '200': {
        description: 'Unfollow User',
        content: {
          'application/json': {
            schema: {
              type: 'boolean',
            },
          },
        },
      },
    },
  })
  async unfollowUser(
    @param.path.string('followeeId') followeeId: string,
  ): Promise<boolean> {
    const user = await this.userRepository.findById(this.user.id);
    if (!user) {
      throw new HttpErrors.NotFound('User not found');
    }
    const followee = await this.userRepository.findById(followeeId);
    if (!followee) {
      throw new Error('Followee not found');
    }
    const userLink = await this.userLinkRepository.findOne({
      where: {
        followerId: this.user.id,
        followeeId: followeeId,
      },
    });
    if (userLink) {
      await this.userLinkRepository.deleteById(userLink.id);
    }
    return true;
  }

  @get('/users/{userId}/followers', {
    responses: {
      '200': {
        description: 'Get followers',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                id: {type: 'string'},
                username: {type: 'string'},
                link: {type: 'string'},
              },
            },
          },
        },
      },
    },
  })
  async getFollowers(
    @param.path.string('userId') userId: string,
    @param.query.number('limit') limit: number = 10,
    @param.query.number('offset') offset: number = 0,
  ): Promise<Partial<User[]>> {
    const userLinks = await this.userLinkRepository.find({
      where: {
        followeeId: userId,
      },
      limit,
      skip: offset,
    });
    const followerIds = userLinks.map(link => link.followerId);
    const followers = await this.userRepository.find({
      where: {
        id: {inq: followerIds},
      },
      fields: {
        email: false,
        passwordHash: false,
        wrappedDEK: false,
        initializationVector: false,
        kekSalt: false,
        language: false,
        darkmode: false,
        emailVerified: false,
        date: false,
        nick: false,
        bio: false,
        deleteHash: false,
        favorites: false,
      },
    });
    return followers;
  }

  @get('/users/{userId}/followees', {
    responses: {
      '200': {
        description: 'Get followees',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                id: {type: 'string'},
                username: {type: 'string'},
                link: {type: 'string'},
              },
            },
          },
        },
      },
    },
  })
  async getFollowees(
    @param.path.string('userId') userId: string,
    @param.query.number('limit') limit: number = 10,
    @param.query.number('offset') offset: number = 0,
  ): Promise<Partial<User[]>> {
    const userLinks = await this.userLinkRepository.find({
      where: {
        followerId: userId,
      },
      limit,
      skip: offset,
    });
    const followeeIds = userLinks.map(link => link.followeeId);
    const following = await this.userRepository.find({
      where: {
        id: {inq: followeeIds},
      },
      fields: {
        email: false,
        passwordHash: false,
        wrappedDEK: false,
        initializationVector: false,
        kekSalt: false,
        language: false,
        darkmode: false,
        emailVerified: false,
        date: false,
        nick: false,
        bio: false,
        deleteHash: false,
        favorites: false,
      },
    });
    return following;
  }
}
