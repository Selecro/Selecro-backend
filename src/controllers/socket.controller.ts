import {repository} from '@loopback/repository';
import * as fs from 'fs';
import * as https from 'https';
import {Server as SocketIOServer} from 'socket.io';
import {InstructionRepository, StepRepository} from '../repositories';

export class SocketController {
  private server: https.Server;
  private io: SocketIOServer;

  constructor(
    @repository(InstructionRepository)
    private instructionRepository: InstructionRepository,
    @repository(StepRepository) private stepRepository: StepRepository,
  ) { }

  async start(): Promise<void> {
    const options = {
      key: fs.readFileSync('localhost.decrypt.key', 'utf8'),
      cert: fs.readFileSync('localhost.crt', 'utf8'),
    };
    this.server = https.createServer(options);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: [
          'https://selecro.cz:443',
          'https://develop.selecro.cz:443',
          'http://localhost:4200',
        ],
        methods: ['GET', 'POST'],
      },
    });
    this.io.on('connection', async socket => {
      const data = await this.instructionRepository.find({
        where: {
          private: false,
        },
        /*include: [
          {
            relation: 'steps',
          },
        ],*/
      });
      socket.emit('message', data);
      socket.on('disconnect', () => { });
    });
    const port = 4000;
    this.server.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  }
}
