import {inject, LifeCycleObserver, Next, Provider} from '@loopback/core';
import {Middleware, MiddlewareContext} from '@loopback/rest';
import {Producer} from 'kafkajs';
import {v4 as uuidv4} from 'uuid';
import {KafkaDataSource} from '../datasources';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId?: string;
  action: string;
  resource: string;
  method: string;
  ipAddress: string;
  correlationId: string;
  details?: object;
  status: 'success' | 'failure';
  error?: string;
}

export class AuditTrailMiddlewareProvider implements Provider<Middleware>, LifeCycleObserver {
  private producer: Producer;
  private auditTopic: string = 'audit-trail-logs';
  private connectionPromise: Promise<void>;

  constructor(
    @inject('datasources.kafka')
    private kafkaDataSource: KafkaDataSource,
  ) {
    this.producer = this.kafkaDataSource.client.producer();
    this.connectionPromise = this.producer.connect().then(() => {
    }).catch(e => {
      console.error(`Error connecting Kafka producer: ${e.message}`);
      throw e;
    });
  }

  async stop(): Promise<void> {
    await this.producer.disconnect();
  }

  value(): Middleware {
    return async (ctx: MiddlewareContext, next: Next) => {
      try {
        await this.connectionPromise;
      } catch (e) {
        console.error('Kafka producer is not ready. Skipping audit log.', e);
        return next();
      }

      const {request} = ctx;
      //const correlationId = ctx.getSync(CorrelationIdBindings.CORRELATION_ID) ?? uuidv4();

      const auditLog: Partial<AuditLogEntry> = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        //correlationId: correlationId,
        method: request.method,
        resource: request.path,
        ipAddress: request.ip,
        status: 'success',
      };

      try {
        await next();
        this.logAuditEntry({
          ...auditLog,
          action: `${request.method} ${request.path}`,
          details: {body: request.body},
        });
      } catch (error) {
        this.logAuditEntry({
          ...auditLog,
          action: `${request.method} ${request.path}`,
          status: 'failure',
          error: error.message,
          details: {body: request.body},
        });
        throw error;
      }
    };
  }

  private async logAuditEntry(entry: Partial<AuditLogEntry>): Promise<void> {
    try {
      await this.producer.send({
        topic: this.auditTopic,
        messages: [
          {value: JSON.stringify(entry)},
        ],
      });
    } catch (error) {
      console.error('Failed to send audit log to Kafka:', error);
    }
  }
}
