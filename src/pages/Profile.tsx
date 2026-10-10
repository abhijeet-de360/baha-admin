import React, { useState, useEffect } from "react";
import {
  Mail,
  Save,
  User as UserIcon,
  Shield,
  ShieldCheck,
  Calendar,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { getProfile, updateAdminProfile } from "@/store/authSlice";

export default function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, status } = useSelector((state: RootState) => state.auth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Sync state when user profile is loaded or updated
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    } else {
      dispatch(getProfile());
    }
  }, [user, dispatch]);

  const isLoading = status === "loading";
  const isUnchanged =
    name.trim() === (user?.name || "").trim() &&
    email.trim() === (user?.email || "").trim();
  const isSaveDisabled =
    isLoading || isUnchanged || !name.trim() || !email.trim();

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaveDisabled) return;

    await dispatch(
      updateAdminProfile({
        name: name.trim(),
        email: email.trim(),
      }),
    );
  };

  // Generate initials for avatar fallback
  const getInitials = (userName?: string) => {
    if (!userName) return "AD";
    const parts = userName.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return userName.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-8 w-full max-w-4xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-card border border-border p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm">
        <div className="relative">
          <Avatar className="h-24 w-24 border-4 border-background shadow-md">
            <AvatarImage
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
              alt={user?.name || "Admin"}
            />
            <AvatarFallback className="text-xl font-extrabold bg-primary text-primary-foreground">
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="space-y-2 text-center md:text-left flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              {user?.name || "Administrator"}
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider bg-primary/10 text-primary border-primary/20">
                <Shield className="h-3 w-3" />
                {user?.type || "ADMIN"}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                <ShieldCheck className="h-3 w-3" />
                {user?.status || "ACTIVE"}
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {user?.email || "No email provided"}
          </p>
        </div>
      </div>

      {/* Personal Details Form Card */}
      <Card className="rounded-3xl border border-border shadow-xs overflow-hidden">
        <CardHeader className="p-6 pb-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-primary" /> Personal Information
          </CardTitle>
          <CardDescription className="text-xs">
            Update your account name and email address. Changes will reflect
            across the admin portal.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleProfileSubmit}>
          <CardContent className="space-y-6 p-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  Full Name <span className="text-destructive">*</span>
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  className="h-10 text-xs font-semibold rounded-xl"
                  required
                />
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  Email Address <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="pl-9 h-10 text-xs font-semibold rounded-xl"
                    required
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Read-only Account Meta Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border">
              {/* Account Role */}
              <div className="bg-muted/40 p-3.5 rounded-2xl border border-border space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Shield className="h-3 w-3 text-primary" /> Role Type
                </span>
                <p className="text-xs font-bold text-foreground capitalize">
                  {user?.type || "Admin"}
                </p>
              </div>

              {/* Account Status */}
              <div className="bg-muted/40 p-3.5 rounded-2xl border border-border space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-500" /> Account
                  Status
                </span>
                <p className="text-xs font-bold text-foreground capitalize">
                  {user?.status || "Active"}
                </p>
              </div>

              {/* Member Since / ID */}
              <div className="bg-muted/40 p-3.5 rounded-2xl border border-border space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-amber-500" /> Member Since
                </span>
                <p className="text-xs font-mono font-semibold text-foreground">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "Active Member"}
                </p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end border-t border-border p-6 bg-muted/20">
            <Button
              type="submit"
              disabled={isSaveDisabled}
              className="gap-2 rounded-xl text-xs font-semibold px-6 shadow-md cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
