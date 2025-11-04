import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import QuotaUsageTab from "@/components/mailrelay/QuotaUsageTab";
import ClientIPScopeTab from "@/components/mailrelay/ClientIPScopeTab";

const MailRelay = () => {
  const [selectedTenant, setSelectedTenant] = useState("tenant-001");
  const [activeTab, setActiveTab] = useState("quota");
  const [ipFilter, setIpFilter] = useState<string | null>(null);

  const tenants = [
    { id: "tenant-001", name: "Acme Corporation" },
    { id: "tenant-002", name: "TechStart Solutions" },
    { id: "tenant-003", name: "Global Enterprises" },
  ];

  const handleViewQuotasForIP = (ip: string) => {
    setIpFilter(ip);
    setActiveTab("quota");
  };

  const currentTenant = tenants.find((t) => t.id === selectedTenant);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Mail Relay</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Quota & IP Management</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Tenant Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Current Tenant
              </label>
              <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Tenant ID:</span> {currentTenant?.id}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="quota">Quota & Usage</TabsTrigger>
          <TabsTrigger value="ip">Client IP Scope</TabsTrigger>
        </TabsList>

        <TabsContent value="quota" className="space-y-6">
          <QuotaUsageTab tenantId={selectedTenant} ipFilter={ipFilter} onClearIpFilter={() => setIpFilter(null)} />
        </TabsContent>

        <TabsContent value="ip" className="space-y-6">
          <ClientIPScopeTab tenantId={selectedTenant} onViewQuotas={handleViewQuotasForIP} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MailRelay;
