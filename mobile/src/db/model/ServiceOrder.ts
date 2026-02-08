import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class ServiceOrder extends Model {
  static table = 'service_orders';

  @field('customer_name') customerName;
  @field('device') device;
  @field('issue_description') issueDescription;
  @field('status') status;
  @readonly @date('created_at') createdAt;
  @readonly @date('updated_at') updatedAt;
}
