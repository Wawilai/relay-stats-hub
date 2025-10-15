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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [date, setDate] = useState<Date>();
  const [filterType, setFilterType] = useState<"day" | "week" | "month">("day");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();

  // Mock report data (expanded for pagination demo)
  const reportData = [
    { date: "2025-01-15", domain: "gmail.com", success: 2345, block: 45 },
    { date: "2025-01-15", domain: "yahoo.com", success: 1567, block: 32 },
    { date: "2025-01-15", domain: "hotmail.com", success: 987, block: 23 },
    { date: "2025-01-15", domain: "outlook.com", success: 1823, block: 38 },
    { date: "2025-01-15", domain: "aol.com", success: 756, block: 15 },
    { date: "2025-01-14", domain: "gmail.com", success: 2100, block: 38 },
    { date: "2025-01-14", domain: "outlook.com", success: 1234, block: 28 },
    { date: "2025-01-14", domain: "yahoo.com", success: 1432, block: 25 },
    { date: "2025-01-14", domain: "hotmail.com", success: 923, block: 19 },
    { date: "2025-01-14", domain: "protonmail.com", success: 567, block: 12 },
    { date: "2025-01-13", domain: "gmail.com", success: 2234, block: 42 },
    { date: "2025-01-13", domain: "yahoo.com", success: 1654, block: 31 },
    { date: "2025-01-13", domain: "outlook.com", success: 1456, block: 27 },
    { date: "2025-01-13", domain: "icloud.com", success: 834, block: 16 },
    { date: "2025-01-13", domain: "zoho.com", success: 445, block: 9 },
    { date: "2025-01-12", domain: "gmail.com", success: 2456, block: 48 },
    { date: "2025-01-12", domain: "hotmail.com", success: 1123, block: 24 },
    { date: "2025-01-12", domain: "yahoo.com", success: 1534, block: 29 },
    { date: "2025-01-12", domain: "outlook.com", success: 1345, block: 26 },
    { date: "2025-01-12", domain: "gmx.com", success: 623, block: 13 },
  ];

  // Pagination calculations
  const totalPages = Math.ceil(reportData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = reportData.slice(startIndex, endIndex);

  const handleExport = () => {
    try {
      // Prepare data for Excel
      const exportData = reportData.map((item) => ({
        "วันที่ส่ง": item.date,
        "โดเมนที่ส่ง": item.domain,
        "ส่งสำเร็จ": item.success,
        "บล็อก": item.block,
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
            <div className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">ประเภทการค้นหา</label>
                <Select
                  value={filterType}
                  onValueChange={(value: "day" | "week" | "month") => setFilterType(value)}
                >
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
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">เลือกวันที่</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: th }) : "เลือกวันที่"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={setDate} locale={th} />
                  </PopoverContent>
                </Popover>
              </div>
              <Button>ค้นหา</Button>
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
                  <TableHead className="text-right">บล็อก</TableHead>
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

export default Report;
