import mongoose, { Schema, Document } from 'mongoose';

export interface IOption {
    text: string;
    isCorrect: boolean;
    votes: number;
}

export interface IPoll extends Document {
    _id: mongoose.Types.ObjectId;
    question: string;
    options: IOption[];
    timer: number; // seconds
    startedAt: Date;
    status: 'active' | 'ended';
    createdAt: Date;
}

const OptionSchema = new Schema<IOption>({
    text: { type: String, required: true },
    isCorrect: { type: Boolean, default: false },
    votes: { type: Number, default: 0 },
});

const PollSchema = new Schema<IPoll>(
    {
        question: { type: String, required: true },
        options: { type: [OptionSchema], required: true },
        timer: { type: Number, required: true, default: 60 },
        startedAt: { type: Date, default: Date.now },
        status: { type: String, enum: ['active', 'ended'], default: 'active' },
    },
    { timestamps: true }
);

export const Poll = mongoose.model<IPoll>('Poll', PollSchema);
