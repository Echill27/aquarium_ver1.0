export const INITIAL_STATE = {
  relationship: 0,
  control: 0,
  contamination: 0,
  flags: [],
  history: [],
  chapter: 0,
  route: {},
};

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function applyEffects(state, effects = {}) {
  const flags = new Set(state.flags);
  (effects.addFlags || []).forEach((flag) => flags.add(flag));
  (effects.removeFlags || []).forEach((flag) => flags.delete(flag));
  return {
    ...state,
    relationship: clamp(state.relationship + (effects.relationship || 0), 0, 100),
    control: clamp(state.control + (effects.control || 0), -100, 100),
    contamination: clamp(state.contamination + (effects.contamination || 0), 0, 100),
    flags: [...flags],
    route: { ...state.route, ...(effects.route || {}) },
  };
}

export const hasFlag = (state, flag) => state.flags.includes(flag);

export function isChoiceVisible(choice, state) {
  if (!choice.when) return true;
  const { flag, notFlag, minRelationship, maxRelationship, minControl, maxControl,
    minContamination, maxContamination } = choice.when;
  return (!flag || hasFlag(state, flag))
    && (!notFlag || !hasFlag(state, notFlag))
    && (minRelationship == null || state.relationship >= minRelationship)
    && (maxRelationship == null || state.relationship <= maxRelationship)
    && (minControl == null || state.control >= minControl)
    && (maxControl == null || state.control <= maxControl)
    && (minContamination == null || state.contamination >= minContamination)
    && (maxContamination == null || state.contamination <= maxContamination);
}

export function secretEnding(state) {
  const nameFlags = ["FLAG_이름1", "FLAG_이름2", "FLAG_안내판기입", "FLAG_이름부정"]
    .filter((flag) => hasFlag(state, flag)).length;
  return nameFlags >= 3 && state.contamination >= 76;
}

function qualifiesForEnding9A(state) {
  return state.contamination >= 36
    && state.relationship >= 71
    && state.control >= -5
    && hasFlag(state, "FLAG_백사헌선도1")
    && hasFlag(state, "FLAG_백사헌선도2");
}

export function forcedEnding(state, context = {}) {
  if (secretEnding(state)) return "ending11";
  if (context.atChapter9 && qualifiesForEnding9A(state)) return "ending9a";
  if (state.contamination >= 76 && context.pairFailed) {
    if (state.route.protectBaek === true) return "ending7";
    return "ending10";
  }
  return null;
}

export function resolveFinal(choice, state) {
  if (secretEnding(state)) return "ending11";
  if (qualifiesForEnding9A(state)) return "ending9a";
  if (choice === "A" && state.contamination <= 35) return "ending1";
  if (choice === "B" && state.contamination <= 65) {
    const leadCount = ["FLAG_선도1", "FLAG_선도2", "FLAG_선도3", "FLAG_선도4"]
      .filter((flag) => hasFlag(state, flag)).length;
    if (state.relationship >= 71 && leadCount >= 3 && state.control <= -20) {
      return "ending12";
    }
    if (state.relationship >= 71) return "ending3";
    return "ending2";
  }
  if (choice === "C") return "ending9b";
  if (choice === "D" && state.contamination >= 66) return "ending6";
  if (choice === "E" && hasFlag(state, "FLAG_라벨없음")) return "ending8";
  return "ending5";
}
