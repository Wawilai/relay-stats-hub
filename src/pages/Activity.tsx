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
import { CalendarIcon, Download } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { toast } from "sonner";

const Activity = () => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [senderEmail, setSenderEmail] = useState("");
  const [receiverEmail, setReceiverEmail] = useState("");

  // Mock activity data
  const activityData = [
    {
      date: "2025-01-15 14:23:45",
      sender: "admin@company.com",
      status: "ส่งสำเร็จ",
      total: 150,
      failed: 5,
      success: 145,
      queue: 0,
    },
    {
      date: "2025-01-15 13:15:22",
      sender: "marketing@company.com",
      status: "มีบางส่วนล้มเหลว",
      total: 320,
      failed: 28,
      success: 292,
      queue: 0,
    },
    {
      date: "2025-01-15 11:45:10",
      sender: "support@company.com",
      status: "ส่งสำเร็จ",
      total: 89,
      failed: 0,
      success: 89,
      queue: 0,
    },
    {
      date: "2025-01-15 09:30:55",
      sender: "sales@company.com",
      status: "กำลังส่ง",
      total: 500,
      failed: 12,
      success: 453,
      queue: 35,
    },
  ];

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
                  {activityData.map((item, index) => (
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
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Activity;
