import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { CalendarIcon, Download } from "lucide-react";
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
  const itemsPerPage = 10;

  // Mock activity data with failed recipients details
  const activityData = [
    {
      date: "2025-01-15 14:23:45",
      sender: "admin@company.com",
      recipient: "team@example.com",
      status: "Processed",
      tag: "",
      total: 150,
      failed: 0,
      success: 150,
      failedRecipients: [],
    },
    {
      date: "2025-01-15 13:15:22",
      sender: "marketing@company.com",
      recipient: "user1@domain.com",
      status: "Fail",
      tag: "Error",
      total: 1,
      failed: 1,
      success: 0,
      failedRecipients: [{ email: "user1@domain.com", reason: "Blocked by spam filter" }],
    },
    {
      date: "2025-01-15 11:45:10",
      sender: "support@company.com",
      recipient: "client@business.com",
      status: "Success",
      tag: "",
      total: 89,
      failed: 0,
      success: 89,
      failedRecipients: [],
    },
    {
      date: "2025-01-15 09:30:55",
      sender: "sales@company.com",
      recipient: "recipient1@email.com",
      status: "Fail",
      tag: "Error",
      total: 1,
      failed: 1,
      success: 0,
      failedRecipients: [{ email: "recipient1@email.com", reason: "Recipient address rejected" }],
    },
    {
      date: "2025-01-14 16:45:30",
      sender: "hr@company.com",
      recipient: "staff@company.com",
      status: "Success",
      tag: "",
      total: 234,
      failed: 0,
      success: 234,
      failedRecipients: [],
    },
    {
      date: "2025-01-14 15:20:18",
      sender: "admin@company.com",
      recipient: "spam1@test.com",
      status: "Fail",
      tag: "Error",
      total: 1,
      failed: 1,
      success: 0,
      failedRecipients: [{ email: "spam1@test.com", reason: "Blocked by recipient's spam filter" }],
    },
    {
      date: "2025-01-14 14:10:42",
      sender: "marketing@company.com",
      recipient: "reject1@bounce.com",
      status: "Fail",
      tag: "Error",
      total: 1,
      failed: 1,
      success: 0,
      failedRecipients: [{ email: "reject1@bounce.com", reason: "Permanent delivery failure" }],
    },
    {
      date: "2025-01-14 12:35:15",
      sender: "support@company.com",
      recipient: "customer@shop.com",
      status: "Processed",
      tag: "",
      total: 123,
      failed: 0,
      success: 123,
      failedRecipients: [],
    },
    {
      date: "2025-01-14 10:50:33",
      sender: "sales@company.com",
      recipient: "leads@prospect.com",
      status: "Success",
      tag: "",
      total: 267,
      failed: 0,
      success: 267,
      failedRecipients: [],
    },
    {
      date: "2025-01-14 09:15:28",
      sender: "info@company.com",
      recipient: "blocked1@provider.com",
      status: "Fail",
      tag: "Error",
      total: 1,
      failed: 1,
      success: 0,
      failedRecipients: [{ email: "blocked1@provider.com", reason: "Message blocked by email provider" }],
    },
    {
      date: "2025-01-13 17:30:50",
      sender: "admin@company.com",
      recipient: "users@platform.com",
      status: "Success",
      tag: "",
      total: 156,
      failed: 0,
      success: 156,
      failedRecipients: [],
    },
    {
      date: "2025-01-13 16:22:10",
      sender: "marketing@company.com",
      recipient: "subscribers@newsletter.com",
      status: "Success",
      tag: "",
      total: 298,
      failed: 0,
      success: 298,
      failedRecipients: [],
    },
    {
      date: "2025-01-13 15:18:45",
      sender: "support@company.com",
      recipient: "noreply@closed.com",
      status: "Fail",
      tag: "Error",
      total: 1,
      failed: 1,
      success: 0,
      failedRecipients: [{ email: "noreply@closed.com", reason: "Mailbox unavailable" }],
    },
    {
      date: "2025-01-13 14:05:33",
      sender: "sales@company.com",
      recipient: "contacts@enterprise.com",
      status: "Success",
      tag: "",
      total: 334,
      failed: 0,
      success: 334,
      failedRecipients: [],
    },
    {
      date: "2025-01-13 11:40:22",
      sender: "hr@company.com",
      recipient: "employees@company.com",
      status: "Success",
      tag: "",
      total: 145,
      failed: 0,
      success: 145,
      failedRecipients: [],
    },
    {
      date: "2025-01-12 16:55:18",
      sender: "admin@company.com",
      recipient: "all@company.com",
      status: "Success",
      tag: "",
      total: 223,
      failed: 0,
      success: 223,
      failedRecipients: [],
    },
    {
      date: "2025-01-12 15:25:40",
      sender: "marketing@company.com",
      recipient: "protect1@domain.com",
      status: "Fail",
      tag: "Error",
      total: 1,
      failed: 1,
      success: 0,
      failedRecipients: [{ email: "protect1@domain.com", reason: "Sender blocked by recipient" }],
    },
    {
      date: "2025-01-12 14:12:55",
      sender: "support@company.com",
      recipient: "help@customer.com",
      status: "Success",
      tag: "",
      total: 167,
      failed: 0,
      success: 167,
      failedRecipients: [],
    },
    {
      date: "2025-01-12 12:48:30",
      sender: "sales@company.com",
      recipient: "buyers@market.com",
      status: "Success",
      tag: "",
      total: 289,
      failed: 0,
      success: 289,
      failedRecipients: [],
    },
    {
      date: "2025-01-12 10:30:15",
      sender: "info@company.com",
      recipient: "dns@error.com",
      status: "Fail",
      tag: "Error",
      total: 1,
      failed: 1,
      success: 0,
      failedRecipients: [{ email: "dns@error.com", reason: "DNS lookup failed" }],
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
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Sender</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Tag</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date & time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((item, index) => {
                    const reason = item.failedRecipients?.[0]?.reason || "-";

                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <Badge variant={item.status === "Success" ? "default" : "destructive"}>{item.status}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{item.sender}</TableCell>
                        <TableCell className="font-medium">{item.recipient}</TableCell>
                        <TableCell>{item.tag && <Badge variant="destructive">{item.tag}</Badge>}</TableCell>
                        <TableCell>
                          {item.status === "Fail" ? <Badge variant="outline">{reason}</Badge> : "-"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{item.date}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 px-6 pb-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                แสดง {startIndex + 1} - {Math.min(endIndex, activityData.length)} จาก {activityData.length} รายการ
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Activity;
