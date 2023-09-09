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
  @post('/users/{id}//follow/{followeeId}')
  async followUser(
    @param.path.number('followeeId') followeeId: number,
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
  @del('/users/{id}//unfollow/{followeeId}')
  async unfollowUser(
    @param.path.number('followeeId') followeeId: number,
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

  @get('/users/{id}/followers')
  async getFollowers(
    @param.path.number('id') userId: number,
    @param.query.number('limit') limit: number = 10,
    @param.query.number('offset') offset: number = 0,
  ): Promise<User[]> {
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
    });
    return followers;
  }

  @get('/users/{id}/following')
  async getFollowing(
    @param.path.number('id') userId: number,
    @param.query.number('limit') limit: number = 10,
    @param.query.number('offset') offset: number = 0,
  ): Promise<User[]> {
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
    });
    return following;
  }
}
