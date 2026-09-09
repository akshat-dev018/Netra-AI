import { Model, Types } from 'mongoose';
import { notFound } from './appError.js';

export async function assertOwnership<T>(
  ModelClass: Model<T>,
  resourceId: string,
  userId: string,
  ownerField = 'userId',
): Promise<T> {
  const filter: Record<string, unknown> = {
    _id: new Types.ObjectId(resourceId),
    isDeleted: false,
    [ownerField]: new Types.ObjectId(userId),
  };
  const doc = await ModelClass.findOne(filter);
  if (!doc) throw notFound();
  return doc;
}
