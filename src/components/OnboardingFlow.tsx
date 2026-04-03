/**
 * OnboardingFlow — Step 2-3 after language selection
 * Step 2: "Who are you?" — Farmer / Worker / Citizen
 * Step 3: State selection
 * Warm, friendly tone — not form-like
 */
import { useState } from "react";
import { Tractor, HardHat, Home, ChevronRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useUserProfile, type UserProfile } from "@/contexts/UserProfileContext";
import type { TranslationKey } from "@/i18n/translations";
import GraminLogo from "./GraminLogo";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh",
];

const roleOptions: { role: UserProfile["role"]; icon: typeof Tractor; labelKey: string; descKey: string }[] = [
  { role: "farmer", icon: Tractor, labelKey: "onboardRoleFarmer", descKey: "onboardRoleFarmerDesc" },
  { role: "worker", icon: HardHat, labelKey: "onboardRoleWorker", descKey: "onboardRoleWorkerDesc" },
  { role: "citizen", icon: Home, labelKey: "onboardRoleCitizen", descKey: "onboardRoleCitizenDesc" },
];

const OnboardingFlow = () => {
  const [step, setStep] = useState<2 | 3>(2);
  const [selectedRole, setSelectedRole] = useState<UserProfile["role"] | null>(null);
  const [selectedState, setSelectedState] = useState("");
  const { t } = useLanguage();
  const { completeOnboarding } = useUserProfile();

  const handleComplete = () => {
    if (!selectedRole) return;
    completeOnboarding({ role: selectedRole, state: selectedState || null });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm flex flex-col items-center gap-6 animate-fade-in">
        <GraminLogo size={56} />

        {step === 2 && (
          <>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-extrabold text-foreground">
                {t("onboardWhoTitle" as TranslationKey)}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("onboardWhoSubtitle" as TranslationKey)}
              </p>
            </div>

            <div className="w-full space-y-3">
              {roleOptions.map(({ role, icon: Icon, labelKey, descKey }) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`w-full flex items-center gap-4 rounded-2xl border-2 px-5 py-4 transition-all active:scale-[0.98] ${
                    selectedRole === role
                      ? "border-primary bg-primary/10 shadow-md"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div className={`rounded-full p-3 ${selectedRole === role ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-foreground">{t(labelKey as TranslationKey)}</div>
                    <div className="text-xs text-muted-foreground">{t(descKey as TranslationKey)}</div>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => selectedRole && setStep(3)}
              disabled={!selectedRole}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-lg font-bold text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors active:scale-[0.98] disabled:opacity-50"
            >
              {t("continueLang" as TranslationKey)}
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-extrabold text-foreground">
                {t("onboardStateTitle" as TranslationKey)}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("onboardStateSubtitle" as TranslationKey)}
              </p>
            </div>

            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full rounded-2xl border-2 border-border bg-card px-5 py-4 text-base font-semibold text-foreground outline-none focus:border-primary transition-colors"
            >
              <option value="">{t("onboardStateSelect" as TranslationKey)}</option>
              {INDIAN_STATES.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>

            <button
              onClick={handleComplete}
              className="w-full rounded-2xl bg-primary py-4 text-lg font-bold text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors active:scale-[0.98]"
            >
              {t("onboardStart" as TranslationKey)}
            </button>

            <button
              onClick={() => setStep(2)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← {t("backToHome" as TranslationKey)}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default OnboardingFlow;
