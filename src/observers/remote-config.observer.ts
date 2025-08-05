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
    console.log('Attempting to fetch initial Remote Config values...');
    await this.remoteConfigService.getConfigValues();
  }
}
