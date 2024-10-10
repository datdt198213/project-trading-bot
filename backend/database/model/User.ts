import { model, Schema, Types } from 'mongoose';

export const DOCUMENT_NAME = 'User';
export const COLLECTION_NAME = 'users';

export default interface User {
    _id?: Types.ObjectId;
    userId: string;
    publicKey: string;
    privateKey: string;
    referenceCode?: string;
    referralId?: string;
}

const schema = new Schema<User>(
    {
        userId: {
            type: Schema.Types.String,
            unique: true,
            select: true
        },
        publicKey: {
            type: Schema.Types.String,
            unique: true,
            select: true,
        },
        privateKey: {
            type: Schema.Types.String,
            select: false,
        },
        referenceCode: {
            type: Schema.Types.String,
            unique: true,
            select: true,
        },
    },
    {
        versionKey: false,
    },
);

schema.index({ _id: 1, userId: 1 });

export const UserModel = model<User>(DOCUMENT_NAME, schema, COLLECTION_NAME);
