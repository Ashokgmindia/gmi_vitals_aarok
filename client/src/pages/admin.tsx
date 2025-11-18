import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Activity, Heart } from "lucide-react";
import type { User, EcgData } from "@shared/schema";

export default function AdminPage() {
  const { data: allUsers, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: allEcgData, isLoading: ecgLoading } = useQuery<EcgData[]>({
    queryKey: ["/api/admin/ecg-data"],
  });

  if (usersLoading || ecgLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const patients = allUsers?.filter((u) => u.role === "patient") || [];
  const latestReadings = allEcgData?.slice(0, 10) || [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">System overview and patient management</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
              <p className="text-3xl font-bold text-foreground mt-2">{patients.length}</p>
            </div>
            <Users className="h-10 w-10 text-primary opacity-50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Records</p>
              <p className="text-3xl font-bold text-foreground mt-2">{allEcgData?.length || 0}</p>
            </div>
            <Activity className="h-10 w-10 text-vital-cyan opacity-50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Monitoring</p>
              <p className="text-3xl font-bold text-foreground mt-2">{patients.length}</p>
            </div>
            <Heart className="h-10 w-10 text-vital-red opacity-50" />
          </div>
        </Card>
      </div>

      {/* Patients Table */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-foreground">All Patients</h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Blood Group</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No patients registered yet.
                  </TableCell>
                </TableRow>
              ) : (
                patients.map((patient) => (
                  <TableRow key={patient.id} data-testid={`row-patient-${patient.id}`}>
                    <TableCell className="font-mono text-xs">{patient.id.substring(0, 8)}</TableCell>
                    <TableCell>{patient.email}</TableCell>
                    <TableCell>{patient.phone}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {patient.bloodGroup === "Others" ? patient.customBloodGroup : patient.bloodGroup}
                      </Badge>
                    </TableCell>
                    <TableCell>{patient.gender}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-vital-green/20 text-vital-green">
                        Active
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Latest Readings Table */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Latest Vital Sign Readings</h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Patient ID</TableHead>
                <TableHead>HR (BPM)</TableHead>
                <TableHead>SpO2 (%)</TableHead>
                <TableHead>BP (mmHg)</TableHead>
                <TableHead>Temp (°C)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {latestReadings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No vital sign data available.
                  </TableCell>
                </TableRow>
              ) : (
                latestReadings.map((reading) => (
                  <TableRow key={reading.id}>
                    <TableCell className="text-xs">
                      {new Date(reading.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{reading.userId.substring(0, 8)}</TableCell>
                    <TableCell className="font-semibold text-vital-cyan">{reading.heartRate}</TableCell>
                    <TableCell className="font-semibold text-vital-cyan">{reading.spo2}</TableCell>
                    <TableCell className="font-semibold text-vital-yellow">
                      {reading.systolicBP}/{reading.diastolicBP}
                    </TableCell>
                    <TableCell className="font-semibold text-vital-red">{reading.temperature}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
