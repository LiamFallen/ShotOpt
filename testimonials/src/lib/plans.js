// Plan definitions and gating. This is the single place to change limits
// or add tiers — everything else reads from here.
export const PLANS = {
  free: {
    key: 'free',
    name: 'Free',
    price: 0,
    maxWalls: 1,
    maxTestimonialsPerWall: 10,
    canHideBadge: false,
  },
  pro: {
    key: 'pro',
    name: 'Pro',
    price: 19,
    maxWalls: Infinity,
    maxTestimonialsPerWall: Infinity,
    canHideBadge: true,
  },
};

export function planOf(user) {
  return PLANS[user?.plan] || PLANS.free;
}

// A wall's owner_plan is null for ownerless walls (self-hosted single-user
// mode, pre-accounts data) — those get no gating.
function ownerPlan(wall) {
  if (!wall.user_id) return PLANS.pro;
  return PLANS[wall.owner_plan] || PLANS.free;
}

export function badgeVisible(wall) {
  return !(wall.hide_badge && ownerPlan(wall).canHideBadge);
}

export function wallAtCapacity(wall, testimonialCount) {
  return testimonialCount >= ownerPlan(wall).maxTestimonialsPerWall;
}
