export const FREE_POSTS_LIMIT = 5;

export type TrialStatusPayload = {
  allowed: boolean;
  authRequired?: boolean;
  paywall?: boolean;
  message?: string;
  free_posts_used: number;
  free_posts_limit: number;
  is_paid: boolean;
  subscription_status: string;
  remaining_free_generations: number;
};
