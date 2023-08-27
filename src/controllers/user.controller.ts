import {authenticate} from '@loopback/authentication';
import {
  Credentials,
  JWTService,
  UserCredentials,
} from '@loopback/authentication-jwt';
import {inject} from '@loopback/context';
import {repository} from '@loopback/repository';
import {
  HttpErrors,
  Request,
  Response,
  RestBindings,
  del,
  get,
  patch,
  post,
  requestBody
} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import * as isEmail from 'isemail';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import {Language, User} from '../models';
import {UserRepository} from '../repositories';
import {
  BcryptHasher,
  EmailService,
  MyUserService,
  PictureService,
  VaultService,
  validateCredentials,
} from '../services';
dotenv.config();

export class UserController {
  constructor(
    @inject('services.jwt.service')
    public jwtService: JWTService,
    @inject('services.user.service')
    public userService: MyUserService,
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @inject('services.hasher')
    public hasher: BcryptHasher,
    @inject('services.email')
    public emailService: EmailService,
    @inject('services.picture')
    public pictureService: PictureService,
    @inject('services.vault')
    public vaultService: VaultService,
    @repository(UserRepository) public userRepository: UserRepository,
  ) { }

  @post('/login', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              email: {type: 'string'},
              password: {type: 'string'},
            },
            required: ['email', 'password'],
          },
        },
      },
    })
    credentials: Credentials,
  ): Promise<{token: string}> {
    const user = await this.userService.verifyCredentials(credentials);
    const userProfile = this.userService.convertToUserProfile(user);
    const existingUser = await this.userRepository.findOne({
      where: {or: [{email: credentials.email}, {username: credentials.email}]},
    });
    if (!existingUser?.emailVerified) {
      throw new HttpErrors.UnprocessableEntity('email is not verified');
    }
    const token = await this.jwtService.generateToken(userProfile);
    return {token};
  }

  @post('/signup', {
    responses: {
      '200': {
        description: 'Signup',
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
  async signup(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              email: {type: 'string'},
              username: {type: 'string'},
              password0: {type: 'string'},
              password1: {type: 'string'},
              language: {type: 'string', enum: Object.values(Language)},
            },
            required: [
              'email',
              'username',
              'password0',
              'password1',
              'language',
            ],
          },
        },
      },
    })
    credentials: UserCredentials,
  ): Promise<boolean> {
    validateCredentials(
      _.pick(credentials, ['email', 'password0', 'password1', 'username']),
    );
    const existingUser = await this.userRepository.findOne({
      where: {
        or: [{email: credentials.email}, {username: credentials.username}],
      },
    });
    if (existingUser) {
      throw new HttpErrors.BadRequest(
        'User with this email or username already exists.',
      );
    }
    const hashedPassword = await this.hasher.hashPassword(
      credentials.password0,
    );
    const dek = crypto.randomBytes(32);
    const kekSalt = crypto.randomBytes(16).toString('base64');
    const kek = crypto.pbkdf2Sync(
      credentials.password0,
      kekSalt,
      100000,
      32,
      'sha512',
    );
    const initializationVector = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      kek,
      initializationVector,
    );
    const wrappedDEK = Buffer.concat([cipher.update(dek), cipher.final()]);
    const newUser = new User({
      email: credentials.email,
      username: credentials.username,
      passwordHash: hashedPassword,
      wrappedDEK: wrappedDEK.toString('base64'),
      kekSalt: kekSalt,
      initializationVector: initializationVector.toString('base64'),
      language: credentials.language,
    });
    const userKek = {
      key: kek.toString('base64'),
    };
    const userDek = {
      key: dek.toString('base64'),
    };
    await this.vaultService.write(credentials.username + '/userkek', {
      data: userKek,
    });
    await this.vaultService.write(credentials.username + '/userdek', {
      data: userDek,
    });
    const dbUser = await this.userRepository.create(newUser);
    await this.emailService.sendRegistrationEmail(dbUser);
    return true;
  }

  @post('/verify-email', {
    responses: {
      '200': {
        description: 'Verify',
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
  async verifyEmail(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              token: {type: 'string'},
            },
            required: ['token'],
          },
        },
      },
    })
    request: {
      token: string;
    },
  ): Promise<boolean> {
    interface DecodedToken {
      userId: number;
      iat: number;
      exp: number;
    }
    try {
      const {token} = request;
      const secret = process.env.JWT_SECRET ?? '';
      const decodedToken = jwt.verify(token, secret) as DecodedToken;
      const {userId} = decodedToken;
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new HttpErrors.UnprocessableEntity('User not found');
      }
      await this.userRepository.updateById(user.id, {emailVerified: true});
      return true;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new HttpErrors.UnprocessableEntity(
          'Verification token has expired',
        );
      } else if (error.name === 'JsonWebTokenError') {
        throw new HttpErrors.UnprocessableEntity('Invalid verification token');
      } else {
        throw new HttpErrors.UnprocessableEntity(
          'Failed to update user email verification status',
        );
      }
    }
  }

  @post('/send-password-change', {
    responses: {
      '200': {
        description: 'Verify',
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
  async sendPasswordChange(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              email: {type: 'string'},
            },
            required: ['email'],
          },
        },
      },
    })
    request: {
      email: string;
    },
  ): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: {
        email: request.email,
      },
    });
    if (!user) {
      throw new HttpErrors.UnprocessableEntity('email not recognized');
    }
    await this.emailService.sendPasswordChange(user);
    return true;
  }

  @post('/password-change', {
    responses: {
      '200': {
        description: 'Verify',
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
  async changePassword(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              token: {type: 'string'},
              password0: {type: 'string'},
              password1: {type: 'string'},
            },
            required: ['token', 'password0', 'password1'],
          },
        },
      },
    })
    request: {
      token: string;
      password0: string;
      password1: string;
    },
  ): Promise<boolean> {
    interface DecodedToken {
      userData: number;
      iat: number;
      exp: number;
    }
    try {
      const secret = process.env.JWT_SECRET ?? '';
      const decodedToken = jwt.verify(request.token, secret) as DecodedToken;
      const {userData} = decodedToken;
      const user = await this.userRepository.findById(userData);
      if (!user) {
        throw new HttpErrors.UnprocessableEntity('User not found');
      }
      if (request.password0 !== request.password1) {
        throw new HttpErrors.UnprocessableEntity('Passwords are not matching');
      }
      await this.emailService.sendSuccessfulyPasswordChange(user);
      await this.userRepository.updateById(user.id, {
        passwordHash: await this.hasher.hashPassword(request.password0),
      });
      return true;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new HttpErrors.UnprocessableEntity(
          'Verification token has expired',
        );
      } else if (error.name === 'JsonWebTokenError') {
        throw new HttpErrors.UnprocessableEntity('Invalid verification token');
      } else {
        throw new HttpErrors.UnprocessableEntity('Failed to change password');
      }
    }
  }

  @authenticate('jwt')
  @get('/users/{id}', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                email: {type: 'string'},
                username: {type: 'string'},
                language: {type: 'string'},
                darkmode: {type: 'string'},
                emailVerified: {type: 'string'},
                date: {type: 'string'},
                nick: {type: 'string'},
                bio: {type: 'string'},
                link: {type: 'string'},
              },
            },
          },
        },
      },
    },
  })
  async getUser(): Promise<
    Omit<
      User,
      'id' | 'passwordHash' | 'wrappedDEK' | 'initializationVector' | 'kekSalt' | 'deleteHash'
    >
  > {
    const user = await this.userRepository.findById(this.user.id, {
      fields: {
        id: false,
        passwordHash: false,
        wrappedDEK: false,
        initializationVector: false,
        kekSalt: false,
        deleteHash: false,
      },
    });
    if (!user) {
      throw new HttpErrors.NotFound('User not found');
    }
    return user;
  }

  @authenticate('jwt')
  @patch('/users/{id}', {
    responses: {
      '200': {
        description: 'Update user',
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
  async patchUser(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              email: {type: 'string'},
              username: {type: 'string'},
              language: {$ref: '#/components/schemas/Language'},
              darkmode: {type: 'boolean'},
              nick: {type: 'string'},
              bio: {type: 'string'},
            },
          },
        },
      },
    })
    user: Partial<User>,
  ): Promise<boolean> {
    const userOriginal = await this.userRepository.findById(this.user.id);
    if (!user) {
      throw new HttpErrors.NotFound('User not found');
    }
    if (user.email && user.email !== user.email) {
      if (!isEmail.validate(user.email)) {
        throw new HttpErrors.UnprocessableEntity('invalid email');
      }
      await this.emailService.sendResetEmail(userOriginal, user.email);
      await this.userRepository.updateById(this.user.id, {
        emailVerified: false,
      });
    }
    await this.userRepository.updateById(this.user.id, user);
    return true;
  }

  @authenticate('jwt')
  @del('/users/{id}', {
    responses: {
      '200': {
        description: 'Delete user',
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
  async deleteUser(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              password: {type: 'string'},
            },
            required: ['password'],
          },
        },
      },
    })
    request: {
      password: string;
    },
  ): Promise<boolean> {
    const user = await this.userRepository.findById(this.user.id);
    if (!user) {
      throw new HttpErrors.NotFound('User not found');
    }
    const passwordMatched = await this.hasher.comparePassword(
      request.password,
      user.passwordHash,
    );
    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized('password is not valid');
    }
    await this.userRepository.deleteById(this.user.id);
    return true;
  }

  @authenticate('jwt')
  @post('/users/{id}/profile-picture', {
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
    @requestBody({
      content: {
        'multipart/form-data': {
          'x-parser': 'stream',
          schema: {
            type: 'object',
            properties: {
              image: {type: 'string', format: 'binary'},
            },
            required: ['image'],
          },
        },
      },
    })
    request: Request,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ): Promise<boolean> {
    const user = await this.userRepository.findById(this.user.id);
    if (!user) {
      throw new HttpErrors.NotFound('User not found');
    }
    if (user.deleteHash) {
      await this.pictureService.deleteProfilePicture(user.deleteHash);
    }
    const data = await this.pictureService.saveProfilePicture(request, response);
    await this.userRepository.updateById(this.user.id, {link: data.link, deleteHash: data.deletehash});
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
    if (!user.deleteHash) {
      throw new HttpErrors.NotFound('Users profile picture does not exist');
    }
    await this.pictureService.deleteProfilePicture(user.deleteHash);
    await this.userRepository.updateById(this.user.id, {link: null, deleteHash: null});
    return true;
  }
}
