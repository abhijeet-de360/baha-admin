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
  Percent,
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
  const { settings, status } = useSelector((state: RootState) => state.settings);
  const isLoading = status === "loading";

  const [activeTab, setActiveTab] = useState<TabType>("contact");

  // Contact Info State (matches API contactInfo)
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    address: "",
    email: "",
    phone: "",
    whatsapp: "",
  });

  // Social Links State (matches API socialLinks)
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    facebook: "",
    instagram: "",
    twitter: "",
    youtube: "",
  });

  // Delivery & Payment State (matches API paymentInfo)
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    prepaidDeliveryFee: 0,
    freePrepaidDeliveryOn: 0,
    codDeliveryFee: 0,
    freeCodDeliveryOn: 0,
    maxFreeCodDeliveryOn: 0,
  });

  // Optional local partial payment config
  // const [partialCodSetup, setPartialCodSetup] = useState({
  //   partialCodRequired: false,
  //   partialType: "Fixed Amount (₹)",
  //   partialValue: "0",
  // });

  // Policies State (matches API policy keys)
  const [policies, setPolicies] = useState({
    privacyPolicy: "",
    termsConditions: "",
    shippingPolicy: "",
    returnPolicy: "",
  });

  // Fetch settings on mount
  useEffect(() => {
    dispatch(getAllSettings());
  }, [dispatch]);

  // Sync state whenever settings from API/store changes
  useEffect(() => {
    if (settings) {
      const data: SettingsData = (settings as any)?.data || settings;

      if (data.contactInfo) {
        setContactInfo({
          address: data.contactInfo.address || "",
          email: data.contactInfo.email || "",
          phone: data.contactInfo.phone || "",
          whatsapp: data.contactInfo.whatsapp || "",
        });
      }

      if (data.socialLinks) {
        setSocialLinks({
          facebook: data.socialLinks.facebook || "",
          instagram: data.socialLinks.instagram || "",
          twitter: data.socialLinks.twitter || "",
          youtube: data.socialLinks.youtube || "",
        });
      }

      if (data.paymentInfo) {
        setPaymentInfo({
          prepaidDeliveryFee: data.paymentInfo.prepaidDeliveryFee ?? 0,
          freePrepaidDeliveryOn: data.paymentInfo.freePrepaidDeliveryOn ?? 0,
          codDeliveryFee: data.paymentInfo.codDeliveryFee ?? 0,
          freeCodDeliveryOn: data.paymentInfo.freeCodDeliveryOn ?? 0,
          maxFreeCodDeliveryOn: data.paymentInfo.maxFreeCodDeliveryOn ?? 0,
        });
      }

      setPolicies({
        privacyPolicy: data.privacyPolicy || "",
        termsConditions: data.termsConditions || "",
        shippingPolicy: data.shippingPolicy || "",
        returnPolicy: data.returnPolicy || "",
      });
    }
  }, [settings]);

  // Save Contact Info
  const handleSaveContact = async () => {
    await dispatch(
      updateSettings(
        { contactInfo },
        "Contact details saved successfully!"
      )
    );
  };

  // Save Social Links
  const handleSaveSocial = async () => {
    await dispatch(
      updateSettings(
        { socialLinks },
        "Social media details saved successfully!"
      )
    );
  };

  // Save Payment & Delivery Setup
  const handleSaveDelivery = async () => {
    const payload = {
      paymentInfo: {
        prepaidDeliveryFee: Number(paymentInfo.prepaidDeliveryFee) || 0,
        freePrepaidDeliveryOn: Number(paymentInfo.freePrepaidDeliveryOn) || 0,
        codDeliveryFee: Number(paymentInfo.codDeliveryFee) || 0,
        freeCodDeliveryOn: Number(paymentInfo.freeCodDeliveryOn) || 0,
        maxFreeCodDeliveryOn: Number(paymentInfo.maxFreeCodDeliveryOn) || 0,
      },
    };
    await dispatch(
      updateSettings(payload, "Delivery & COD settings saved!")
    );
  };

  // Save Policy
  const handleSavePolicy = async () => {
    const payload: Partial<SettingsData> = {};
    let label = "Policy";

    if (activeTab === "privacy") {
      payload.privacyPolicy = policies.privacyPolicy;
      label = "Privacy Policy";
    } else if (activeTab === "terms") {
      payload.termsConditions = policies.termsConditions;
      label = "Terms & Conditions";
    } else if (activeTab === "shipping") {
      payload.shippingPolicy = policies.shippingPolicy;
      label = "Shipping Policy";
    } else if (activeTab === "refund") {
      payload.returnPolicy = policies.returnPolicy;
      label = "Return & Refund Policy";
    }

    await dispatch(
      updateSettings(payload, `${label} updated successfully!`)
    );
  };

  // Helper for current policy value
  const getPolicyValue = (tab: "privacy" | "terms" | "shipping" | "refund") => {
    switch (tab) {
      case "privacy":
        return policies.privacyPolicy;
      case "terms":
        return policies.termsConditions;
      case "shipping":
        return policies.shippingPolicy;
      case "refund":
        return policies.returnPolicy;
      default:
        return "";
    }
  };

  const handlePolicyChange = (val: string) => {
    switch (activeTab) {
      case "privacy":
        setPolicies((prev) => ({ ...prev, privacyPolicy: val }));
        break;
      case "terms":
        setPolicies((prev) => ({ ...prev, termsConditions: val }));
        break;
      case "shipping":
        setPolicies((prev) => ({ ...prev, shippingPolicy: val }));
        break;
      case "refund":
        setPolicies((prev) => ({ ...prev, returnPolicy: val }));
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
                          value={contactInfo.email}
                          onChange={(e) =>
                            setContactInfo({
                              ...contactInfo,
                              email: e.target.value,
                            })
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
                          value={contactInfo.phone}
                          onChange={(e) =>
                            setContactInfo({
                              ...contactInfo,
                              phone: e.target.value,
                            })
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
                          value={contactInfo.whatsapp}
                          onChange={(e) =>
                            setContactInfo({
                              ...contactInfo,
                              whatsapp: e.target.value,
                            })
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
                          value={contactInfo.address}
                          onChange={(e) =>
                            setContactInfo({
                              ...contactInfo,
                              address: e.target.value,
                            })
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
                  disabled={isLoading}
                  onClick={handleSaveContact}
                  className="font-semibold text-xs px-5 py-2.5 rounded-xl gap-2 shadow-md ml-auto"
                >
                  {isLoading ? (
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
                          value={socialLinks.facebook}
                          onChange={(e) =>
                            setSocialLinks({
                              ...socialLinks,
                              facebook: e.target.value,
                            })
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
                          value={socialLinks.instagram}
                          onChange={(e) =>
                            setSocialLinks({
                              ...socialLinks,
                              instagram: e.target.value,
                            })
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
                          value={socialLinks.twitter}
                          onChange={(e) =>
                            setSocialLinks({
                              ...socialLinks,
                              twitter: e.target.value,
                            })
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
                          value={socialLinks.youtube || ""}
                          onChange={(e) =>
                            setSocialLinks({
                              ...socialLinks,
                              youtube: e.target.value,
                            })
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
                  disabled={isLoading}
                  onClick={handleSaveSocial}
                  className="font-semibold text-xs px-5 py-2.5 rounded-xl gap-2 shadow-md ml-auto"
                >
                  {isLoading ? (
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
                        value={paymentInfo.prepaidDeliveryFee}
                        onChange={(e) =>
                          setPaymentInfo({
                            ...paymentInfo,
                            prepaidDeliveryFee: Number(e.target.value),
                          })
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
                        value={paymentInfo.freePrepaidDeliveryOn}
                        onChange={(e) =>
                          setPaymentInfo({
                            ...paymentInfo,
                            freePrepaidDeliveryOn: Number(e.target.value),
                          })
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
                        value={paymentInfo.codDeliveryFee}
                        onChange={(e) =>
                          setPaymentInfo({
                            ...paymentInfo,
                            codDeliveryFee: Number(e.target.value),
                          })
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
                        value={paymentInfo.freeCodDeliveryOn}
                        onChange={(e) =>
                          setPaymentInfo({
                            ...paymentInfo,
                            freeCodDeliveryOn: Number(e.target.value),
                          })
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
                        value={paymentInfo.maxFreeCodDeliveryOn}
                        onChange={(e) =>
                          setPaymentInfo({
                            ...paymentInfo,
                            maxFreeCodDeliveryOn: Number(e.target.value),
                          })
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

              {/* Card 3: Partial Payment Rules */}
              {/* <Card className="rounded-2xl border-border shadow-sm">
                <CardHeader className="py-4 px-6 border-b border-border/60 flex flex-row items-center justify-between">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Percent className="h-3.5 w-3.5" /> COD PARTIAL PAYMENT
                    RULES
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={partialCodSetup.partialCodRequired}
                      onCheckedChange={(checked) =>
                        setPartialCodSetup({
                          ...partialCodSetup,
                          partialCodRequired: checked,
                        })
                      }
                    />
                    <span className="text-xs font-semibold">Required</span>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                        PARTIAL PAYMENT TYPE
                      </label>
                      <select
                        value={partialCodSetup.partialType}
                        onChange={(e) =>
                          setPartialCodSetup({
                            ...partialCodSetup,
                            partialType: e.target.value,
                          })
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="Fixed Amount (₹)">
                          Fixed Amount (₹)
                        </option>
                        <option value="Percentage (%)">Percentage (%)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                        PARTIAL VALUE (₹)
                      </label>
                      <Input
                        value={partialCodSetup.partialValue}
                        onChange={(e) =>
                          setPartialCodSetup({
                            ...partialCodSetup,
                            partialValue: e.target.value,
                          })
                        }
                        className="h-10 bg-background font-mono"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground pt-1">
                    Partial COD requires users to pay a small token fee online
                    to prevent invalid orders. The remaining amount will be paid
                    during physical delivery.
                  </p>
                </CardContent>
              </Card> */}

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  disabled={isLoading}
                  onClick={handleSaveDelivery}
                  className="font-semibold text-xs px-5 py-2.5 rounded-xl gap-2 shadow-md ml-auto"
                >
                  {isLoading ? (
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
                  disabled={isLoading}
                  onClick={handleSavePolicy}
                  className="font-semibold text-xs px-5 py-2.5 rounded-xl gap-2 shadow-md ml-auto"
                >
                  {isLoading ? (
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
