import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getStoredCustomers, type Customer } from "@/data/mockCustomers";
import { getStoredOrders, type Order } from "@/data/mockOrders";
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  DollarSign,
  CalendarDays,
  Clock,
  FileText,
  Star,
  ArrowLeft,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import OrdersTable from "@/components/OrdersTable/OrdersTable";

const STATUS_STYLES: Record<string, string> = {
  Active: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  VIP: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  Inactive: "bg-muted text-muted-foreground border-border",
  Blocked: "bg-rose-500/15 text-rose-500 border-rose-500/30",
};

const GROUP_STYLES: Record<string, string> = {
  Regular: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  VIP: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  Wholesale: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  New: "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function CustomerDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<Customer | null>(null);

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const customers = getStoredCustomers();
    const found = customers.find((c) => c.id === id);
    if (found) setCustomer(found);

    const orders = getStoredOrders();

    const customerOrders = orders.filter((o) => o.customer.id === id);
    setOrders(customerOrders);
  }, [id]);

  return (
    <div className="space-y-5 max-w-full mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/customers")}
            className="h-10 w-10 rounded-2xl border-border hover:bg-muted cursor-pointer shrink-0"
            title="Back to Orders"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2.5 text-foreground">
            <User className="h-7 w-7 text-emerald-500" /> Customer Details
          </h1>
        </div>
      </div>

      {!customer ? (
        <div className="py-20 text-center text-muted-foreground">
          <User className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Customer not found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ── Left Column: Profile Card ───────────────────── */}
          <Card className="lg:col-span-1 bg-card border-border shadow-sm">
            <CardContent className="p-6 flex flex-col sm:flex-row lg:flex-col items-center sm:items-start lg:items-center text-center sm:text-left lg:text-center gap-5">
              {/* Avatar + identity (always stacked together) */}
              <div className="flex flex-col items-center gap-4 shrink-0">
                <Avatar className="h-24 w-24 border-2 border-indigo-500/30 shadow-lg">
                  {customer.avatar && (
                    <AvatarImage src={customer.avatar} alt={customer.name} />
                  )}
                  <AvatarFallback className="bg-indigo-500/20 text-indigo-400 font-bold text-2xl">
                    {getInitials(customer.name)}
                  </AvatarFallback>
                </Avatar>

                {/* Name & ID */}
                <div className="text-center">
                  <h2 className="text-xl font-bold text-foreground">
                    {customer.name}
                  </h2>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    {customer.id}
                  </p>
                </div>

                {/* Status & Group badges */}
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <Badge
                    variant="outline"
                    className={`text-xs font-semibold px-2.5 py-0.5 ${STATUS_STYLES[customer.status] ?? ""}`}
                  >
                    <Star className="h-3 w-3 mr-1" />
                    {customer.status}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-xs font-semibold px-2.5 py-0.5 ${GROUP_STYLES[customer.group] ?? ""}`}
                  >
                    {customer.group}
                  </Badge>
                </div>

                {/* Member since */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                  Member since{" "}
                  {new Date(customer.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>

              {/* Divider — horizontal on mobile/lg, vertical on sm */}
              <div className="w-full sm:w-px sm:h-auto sm:self-stretch lg:w-full lg:h-px border-t sm:border-t-0 sm:border-l lg:border-l-0 lg:border-t border-border" />

              {/* Contact info */}
              <div className="w-full space-y-2.5 text-sm text-left">
                <div className="flex items-center gap-2.5 text-foreground">
                  <Mail className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span className="truncate">{customer.email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{customer.phone}</span>
                </div>
                <div className="flex items-start gap-2.5 text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                  <span className="leading-snug">
                    {customer.address.street},<br />
                    {customer.address.city}, {customer.address.state}{" "}
                    {customer.address.zipCode},<br />
                    {customer.address.country}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Right Column ───────────────────────────────── */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Stats Strip */}
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  icon: <ShoppingBag className="h-5 w-5" />,
                  label: "Total Orders",
                  value: customer.totalOrders,
                  color: "text-indigo-400",
                  bg: "bg-indigo-500/10",
                },
                {
                  icon: <DollarSign className="h-5 w-5" />,
                  label: "Total Spent",
                  value: `₹${customer.totalSpent.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
                  color: "text-emerald-400",
                  bg: "bg-emerald-500/10",
                },
                {
                  icon: <Clock className="h-5 w-5" />,
                  label: "Last Order",
                  value: new Date(customer.lastOrderDate).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    },
                  ),
                  color: "text-cyan-400",
                  bg: "bg-cyan-500/10",
                },
              ].map((stat) => (
                <Card
                  key={stat.label}
                  className="bg-card border-border shadow-sm"
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-1.5">
                    <div
                      className={`h-9 w-9 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}
                    >
                      {stat.icon}
                    </div>
                    <p className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider">
                      {stat.label}
                    </p>
                    <p className="text-base font-bold text-foreground">
                      {stat.value}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Notes */}
            {customer.notes && (
              <Card className="bg-card border-border shadow-sm">
                <CardHeader className="pb-2 pt-4 px-5">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-400" /> Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <p className="text-sm text-foreground leading-relaxed">
                    {customer.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      <OrdersTable orders={orders} onOrdersChange={setOrders} />
    </div>
  );
}
