import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TopFailureData {
  destination: string;
  failures: number;
}

interface TopFailureTableProps {
  data: TopFailureData[];
}

const TopFailureTable = ({ data }: TopFailureTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Failure ปลายทาง</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ปลายทาง</TableHead>
              <TableHead className="text-right">จำนวนที่ส่งไม่สำเร็จ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.destination}</TableCell>
                <TableCell className="text-right text-destructive font-semibold">
                  {item.failures.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TopFailureTable;
