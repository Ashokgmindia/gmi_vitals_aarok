import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Phone, Mail, Droplet, User as UserIcon } from "lucide-react";
import type { User, PatientRecord } from "@shared/schema";

export default function ProfilePage() {
  const userId = localStorage.getItem("userId");

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId,
  });

  const { data: records, isLoading: recordsLoading } = useQuery<PatientRecord[]>({
    queryKey: [`/api/patients/${userId}/records`],
    enabled: !!userId,
  });

  if (userLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Unable to load profile information.</p>
        </Card>
      </div>
    );
  }

  const initials = user.email.substring(0, 2).toUpperCase();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Patient Profile</h1>
        <p className="text-muted-foreground">Your personal information and health records</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="p-6 lg:col-span-1">
          <div className="flex flex-col items-center text-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Patient ID</h2>
              <p className="text-sm text-muted-foreground font-mono">{user.id.substring(0, 8)}</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Mail className="h-5 w-5 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium truncate" data-testid="text-email">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Phone className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium" data-testid="text-phone">{user.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Droplet className="h-5 w-5 text-vital-red" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Blood Group</p>
                <p className="text-sm font-medium" data-testid="text-blood-group">
                  {user.bloodGroup === "Others" ? user.customBloodGroup : user.bloodGroup}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <UserIcon className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Gender</p>
                <p className="text-sm font-medium" data-testid="text-gender">{user.gender}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Health Records */}
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Health Records</h2>
          
          {recordsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : records && records.length > 0 ? (
            <div className="space-y-3">
              {records.map((record) => (
                <Card key={record.id} className="p-4 bg-muted/30 border-border" data-testid={`card-record-${record.id}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-foreground">
                        {new Date(record.recordDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      {record.diagnosis && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Diagnosis: {record.diagnosis}
                        </p>
                      )}
                      {record.notes && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {record.notes}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(record.recordDate).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No health records available yet.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
