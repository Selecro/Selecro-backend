import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import * as fs from 'fs';
import * as https from 'https';
import path from 'path';
import {Server as SocketIOServer} from 'socket.io';
import {config} from '../datasources';
import {InstructionRepository} from '../repositories';
const Client = require('ssh2-sftp-client');
const sftp = new Client();

export class SocketController {
  private server: https.Server;
  private io: SocketIOServer;

  constructor(
    @repository(InstructionRepository)
    private instructionRepository: InstructionRepository,
  ) {}

  async start(): Promise<void> {
    const options = {
      key: fs.readFileSync(
        path.join(
          String(process.env.CERT_PATH),
          String(process.env.PRIVATE_KEY_FILE),
        ),
        'utf-8',
      ),
      cert: fs.readFileSync(
        path.join(String(process.env.CERT_PATH), String(process.env.CERT_FILE)),
        'utf-8',
      ),
    };
    this.server = https.createServer(options);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });
    await sftp.connect(config);
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
      for (const item of data) {
        try {
          sftp.get(
            '/instructions/' + item.link,
            './public/' + item.link + '.jpg',
          );
          for (const item2 of item.steps) {
            if (item2.link !== 'string') {
              sftp.get(
                '/instructions/' + item2.link,
                './public/' + item2.link + '.jpg',
              );
            }
          }
        } catch (_e) {
          throw new HttpErrors.UnprocessableEntity('Some error');
        }
        socket.emit('message', item);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    });
    const port = Number(process.env.SOCKETPORT);
    this.server.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  }
}
