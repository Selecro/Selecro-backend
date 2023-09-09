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
  getModelSchemaRef,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import * as dotenv from 'dotenv';
import * as isEmail from 'isemail';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import {Instruction, InstructionRelations, Language, User} from '../models';
import {
  InstructionRepository,
  StepRepository,
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
  ): Promise<{token: string; tokenKMS: string}> {
    const user = await this.userService.verifyCredentials(credentials);
    const userProfile = this.userService.convertToUserProfile(user);
    const existingUser = await this.userRepository.findOne({
      where: {or: [{email: credentials.email}, {username: credentials.email}]},
    });
    if (!existingUser?.emailVerified) {
      throw new HttpErrors.UnprocessableEntity('email is not verified');
    }
    const token = await this.jwtService.generateToken(userProfile);
    const tokenKMS = await this.vaultService.authenticate(
      String(existingUser.id),
      credentials.password,
    );
    return {token, tokenKMS};
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
              wrappedDEK: {type: 'string'},
              kekSalt: {type: 'string'},
              initializationVector: {type: 'string'},
            },
            required: [
              'email',
              'username',
              'password0',
              'password1',
              'language',
              'wrappedDEK',
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
    await this.vaultService.createUser(
      String(credentials.id),
      credentials.password0,
    );
    const tokenKMS = await this.vaultService.authenticate(
      String(credentials.id),
      credentials.password0,
    );
    const newUser = new User({
      email: credentials.email,
      username: credentials.username,
      passwordHash: hashedPassword,
      wrappedDEK: credentials.wrappedDEK.toString('base64'),
      kekSalt: credentials.kekSalt,
      initializationVector: credentials.initializationVector.toString('base64'),
      language: credentials.language,
    });
    const dbUser = await this.userRepository.create(newUser);
    await this.emailService.sendRegistrationEmail(dbUser);
    return tokenKMS;
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
      await this.vaultService.updatePassword(String(user.id), request.password0);
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
      'id' | 'passwordHash' | 'initializationVector' | 'kekSalt' | 'deleteHash'
    >
  > {
    const user = await this.userRepository.findById(this.user.id, {
      fields: {
        id: false,
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
    await this.vaultService.deleteUser(String(user.id));
    if (user.deleteHash) {
      await this.imgurService.deleteImage(user.deleteHash);
    }
    await this.userRepository.deleteById(this.user.id);
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

  @get('/public-instructions', {
    responses: {
      '200': {
        description: 'Get public instructions',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Instruction)
          },
        },
      },
    },
  })
  async getPublicInstructions(): Promise<(Instruction & InstructionRelations)[]> {
    const data = await this.instructionRepository.find({
      where: {
        private: false,
      },
      include: [
        {
          relation: 'steps',
        },
      ],
    });
    return data;
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
                username: {type: 'string'},
                link: {type: 'string'},
              },
            },
          },
        },
      },
    },
  })
  async getUsers(): Promise<{username: string; link: string | null | undefined;}[]> {
    const users = await this.userRepository.find();
    const usernamesAndLinks = users.map(user => ({
      username: user.username,
      link: user.link,
    }));
    return usernamesAndLinks;
  }
}
