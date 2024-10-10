import User, { UserModel } from '../model/User';
import { Types } from 'mongoose';

async function exists(id: Types.ObjectId): Promise<boolean> {
    const user = await UserModel.exists({ _id: id, status: true });
    return user !== null && user !== undefined;
}

async function findPrivateProfileById(
    id: Types.ObjectId,
): Promise<User | null> {
    return UserModel.findOne({ _id: id, status: true })
        .select('+email')
        .lean<User>()
        .exec();
}

// contains critical information of the user
async function findByUserId(userId: string): Promise<User | null> {
    return UserModel.findOne({ userId: userId })
        .select('+userId +publicKey +referenceCode +privateKey')
        .lean()
        .exec();
}

async function findByReferralCode(referralCode: string): Promise<User | null> {
    return UserModel.findOne({ referenceCode: referralCode })
        .select('+userId +publicKey +referenceCode')
        .lean()
        .exec();
}

async function findFieldsById(
    id: Types.ObjectId,
    ...fields: string[]
): Promise<User | null> {
    return UserModel.findOne({ _id: id, status: true }, [...fields])
        .lean()
        .exec();
}

async function findPublicProfileById(id: Types.ObjectId): Promise<User | null> {
    return UserModel.findOne({ _id: id, status: true }).lean().exec();
}

async function create(
    user: User
): Promise<{ user: User; }> {
    // TODO: check is exist user
    const createdUser = await UserModel.create(user);
    return {
        user: { ...createdUser.toObject() },
    };
}

export default {
    exists,
    findByUserId,
    findFieldsById,
    findByReferralCode,
    create,
};
