import {authenticate} from '@loopback/authentication';
import {
  Credentials,
  JWTService,
  TokenObject,
  UserCredentials,
} from '@loopback/authentication-jwt';
import {inject} from '@loopback/context';
import {Count, repository} from '@loopback/repository';
import {
  HttpErrors,
  Request,
  Response,
  RestBindings,
  del,
  get,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import * as dotenv from 'dotenv';
import * as isEmail from 'isemail';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import {Difficulty, Instruction, Language, User} from '../models';
import {
  InstructionRepository,
  StepRepository,
  UserLinkRepository,
  UserRepository,
} from '../repositories';
import {
  BcryptHasher,
  EmailService,
  ImgurService,
  MyUserService,
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
    @inject('services.imgur')
    public imgurService: ImgurService,
    @inject('services.vault')
    public vaultService: VaultService,
    @repository(UserRepository) protected userRepository: UserRepository,
    @repository(InstructionRepository)
    protected instructionRepository: InstructionRepository,
    @repository(StepRepository) public stepRepository: StepRepository,
    @repository(UserLinkRepository)
    public userLinkRepository: UserLinkRepository,
  ) {}

  @post('/login', {
    responses: {
      '200': {
        description: 'Login',
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
      description: 'Login',
      required: true,
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
      throw new HttpErrors.UnprocessableEntity('Email is not verified');
    }
    const token = await this.jwtService.generateToken(userProfile);
    return {
      token: token,
    };
  }

  @post('/refresh-token', {
    responses: {
      '200': {
        description: 'Refresh token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {type: 'string'},
              },
            },
          },
        },
      },
    },
  })
  async refreshToken(
    @requestBody({
      description: 'Refresh token',
      required: true,
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
    requestBodyRefreshToken: {
      refreshToken: string;
    },
  ): Promise<TokenObject> {
    try {
      const {refreshToken} = requestBodyRefreshToken;
      if (!refreshToken) {
        throw new HttpErrors.Unauthorized(
          'Error verifying token: refresh token is null',
        );
      }
      const userRefreshData = await this.jwtService.verifyToken(refreshToken);
      const user = await this.userRepository.findById(userRefreshData.userId);
      const userProfile: UserProfile =
        this.userService.convertToUserProfile(user);
      const token = await this.jwtService.generateToken(userProfile);
      return {
        accessToken: token,
      };
    } catch (error) {
      await this.emailService.sendError('Error verifying token: ' + error);
      throw new HttpErrors.Unauthorized('Error verifying token');
    }
  }

  @post('/signup', {
    responses: {
      '200': {
        description: 'Signup',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {type: 'string'},
                userId: {type: 'string'},
              },
            },
          },
        },
      },
    },
  })
  async signup(
    @requestBody({
      description: 'Signup',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              email: {type: 'string'},
              username: {type: 'string'},
              password0: {type: 'string'},
              password1: {type: 'string'},
              language: {enum: Object.values(Language)},
              darkmode: {type: 'boolean'},
              kekSalt: {type: 'string'},
              initializationVector: {type: 'string'},
            },
            required: [
              'email',
              'username',
              'password0',
              'password1',
              'language',
              'darkmode',
              'kekSalt',
              'initializationVector',
            ],
          },
        },
      },
    })
    credentials: UserCredentials,
  ): Promise<{token: string; userId: string}> {
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
        'User with this email or username already exists',
      );
    }
    const hashedPassword = await this.hasher.hashPassword(
      credentials.password0,
    );
    const newUser = new User({
      email: credentials.email,
      username: credentials.username,
      passwordHash: hashedPassword,
      wrappedDEK: 'null',
      kekSalt: credentials.kekSalt,
      initializationVector: credentials.initializationVector,
      language: credentials.language,
      darkmode: credentials.darkmode,
    });
    const dbUser = await this.userRepository.create(newUser);
    await this.vaultService.createUserPolicy(dbUser.id);
    await this.vaultService.createUser(dbUser.id, credentials.password0);
    await this.vaultService.createUserKey(dbUser.id);
    await this.emailService.sendRegistrationEmail(dbUser);
    const secret = process.env.JWT_SECRET_SIGNUP ?? '';
    const userId = dbUser.id;
    const token = jwt.sign({userId}, secret, {
      expiresIn: 60,
      algorithm: 'HS256',
    });
    return {token: token, userId: userId};
  }

  @post('/save-Wrapped-DEK', {
    responses: {
      '200': {
        description: 'Save wrapped DEK',
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
  async saveWrappedDEK(
    @requestBody({
      description: 'Save wrapped DEK',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              token: {type: 'string'},
              wrappedDEK: {type: 'string'},
            },
            required: ['token', 'wrappedDEK'],
          },
        },
      },
    })
    request: {
      token: string;
      wrappedDEK: string;
    },
  ): Promise<boolean> {
    interface DecodedToken {
      userId: string;
      iat: number;
      exp: number;
    }
    try {
      const {token} = request;
      const secret = process.env.JWT_SECRET_SIGNUP ?? '';
      const decodedToken = jwt.verify(token, secret) as DecodedToken;
      const {userId} = decodedToken;
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new HttpErrors.UnprocessableEntity('User not found');
      }
      if (user.wrappedDEK !== 'null') {
        throw new HttpErrors.UnprocessableEntity('DEK already saved');
      }
      await this.userRepository.updateById(user.id, {
        wrappedDEK: request.wrappedDEK,
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
        await this.emailService.sendError(
          'Failed to save wrapped DEK: ' + error,
        );
        throw new HttpErrors.UnprocessableEntity('Failed to save wrapped DEK');
      }
    }
  }

  @post('/verify-email', {
    responses: {
      '200': {
        description: 'Verify email',
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
      description: 'Verify email',
      required: true,
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
      userId: string;
      iat: number;
      exp: number;
    }
    try {
      const {token} = request;
      const secret = process.env.JWT_SECRET_EMAIL ?? '';
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
        await this.emailService.sendError(
          'Failed to update user email verification status: ' + error,
        );
        throw new HttpErrors.UnprocessableEntity(
          'Failed to update user email verification status',
        );
      }
    }
  }

  @post('/send-password-change', {
    responses: {
      '200': {
        description: 'Send password change',
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
      description: 'Send password change',
      required: true,
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
      return true;
    }
    await this.emailService.sendPasswordChange(user);
    return true;
  }

  @post('/password-change', {
    responses: {
      '200': {
        description: 'Password change',
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
      description: 'Password change',
      required: true,
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
      userData: string;
      iat: number;
      exp: number;
    }
    try {
      const secret = process.env.JWT_SECRET_EMAIL ?? '';
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
      await this.vaultService.updatePassword(user.id, request.password0);
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
        await this.emailService.sendError(
          'Failed to update user password: ' + error,
        );
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
                id: {type: 'string'},
                email: {type: 'string'},
                username: {type: 'string'},
                wrappedDEK: {type: 'string'},
                initializationVector: {type: 'string'},
                kekSalt: {type: 'string'},
                language: {enum: Object.values(Language)},
                darkmode: {type: 'boolean'},
                date: {type: 'string'},
                nick: {type: 'string'},
                bio: {type: 'string'},
                link: {type: 'string'},
                favorites: {
                  type: 'array',
                  items: {
                    type: 'number',
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  async getUser(): Promise<Omit<User, 'passwordHash' | 'deleteHash'>> {
    const user = await this.userRepository.findById(this.user.id, {
      fields: {
        passwordHash: false,
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
      description: 'Update user',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              email: {type: 'string'},
              username: {type: 'string'},
              language: {enum: Object.values(Language)},
              darkmode: {type: 'boolean'},
              nick: {type: 'string'},
              bio: {type: 'string'},
              favorites: {
                type: 'array',
                items: {
                  type: 'number',
                },
              },
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
        throw new HttpErrors.UnprocessableEntity('Invalid email');
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
  @del('/users/{id}/{password}', {
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
    @param.path.password('password') password: string,
  ): Promise<boolean> {
    const userOriginal = await this.userRepository.findById(this.user.id);
    if (!userOriginal) {
      throw new HttpErrors.NotFound('User not found');
    }
    const passwordMatched = await this.hasher.comparePassword(
      password,
      userOriginal.passwordHash,
    );
    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized('Password is not valid');
    }
    await this.vaultService.deleteUserKey(userOriginal.id);
    await this.vaultService.deleteUser(userOriginal.id);
    await this.vaultService.deleteUserPolicy(userOriginal.id);
    if (userOriginal.deleteHash) {
      await this.imgurService.deleteImage(userOriginal.deleteHash);
    }
    await this.userRepository.deleteById(this.user.id);
    const userLinksToDelete = await this.userLinkRepository.find({
      where: {
        or: [{followerId: this.user.id}, {followeeId: this.user.id}],
      },
    });
    const userLinksToKeep = userLinksToDelete.filter(
      userLink => userLink.id !== this.user.id,
    );
    for (const userLink of userLinksToKeep) {
      await this.userLinkRepository.deleteById(userLink.id);
    }
    const instructionHashes = await this.instructionRepository.find({
      where: {
        and: [
          {
            deleteHash: {neq: ''},
            userId: this.user.id,
          },
        ],
      },
    });
    const userInstructionHashes = instructionHashes.map(
      instruction => instruction.deleteHash,
    );
    for (const hash in userInstructionHashes) {
      await this.imgurService.deleteImage(hash);
    }
    const InstructionIDs = instructionHashes.map(
      instructions => instructions.id,
    );
    for (const InstructionID of InstructionIDs) {
      const deleteHashs = await this.stepRepository.find({
        where: {
          and: [
            {
              deleteHash: {neq: ''},
              instructionId: InstructionID,
            },
          ],
        },
        fields: {deleteHash: true},
      });
      const hashes = deleteHashs.map(step => step.deleteHash);
      for (const hash in hashes) {
        await this.imgurService.deleteImage(hash);
      }
    }
    const instructions = await this.instructionRepository.find({
      fields: {userId: this.user.id},
    });
    await this.instructionRepository.deleteAll({userId: this.user.id});
    for (const instruction of instructions) {
      await this.stepRepository.deleteAll({instructionId: instruction.id});
      const users = await this.userRepository.find();
      for (const user of users) {
        user.favorites = user.favorites?.filter(
          favorite => favorite !== instruction.id,
        );
        await this.userRepository.updateById(user.id, user);
      }
    }
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
      description: 'Update profile picture',
      required: true,
      content: {
        'multipart/form-data': {
          'x-parser': 'stream',
          schema: {
            type: 'object',
            properties: {
              image: {type: 'string', format: 'binary'},
            },
          },
        },
      },
    })
    request: Request,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ): Promise<string> {
    const user = await this.userRepository.findById(this.user.id);
    if (!user) {
      throw new HttpErrors.NotFound('User not found');
    }
    if (user.deleteHash) {
      await this.imgurService.deleteImage(user.deleteHash);
    }
    const data = await this.imgurService.savePicture(request, response);
    await this.userRepository.updateById(user.id, {
      link: data.link,
      deleteHash: data.deletehash,
    });
    return data.link;
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
    await this.imgurService.deleteImage(user.deleteHash);
    await this.userRepository.updateById(user.id, {
      link: null,
      deleteHash: null,
    });
    return true;
  }

  @get('/users', {
    responses: {
      '200': {
        description: 'Get users',
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
  async getUsers(
    @param.query.number('limit') limit: number = 10,
    @param.query.number('offset') offset: number = 0,
  ): Promise<
    {id: string; username: string; link: string | null | undefined}[]
  > {
    const users = await this.userRepository.find({
      limit,
      skip: offset,
    });
    const usernamesAndLinks = users.map(user => ({
      id: user.id,
      username: user.username,
      link: user.link,
    }));
    return usernamesAndLinks;
  }

  @get('/user-detail/{userId}', {
    responses: {
      '200': {
        description: 'Get user detail',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                id: {type: 'string'},
                username: {type: 'string'},
                nick: {type: 'string'},
                bio: {type: 'string'},
                link: {type: 'string'},
                followerCount: {type: 'number'},
                followeeCount: {type: 'number'},
                instructions: {
                  type: 'object',
                  items: {
                    id: {type: 'string'},
                    titleCz: {type: 'string'},
                    titleEn: {type: 'string'},
                    difficulty: {enum: Object.values(Difficulty)},
                    link: {type: 'string'},
                    private: {type: 'boolean'},
                    premium: {type: 'boolean'},
                    date: {type: 'string'},
                    steps: {
                      type: 'object',
                      items: {
                        id: {type: 'number'},
                        titleCz: {type: 'string'},
                        titleEn: {type: 'string'},
                        descriptionCz: {
                          type: 'array',
                          items: {
                            type: 'string',
                          },
                        },
                        descriptionEn: {
                          type: 'array',
                          items: {
                            type: 'string',
                          },
                        },
                        link: {type: 'string'},
                      },
                    },
                  },
                },
                instructionsPremium: {
                  type: 'object',
                  items: {
                    id: {type: 'string'},
                    titleCz: {type: 'string'},
                    titleEn: {type: 'string'},
                    difficulty: {enum: Object.values(Difficulty)},
                    link: {type: 'string'},
                    private: {type: 'boolean'},
                    premium: {type: 'boolean'},
                    date: {type: 'string'},
                  },
                },
                instructionCount: {type: 'number'},
              },
            },
          },
        },
      },
    },
  })
  async getUserDetail(
    @param.path.string('userId') userId: string,
    @param.query.number('limit') limit: number = 10,
    @param.query.number('offset') offset: number = 0,
  ): Promise<{
    user: Omit<
      User,
      | 'email'
      | 'passwordHash'
      | 'wrappedDEK'
      | 'initializationVector'
      | 'kekSalt'
      | 'language'
      | 'darkmode'
      | 'emailVerified'
      | 'date'
      | 'deleteHash'
      | 'favorites'
    >;
    followerCount: Count;
    followeeCount: Count;
    instructions: Omit<Instruction, 'deleteHash'>[] | null;
    instructionsPremium: Omit<Instruction, 'deleteHash'>[] | null;
    instructionCount: Count;
  }> {
    const user = await this.userRepository.findById(userId, {
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
        deleteHash: false,
        favorites: false,
      },
    });
    if (!user) {
      throw new HttpErrors.NotFound('User not found');
    }
    const instructions = await this.instructionRepository.find({
      limit,
      skip: offset,
      where: {
        userId: userId,
        private: false,
        premium: false,
      },
      include: [
        {
          relation: 'steps',
          scope: {
            fields: {
              deleteHash: false,
            },
          },
        },
      ],
    });
    const instructionsPremium = await this.instructionRepository.find({
      where: {
        userId: userId,
        private: false,
        premium: true,
      },
    });
    const instructionCount = await this.instructionRepository.count({
      userId: userId,
    });
    const followerCount = await this.userLinkRepository.count({
      followerId: userId,
    });
    const followeeCount = await this.userLinkRepository.count({
      followeeId: userId,
    });
    return {
      user,
      followerCount,
      followeeCount,
      instructions,
      instructionsPremium,
      instructionCount,
    };
  }
}
