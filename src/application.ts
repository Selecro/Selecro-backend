import {AuthenticationComponent} from '@loopback/authentication';
import {JWTAuthenticationComponent} from '@loopback/authentication-jwt';
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import * as dotenv from 'dotenv';
import path from 'path';
import {PingController, SocketController, UserController} from './controllers';
import {DbDataSource} from './datasources';
import {
  GroupRepository,
  InstructionRepository,
  StepRepository,
  UserGroupRepository,
  UserLinkRepository,
  UserRepository,
} from './repositories';
import {MySequence} from './sequence';
import {MyUserService, VaultService} from './services';
import {EmailService} from './services/email';
import {BcryptHasher} from './services/hash.password';
import {JWTService} from './services/jwt-service';
dotenv.config();

export {ApplicationConfig};

export class SelecroBackendApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);
    this.component(AuthenticationComponent);
    this.component(JWTAuthenticationComponent);
    this.controller(SocketController);
    this.controller(PingController);
    this.controller(UserController);
    this.controller(SocketController);
    this.repository(UserRepository);
    this.repository(InstructionRepository);
    this.repository(StepRepository);
    this.repository(UserGroupRepository);
    this.repository(UserLinkRepository);
    this.repository(GroupRepository);
    this.dataSource(DbDataSource);

    this.bind('services.jwt.service').toClass(JWTService);
    this.bind('authentication.jwt.expiresIn').to('7h');
    this.bind('authentication.jwt.secret').to(process.env.TOKEN);
    this.bind('services.hasher').toClass(BcryptHasher);
    this.bind('services.hasher.rounds').to(10);
    this.bind('services.user.service').toClass(MyUserService);
    this.bind('services.email').toClass(EmailService);
    this.bind('services.vault').toClass(VaultService);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
}
