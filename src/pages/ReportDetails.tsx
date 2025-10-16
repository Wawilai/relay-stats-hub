import { useLocation, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ReportDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const reportData = location.state?.reportData;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  if (!reportData) {
    navigate("/report");
    return null;
  }

  const blockedRecipients = reportData.blockedRecipients || [];
  const totalPages = Math.ceil(blockedRecipients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRecipients = blockedRecipients.slice(startIndex, endIndex);

  const handleExport = () => {
    try {
      const exportData = blockedRecipients.map((recipient: any) => ({
        อีเมลผู้รับ: recipient.email,
        สาเหตุ: recipient.reason,
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Blocked Recipients");

      const filename = `blocked-recipients-${reportData.date}-${reportData.domain}-${format(new Date(), "yyyy-MM-dd")}.xlsx`;
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
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/report")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold">รายละเอียดรายการส่งไม่สำเร็จ</h2>
            <p className="text-muted-foreground mt-1">
              วันที่: {reportData.date} | โดเมน: {reportData.domain} | ทั้งหมด: {(reportData.success + reportData.block).toLocaleString()} | ส่งสำเร็จ: {reportData.success.toLocaleString()} | ส่งไม่สำเร็จ: {reportData.block.toLocaleString()} รายการ
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>รายการอีเมลที่ส่งไม่สำเร็จ</CardTitle>
              <Button onClick={handleExport} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {blockedRecipients.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">ลำดับ</TableHead>
                      <TableHead>อีเมลผู้รับ</TableHead>
                      <TableHead>สาเหตุ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRecipients.map((recipient: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className="text-muted-foreground">{startIndex + idx + 1}</TableCell>
                        <TableCell className="font-medium">{recipient.email}</TableCell>
                        <TableCell className="text-muted-foreground">{recipient.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    แสดง {startIndex + 1} - {Math.min(endIndex, blockedRecipients.length)} จาก{" "}
                    {blockedRecipients.length} รายการ
                  </p>
                  {totalPages > 1 && (
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>

                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          let page;
                          if (totalPages <= 5) {
                            page = i + 1;
                          } else if (currentPage <= 3) {
                            page = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            page = totalPages - 4 + i;
                          } else {
                            page = currentPage - 2 + i;
                          }
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setCurrentPage(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </div>
              </>
            ) : (
              <p className="text-center text-muted-foreground py-8">ไม่มีข้อมูลรายการบล็อก</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ReportDetails;
