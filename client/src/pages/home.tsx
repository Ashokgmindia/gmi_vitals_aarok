import { useLocation } from "wouter";
import { Activity, Heart, Shield, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background py-24 sm:py-32">
        <div className="w-full px-6 lg:px-8">
          <div className="w-full text-center">
            <div className="flex justify-center mb-6">
              <Activity className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Patient Health Management System
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Advanced medical monitoring with real-time ECG tracking, comprehensive health records, and secure patient data management.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button
                size="lg"
                onClick={() => setLocation("/register")}
                data-testid="button-get-started"
              >
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setLocation("/login")}
                data-testid="button-sign-in"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full px-6 lg:px-8 py-24">
        <div className="w-full text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Comprehensive Health Monitoring
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to track and manage patient health data
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="p-6">
            <Heart className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Real-time ECG Monitoring</h3>
            <p className="text-muted-foreground">
              Monitor vital signs including heart rate, SpO2, blood pressure, and temperature with live waveform displays.
            </p>
          </Card>

          <Card className="p-6">
            <Shield className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Secure & HIPAA Compliant</h3>
            <p className="text-muted-foreground">
              Role-based access control ensures patients access only their data while admins have comprehensive oversight.
            </p>
          </Card>

          <Card className="p-6">
            <BarChart3 className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Advanced Analytics</h3>
            <p className="text-muted-foreground">
              View health trends over time with interactive charts filterable by day, month, or year.
            </p>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary/5 py-16">
        <div className="w-full px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Ready to start monitoring your health?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Create an account today and experience professional-grade health tracking.
          </p>
          <div className="mt-8">
            <Button
              size="lg"
              onClick={() => setLocation("/register")}
              data-testid="button-register-now"
            >
              Register Now
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-24">
        <div className="w-full px-6 py-12 lg:px-8">
          <p className="text-center text-sm text-muted-foreground">
            © 2025 Health Monitor. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
