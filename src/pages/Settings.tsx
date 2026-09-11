import { useState } from 'react'
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
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { RichTextEditor } from '@/components/ui/rich-text-editor'

type TabType =
  | 'social'
  | 'delivery'
  | 'privacy'
  | 'terms'
  | 'shipping'
  | 'refund'

interface TabItem {
  id: TabType
  title: string
  desc: string
  icon: React.ElementType
}

const TAB_ITEMS: TabItem[] = [
  {
    id: 'social',
    title: 'Social & Contact Info',
    desc: 'Phone, email, and social profiles',
    icon: Globe,
  },
  {
    id: 'delivery',
    title: 'Delivery Charges & COD',
    desc: 'Prepaid/COD fees & partial payments',
    icon: CreditCard,
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    desc: 'User data & privacy statement',
    icon: ShieldCheck,
  },
  {
    id: 'terms',
    title: 'Terms & Conditions',
    desc: 'Store rules & service terms',
    icon: FileText,
  },
  {
    id: 'shipping',
    title: 'Shipping & Delivery',
    desc: 'Timelines and delivery methods',
    icon: Truck,
  },
  {
    id: 'refund',
    title: 'Return & Refund Policy',
    desc: 'Returns window & refund rules',
    icon: RotateCcw,
  },
]

export default function Settings() {
  const [activeTab, setActiveTab] = useState<TabType>('social')
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)

  // Social & Contact State
  const [contactInfo, setContactInfo] = useState({
    email: 'info@baha.com',
    phone: '+919876543210',
    whatsapp: '+919876543210',
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com',
    twitter: 'https://x.com',
    youtube: 'https://www.youtube.com',
  })

  // Delivery & COD State
  const [deliverySetup, setDeliverySetup] = useState({
    prepaidFee: '0',
    prepaidFreeThreshold: '0',
    codFee: '50',
    codFreeThreshold: '0',
    maxCodAmount: '5000',
    partialCodRequired: true,
    partialType: 'Fixed Amount (₹)',
    partialValue: '55',
  })

  // Policies State
  const [policies, setPolicies] = useState({
    privacy:
      'We value your privacy. We collect personal information such as name, email, phone number, and address strictly for processing orders and enhancing your shopping experience. We never sell or share your data with unauthorized third parties.',
    terms:
      'By accessing and placing an order with Sree Vedics, you confirm that you are in agreement with and bound by the terms of service contained herein. Orders are subject to stock availability and pricing verification.',
    shipping:
      'Orders are processed within 24-48 hours. Standard delivery takes 3-7 business days across India depending on pincode serviceability. Express shipping option is available at checkout.',
    refund:
      'We accept returns within 7 days of product delivery. Products must be unopened, in their original packaging, and accompanied by the receipt.',
  })

  const triggerSaveSuccess = (message: string) => {
    setSaveSuccess(message)
    setTimeout(() => setSaveSuccess(null), 3000)
  }

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
          Update store contact points, loyalty configurations, policies, and social media handles.
        </p>
      </div>

      {/* Main Content Layout: Left Nav + Right Configuration Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-2">
        {/* Left Vertical Navigation Menu */}
        <div className="lg:col-span-4 xl:col-span-3 bg-card rounded-2xl border border-border p-2 sm:p-2.5 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1.5">
          {TAB_ITEMS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-start gap-3 sm:gap-3.5 p-3 sm:p-3.5 rounded-xl border-l-4 transition-all text-left cursor-pointer ${isActive
                    ? 'bg-muted text-foreground border-primary shadow-xs font-semibold'
                    : 'border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  }`}
              >
                <Icon
                  className={`h-5 w-5 mt-0.5 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'
                    }`}
                />
                <div className="min-w-0">
                  <p
                    className={`text-sm font-semibold leading-snug truncate ${isActive ? 'text-foreground font-bold' : 'text-muted-foreground'
                      }`}
                  >
                    {tab.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 sm:line-clamp-2">
                    {tab.desc}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Right Configuration View Viewport */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          {/* TAB 1: SOCIAL & CONTACT INFO */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Points Card */}
                <Card className="rounded-2xl border-border shadow-sm">
                  <CardHeader className="py-4 px-6 border-b border-border/60">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <span>#</span> CONTACT POINTS
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                        STORE EMAIL ADDRESS
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={contactInfo.email}
                          onChange={(e) =>
                            setContactInfo({ ...contactInfo, email: e.target.value })
                          }
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
                          value={contactInfo.phone}
                          onChange={(e) =>
                            setContactInfo({ ...contactInfo, phone: e.target.value })
                          }
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
                            setContactInfo({ ...contactInfo, whatsapp: e.target.value })
                          }
                          className="pl-9 h-10 bg-background"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Social Media Handles Card */}
                <Card className="rounded-2xl border-border shadow-sm">
                  <CardHeader className="py-4 px-6 border-b border-border/60">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5" /> SOCIAL MEDIA HANDLES
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                        INSTAGRAM PAGE URL
                      </label>
                      <div className="relative">
                        <Share2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={contactInfo.instagram}
                          onChange={(e) =>
                            setContactInfo({ ...contactInfo, instagram: e.target.value })
                          }
                          className="pl-9 h-10 bg-background text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                        FACEBOOK PAGE URL
                      </label>
                      <div className="relative">
                        <Share2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={contactInfo.facebook}
                          onChange={(e) =>
                            setContactInfo({ ...contactInfo, facebook: e.target.value })
                          }
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
                          value={contactInfo.twitter}
                          onChange={(e) =>
                            setContactInfo({ ...contactInfo, twitter: e.target.value })
                          }
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
                          value={contactInfo.youtube}
                          onChange={(e) =>
                            setContactInfo({ ...contactInfo, youtube: e.target.value })
                          }
                          className="pl-9 h-10 bg-background text-xs font-mono"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Bottom Action Bar */}
              <div className="flex items-center justify-between pt-2">
                {saveSuccess ? (
                  <span className="text-xs font-semibold text-emerald-600 animate-in fade-in">
                    ✓ {saveSuccess}
                  </span>
                ) : (
                  <span />
                )}
                <Button
                  onClick={() => triggerSaveSuccess('Contact & Social details saved successfully!')}
                  className="font-semibold text-xs px-5 py-2.5 rounded-xl gap-2 shadow-md ml-auto"
                >
                  <Save className="h-4 w-4" /> Save Contact & Social Details
                </Button>
              </div>
            </div>
          )}

          {/* TAB 3: DELIVERY CHARGES & COD */}
          {activeTab === 'delivery' && (
            <div className="space-y-6">
              {/* Card 1: Prepaid */}
              <Card className="rounded-2xl border-border shadow-sm">
                <CardHeader className="py-4 px-6 border-b border-border/60">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-3.5 w-3.5" /> PREPAID ORDER DELIVERY CHARGES
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                        PREPAID DELIVERY FEE (₹)
                      </label>
                      <Input
                        value={deliverySetup.prepaidFee}
                        onChange={(e) =>
                          setDeliverySetup({ ...deliverySetup, prepaidFee: e.target.value })
                        }
                        className="h-10 bg-background font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                        FREE DELIVERY THRESHOLD FOR PREPAID (₹)
                      </label>
                      <Input
                        value={deliverySetup.prepaidFreeThreshold}
                        onChange={(e) =>
                          setDeliverySetup({
                            ...deliverySetup,
                            prepaidFreeThreshold: e.target.value,
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
                    <PackageCheck className="h-3.5 w-3.5" /> CASH ON DELIVERY (COD) SETTINGS
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                        COD DELIVERY FEE (₹)
                      </label>
                      <Input
                        value={deliverySetup.codFee}
                        onChange={(e) =>
                          setDeliverySetup({ ...deliverySetup, codFee: e.target.value })
                        }
                        className="h-10 bg-background font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                        FREE DELIVERY THRESHOLD FOR COD (₹)
                      </label>
                      <Input
                        value={deliverySetup.codFreeThreshold}
                        onChange={(e) =>
                          setDeliverySetup({
                            ...deliverySetup,
                            codFreeThreshold: e.target.value,
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
                        MAX ALLOWED COD AMOUNT (₹)
                      </label>
                      <Input
                        value={deliverySetup.maxCodAmount}
                        onChange={(e) =>
                          setDeliverySetup({
                            ...deliverySetup,
                            maxCodAmount: e.target.value,
                          })
                        }
                        className="h-10 bg-background font-mono"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Disable COD for orders above this value.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card 3: Partial Payment Rules */}
              <Card className="rounded-2xl border-border shadow-sm">
                <CardHeader className="py-4 px-6 border-b border-border/60 flex flex-row items-center justify-between">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Percent className="h-3.5 w-3.5" /> COD PARTIAL PAYMENT RULES
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={deliverySetup.partialCodRequired}
                      onCheckedChange={(checked) =>
                        setDeliverySetup({ ...deliverySetup, partialCodRequired: checked })
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
                        value={deliverySetup.partialType}
                        onChange={(e) =>
                          setDeliverySetup({ ...deliverySetup, partialType: e.target.value })
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="Fixed Amount (₹)">Fixed Amount (₹)</option>
                        <option value="Percentage (%)">Percentage (%)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                        PARTIAL VALUE (₹)
                      </label>
                      <Input
                        value={deliverySetup.partialValue}
                        onChange={(e) =>
                          setDeliverySetup({
                            ...deliverySetup,
                            partialValue: e.target.value,
                          })
                        }
                        className="h-10 bg-background font-mono"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground pt-1">
                    Partial COD requires users to pay a small token fee online to prevent invalid orders. The remaining amount will be paid during physical delivery.
                  </p>
                </CardContent>
              </Card>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-2">
                {saveSuccess ? (
                  <span className="text-xs font-semibold text-emerald-600 animate-in fade-in">
                    ✓ {saveSuccess}
                  </span>
                ) : (
                  <span />
                )}
                <Button
                  onClick={() => triggerSaveSuccess('Delivery & COD settings saved!')}
                  className="font-semibold text-xs px-5 py-2.5 rounded-xl gap-2 shadow-md ml-auto"
                >
                  <Save className="h-4 w-4" /> Save Delivery Settings
                </Button>
              </div>
            </div>
          )}

          {/* POLICY TABS: PRIVACY, TERMS, SHIPPING, REFUND */}
          {(activeTab === 'privacy' ||
            activeTab === 'terms' ||
            activeTab === 'shipping' ||
            activeTab === 'refund') && (
              <div className="space-y-6">
                <Card className="rounded-2xl border-border shadow-sm">
                  <CardHeader className="py-4 px-6 border-b border-border/60">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <RotateCcw className="h-3.5 w-3.5" />
                      {activeTab === 'privacy' && 'PRIVACY POLICY'}
                      {activeTab === 'terms' && 'TERMS & CONDITIONS'}
                      {activeTab === 'shipping' && 'SHIPPING & DELIVERY POLICY'}
                      {activeTab === 'refund' && 'RETURN & REFUND POLICY'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                      {activeTab === 'privacy' && 'PRIVACY POLICY CONTENT'}
                      {activeTab === 'terms' && 'TERMS & CONDITIONS CONTENT'}
                      {activeTab === 'shipping' && 'SHIPPING POLICY CONTENT'}
                      {activeTab === 'refund' && 'RETURN & REFUND POLICY CONTENT'}
                    </label>

                    {/* Rich Text Editor */}
                    <RichTextEditor
                      value={policies[activeTab]}
                      onChange={(val) => setPolicies({ ...policies, [activeTab]: val })}
                      placeholder="Type policy details here..."
                      minHeight="260px"
                    />

                    <p className="text-[11px] text-muted-foreground pt-1">
                      State return windows (e.g., 7 days), product eligibility (opened vs unopened), shipping fees, and payment channels.
                    </p>
                  </CardContent>
                </Card>

                {/* Action Bar */}
                <div className="flex items-center justify-between pt-2">
                  {saveSuccess ? (
                    <span className="text-xs font-semibold text-emerald-600 animate-in fade-in">
                      ✓ {saveSuccess}
                    </span>
                  ) : (
                    <span />
                  )}
                  <Button
                    onClick={() =>
                      triggerSaveSuccess(
                        `${activeTab === 'privacy'
                          ? 'Privacy Policy'
                          : activeTab === 'terms'
                            ? 'Terms & Conditions'
                            : activeTab === 'shipping'
                              ? 'Shipping Policy'
                              : 'Return & Refund Policy'
                        } updated successfully!`
                      )
                    }
                    className="font-semibold text-xs px-5 py-2.5 rounded-xl gap-2 shadow-md ml-auto"
                  >
                    <Save className="h-4 w-4" /> Save Policy
                  </Button>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}