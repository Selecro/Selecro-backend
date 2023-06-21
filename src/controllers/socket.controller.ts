import {repository} from '@loopback/repository';
import * as fs from 'fs';
import * as https from 'https';
import {Server as SocketIOServer} from 'socket.io';
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
    this.io.on('connection', async (socket) => {
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
      //await sftp.connect(config);
      for (const item of data) {
        /*let x = '';
        if (typeof item.link === 'string') {
          x = await sftp.get('/instructions/' + item.link);
        }
        item.link = x;*/
        socket.emit('message', item);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      //sftp.end();

      /*const sftpResponse = await sftp
        .connect(config)
        .then(async () => {
          data.forEach(async item0 => {
            let x = "";
            if (item0.link !== "string") {
              x = await sftp.get('/instructions/' + item0.link);
            }
            console.log(x);

          });
        })
        .then((response: string) => {
          //sftp.end();
        })
        .catch((err: any) => {
          console.log(err);
        }
        );

      for (const item of data) {
        socket.emit('message', item);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      socket.on('disconnect', () => { });*/
    });
    const port = 4000;
    this.server.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  }
}
