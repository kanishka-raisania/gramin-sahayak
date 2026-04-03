/**
 * Profile — Modern account center with card-based layout
 * Shows profile info, edit capabilities, and actions
 */
import { useState } from "react";
import {
  User, MapPin, Globe, Calendar, UserCheck,
  Edit3, RotateCcw, Trash2, ChevronRight, Save, X
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import type { TranslationKey } from "@/i18n/translations";
import { useToast } from "@/hooks/use-toast";
import GraminLogo from "@/components/GraminLogo";

const Profile = () => {
  const { t, language } = useLanguage();
  const { profile, updateProfile, resetProfile } = useUserProfile();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile?.name || "");
  const [editDistrict, setEditDistrict] = useState(profile?.district || "");
  const [editAgeGroup, setEditAgeGroup] = useState(profile?.age_group || "");
  const [editGender, setEditGender] = useState(profile?.gender || "");

  const roleLabels: Record<string, Record<string, string>> = {
    farmer: { en: "Farmer", hi: "किसान", pa: "ਕਿਸਾਨ", bn: "কৃষক", ta: "விவசாயி" },
    worker: { en: "Worker", hi: "मजदूर", pa: "ਮਜ਼ਦੂਰ", bn: "শ্রমিক", ta: "தொழிலாளி" },
    citizen: { en: "Citizen", hi: "नागरिक", pa: "ਨਾਗਰਿਕ", bn: "নাগরিক", ta: "குடிமகன்" },
  };

  const handleSave = async () => {
    await updateProfile({
      name: editName || null,
      district: editDistrict || null,
      age_group: editAgeGroup || null,
      gender: editGender || null,
    });
    setIsEditing(false);
    toast({ title: t("profileSaved" as TranslationKey), duration: 2000 });
  };

  const handleReset = () => {
    resetProfile();
    toast({ title: t("profileReset" as TranslationKey), duration: 2000 });
    window.location.reload();
  };

  if (!profile) return null;

  const infoItems = [
    { icon: User, label: t("profileName" as TranslationKey), value: profile.name || t("profileNotSet" as TranslationKey) },
    { icon: UserCheck, label: t("profileRole" as TranslationKey), value: roleLabels[profile.role]?.[language] || profile.role },
    { icon: Globe, label: t("profileLanguage" as TranslationKey), value: language.toUpperCase() },
    { icon: MapPin, label: t("profileState" as TranslationKey), value: profile.state || t("profileNotSet" as TranslationKey) },
    { icon: MapPin, label: t("profileDistrict" as TranslationKey), value: profile.district || t("profileNotSet" as TranslationKey) },
    { icon: Calendar, label: t("profileAge" as TranslationKey), value: profile.age_group || t("profileNotSet" as TranslationKey) },
    { icon: User, label: t("profileGender" as TranslationKey), value: profile.gender || t("profileNotSet" as TranslationKey) },
  ];

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-primary px-4 py-6 text-primary-foreground">
        <div className="container mx-auto flex flex-col items-center gap-3">
          <div className="rounded-full bg-primary-foreground/20 p-4">
            <User className="h-10 w-10" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold">
              {profile.name ? `${profile.name} ji` : t("profileTitle" as TranslationKey)}
            </h2>
            <p className="text-sm opacity-80">
              {roleLabels[profile.role]?.[language] || profile.role} • {profile.state || "India"}
            </p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 space-y-5">
        {/* Profile Info Card */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/50">
            <h3 className="font-bold text-foreground">{t("profileInfo" as TranslationKey)}</h3>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 text-sm text-primary font-semibold">
                <Edit3 className="h-4 w-4" /> {t("profileEdit" as TranslationKey)}
              </button>
            ) : (
              <button onClick={() => setIsEditing(false)} className="flex items-center gap-1 text-sm text-muted-foreground font-semibold">
                <X className="h-4 w-4" /> {t("profileCancel" as TranslationKey)}
              </button>
            )}
          </div>

          {!isEditing ? (
            <div className="divide-y divide-border">
              {infoItems.map(({ icon: Icon, label, value }, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                  <Icon className="h-5 w-5 text-primary shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm font-semibold text-foreground">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">{t("profileName" as TranslationKey)}</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder={t("profileNamePlaceholder" as TranslationKey)}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">{t("profileDistrict" as TranslationKey)}</label>
                <input
                  value={editDistrict}
                  onChange={(e) => setEditDistrict(e.target.value)}
                  placeholder={t("profileDistrictPlaceholder" as TranslationKey)}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">{t("profileAge" as TranslationKey)}</label>
                <select
                  value={editAgeGroup}
                  onChange={(e) => setEditAgeGroup(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">—</option>
                  <option value="<18">&lt;18</option>
                  <option value="18-40">18–40</option>
                  <option value="40+">40+</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">{t("profileGender" as TranslationKey)}</label>
                <select
                  value={editGender}
                  onChange={(e) => setEditGender(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">—</option>
                  <option value="male">{t("profileMale" as TranslationKey)}</option>
                  <option value="female">{t("profileFemale" as TranslationKey)}</option>
                  <option value="other">{t("profileOther" as TranslationKey)}</option>
                </select>
              </div>
              <button
                onClick={handleSave}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Save className="h-4 w-4" /> {t("profileSaveBtn" as TranslationKey)}
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-muted/50">
            <h3 className="font-bold text-foreground">{t("profileActions" as TranslationKey)}</h3>
          </div>
          <div className="divide-y divide-border">
            <button
              onClick={handleReset}
              className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-muted/50 transition-colors"
            >
              <RotateCcw className="h-5 w-5 text-muted-foreground" />
              <span className="flex-1 text-sm font-semibold text-foreground">
                {t("profileResetOnboarding" as TranslationKey)}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* App info */}
        <div className="flex flex-col items-center gap-2 pt-4">
          <GraminLogo size={32} />
          <p className="text-xs text-muted-foreground">{t("footer")}</p>
        </div>
      </main>
    </div>
  );
};

export default Profile;
