import { useEffect, useState } from "react";
import {
  Globe,
  CreditCard,
  ShieldCheck,
  FileText,
  Truck,
  RotateCcw,
  Save,
  Mail,
  Phone,
  MessageSquare,
  DollarSign,
  PackageCheck,
  Share2,
  Tv,
  MapPin,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RichEditor } from "@/components/ui/rich-editor";
import {
  getAllSettings,
  updateSettings,
  type ContactInfo,
  type SocialLinks,
  type PaymentInfo,
  type SettingsData,
} from "@/store/settingsSlice";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";

type TabType =
  | "contact"
  | "social"
  | "delivery"
  | "privacy"
  | "terms"
  | "shipping"
  | "refund";

interface TabItem {
  id: TabType;
  title: string;
  desc: string;
  icon: React.ElementType;
}

const TAB_ITEMS: TabItem[] = [
  {
    id: "contact",
    title: "Contact Info",
    desc: "Store phone, email, WhatsApp & address",
    icon: Phone,
  },
  {
    id: "social",
    title: "Social Info",
    desc: "Social media profile handles & links",
    icon: Share2,
  },
  {
    id: "delivery",
    title: "Delivery Charges & COD",
    desc: "Prepaid/COD fees & thresholds",
    icon: CreditCard,
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    desc: "User data & privacy statement",
    icon: ShieldCheck,
  },
  {
    id: "terms",
    title: "Terms & Conditions",
    desc: "Store rules & service terms",
    icon: FileText,
  },
  {
    id: "shipping",
    title: "Shipping & Delivery",
    desc: "Timelines and delivery methods",
    icon: Truck,
  },
  {
    id: "refund",
    title: "Return & Refund Policy",
    desc: "Returns window & refund rules",
    icon: RotateCcw,
  },
];

export default function Settings() {
  const dispatch = useDispatch<AppDispatch>();
  const settingsVar = useSelector((state: RootState) => state.settings);

  const [activeTab, setActiveTab] = useState<TabType>("contact");

  // Unified settings form state (mirrors API / ISettings schema)
  const [settingsForm, setSettingsForm] = useState<SettingsData>({
    contactInfo: {
      address: "",
      email: "",
      phone: "",
      whatsapp: "",
    },
    socialLinks: {
      facebook: "",
      instagram: "",
      twitter: "",
      youtube: "",
      linkedin: "",
    },
    paymentInfo: {
      prepaidDeliveryFee: 0,
      freePrepaidDeliveryOn: 0,
      codDeliveryFee: 0,
      freeCodDeliveryOn: 0,
      maxFreeCodDeliveryOn: 0,
    },
    privacyPolicy: "",
    termsConditions: "",
    shippingPolicy: "",
    returnPolicy: "",
  });

  // Fetch settings on mount
  useEffect(() => {
    dispatch(getAllSettings());
  }, [dispatch]);

  // Sync settingsForm whenever settings from API/store changes
  useEffect(() => {
    if (settingsVar.settings) {
      setSettingsForm({
        contactInfo: {
          address: settingsVar.settings.contactInfo?.address || "",
          email: settingsVar.settings.contactInfo?.email || "",
          phone: settingsVar.settings.contactInfo?.phone || "",
          whatsapp: settingsVar.settings.contactInfo?.whatsapp || "",
        },
        socialLinks: {
          facebook: settingsVar.settings.socialLinks?.facebook || "",
          instagram: settingsVar.settings.socialLinks?.instagram || "",
          twitter: settingsVar.settings.socialLinks?.twitter || "",
          youtube: settingsVar.settings.socialLinks?.youtube || "",
          linkedin: settingsVar.settings.socialLinks?.linkedin || "",
        },
        paymentInfo: {
          prepaidDeliveryFee:
            settingsVar.settings.paymentInfo?.prepaidDeliveryFee ?? 0,
          freePrepaidDeliveryOn:
            settingsVar.settings.paymentInfo?.freePrepaidDeliveryOn ?? 0,
          codDeliveryFee: settingsVar.settings.paymentInfo?.codDeliveryFee ?? 0,
          freeCodDeliveryOn:
            settingsVar.settings.paymentInfo?.freeCodDeliveryOn ?? 0,
          maxFreeCodDeliveryOn:
            settingsVar.settings.paymentInfo?.maxFreeCodDeliveryOn ?? 0,
        },
        privacyPolicy: settingsVar.settings.privacyPolicy || "",
        termsConditions: settingsVar.settings.termsConditions || "",
        shippingPolicy: settingsVar.settings.shippingPolicy || "",
        returnPolicy: settingsVar.settings.returnPolicy || "",
      });
    }
  }, [settingsVar.settings]);

  // Save Contact Info
  const handleSaveContact = async () => {
    await dispatch(updateSettings({ contactInfo: settingsForm.contactInfo }));
  };

  // Save Social Links
  const handleSaveSocial = async () => {
    await dispatch(updateSettings({ socialLinks: settingsForm.socialLinks }));
  };

  // Save Payment & Delivery Setup
  const handleSaveDelivery = async () => {
    const payload = {
      paymentInfo: {
        prepaidDeliveryFee:
          Number(settingsForm.paymentInfo.prepaidDeliveryFee) || 0,
        freePrepaidDeliveryOn:
          Number(settingsForm.paymentInfo.freePrepaidDeliveryOn) || 0,
        codDeliveryFee: Number(settingsForm.paymentInfo.codDeliveryFee) || 0,
        freeCodDeliveryOn:
          Number(settingsForm.paymentInfo.freeCodDeliveryOn) || 0,
        maxFreeCodDeliveryOn:
          Number(settingsForm.paymentInfo.maxFreeCodDeliveryOn) || 0,
      },
    };
    await dispatch(updateSettings(payload));
  };

  // Save Policy
  const handleSavePolicy = async () => {
    const payload: Partial<SettingsData> = {};

    if (activeTab === "privacy") {
      payload.privacyPolicy = settingsForm.privacyPolicy;
    } else if (activeTab === "terms") {
      payload.termsConditions = settingsForm.termsConditions;
    } else if (activeTab === "shipping") {
      payload.shippingPolicy = settingsForm.shippingPolicy;
    } else if (activeTab === "refund") {
      payload.returnPolicy = settingsForm.returnPolicy;
    }

    await dispatch(updateSettings(payload));
  };

  // Helper for current policy value
  const getPolicyValue = (tab: "privacy" | "terms" | "shipping" | "refund") => {
    switch (tab) {
      case "privacy":
        return settingsForm.privacyPolicy;
      case "terms":
        return settingsForm.termsConditions;
      case "shipping":
        return settingsForm.shippingPolicy;
      case "refund":
        return settingsForm.returnPolicy;
      default:
        return "";
    }
  };

  const handlePolicyChange = (val: string) => {
    switch (activeTab) {
      case "privacy":
        setSettingsForm((prev) => ({ ...prev, privacyPolicy: val }));
        break;
      case "terms":
        setSettingsForm((prev) => ({ ...prev, termsConditions: val }));
        break;
      case "shipping":
        setSettingsForm((prev) => ({ ...prev, shippingPolicy: val }));
        break;
      case "refund":
        setSettingsForm((prev) => ({ ...prev, returnPolicy: val }));
        break;
    }
  };

  return (
    <div className="space-y-6 w-full mx-auto font-sans pb-16">
      {/* Header Banner */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary text-primary-foreground">
            <Globe className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Store Configuration
          </h1>
        </div>
        <p className="text-xs text-muted-foreground pl-10">
          Update store contact points, delivery configurations, policies, and
          social media handles.
        </p>
      </div>

      {/* Main Content Layout: Left Nav + Right Configuration Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-2">
        {/* Left Vertical Navigation Menu */}
        <div className="lg:col-span-4 xl:col-span-3 bg-card rounded-2xl border border-border p-2 sm:p-2.5 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1.5">
          {TAB_ITEMS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-start gap-3 sm:gap-3.5 p-3 sm:p-3.5 rounded-xl border-l-4 transition-all text-left cursor-pointer ${
                  isActive
                    ? "bg-muted text-foreground border-primary shadow-xs font-semibold"
                    : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <Icon
                  className={`h-5 w-5 mt-0.5 shrink-0 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <div className="min-w-0">
                  <p
                    className={`text-sm font-semibold leading-snug truncate ${
                      isActive
                        ? "text-foreground font-bold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {tab.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 sm:line-clamp-2">
                    {tab.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Configuration View Viewport */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          {/* TAB 1: CONTACT INFO */}
          {activeTab === "contact" && (
            <div className="space-y-6">
              <Card className="rounded-2xl border-border shadow-sm">
                <CardHeader className="py-4 px-6 border-b border-border/60">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" /> CONTACT POINTS
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                        STORE EMAIL ADDRESS
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          value={settingsForm.contactInfo.email}
                          onChange={(e) =>
                            setSettingsForm((prev) => ({
                              ...prev,
                              contactInfo: {
                                ...prev.contactInfo,
                                email: e.target.value,
                              },
                            }))
                          }
                          placeholder="e.g. contact@baha.in"
                          className="pl-9 h-10 bg-background"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                        SUPPORT CONTACT NUMBER
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="tel"
                          value={settingsForm.contactInfo.phone}
                          onChange={(e) =>
                            setSettingsForm((prev) => ({
                              ...prev,
                              contactInfo: {
                                ...prev.contactInfo,
                                phone: e.target.value,
                              },
                            }))
                          }
                          placeholder="e.g. +911234567890"
                          className="pl-9 h-10 bg-background"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                        WHATSAPP BUSINESS LINK / NUMBER
                      </label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={settingsForm.contactInfo.whatsapp}
                          onChange={(e) =>
                            setSettingsForm((prev) => ({
                              ...prev,
                              contactInfo: {
                                ...prev.contactInfo,
                                whatsapp: e.target.value,
                              },
                            }))
                          }
                          placeholder="e.g. +910987654321"
                          className="pl-9 h-10 bg-background"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                        STORE PHYSICAL ADDRESS
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={settingsForm.contactInfo.address}
                          onChange={(e) =>
                            setSettingsForm((prev) => ({
                              ...prev,
                              contactInfo: {
                                ...prev.contactInfo,
                                address: e.target.value,
                              },
                            }))
                          }
                          placeholder="e.g. 23 jump street, New York, USA, 120034"
                          className="pl-9 h-10 bg-background"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bottom Action Bar */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  disabled={settingsVar.status === "loading"}
                  onClick={handleSaveContact}
                  className="font-semibold text-xs px-5 py-2.5 rounded-xl gap-2 shadow-md ml-auto"
                >
                  {settingsVar.status === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Contact Details
                </Button>
              </div>
            </div>
          )}

          {/* TAB 2: SOCIAL INFO */}
          {activeTab === "social" && (
            <div className="space-y-6">
              <Card className="rounded-2xl border-border shadow-sm">
                <CardHeader className="py-4 px-6 border-b border-border/60">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Share2 className="h-3.5 w-3.5" /> SOCIAL MEDIA HANDLES
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                        FACEBOOK PAGE URL
                      </label>
                      <div className="relative">
                        <Share2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={settingsForm.socialLinks.facebook}
                          onChange={(e) =>
                            setSettingsForm((prev) => ({
                              ...prev,
                              socialLinks: {
                                ...prev.socialLinks,
                                facebook: e.target.value,
                              },
                            }))
                          }
                          placeholder="https://facebook.com/"
                          className="pl-9 h-10 bg-background text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                        INSTAGRAM PAGE URL
                      </label>
                      <div className="relative">
                        <Share2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={settingsForm.socialLinks.instagram}
                          onChange={(e) =>
                            setSettingsForm((prev) => ({
                              ...prev,
                              socialLinks: {
                                ...prev.socialLinks,
                                instagram: e.target.value,
                              },
                            }))
                          }
                          placeholder="https://instagram.com/hello"
                          className="pl-9 h-10 bg-background text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                        X (TWITTER) PROFILE URL
                      </label>
                      <div className="relative">
                        <Share2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={settingsForm.socialLinks.twitter}
                          onChange={(e) =>
                            setSettingsForm((prev) => ({
                              ...prev,
                              socialLinks: {
                                ...prev.socialLinks,
                                twitter: e.target.value,
                              },
                            }))
                          }
                          placeholder="https://x.com/"
                          className="pl-9 h-10 bg-background text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                        YOUTUBE CHANNEL URL
                      </label>
                      <div className="relative">
                        <Tv className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={settingsForm.socialLinks.youtube || ""}
                          onChange={(e) =>
                            setSettingsForm((prev) => ({
                              ...prev,
                              socialLinks: {
                                ...prev.socialLinks,
                                youtube: e.target.value,
                              },
                            }))
                          }
                          placeholder="https://youtube.com/"
                          className="pl-9 h-10 bg-background text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bottom Action Bar */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  disabled={settingsVar.status === "loading"}
                  onClick={handleSaveSocial}
                  className="font-semibold text-xs px-5 py-2.5 rounded-xl gap-2 shadow-md ml-auto"
                >
                  {settingsVar.status === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Social Details
                </Button>
              </div>
            </div>
          )}

          {/* TAB 3: DELIVERY CHARGES & COD */}
          {activeTab === "delivery" && (
            <div className="space-y-6">
              {/* Card 1: Prepaid */}
              <Card className="rounded-2xl border-border shadow-sm">
                <CardHeader className="py-4 px-6 border-b border-border/60">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-3.5 w-3.5" /> PREPAID ORDER
                    DELIVERY CHARGES
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                        PREPAID DELIVERY FEE (₹)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={settingsForm.paymentInfo.prepaidDeliveryFee}
                        onChange={(e) =>
                          setSettingsForm((prev) => ({
                            ...prev,
                            paymentInfo: {
                              ...prev.paymentInfo,
                              prepaidDeliveryFee: Number(e.target.value),
                            },
                          }))
                        }
                        className="h-10 bg-background font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                        FREE DELIVERY THRESHOLD FOR PREPAID (₹)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={settingsForm.paymentInfo.freePrepaidDeliveryOn}
                        onChange={(e) =>
                          setSettingsForm((prev) => ({
                            ...prev,
                            paymentInfo: {
                              ...prev.paymentInfo,
                              freePrepaidDeliveryOn: Number(e.target.value),
                            },
                          }))
                        }
                        className="h-10 bg-background font-mono"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Set to 0 to always charge delivery fee.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: COD Settings */}
              <Card className="rounded-2xl border-border shadow-sm">
                <CardHeader className="py-4 px-6 border-b border-border/60">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <PackageCheck className="h-3.5 w-3.5" /> CASH ON DELIVERY
                    (COD) SETTINGS
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                        COD DELIVERY FEE (₹)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={settingsForm.paymentInfo.codDeliveryFee}
                        onChange={(e) =>
                          setSettingsForm((prev) => ({
                            ...prev,
                            paymentInfo: {
                              ...prev.paymentInfo,
                              codDeliveryFee: Number(e.target.value),
                            },
                          }))
                        }
                        className="h-10 bg-background font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                        FREE DELIVERY THRESHOLD FOR COD (₹)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={settingsForm.paymentInfo.freeCodDeliveryOn}
                        onChange={(e) =>
                          setSettingsForm((prev) => ({
                            ...prev,
                            paymentInfo: {
                              ...prev.paymentInfo,
                              freeCodDeliveryOn: Number(e.target.value),
                            },
                          }))
                        }
                        className="h-10 bg-background font-mono"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Set to 0 to always charge COD delivery fee.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                        MAX FREE COD DELIVERY THRESHOLD (₹)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={settingsForm.paymentInfo.maxFreeCodDeliveryOn}
                        onChange={(e) =>
                          setSettingsForm((prev) => ({
                            ...prev,
                            paymentInfo: {
                              ...prev.paymentInfo,
                              maxFreeCodDeliveryOn: Number(e.target.value),
                            },
                          }))
                        }
                        className="h-10 bg-background font-mono"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Orders above this amount will not qualify for free COD.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  disabled={settingsVar.status === "loading"}
                  onClick={handleSaveDelivery}
                  className="font-semibold text-xs px-5 py-2.5 rounded-xl gap-2 shadow-md ml-auto"
                >
                  {settingsVar.status === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Delivery Settings
                </Button>
              </div>
            </div>
          )}

          {/* POLICY TABS: PRIVACY, TERMS, SHIPPING, REFUND */}
          {(activeTab === "privacy" ||
            activeTab === "terms" ||
            activeTab === "shipping" ||
            activeTab === "refund") && (
            <div className="space-y-6">
              <Card className="rounded-2xl border-border shadow-sm">
                <CardHeader className="py-4 px-6 border-b border-border/60">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <RotateCcw className="h-3.5 w-3.5" />
                    {activeTab === "privacy" && "PRIVACY POLICY"}
                    {activeTab === "terms" && "TERMS & CONDITIONS"}
                    {activeTab === "shipping" && "SHIPPING & DELIVERY POLICY"}
                    {activeTab === "refund" && "RETURN & REFUND POLICY"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                    {activeTab === "privacy" && "PRIVACY POLICY CONTENT"}
                    {activeTab === "terms" && "TERMS & CONDITIONS CONTENT"}
                    {activeTab === "shipping" && "SHIPPING POLICY CONTENT"}
                    {activeTab === "refund" && "RETURN & REFUND POLICY CONTENT"}
                  </label>

                  {/* Rich Text Editor */}
                  <RichEditor
                    key={activeTab}
                    value={getPolicyValue(activeTab)}
                    onChange={handlePolicyChange}
                    placeholder="Type policy details here..."
                    minHeight="260px"
                  />

                  <p className="text-[11px] text-muted-foreground pt-1">
                    State return windows (e.g., 7 days), product eligibility
                    (opened vs unopened), shipping fees, and payment channels.
                  </p>
                </CardContent>
              </Card>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  disabled={settingsVar.status === "loading"}
                  onClick={handleSavePolicy}
                  className="font-semibold text-xs px-5 py-2.5 rounded-xl gap-2 shadow-md ml-auto"
                >
                  {settingsVar.status === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Policy
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
