import mongoose from '../db';

export const teamMembershipRoles = ['member', 'leader'] as const;

export type TeamMembershipRole = typeof teamMembershipRoles[number];

export interface TeamMembershipDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  role?: TeamMembershipRole;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TeamMembershipModel
  extends mongoose.Model<TeamMembershipDocument> {}

export const teamMembershipSchema = new mongoose.Schema<TeamMembershipDocument>(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    role: {
      type: String,
    },
  },
);

export const TeamMembership = mongoose.model<
  TeamMembershipDocument,
  TeamMembershipModel
>('teamMembership', teamMembershipSchema);
