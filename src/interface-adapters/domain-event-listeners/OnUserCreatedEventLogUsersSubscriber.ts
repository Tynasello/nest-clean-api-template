import { User } from '@domain/aggregates/User';
import { DomainEventManager } from '@domain/events/DomainEventManager';
import { IDomainEventSubscriber } from '@domain/events/IDomainEventSubscriber';
import { UserCreatedEvent } from '@domain/events/UserCreatedEvent';
import { IUserGateway } from '@domain/interfaces/IUserGateway';

export class OnUserCreatedEventLogUsersSubscriber
  implements IDomainEventSubscriber
{
  constructor() {
    DomainEventManager.subscribeToDomainEvent(UserCreatedEvent.name, this);
  }

  public update(gateway?: IUserGateway, user?: User) {
    gateway.emitUserCreated(UserCreatedEvent.name, user);
  }
}
