/**
 * UserProfileContext — Manages user profile state (session-based, persisted to DB)
 * Provides profile data, smart greeting, and personalization helpers
 */
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  session_id: string;
  name: string | null;
  role: "farmer" | "worker" | "citizen";
  language: string;
  state: string | null;
  district: string | null;
  age_group: string | null;
  gender: string | null;
  interaction_tags: string[];
}

interface UserProfileContextType {
  profile: UserProfile | null;
  isOnboarded: boolean;
  isLoading: boolean;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: (data: Pick<UserProfile, "role" | "state">) => void;
  resetProfile: () => void;
  getGreeting: (langGreetings: Record<string, string>) => string;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

function getSessionId(): string {
  let id = localStorage.getItem("gs-session-id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("gs-session-id", id);
  }
  return id;
}

function getStoredProfile(): UserProfile | null {
  try {
    const stored = localStorage.getItem("gs-user-profile");
    if (stored) return JSON.parse(stored);
  } catch {}
  return null;
}

export const UserProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile | null>(getStoredProfile);
  const [isLoading, setIsLoading] = useState(false);

  const sessionId = getSessionId();
  const isOnboarded = !!profile && !!localStorage.getItem("gs-onboarded");

  // Load profile from DB on mount
  useEffect(() => {
    if (profile) return;
    setIsLoading(true);
    supabase
      .from("user_profiles")
      .select("*")
      .eq("session_id", sessionId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const p: UserProfile = {
            session_id: data.session_id,
            name: data.name,
            role: data.role as UserProfile["role"],
            language: data.language,
            state: data.state,
            district: data.district,
            age_group: data.age_group,
            gender: data.gender,
            interaction_tags: data.interaction_tags || [],
          };
          setProfile(p);
          localStorage.setItem("gs-user-profile", JSON.stringify(p));
          if (data.role) localStorage.setItem("gs-onboarded", "true");
        }
        setIsLoading(false);
      });
  }, [sessionId]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    const updated = { ...profile!, ...updates, updated_at: new Date().toISOString() };
    setProfile(updated);
    localStorage.setItem("gs-user-profile", JSON.stringify(updated));

    await supabase
      .from("user_profiles")
      .upsert({ 
        session_id: sessionId,
        ...updates,
        updated_at: new Date().toISOString(),
      }, { onConflict: "session_id" });
  }, [profile, sessionId]);

  const completeOnboarding = useCallback((data: Pick<UserProfile, "role" | "state">) => {
    const lang = localStorage.getItem("gs-lang") || "hi";
    const newProfile: UserProfile = {
      session_id: sessionId,
      name: null,
      role: data.role,
      language: lang,
      state: data.state || null,
      district: null,
      age_group: null,
      gender: null,
      interaction_tags: [],
    };
    setProfile(newProfile);
    localStorage.setItem("gs-user-profile", JSON.stringify(newProfile));
    localStorage.setItem("gs-onboarded", "true");

    // Save to DB (non-blocking)
    supabase
      .from("user_profiles")
      .upsert({
        session_id: sessionId,
        role: data.role,
        language: lang,
        state: data.state || null,
      }, { onConflict: "session_id" });
  }, [sessionId]);

  const resetProfile = useCallback(() => {
    setProfile(null);
    localStorage.removeItem("gs-user-profile");
    localStorage.removeItem("gs-onboarded");
    localStorage.removeItem("gs-lang-chosen");
  }, []);

  const getGreeting = useCallback((langGreetings: Record<string, string>) => {
    if (!profile) return langGreetings.default || "Welcome";
    const name = profile.name;
    const greeting = langGreetings[profile.language] || langGreetings.default || "Welcome";
    if (name) return `${greeting}, ${name} ji`;
    return greeting;
  }, [profile]);

  return (
    <UserProfileContext.Provider
      value={{ profile, isOnboarded, isLoading, updateProfile, completeOnboarding, resetProfile, getGreeting }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => {
  const ctx = useContext(UserProfileContext);
  if (!ctx) throw new Error("useUserProfile must be used within UserProfileProvider");
  return ctx;
};
