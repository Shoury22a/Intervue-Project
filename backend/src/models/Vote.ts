import mongoose, { Schema, Document } from 'mongoose';

export interface IVote extends Document {
    pollId: mongoose.Types.ObjectId;
    studentName: string;
    optionIndex: number;
    createdAt: Date;
}

const VoteSchema = new Schema<IVote>(
    {
        pollId: { type: Schema.Types.ObjectId, ref: 'Poll', required: true },
        studentName: { type: String, required: true },
        optionIndex: { type: Number, required: true },
    },
    { timestamps: true }
);

// Unique constraint to prevent duplicate votes
VoteSchema.index({ pollId: 1, studentName: 1 }, { unique: true });

export const Vote = mongoose.model<IVote>('Vote', VoteSchema);
