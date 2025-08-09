import {
  inject,
  LifeCycleObserver,
  lifeCycleObserver,
} from '@loopback/core';
import {RemoteConfigService} from '../providers/remote-config.provider';

@lifeCycleObserver('RemoteConfigObserver')
export class RemoteConfigObserver implements LifeCycleObserver {
  constructor(
    @inject('services.RemoteConfigService')
    private remoteConfigService: RemoteConfigService,
  ) { }

  async start(): Promise<void> {
    await this.remoteConfigService.getConfigValues();
  }
}
