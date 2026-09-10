import mongoose, { Schema } from 'mongoose';

export type CopilotConversationDoc = {
  userId: mongoose.Types.ObjectId;
  messages: { role: 'user' | 'assistant'; content: string; createdAt: Date }[];
  contextSnapshotIds: string[];
  createdAt: Date;
  updatedAt: Date;
};

const convoSchema = new Schema<CopilotConversationDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    messages: [
      {
        role: { type: String, enum: ['user', 'assistant'], required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    contextSnapshotIds: [{ type: String }],
  },
  { timestamps: true },
);

export const CopilotConversation = mongoose.model<CopilotConversationDoc>(
  'CopilotConversation',
  convoSchema,
);
