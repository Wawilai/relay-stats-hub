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
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

const Report = () => {
  const [date, setDate] = useState<Date>();
  const [filterType, setFilterType] = useState<"day" | "week" | "month">("day");

  // Mock report data
  const reportData = [
    {
      date: "2025-01-15",
      domain: "gmail.com",
      success: 2345,
      block: 45,
    },
    {
      date: "2025-01-15",
      domain: "yahoo.com",
      success: 1567,
      block: 32,
    },
    {
      date: "2025-01-15",
      domain: "hotmail.com",
      success: 987,
      block: 23,
    },
    {
      date: "2025-01-14",
      domain: "gmail.com",
      success: 2100,
      block: 38,
    },
    {
      date: "2025-01-14",
      domain: "outlook.com",
      success: 1234,
      block: 28,
    },
  ];

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
            <CardTitle>รายละเอียดการส่งอีเมล</CardTitle>
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
                {reportData.map((item, index) => (
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
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Report;
