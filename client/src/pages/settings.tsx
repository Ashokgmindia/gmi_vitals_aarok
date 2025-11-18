import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell, Moon, Lock, Shield } from "lucide-react";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = (enabled: boolean) => {
    setDarkMode(enabled);
    if (enabled) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and application settings</p>
      </div>

      <div className="space-y-4 max-w-2xl">
        {/* Appearance */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Moon className="h-5 w-5 text-primary mt-1" />
              <div>
                <Label htmlFor="dark-mode" className="text-base font-semibold cursor-pointer">
                  Dark Mode
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Toggle between light and dark theme
                </p>
              </div>
            </div>
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={toggleDarkMode}
              data-testid="switch-dark-mode"
            />
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Bell className="h-5 w-5 text-primary mt-1" />
              <div>
                <Label htmlFor="notifications" className="text-base font-semibold cursor-pointer">
                  Notifications
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Receive alerts for vital sign changes
                </p>
              </div>
            </div>
            <Switch
              id="notifications"
              checked={notifications}
              onCheckedChange={setNotifications}
              data-testid="switch-notifications"
            />
          </div>
        </Card>

        {/* Security */}
        <Card className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <Lock className="h-5 w-5 text-primary mt-1" />
            <div className="flex-1">
              <h3 className="text-base font-semibold">Security</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your password and security settings
              </p>
            </div>
          </div>
          <Button variant="outline" className="w-full sm:w-auto" data-testid="button-change-password">
            Change Password
          </Button>
        </Card>

        {/* Privacy */}
        <Card className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <Shield className="h-5 w-5 text-primary mt-1" />
            <div className="flex-1">
              <h3 className="text-base font-semibold">Privacy</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Control who can access your health information
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" className="w-full sm:w-auto" data-testid="button-export-data">
              Export My Data
            </Button>
            <Button variant="outline" className="w-full sm:w-auto text-destructive hover:text-destructive" data-testid="button-delete-account">
              Delete Account
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
