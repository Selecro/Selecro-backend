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
  ): Promise<string> {
    const user = await this.userService.verifyCredentials(credentials);
    const userProfile = this.userService.convertToUserProfile(user);
    const existingUser = await this.userRepository.findOne({
      where: {or: [{email: credentials.email}, {username: credentials.email}]},
    });
    if (!existingUser?.emailVerified) {
      throw new HttpErrors.UnprocessableEntity('email is not verified');
    }
    const token = await this.jwtService.generateToken(userProfile);
    return token;
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
              language: {enum: Object.values(Language)},
              kekSalt: {type: 'string'},
              initializationVector: {type: 'string'},
            },
            required: [
              'email',
              'username',
              'password0',
              'password1',
              'language',
              'kekSalt',
              'initializationVector',
            ],
          },
        },
      },
    })
    credentials: UserCredentials,
  ): Promise<string> {
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
    const newUser = new User({
      email: credentials.email,
      username: credentials.username,
      passwordHash: hashedPassword,
      wrappedDEK: 'null',
      kekSalt: credentials.kekSalt,
      initializationVector: credentials.initializationVector.toString('base64'),
      language: credentials.language,
    });
    const dbUser = await this.userRepository.create(newUser);
    await this.vaultService.createUserPolicy(String(dbUser.id));
    await this.vaultService.createUser(
      String(dbUser.id),
      credentials.password0,
    );
    await this.vaultService.createUserKey(String(dbUser.id));
    await this.emailService.sendRegistrationEmail(dbUser);
    const secret = process.env.JWT_SECRET_SIGNUP ?? '';
    const userId = dbUser.id;
    const token = jwt.sign({userId}, secret, {
      expiresIn: 60,
      algorithm: 'HS256',
    });
    return token;
  }

  @post('/save-Wrapped-DEK', {
    responses: {
      '200': {
        description: 'Save Wrapped DEK',
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
      userId: number;
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
        throw new HttpErrors.UnprocessableEntity(
          'Failed to update user email verification status',
        );
      }
    }
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
      await this.vaultService.updatePassword(
        String(user.id),
        request.password0,
      );
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
                id: {type: 'number'},
                email: {type: 'string'},
                username: {type: 'string'},
                language: {enum: Object.values(Language)},
                darkmode: {type: 'string'},
                emailVerified: {type: 'string'},
                date: {type: 'string'},
                nick: {type: 'string'},
                bio: {type: 'string'},
                link: {type: 'string'},
                wrappedDEK: {type: 'string'},
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
  async getUser(): Promise<
    Omit<
      User,
      'passwordHash' | 'initializationVector' | 'kekSalt' | 'deleteHash'
    >
  > {
    const user = await this.userRepository.findById(this.user.id, {
      fields: {
        passwordHash: false,
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
    const userOriginal = await this.userRepository.findById(this.user.id);
    if (!userOriginal) {
      throw new HttpErrors.NotFound('User not found');
    }
    const passwordMatched = await this.hasher.comparePassword(
      request.password,
      userOriginal.passwordHash,
    );
    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized('Password is not valid');
    }
    await this.vaultService.deleteUser(String(userOriginal.id));
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
      await this.imgurService.deleteImage(user.deleteHash);
    }
    const data = await this.imgurService.savePicture(request, response);
    await this.userRepository.updateById(user.id, {
      link: data.link,
      deleteHash: data.deletehash,
    });
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
                id: {type: 'number'},
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
    {id: number; username: string; link: string | null | undefined}[]
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

  @get('/user-detail/{id}', {
    responses: {
      '200': {
        description: 'Get user detail',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                id: {type: 'number'},
                username: {type: 'string'},
                nick: {type: 'string'},
                bio: {type: 'string'},
                link: {type: 'string'},
                followerCount: {type: 'number'},
                followeeCount: {type: 'number'},
                instructions: {
                  type: 'object',
                  items: {
                    id: {type: 'number'},
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
              },
            },
          },
        },
      },
    },
  })
  async getUserDetail(@param.query.number('id') userId: number): Promise<{
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
    followerCount: number;
    followeeCount: number;
    instructions: Omit<Instruction, 'deleteHash'>[];
    instructionsPremium: Omit<Instruction, 'deleteHash'>[];
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
    const userForFollower = await this.userLinkRepository.find({
      where: {
        followerId: userId,
      },
    });
    const followerCount = userForFollower.length;
    const userForFollowee = await this.userLinkRepository.find({
      where: {
        followeeId: userId,
      },
    });
    const followeeCount = userForFollowee.length;
    return {
      user,
      followerCount,
      followeeCount,
      instructions,
      instructionsPremium,
    };
  }
}
