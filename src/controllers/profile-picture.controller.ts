import {authenticate} from '@loopback/authentication';
import {
  JWTService
} from '@loopback/authentication-jwt';
import {inject} from '@loopback/context';
import {repository} from '@loopback/repository';
import {
  HttpErrors,
  del,
  patch,
  requestBody
} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {UserRepository} from '../repositories';

export class ProfilePictureController {
  constructor(
    @inject('services.jwt.service')
    public jwtService: JWTService,
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @repository(UserRepository) public userRepository: UserRepository,
  ) { }

  @authenticate('jwt')
  @patch('/users/{id}/profile-picture', {
    responses: {
      '200': {
        description: 'Update profile picture',
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
  async uploadProfilePicture(
    @requestBody.file() profilePicture: Request,
  ): Promise<boolean> {
    const user = await this.userRepository.findById(this.user.id);
    if (!user) {
      throw new HttpErrors.NotFound('User not found');
    }
    return true;
  }

  @authenticate('jwt')
  @del('/users/{id}/profile-picture', {
    responses: {
      '200': {
        description: 'Delete profile picture',
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
  async deleteProfilePicture(): Promise<boolean> {
    const user = await this.userRepository.findById(this.user.id);
    if (!user) {
      throw new HttpErrors.NotFound('User not found');
    }
    return true;
  }
}
