import { useLocation, useNavigate } from "react-router-dom";
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
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { toast } from "sonner";
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

const ActivityDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const activityData = location.state?.activityData;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  if (!activityData) {
    navigate("/activity");
    return null;
  }

  const failedRecipients = activityData.failedRecipients || [];
  const totalPages = Math.ceil(failedRecipients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRecipients = failedRecipients.slice(startIndex, endIndex);

  const handleExport = () => {
    try {
      const exportData = failedRecipients.map((recipient: any) => ({
        "อีเมลผู้รับ": recipient.email,
        "สาเหตุ": recipient.reason,
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Failed Recipients");

      const filename = `failed-recipients-${activityData.date.replace(/[:\s]/g, "-")}-${format(new Date(), "yyyy-MM-dd")}.xlsx`;
      XLSX.writeFile(workbook, filename);

      toast.success(`ไฟล์ ${filename} ถูกดาวน์โหลดเรียบร้อยแล้ว`);
    } catch (error) {
      toast.error("ไม่สามารถส่งออกไฟล์ได้");
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigate("/activity")}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <CardTitle>รายการที่ส่งไม่สำเร็จ</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    วันที่ส่ง: {activityData.date} | ผู้ส่ง: {activityData.sender} | สถานะ: {activityData.status}
                  </p>
                </div>
              </div>
              <Button onClick={handleExport} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {failedRecipients.length > 0 ? (
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
                        <TableCell className="text-muted-foreground">
                          {startIndex + idx + 1}
                        </TableCell>
                        <TableCell className="font-medium">{recipient.email}</TableCell>
                        <TableCell className="text-muted-foreground">{recipient.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-4 px-6 pb-6 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    แสดง {startIndex + 1} - {Math.min(endIndex, failedRecipients.length)} จาก {failedRecipients.length} รายการ
                  </p>
                  {totalPages > 1 && (
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </div>
              </>
            ) : (
              <p className="text-center text-muted-foreground py-8 px-6">ไม่มีข้อมูลรายการที่ส่งไม่สำเร็จ</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ActivityDetails;
