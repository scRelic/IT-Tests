import { computed } from "vue";
import { LEVEL_UP_EXP, REWARD_EXP } from "~~/shared/constants";

export const useLevel = () => {
  const { user, fetchUser } = useUser();

  const exp = computed(() => user.value?.exp || 0);
  const level = computed(() => user.value?.level || "Trainee");

  const nextLevelExp = computed((): number => {
    switch (level.value) {
      case "Trainee": return LEVEL_UP_EXP[1]?.exp || 0;
      case "Junior": return LEVEL_UP_EXP[2]?.exp || 0;
      case "Middle": return LEVEL_UP_EXP[3]?.exp || 0;
      case "Senior": return LEVEL_UP_EXP[4]?.exp || 0;
      case "Lead": return LEVEL_UP_EXP[4]?.exp || 0;
      default: return 0;
    }
  });


  const nextLevel = computed((): string => {
    switch (level.value) {
      case "Trainee": return "Junior";
      case "Junior": return "Middle";
      case "Middle": return "Senior";
      case "Senior": return "Lead";
      case "Lead": return "Lead"; // Max level
      default: return "Trainee";
    }
  });

  const expUp = async (action: string) => {
    const reward = REWARD_EXP.find(r => r.action === action);
    const newExp = exp.value + (reward ? reward.exp : 0);

    if (newExp >= nextLevelExp.value) {
      await $fetch("/api/me/level", {
        method: "PATCH", body: {
          level: nextLevel.value,
          exp: newExp,
        }
      });

    }
    else {
      await $fetch("/api/me/level", {
        method: "PATCH", body: {
          level: level.value,
          exp: newExp,
        }
      });
    }

    await fetchUser();
  };


  return {
    exp,
    level,
    nextLevelExp,
    nextLevel,

    expUp,
  };
};
