import {repository} from '@loopback/repository';
import * as fs from 'fs';
import * as https from 'https';
import {Server as SocketIOServer} from 'socket.io';
import {config} from '../datasources/sftp.datasource';
import {InstructionRepository} from '../repositories';
const Client = require('ssh2-sftp-client');
const sftp = new Client();

export class SocketController {
  private server: https.Server;
  private io: SocketIOServer;

  constructor(
    @repository(InstructionRepository)
    private instructionRepository: InstructionRepository,
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
        include: [
          {
            relation: 'steps',
          },
        ],
      });
      data.forEach(async item => {
        if (item.link !== "string") {
          const sftpResponse = await sftp
            .connect(config)
            .then(async () => {
              const x = await sftp.get('/instructions/' + item.link);
              return x;
            })
            .then((response: string) => {
              sftp.end();
              return response;
            })
            .catch((err: any) => {
              console.log(err);
            });
          item.link = sftpResponse;
        }
      });
      for (const item of data) {
        socket.emit('message', item);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      socket.on('disconnect', () => { });
    });
    const port = 4000;
    this.server.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  }
}
