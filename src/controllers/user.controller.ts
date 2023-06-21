import {authenticate} from '@loopback/authentication';
import {JWTService} from '@loopback/authentication-jwt';
import {inject} from '@loopback/context';
import {model, property, repository} from '@loopback/repository';
import {
  HttpErrors,
  Request,
  Response,
  RestBindings,
  del,
  get,
  getModelSchemaRef,
  post,
  put,
  requestBody,
} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import * as dotenv from 'dotenv';
import * as isEmail from 'isemail';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import multer from 'multer';
import {config} from '../datasources/sftp.datasource';
import {Language, User} from '../models';
import {UserRepository} from '../repositories';
import {EmailService} from '../services/email';
import {BcryptHasher} from '../services/hash.password';
import {MyUserService} from '../services/user-service';
import {validateCredentials} from '../services/validator.service';
dotenv.config();
const Client = require('ssh2-sftp-client');
const sftp = new Client();

@model()
export class UserSingup {
  @property({
    type: 'string',
    required: true,
  })
  email: string;
  @property({
    type: 'string',
    required: true,
  })
  username: string;
  @property({
    type: 'string',
    required: true,
  })
  password: string;
  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: Object.values(Language),
    },
  })
  language: Language;
}

@model()
export class Credentials {
  @property({
    type: 'string',
    required: true,
  })
  email: string;
  @property({
    type: 'string',
    required: true,
  })
  passwordHash: string;
}

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
          schema: getModelSchemaRef(Credentials),
        },
      },
    })
    credentials: Credentials,
  ): Promise<{token: string}> {
    const user = await this.userService.verifyCredentials(credentials);
    const userProfile = this.userService.convertToUserProfile(user);
    const existedemail = await this.userRepository.findOne({
      where: {email: user.email},
    });
    const existedusername = await this.userRepository.findOne({
      where: {username: user.email},
    });
    if (existedemail?.emailVerified || existedusername?.emailVerified) {
      const token = await this.jwtService.generateToken(userProfile);
      return {token};
    } else {
      throw new HttpErrors.UnprocessableEntity('email is not verified');
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
                signup: {
                  type: 'boolean',
                },
              },
            },
          },
        },
      },
    },
  })
  async signUp(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserSingup),
        },
      },
    })
    userData: UserSingup,
  ): Promise<boolean> {
    validateCredentials(_.pick(userData, ['email', 'password', 'username']));
    const existedemail = await this.userRepository.findOne({
      where: {email: userData.email},
    });
    const existedusername = await this.userRepository.findOne({
      where: {username: userData.username},
    });
    if (!existedemail && !existedusername) {
      const user: User = new User(userData);
      user.passwordHash = await this.hasher.hashPassword(userData.password);
      const savedUser = await this.userRepository.create(
        _.omit(user, 'password'),
      );
      try {
        await this.emailService.sendRegistrationEmail(savedUser);
        return true;
      } catch (_err) {
        throw new HttpErrors.UnprocessableEntity('error sending email');
      }
    } else if (existedemail) {
      throw new HttpErrors.UnprocessableEntity('email already exist');
    } else if (existedusername) {
      throw new HttpErrors.UnprocessableEntity('username already exist');
    } else {
      throw new HttpErrors.UnprocessableEntity('unexpected error');
    }
  }

  @post('/verify-email', {
    responses: {
      '200': {
        description: 'Verify',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                signup: {
                  type: 'boolean',
                },
              },
            },
          },
        },
      },
    },
  })
  async verifyEmail(
    @requestBody()
    request: {
      token: string;
    },
  ): Promise<boolean> {
    interface DecodedToken {
      userId: number;
      iat: number;
      exp: number;
    }
    const {token} = request;
    const secret = process.env.JWT_SECRET ?? '';
    let decodedToken: DecodedToken;
    try {
      decodedToken = jwt.verify(token, secret) as DecodedToken;
    } catch (_err) {
      throw new HttpErrors.UnprocessableEntity(
        'Invalid or expired verification token',
      );
    }
    const {userId} = decodedToken;
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new HttpErrors.UnprocessableEntity('User not found');
    } else {
      try {
        await this.userRepository.updateById(user.id, {emailVerified: true});
        return true;
      } catch (_err) {
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
              type: 'object',
              properties: {
                send: {
                  type: 'boolean',
                },
              },
            },
          },
        },
      },
    },
  })
  async sendPasswordChange(
    @requestBody()
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
    } else {
      try {
        await this.emailService.sendPasswordChange(user);
        return true;
      } catch (_err) {
        throw new HttpErrors.UnprocessableEntity('error in email send');
      }
    }
  }

  @post('/password-change', {
    responses: {
      '200': {
        description: 'Verify',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                change: {
                  type: 'boolean',
                },
              },
            },
          },
        },
      },
    },
  })
  async changePassword(
    @requestBody()
    request: {
      token: string;
      password0: string;
      password1: string;
    },
  ): Promise<boolean> {
    interface DecodedToken {
      userId: number;
      iat: number;
      exp: number;
    }
    const {token} = request;
    const secret = process.env.JWT_SECRET ?? '';
    let decodedToken: DecodedToken;
    try {
      decodedToken = jwt.verify(token, secret) as DecodedToken;
    } catch (_err) {
      throw new HttpErrors.UnprocessableEntity(
        'Invalid or expired verification token',
      );
    }
    const {userId} = decodedToken;
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new HttpErrors.UnprocessableEntity('User not found');
    } else {
      if (request.password0 === request.password1) {
        try {
          await this.emailService.sendSuccessfulyPasswordChange(user);
          await this.userRepository.updateById(user.id, {
            passwordHash: await this.hasher.hashPassword(request.password0),
          });
          return true;
        } catch (_err) {
          throw new HttpErrors.UnprocessableEntity(
            'Failed to update user password',
          );
        }
      } else {
        throw new HttpErrors.UnprocessableEntity('Password are not matching');
      }
    }
  }

  @authenticate('jwt')
  @get('/users/{id}', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(User)}},
      },
    },
  })
  async findById(): Promise<User> {
    return this.userRepository.findById(this.user.id);
  }

  @authenticate('jwt')
  @put('/users/{id}', {
    responses: {
      '204': {
        description: 'User PUT success',
      },
    },
  })
  async replaceById(
    @requestBody()
    user: User,
  ): Promise<boolean> {
    const dbuser = await this.userRepository.findById(this.user.id);
    if (
      dbuser.date.toString() === new Date(user.date).toString() &&
      dbuser.id === user.id &&
      dbuser.passwordHash === user.passwordHash &&
      dbuser.emailVerified === user.emailVerified &&
      dbuser.link === user.link
    ) {
      await this.userRepository.updateById(this.user.id, user);
      return true;
    } else if (dbuser.email !== user.email) {
      if (!isEmail.validate(user.email)) {
        throw new HttpErrors.UnprocessableEntity('invalid Email');
      } else {
        await this.emailService.sendResetEmail(dbuser, user.email);
        await this.userRepository.updateById(user.id, {emailVerified: false});
        return true;
      }
    } else if (dbuser.date.toString() !== new Date(user.date).toString()) {
      throw new HttpErrors.UnprocessableEntity('cant change creation date');
    } else if (dbuser.link !== user.link) {
      throw new HttpErrors.UnprocessableEntity('cant change profile link');
    } else if (dbuser.emailVerified !== user.emailVerified) {
      throw new HttpErrors.UnprocessableEntity('email is not verified');
    } else if (dbuser.id !== user.id) {
      throw new HttpErrors.UnprocessableEntity('cant change id');
    } else if (dbuser.passwordHash !== user.passwordHash) {
      throw new HttpErrors.UnprocessableEntity('cant change password');
    } else {
      throw new HttpErrors.UnprocessableEntity('unexpected error');
    }
  }

  @authenticate('jwt')
  @del('/users/{id}', {
    responses: {
      '204': {
        description: 'User DELETE success',
      },
    },
  })
  async deleteById(): Promise<boolean> {
    try {
      await this.userRepository.deleteById(this.user.id);
      return true;
    } catch (_err) {
      throw new HttpErrors.UnprocessableEntity('error in delete');
    }
  }

  @authenticate('jwt')
  @get('/users/{id}/profilePictureGet', {
    responses: {
      '200': {
        description: 'User profile picture content',
        content: {'image/jpeg': {}},
      },
    },
  })
  async getUserProfilePicture(): Promise<Buffer> {
    const user = await this.userRepository.findById(this.user.id);
    if (user.link) {
      const sftpResponse = await sftp
        .connect(config)
        .then(async () => {
          const x = await sftp.get('/users/' + user.link);
          return x;
        })
        .then((response: string) => {
          sftp.end();
          return response;
        })
        .catch(() => {
          throw new HttpErrors.UnprocessableEntity('error in get picture');
        });
      return sftpResponse;
    } else {
      throw new HttpErrors.UnprocessableEntity(
        'user does not have profile picture',
      );
    }
  }

  @authenticate('jwt')
  @put('/users/{id}/profilePictureSet', {
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
            },
          },
        },
        description: 'Picture successfully uploaded',
      },
    },
  })
  async uploadImage(
    @requestBody({
      description: 'multipart/form-data for files/fields',
      required: true,
      content: {
        'multipart/form-data': {
          'x-parser': 'stream',
          schema: {
            type: 'object',
            properties: {
              file: {type: 'string', format: 'binary'},
            },
          },
        },
      },
    })
    request: Request,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ): Promise<void> {
    const user = await this.userRepository.findById(this.user.id);
    const storage = multer.diskStorage({
      destination: function (_req, _file, cb) {
        cb(null, './public');
      },
      filename: function (_req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix);
      },
    });
    const upload = multer({storage: storage});
    if (user) {
      if (user.link !== null) {
        await sftp
          .connect(config)
          .then(() => sftp.delete('/users/' + user.link))
          .then(() => sftp.end())
          .catch(() => {
            throw new HttpErrors.UnprocessableEntity(
              'error in deleting old picture',
            );
          });
      }
      upload.single('image')(request, response, err => {
        if (err) {
          new HttpErrors.UnprocessableEntity('Error in uploading file');
        } else {
          sftp
            .connect(config)
            .then(() =>
              sftp.put(
                './public/' + request.file?.filename,
                'users/' + request.file?.filename,
              ),
            )
            .then(() => sftp.end())
            .then(() =>
              this.userRepository.updateById(user.id, {
                link: request.file?.filename,
              }),
            )
            .then(() => {
              return true;
            })
            .catch((_error: string) => {
              throw new HttpErrors.UnprocessableEntity(
                'Error in uploading file to SFTP',
              );
            });
        }
      });
    }
  }

  @authenticate('jwt')
  @del('/users/{id}/profilePictureDel', {
    responses: {
      '200': {
        description: 'User picture DELETE success',
      },
    },
  })
  async delUserProfilePicture(): Promise<Buffer> {
    const user = await this.userRepository.findById(this.user.id);
    if (user.link != null) {
      const sftpResponse = await sftp.connect(config).then(async () => {
        const x = await sftp.delete('/users/' + user.link);
        await this.userRepository.updateById(user.id, {link: null});
        return x;
      });
      return sftpResponse;
    } else {
      throw new HttpErrors.UnprocessableEntity(
        'user does not have profile picture',
      );
    }
  }
}
