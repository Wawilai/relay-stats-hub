import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { CalendarIcon, Download } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";

const Report = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");
  const [filterType, setFilterType] = useState<"day" | "week" | "month">("day");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();

  // Mock report data (expanded for pagination demo)
  const reportData = [
    {
      date: "2025-01-15",
      domain: "gmail.com",
      success: 2345,
      block: 45,
      blockedRecipients: Array.from({ length: 45 }, (_, i) => ({
        email: `user${i + 1}@gmail.com`,
        reason: ["Spam filter", "Invalid recipient", "Mailbox full", "Rate limit exceeded", "Blocked by recipient"][
          i % 5
        ],
      })),
    },
    {
      date: "2025-01-15",
      domain: "yahoo.com",
      success: 1567,
      block: 32,
      blockedRecipients: Array.from({ length: 32 }, (_, i) => ({
        email: `test${i + 1}@yahoo.com`,
        reason: ["Blocked by recipient", "Policy violation", "Spam filter", "Suspicious content"][i % 4],
      })),
    },
    {
      date: "2025-01-15",
      domain: "hotmail.com",
      success: 987,
      block: 23,
      blockedRecipients: Array.from({ length: 23 }, (_, i) => ({
        email: `info${i + 1}@hotmail.com`,
        reason: ["Spam filter", "Mailbox full", "Invalid recipient"][i % 3],
      })),
    },
    {
      date: "2025-01-15",
      domain: "outlook.com",
      success: 1823,
      block: 38,
      blockedRecipients: Array.from({ length: 38 }, (_, i) => ({
        email: `contact${i + 1}@outlook.com`,
        reason: ["Rate limit exceeded", "Suspicious content", "Blacklisted sender", "Policy violation"][i % 4],
      })),
    },
    {
      date: "2025-01-15",
      domain: "aol.com",
      success: 756,
      block: 15,
      blockedRecipients: [{ email: "user@aol.com", reason: "Blacklisted sender" }],
    },
    {
      date: "2025-01-14",
      domain: "gmail.com",
      success: 2100,
      block: 38,
      blockedRecipients: [{ email: "blocked1@gmail.com", reason: "Spam filter" }],
    },
    {
      date: "2025-01-14",
      domain: "outlook.com",
      success: 1234,
      block: 28,
      blockedRecipients: [{ email: "test@outlook.com", reason: "Invalid recipient" }],
    },
    {
      date: "2025-01-14",
      domain: "yahoo.com",
      success: 1432,
      block: 25,
      blockedRecipients: [{ email: "sample@yahoo.com", reason: "Mailbox full" }],
    },
    {
      date: "2025-01-14",
      domain: "hotmail.com",
      success: 923,
      block: 19,
      blockedRecipients: [{ email: "demo@hotmail.com", reason: "Policy violation" }],
    },
    {
      date: "2025-01-14",
      domain: "protonmail.com",
      success: 567,
      block: 12,
      blockedRecipients: [{ email: "user@protonmail.com", reason: "Spam filter" }],
    },
    {
      date: "2025-01-13",
      domain: "gmail.com",
      success: 2234,
      block: 42,
      blockedRecipients: [{ email: "blocked2@gmail.com", reason: "Rate limit exceeded" }],
    },
    {
      date: "2025-01-13",
      domain: "yahoo.com",
      success: 1654,
      block: 31,
      blockedRecipients: [{ email: "test2@yahoo.com", reason: "Suspicious content" }],
    },
    {
      date: "2025-01-13",
      domain: "outlook.com",
      success: 1456,
      block: 27,
      blockedRecipients: [{ email: "admin2@outlook.com", reason: "Blacklisted sender" }],
    },
    {
      date: "2025-01-13",
      domain: "icloud.com",
      success: 834,
      block: 16,
      blockedRecipients: [{ email: "user@icloud.com", reason: "Spam filter" }],
    },
    {
      date: "2025-01-13",
      domain: "zoho.com",
      success: 445,
      block: 9,
      blockedRecipients: [{ email: "contact@zoho.com", reason: "Invalid recipient" }],
    },
    {
      date: "2025-01-12",
      domain: "gmail.com",
      success: 2456,
      block: 48,
      blockedRecipients: [{ email: "blocked3@gmail.com", reason: "Mailbox full" }],
    },
    {
      date: "2025-01-12",
      domain: "hotmail.com",
      success: 1123,
      block: 24,
      blockedRecipients: [{ email: "test3@hotmail.com", reason: "Policy violation" }],
    },
    {
      date: "2025-01-12",
      domain: "yahoo.com",
      success: 1534,
      block: 29,
      blockedRecipients: [{ email: "demo2@yahoo.com", reason: "Spam filter" }],
    },
    {
      date: "2025-01-12",
      domain: "outlook.com",
      success: 1345,
      block: 26,
      blockedRecipients: [{ email: "support2@outlook.com", reason: "Rate limit exceeded" }],
    },
    {
      date: "2025-01-12",
      domain: "gmx.com",
      success: 623,
      block: 13,
      blockedRecipients: [{ email: "user@gmx.com", reason: "Suspicious content" }],
    },
  ];

  // Pagination calculations
  const totalPages = Math.ceil(reportData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = reportData.slice(startIndex, endIndex);

  const handleViewDetails = (report: any) => {
    navigate("/report/details", { state: { reportData: report } });
  };

  const handleExport = () => {
    try {
      // Prepare data for Excel
      const exportData = reportData.map((item) => ({
        วันที่ส่ง: item.date,
        โดเมนที่ส่ง: item.domain,
        ส่งสำเร็จ: item.success,
        บล็อก: item.block,
      }));

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Summary Report");

      // Generate filename with current date
      const filename = `summary-report-${format(new Date(), "yyyy-MM-dd")}.xlsx`;

      // Save file
      XLSX.writeFile(workbook, filename);

      toast({
        title: "ส่งออกสำเร็จ",
        description: `ไฟล์ ${filename} ถูกดาวน์โหลดเรียบร้อยแล้ว`,
      });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งออกไฟล์ได้",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">Summary Report</h2>

        <Card>
          <CardHeader>
            <CardTitle>ค้นหาโดย</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">ประเภทการค้นหา</label>
                  <Select value={filterType} onValueChange={(value: "day" | "week" | "month") => setFilterType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">รายวัน</SelectItem>
                      <SelectItem value="week">รายสัปดาห์</SelectItem>
                      <SelectItem value="month">รายเดือน</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
              </div>
              <div>
                <Button>ค้นหา</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>รายละเอียดการส่งอีเมล</CardTitle>
              <Button onClick={handleExport} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>วันที่ส่ง</TableHead>
                  <TableHead>โดเมนที่ส่ง</TableHead>
                  <TableHead className="text-right">ส่งสำเร็จ</TableHead>
                  <TableHead className="text-right">ล้มเหลว</TableHead>
                  <TableHead className="text-right">รายละเอียด</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.date}</TableCell>
                    <TableCell className="font-medium">{item.domain}</TableCell>
                    <TableCell className="text-right text-success font-semibold">
                      {item.success.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-destructive font-semibold">
                      {item.block.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.block > 0 && (
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(item)}>
                          ดูรายละเอียด
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                แสดง {startIndex + 1} - {Math.min(endIndex, reportData.length)} จาก {reportData.length} รายการ
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

export default Report;
