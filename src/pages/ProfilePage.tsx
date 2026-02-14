import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const MAX_DISPLAY_NAME = 50;
const MAX_BIO = 200;

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setDisplayName(data.display_name || "");
        setBio(data.bio || "");
        setAvatarUrl(data.avatar_url || "");
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) {
      toast({ title: "Could not upload avatar", variant: "destructive" });
      return;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setAvatarUrl(data.publicUrl);
    const { error: updateErr } = await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("user_id", user.id);
    if (updateErr) {
      toast({ title: "Avatar uploaded but profile update failed", variant: "destructive" });
    }
  };

  const handleSave = async () => {
    if (!user) return;
    const trimmedName = displayName.trim().slice(0, MAX_DISPLAY_NAME);
    const trimmedBio = bio.trim().slice(0, MAX_BIO);
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: trimmedName, bio: trimmedBio })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Could not save profile", variant: "destructive" });
      return;
    }
    setDisplayName(trimmedName);
    setBio(trimmedBio);
    setEditing(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        {/* Avatar */}
        <div className="relative mb-4">
          <div className="h-24 w-24 overflow-hidden rounded-full bg-secondary">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-light text-muted-foreground">
                {displayName?.[0]?.toUpperCase() || "?"}
              </div>
            )}
          </div>
          {editing && (
            <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-calm hover:bg-primary/90">
              <Camera size={14} />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
          )}
        </div>

        {/* Name & Bio */}
        {editing ? (
          <div className="w-full space-y-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Display Name</label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value.slice(0, MAX_DISPLAY_NAME))}
                maxLength={MAX_DISPLAY_NAME}
                className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground transition-calm focus:border-primary/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, MAX_BIO))}
                rows={3}
                maxLength={MAX_BIO}
                className="w-full resize-none rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground transition-calm focus:border-primary/50 focus:outline-none"
                placeholder="A few words about yourself..."
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-calm hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="rounded-lg px-5 py-2 text-sm text-muted-foreground transition-calm hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="mb-1 font-display text-2xl font-bold text-foreground md:text-3xl">
              {displayName || "Anonymous"}
            </h2>
            <p className="mb-4 max-w-xs text-center text-sm text-muted-foreground">
              {bio || "No bio yet."}
            </p>
            <button
              onClick={() => setEditing(true)}
              className="rounded-lg border border-border bg-card px-5 py-2 text-sm text-foreground transition-calm hover:border-primary/30"
            >
              Edit Profile
            </button>
          </>
        )}

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="mt-8 flex items-center gap-2 text-xs text-muted-foreground transition-calm hover:text-foreground"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
