import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {Wishlist, WishlistRelations} from '../models';

export class WishlistRepository extends DefaultCrudRepository<
  Wishlist,
  typeof Wishlist.prototype.id,
  WishlistRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(Wishlist, dataSource);
  }
}
