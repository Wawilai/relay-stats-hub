import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { CalendarIcon, Download, Eye } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { toast } from "sonner";

const Activity = () => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");
  const [senderEmail, setSenderEmail] = useState("");
  const [receiverEmail, setReceiverEmail] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const itemsPerPage = 10;

  // Mock activity data with failed recipients details
  const activityData = [
    { 
      date: "2025-01-15 14:23:45", 
      sender: "admin@company.com", 
      status: "Success", 
      total: 150, 
      failed: 5, 
      success: 145,
      failedRecipients: [
        { email: "invalid@domain.com", reason: "Invalid domain" },
        { email: "user1@example.com", reason: "Mailbox full" },
        { email: "user2@example.com", reason: "User not found" },
        { email: "blocked@spam.com", reason: "Blocked by spam filter" },
        { email: "bounce@test.com", reason: "Hard bounce" },
      ]
    },
    { 
      date: "2025-01-15 13:15:22", 
      sender: "marketing@company.com", 
      status: "Block", 
      total: 320, 
      failed: 28, 
      success: 292,
      failedRecipients: [
        { email: "expired@domain.com", reason: "Domain expired" },
        { email: "full@mailbox.com", reason: "Mailbox full" },
        { email: "invalid@test.com", reason: "Invalid email format" },
      ]
    },
    { date: "2025-01-15 11:45:10", sender: "support@company.com", status: "Success", total: 89, failed: 0, success: 89, failedRecipients: [] },
    { 
      date: "2025-01-15 09:30:55", 
      sender: "sales@company.com", 
      status: "Reject", 
      total: 500, 
      failed: 12, 
      success: 453,
      failedRecipients: [
        { email: "temp@block.com", reason: "Temporary block" },
        { email: "quota@exceeded.com", reason: "Quota exceeded" },
      ]
    },
    { 
      date: "2025-01-14 16:45:30", 
      sender: "hr@company.com", 
      status: "Success", 
      total: 234, 
      failed: 3, 
      success: 231,
      failedRecipients: [
        { email: "deactivated@user.com", reason: "Account deactivated" },
        { email: "moved@away.com", reason: "User moved" },
        { email: "noreply@test.com", reason: "No reply address" },
      ]
    },
    { 
      date: "2025-01-14 15:20:18", 
      sender: "admin@company.com", 
      status: "Success", 
      total: 178, 
      failed: 8, 
      success: 170,
      failedRecipients: [
        { email: "spam@filter.com", reason: "Spam filter rejection" },
        { email: "blacklist@domain.com", reason: "Blacklisted domain" },
      ]
    },
    { 
      date: "2025-01-14 14:10:42", 
      sender: "marketing@company.com", 
      status: "Block", 
      total: 445, 
      failed: 35, 
      success: 410,
      failedRecipients: [
        { email: "bounce@hard.com", reason: "Hard bounce" },
        { email: "soft@bounce.com", reason: "Soft bounce" },
        { email: "timeout@server.com", reason: "Connection timeout" },
      ]
    },
    { 
      date: "2025-01-14 12:35:15", 
      sender: "support@company.com", 
      status: "Success", 
      total: 123, 
      failed: 2, 
      success: 121,
      failedRecipients: [
        { email: "dns@error.com", reason: "DNS lookup failed" },
        { email: "refused@connection.com", reason: "Connection refused" },
      ]
    },
    { 
      date: "2025-01-14 10:50:33", 
      sender: "sales@company.com", 
      status: "Success", 
      total: 267, 
      failed: 7, 
      success: 260,
      failedRecipients: [
        { email: "greylisted@server.com", reason: "Greylisted" },
        { email: "rate@limit.com", reason: "Rate limit exceeded" },
      ]
    },
    { 
      date: "2025-01-14 09:15:28", 
      sender: "info@company.com", 
      status: "Reject", 
      total: 389, 
      failed: 15, 
      success: 356,
      failedRecipients: [
        { email: "virus@detected.com", reason: "Virus detected in content" },
        { email: "policy@violation.com", reason: "Policy violation" },
      ]
    },
    { date: "2025-01-13 17:30:50", sender: "admin@company.com", status: "Success", total: 156, failed: 4, success: 152, failedRecipients: [] },
    { date: "2025-01-13 16:22:10", sender: "marketing@company.com", status: "Success", total: 298, failed: 9, success: 289, failedRecipients: [] },
    { 
      date: "2025-01-13 15:18:45", 
      sender: "support@company.com", 
      status: "Block", 
      total: 189, 
      failed: 22, 
      success: 167,
      failedRecipients: [
        { email: "disabled@account.com", reason: "Account disabled" },
        { email: "full@storage.com", reason: "Storage full" },
      ]
    },
    { date: "2025-01-13 14:05:33", sender: "sales@company.com", status: "Success", total: 334, failed: 5, success: 329, failedRecipients: [] },
    { date: "2025-01-13 11:40:22", sender: "hr@company.com", status: "Success", total: 145, failed: 3, success: 142, failedRecipients: [] },
    { date: "2025-01-12 16:55:18", sender: "admin@company.com", status: "Success", total: 223, failed: 6, success: 217, failedRecipients: [] },
    { 
      date: "2025-01-12 15:25:40", 
      sender: "marketing@company.com", 
      status: "Reject", 
      total: 456, 
      failed: 18, 
      success: 423,
      failedRecipients: [
        { email: "retry@limit.com", reason: "Retry limit exceeded" },
        { email: "invalid@mx.com", reason: "Invalid MX record" },
      ]
    },
    { date: "2025-01-12 14:12:55", sender: "support@company.com", status: "Success", total: 167, failed: 4, success: 163, failedRecipients: [] },
    { date: "2025-01-12 12:48:30", sender: "sales@company.com", status: "Success", total: 289, failed: 7, success: 282, failedRecipients: [] },
    { 
      date: "2025-01-12 10:30:15", 
      sender: "info@company.com", 
      status: "Block", 
      total: 378, 
      failed: 31, 
      success: 347,
      failedRecipients: [
        { email: "authentication@failed.com", reason: "Authentication failed" },
        { email: "spf@fail.com", reason: "SPF check failed" },
        { email: "dkim@fail.com", reason: "DKIM verification failed" },
      ]
    },
  ];

  // Pagination calculations
  const totalPages = Math.ceil(activityData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = activityData.slice(startIndex, endIndex);

  const handleExport = () => {
    toast.success("กำลัง Export ข้อมูลเป็นไฟล์ Excel");
  };

  const handleViewDetails = (item: any) => {
    setSelectedActivity(item);
    setIsDialogOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Activity</h2>
          <Button onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>ค้นหา Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">วันที่และเวลาเริ่มต้น</label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="flex-1 justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "dd/MM/yyyy", { locale: th }) : "เลือกวันที่"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={startDate} onSelect={setStartDate} locale={th} />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-[130px]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">วันที่และเวลาสิ้นสุด</label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="flex-1 justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "dd/MM/yyyy", { locale: th }) : "เลือกวันที่"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={endDate} onSelect={setEndDate} locale={th} />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-[130px]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">อีเมลผู้ส่ง</label>
                <Input
                  type="email"
                  placeholder="ค้นหาจากอีเมลผู้ส่ง"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">อีเมลผู้รับ</label>
                <Input
                  type="email"
                  placeholder="ค้นหาจากอีเมลผู้รับ"
                  value={receiverEmail}
                  onChange={(e) => setReceiverEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4">
              <Button>ค้นหา</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>รายการ Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>วันที่ส่ง</TableHead>
                    <TableHead>ผู้ส่ง</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead className="text-right">ทั้งหมด</TableHead>
                    <TableHead className="text-right">ล้มเหลว</TableHead>
                    <TableHead className="text-right">สำเร็จ</TableHead>
                    <TableHead className="text-center">รายละเอียด</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((item, index) => {
                    const hasFailures = item.failed > 0;

                    return (
                      <TableRow key={index}>
                        <TableCell className="whitespace-nowrap">{item.date}</TableCell>
                        <TableCell className="font-medium">{item.sender}</TableCell>
                        <TableCell>
                          <span
                            className={
                              item.status === "Success"
                                ? "text-success"
                                : item.status === "Block"
                                ? "text-warning"
                                : "text-destructive"
                            }
                          >
                            {item.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {item.total.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-destructive font-semibold">
                          {item.failed.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-success font-semibold">
                          {item.success.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          {hasFailures && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(item)}
                              className="gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              ดูรายละเอียด
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                แสดง {startIndex + 1} - {Math.min(endIndex, activityData.length)} จาก {activityData.length} รายการ
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>รายการที่ส่งไม่สำเร็จ</DialogTitle>
              <DialogDescription>
                {selectedActivity && (
                  <>
                    วันที่ส่ง: {selectedActivity.date} | ผู้ส่ง: {selectedActivity.sender} | 
                    รายการล้มเหลว: {selectedActivity.failedRecipients.length} รายการ
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            {selectedActivity && (
              <div className="space-y-3 mt-4">
                {selectedActivity.failedRecipients.map((recipient: any, idx: number) => (
                  <div 
                    key={idx} 
                    className="flex justify-between items-start p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-sm mb-1">{recipient.email}</p>
                      <p className="text-sm text-muted-foreground">สาเหตุ: {recipient.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Activity;
