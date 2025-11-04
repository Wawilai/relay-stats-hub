import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, CheckCircle, XCircle, Edit, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientIPScopeTabProps {
  tenantId: string;
  onViewQuotas: (ip: string) => void;
}

interface IPData {
  id: string;
  ipCidr: string;
  description: string;
  status: "active" | "inactive";
  validFrom: string | null;
  validUntil: string | null;
  isCurrentlyValid: boolean;
  quotaCount: number;
  createdAt: string;
  updatedAt: string;
}

const ClientIPScopeTab = ({ tenantId, onViewQuotas }: ClientIPScopeTabProps) => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIP, setSelectedIP] = useState<IPData | null>(null);
  const [isAddingIP, setIsAddingIP] = useState(false);
  const [testIP, setTestIP] = useState("");
  const [testResult, setTestResult] = useState<{ valid: boolean; message: string } | null>(null);

  // Mock data
  const ipList: IPData[] = [
    {
      id: "1",
      ipCidr: "192.168.1.0/24",
      description: "Office Network - Main Building",
      status: "active",
      validFrom: "2025-01-01",
      validUntil: null,
      isCurrentlyValid: true,
      quotaCount: 5,
      createdAt: "2025-01-01",
      updatedAt: "2025-01-01",
    },
    {
      id: "2",
      ipCidr: "10.0.0.50/32",
      description: "Production Mail Server",
      status: "active",
      validFrom: "2025-01-01",
      validUntil: "2025-12-31",
      isCurrentlyValid: true,
      quotaCount: 2,
      createdAt: "2025-01-01",
      updatedAt: "2025-01-03",
    },
    {
      id: "3",
      ipCidr: "172.16.0.0/16",
      description: "Legacy System - Deprecated",
      status: "inactive",
      validFrom: "2024-01-01",
      validUntil: "2024-12-31",
      isCurrentlyValid: false,
      quotaCount: 0,
      createdAt: "2024-01-01",
      updatedAt: "2025-01-01",
    },
  ];

  const filteredIPs = ipList.filter((ip) => {
    if (statusFilter !== "all" && ip.status !== statusFilter) return false;
    if (searchTerm && !ip.ipCidr.includes(searchTerm) && !ip.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleTestIP = () => {
    // Mock test logic
    const isValid = Math.random() > 0.3;
    setTestResult({
      valid: isValid,
      message: isValid
        ? `IP ${testIP} is allowed and matches range 192.168.1.0/24`
        : `IP ${testIP} is not in any allowed ranges`,
    });
  };

  const handleSaveIP = () => {
    // Mock save logic
    setIsAddingIP(false);
    setSelectedIP(null);
  };

  return (
    <>
      {/* Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search IP or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button onClick={() => setIsAddingIP(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add IP Range
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* IP List Table */}
      <Card>
        <CardHeader>
          <CardTitle>Client IP Ranges</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>IP/CIDR</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valid Window</TableHead>
                <TableHead>Currently Valid</TableHead>
                <TableHead>Quotas</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIPs.map((ip) => (
                <TableRow key={ip.id}>
                  <TableCell className="font-mono font-medium">{ip.ipCidr}</TableCell>
                  <TableCell>{ip.description}</TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "capitalize",
                        ip.status === "active"
                          ? "bg-success text-success-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {ip.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {ip.validFrom && <div>From: {ip.validFrom}</div>}
                      {ip.validUntil ? <div>Until: {ip.validUntil}</div> : <div>Until: Permanent</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    {ip.isCurrentlyValid ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => onViewQuotas(ip.ipCidr.split("/")[0])}
                      className="p-0 h-auto gap-1"
                    >
                      {ip.quotaCount} quotas
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedIP(ip)}
                      className="gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Test IP Tool */}
      <Card>
        <CardHeader>
          <CardTitle>Test IP Diagnostic</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter IP address to test (e.g., 192.168.1.100)"
                  value={testIP}
                  onChange={(e) => setTestIP(e.target.value)}
                />
              </div>
              <Button onClick={handleTestIP}>Test IP</Button>
            </div>
            {testResult && (
              <div
                className={cn(
                  "p-4 rounded-lg border-2",
                  testResult.valid
                    ? "bg-success/10 border-success"
                    : "bg-destructive/10 border-destructive"
                )}
              >
                <div className="flex items-start gap-3">
                  {testResult.valid ? (
                    <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                  )}
                  <div>
                    <p className="font-semibold mb-1">
                      {testResult.valid ? "IP is allowed" : "IP is not allowed"}
                    </p>
                    <p className="text-sm text-muted-foreground">{testResult.message}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit IP Drawer */}
      <Sheet open={isAddingIP || !!selectedIP} onOpenChange={() => { setIsAddingIP(false); setSelectedIP(null); }}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{isAddingIP ? "Add IP Range" : "Edit IP Range"}</SheetTitle>
            <SheetDescription>
              Configure allowed client IP addresses or CIDR ranges for this tenant.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="ipCidr">IP/CIDR *</Label>
              <Input
                id="ipCidr"
                placeholder="e.g., 192.168.1.0/24 or 10.0.0.1/32"
                defaultValue={selectedIP?.ipCidr}
              />
              <p className="text-xs text-muted-foreground">
                Enter a single IP or CIDR notation for a range
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe this IP range..."
                defaultValue={selectedIP?.description}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select defaultValue={selectedIP?.status || "active"}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="validFrom">Valid From</Label>
                <Input
                  id="validFrom"
                  type="date"
                  defaultValue={selectedIP?.validFrom || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validUntil">Valid Until</Label>
                <Input
                  id="validUntil"
                  type="date"
                  defaultValue={selectedIP?.validUntil || ""}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty for permanent
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSaveIP} className="flex-1">
                {isAddingIP ? "Add IP Range" : "Save Changes"}
              </Button>
              <Button
                variant="outline"
                onClick={() => { setIsAddingIP(false); setSelectedIP(null); }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ClientIPScopeTab;
