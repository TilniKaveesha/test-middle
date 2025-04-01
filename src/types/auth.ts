// In your auth types file (e.g., src/types/auth.ts)
export const Roles = ['admin', 'suser', 'user'] as const;
export type Role = typeof Roles[number];
export type RouteAccessMap = Record<string, Role[]>;

export type AuthUser = {
  id: string;
  nic: string;
  role: Role;
  firstName: string;
  lastName: string;
  email?: string;
  school?: string;
  phoneNumber?: string;
};