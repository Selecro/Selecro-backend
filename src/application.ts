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
import {InstructionStepController, PingController, UserController, UserInstructionController, UserLinkController, UserProgressController} from './controllers';
import {DbDataSource} from './datasources';
import {
  InstructionRepository,
  ProgressRepository,
  StepRepository,
  UserLinkRepository,
  UserRepository,
} from './repositories';
import {MySequence} from './sequence';
import {ImgurService, MyUserService, VaultService} from './services';
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
    this.controller(PingController);
    this.controller(UserController);
    this.controller(UserProgressController);
    this.controller(UserLinkController);
    this.controller(UserInstructionController);
    this.controller(InstructionStepController);
    this.repository(UserRepository);
    this.repository(InstructionRepository);
    this.repository(StepRepository);
    this.repository(UserLinkRepository);
    this.repository(ProgressRepository);
    this.dataSource(DbDataSource);

    this.bind('services.jwt.service').toClass(JWTService);
    this.bind('authentication.jwt.expiresIn').to('32d');
    this.bind('authentication.jwt.secret').to(process.env.TOKEN);
    this.bind('services.hasher').toClass(BcryptHasher);
    this.bind('services.hasher.rounds').to(10);
    this.bind('services.user.service').toClass(MyUserService);
    this.bind('services.email').toClass(EmailService);
    this.bind('services.imgur').toClass(ImgurService);
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
