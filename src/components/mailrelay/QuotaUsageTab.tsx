import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Mail, Users, HardDrive, TrendingUp, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuotaUsageTabProps {
  tenantId: string;
  ipFilter: string | null;
  onClearIpFilter: () => void;
}

interface QuotaData {
  id: string;
  scope: "tenant" | "ip";
  ipAddress?: string;
  messageLimit: number;
  messagesUsed: number;
  recipientLimit: number;
  recipientsUsed: number;
  sizeLimit: number;
  sizeUsed: number;
  resetPolicy: string;
  lastResetAt: string;
  status: "healthy" | "warning" | "exceeded";
}

const QuotaUsageTab = ({ tenantId, ipFilter, onClearIpFilter }: QuotaUsageTabProps) => {
  const [period, setPeriod] = useState("7d");
  const [scopeFilter, setScopeFilter] = useState<string>(ipFilter ? "ip" : "all");
  const [selectedQuota, setSelectedQuota] = useState<QuotaData | null>(null);

  // Mock data
  const quotas: QuotaData[] = [
    {
      id: "1",
      scope: "tenant",
      messageLimit: 100000,
      messagesUsed: 45230,
      recipientLimit: 150000,
      recipientsUsed: 67890,
      sizeLimit: 10240,
      sizeUsed: 3456,
      resetPolicy: "Monthly",
      lastResetAt: "2025-01-01",
      status: "healthy",
    },
    {
      id: "2",
      scope: "ip",
      ipAddress: "192.168.1.100",
      messageLimit: 10000,
      messagesUsed: 8950,
      recipientLimit: 15000,
      recipientsUsed: 13400,
      sizeLimit: 2048,
      sizeUsed: 1890,
      resetPolicy: "Daily",
      lastResetAt: "2025-01-04",
      status: "warning",
    },
    {
      id: "3",
      scope: "ip",
      ipAddress: "10.0.0.50",
      messageLimit: 5000,
      messagesUsed: 5120,
      recipientLimit: 8000,
      recipientsUsed: 8250,
      sizeLimit: 1024,
      sizeUsed: 1100,
      resetPolicy: "Daily",
      lastResetAt: "2025-01-04",
      status: "exceeded",
    },
  ];

  const filteredQuotas = quotas.filter((q) => {
    if (scopeFilter === "tenant" && q.scope !== "tenant") return false;
    if (scopeFilter === "ip" && q.scope !== "ip") return false;
    if (ipFilter && q.ipAddress !== ipFilter) return false;
    return true;
  });

  const totalMessages = quotas.reduce((sum, q) => sum + q.messagesUsed, 0);
  const totalRecipients = quotas.reduce((sum, q) => sum + q.recipientsUsed, 0);
  const totalSize = quotas.reduce((sum, q) => sum + q.sizeUsed, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-success text-success-foreground";
      case "warning":
        return "bg-warning text-warning-foreground";
      case "exceeded":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPercentage = (used: number, limit: number) => {
    return Math.round((used / limit) * 100);
  };

  return (
    <>
      {/* Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Period</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Scope</label>
              <Select value={scopeFilter} onValueChange={setScopeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scopes</SelectItem>
                  <SelectItem value="tenant">Tenant-wide</SelectItem>
                  <SelectItem value="ip">IP-specific</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {ipFilter && (
              <div className="flex items-end">
                <Button variant="outline" onClick={onClearIpFilter} className="gap-2">
                  <X className="h-4 w-4" />
                  Clear IP Filter: {ipFilter}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Messages</p>
                <p className="text-3xl font-bold">{totalMessages.toLocaleString()}</p>
              </div>
              <div className="rounded-full bg-primary p-3">
                <Mail className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Recipients</p>
                <p className="text-3xl font-bold">{totalRecipients.toLocaleString()}</p>
              </div>
              <div className="rounded-full bg-success p-3">
                <Users className="h-6 w-6 text-success-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Size (MB)</p>
                <p className="text-3xl font-bold">{totalSize.toLocaleString()}</p>
              </div>
              <div className="rounded-full bg-warning p-3">
                <HardDrive className="h-6 w-6 text-warning-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Quota Status</p>
                <p className="text-3xl font-bold">
                  {quotas.filter((q) => q.status === "exceeded").length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Exceeded</p>
              </div>
              <div className="rounded-full bg-destructive p-3">
                <TrendingUp className="h-6 w-6 text-destructive-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quota Table */}
      <Card>
        <CardHeader>
          <CardTitle>Quota Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Scope</TableHead>
                <TableHead>Messages</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Size (MB)</TableHead>
                <TableHead>Reset Policy</TableHead>
                <TableHead>Last Reset</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotas.map((quota) => (
                <TableRow
                  key={quota.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedQuota(quota)}
                >
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {quota.scope === "tenant" ? "Tenant-wide" : `IP: ${quota.ipAddress}`}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        {quota.messagesUsed.toLocaleString()} / {quota.messageLimit.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {getPercentage(quota.messagesUsed, quota.messageLimit)}% used
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        {quota.recipientsUsed.toLocaleString()} / {quota.recipientLimit.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {getPercentage(quota.recipientsUsed, quota.recipientLimit)}% used
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        {quota.sizeUsed.toLocaleString()} / {quota.sizeLimit.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {getPercentage(quota.sizeUsed, quota.sizeLimit)}% used
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{quota.resetPolicy}</TableCell>
                  <TableCell>{quota.lastResetAt}</TableCell>
                  <TableCell>
                    <Badge className={cn("capitalize", getStatusColor(quota.status))}>
                      {quota.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Drawer */}
      <Sheet open={!!selectedQuota} onOpenChange={() => setSelectedQuota(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Quota Details</SheetTitle>
            <SheetDescription>
              {selectedQuota?.scope === "tenant"
                ? "Tenant-wide quota information"
                : `IP-specific quota for ${selectedQuota?.ipAddress}`}
            </SheetDescription>
          </SheetHeader>

          {selectedQuota && (
            <div className="mt-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Overview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Scope</span>
                    <span className="font-medium">
                      {selectedQuota.scope === "tenant" ? "Tenant-wide" : "IP-specific"}
                    </span>
                  </div>
                  {selectedQuota.ipAddress && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">IP Address</span>
                      <span className="font-medium">{selectedQuota.ipAddress}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Status</span>
                    <Badge className={cn("capitalize", getStatusColor(selectedQuota.status))}>
                      {selectedQuota.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Reset Policy</span>
                    <span className="font-medium">{selectedQuota.resetPolicy}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Last Reset</span>
                    <span className="font-medium">{selectedQuota.lastResetAt}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Usage Details</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Messages</span>
                      <span>
                        {selectedQuota.messagesUsed.toLocaleString()} /{" "}
                        {selectedQuota.messageLimit.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: `${getPercentage(selectedQuota.messagesUsed, selectedQuota.messageLimit)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Recipients</span>
                      <span>
                        {selectedQuota.recipientsUsed.toLocaleString()} /{" "}
                        {selectedQuota.recipientLimit.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-success"
                        style={{
                          width: `${getPercentage(selectedQuota.recipientsUsed, selectedQuota.recipientLimit)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Size (MB)</span>
                      <span>
                        {selectedQuota.sizeUsed.toLocaleString()} / {selectedQuota.sizeLimit.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-warning"
                        style={{
                          width: `${getPercentage(selectedQuota.sizeUsed, selectedQuota.sizeLimit)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default QuotaUsageTab;
