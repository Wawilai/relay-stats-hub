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
  const [senderEmail, setSenderEmail] = useState("");
  const [receiverEmail, setReceiverEmail] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock activity data (expanded for pagination demo)
  const activityData = [
    { date: "2025-01-15 14:23:45", sender: "admin@company.com", status: "ส่งสำเร็จ", total: 150, failed: 5, success: 145, queue: 0 },
    { date: "2025-01-15 13:15:22", sender: "marketing@company.com", status: "มีบางส่วนล้มเหลว", total: 320, failed: 28, success: 292, queue: 0 },
    { date: "2025-01-15 11:45:10", sender: "support@company.com", status: "ส่งสำเร็จ", total: 89, failed: 0, success: 89, queue: 0 },
    { date: "2025-01-15 09:30:55", sender: "sales@company.com", status: "กำลังส่ง", total: 500, failed: 12, success: 453, queue: 35 },
    { date: "2025-01-14 16:45:30", sender: "hr@company.com", status: "ส่งสำเร็จ", total: 234, failed: 3, success: 231, queue: 0 },
    { date: "2025-01-14 15:20:18", sender: "admin@company.com", status: "ส่งสำเร็จ", total: 178, failed: 8, success: 170, queue: 0 },
    { date: "2025-01-14 14:10:42", sender: "marketing@company.com", status: "มีบางส่วนล้มเหลว", total: 445, failed: 35, success: 410, queue: 0 },
    { date: "2025-01-14 12:35:15", sender: "support@company.com", status: "ส่งสำเร็จ", total: 123, failed: 2, success: 121, queue: 0 },
    { date: "2025-01-14 10:50:33", sender: "sales@company.com", status: "ส่งสำเร็จ", total: 267, failed: 7, success: 260, queue: 0 },
    { date: "2025-01-14 09:15:28", sender: "info@company.com", status: "กำลังส่ง", total: 389, failed: 15, success: 356, queue: 18 },
    { date: "2025-01-13 17:30:50", sender: "admin@company.com", status: "ส่งสำเร็จ", total: 156, failed: 4, success: 152, queue: 0 },
    { date: "2025-01-13 16:22:10", sender: "marketing@company.com", status: "ส่งสำเร็จ", total: 298, failed: 9, success: 289, queue: 0 },
    { date: "2025-01-13 15:18:45", sender: "support@company.com", status: "มีบางส่วนล้มเหลว", total: 189, failed: 22, success: 167, queue: 0 },
    { date: "2025-01-13 14:05:33", sender: "sales@company.com", status: "ส่งสำเร็จ", total: 334, failed: 5, success: 329, queue: 0 },
    { date: "2025-01-13 11:40:22", sender: "hr@company.com", status: "ส่งสำเร็จ", total: 145, failed: 3, success: 142, queue: 0 },
    { date: "2025-01-12 16:55:18", sender: "admin@company.com", status: "ส่งสำเร็จ", total: 223, failed: 6, success: 217, queue: 0 },
    { date: "2025-01-12 15:25:40", sender: "marketing@company.com", status: "กำลังส่ง", total: 456, failed: 18, success: 423, queue: 15 },
    { date: "2025-01-12 14:12:55", sender: "support@company.com", status: "ส่งสำเร็จ", total: 167, failed: 4, success: 163, queue: 0 },
    { date: "2025-01-12 12:48:30", sender: "sales@company.com", status: "ส่งสำเร็จ", total: 289, failed: 7, success: 282, queue: 0 },
    { date: "2025-01-12 10:30:15", sender: "info@company.com", status: "มีบางส่วนล้มเหลว", total: 378, failed: 31, success: 347, queue: 0 },
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
                <label className="text-sm font-medium">วันที่เริ่มต้น</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP", { locale: th }) : "เลือกวันที่"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} locale={th} />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">วันที่สิ้นสุด</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP", { locale: th }) : "เลือกวันที่"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} locale={th} />
                  </PopoverContent>
                </Popover>
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
                    <TableHead className="text-right">คิว</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="whitespace-nowrap">{item.date}</TableCell>
                      <TableCell className="font-medium">{item.sender}</TableCell>
                      <TableCell>
                        <span
                          className={
                            item.status === "ส่งสำเร็จ"
                              ? "text-success"
                              : item.status === "กำลังส่ง"
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
                      <TableCell className="text-right text-warning font-semibold">
                        {item.queue.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
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
      </div>
    </Layout>
  );
};

export default Activity;
