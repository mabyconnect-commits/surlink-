import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { authAPI } from '../services/apiClient';
import {
  User,
  Bell,
  Shield,
  CreditCard,
  HelpCircle,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  Globe,
  Lock,
  Smartphone,
  Mail,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

function Settings() {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: false,
    bookingUpdates: true,
    messages: true,
    promotions: false,
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const isProvider = user?.role === 'provider';

  const handleNotificationChange = async (key, value) => {
    const updatedNotifications = { ...notifications, [key]: value };
    setNotifications(updatedNotifications);

    try {
      const response = await authAPI.updateSettings({ notifications: updatedNotifications });
      if (response.success) {
        toast.success('Notification settings updated');
      } else {
        // Revert on failure
        setNotifications(notifications);
        toast.error('Failed to update settings');
      }
    } catch (error) {
      // Revert on error
      setNotifications(notifications);
      console.error('Error updating settings:', error);
      toast.error(error.response?.data?.message || 'Failed to update settings');
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await authAPI.changePassword(passwordForm.oldPassword, passwordForm.newPassword);
      if (response.success) {
        toast.success('Password changed successfully');
        setShowPasswordDialog(false);
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(response.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Edit Profile', href: isProvider ? '/provider/profile' : '/profile' },
        { icon: Lock, label: 'Change Password', onClick: () => setShowPasswordDialog(true) },
        { icon: Shield, label: 'Two-Factor Authentication', badge: 'OFF' },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: theme === 'dark' ? Moon : Sun, label: 'Theme', value: theme === 'dark' ? 'Dark' : 'Light' },
        { icon: Globe, label: 'Language', value: 'English' },
      ],
    },
    {
      title: 'Payments',
      items: [
        { icon: CreditCard, label: 'Payment Methods', href: isProvider ? '/provider/wallet' : '/wallet' },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help Center', href: '#' },
        { icon: Mail, label: 'Contact Support', href: '#' },
      ],
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Settings</h1>
        <p className="text-[var(--muted-foreground)]">
          Manage your account preferences and settings
        </p>
      </div>

      {/* Quick Settings */}
      {settingsSections.map((section) => (
        <Card key={section.title}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{section.title}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divide-y divide-[var(--border)]">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    className="w-full flex items-center justify-between py-3 hover:bg-[var(--secondary)] -mx-6 px-6 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} className="text-[var(--muted-foreground)]" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.value && (
                        <span className="text-sm text-[var(--muted-foreground)]">{item.value}</span>
                      )}
                      {item.badge && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--secondary)] text-[var(--muted-foreground)]">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight size={18} className="text-[var(--muted-foreground)]" />
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Notifications */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell size={20} />
            Notifications
          </CardTitle>
          <CardDescription>
            Choose how you want to be notified
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-[var(--muted-foreground)]" />
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-xs text-[var(--muted-foreground)]">Receive updates via email</p>
              </div>
            </div>
            <Switch
              checked={notifications.email}
              onCheckedChange={(checked) => handleNotificationChange('email', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone size={18} className="text-[var(--muted-foreground)]" />
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-xs text-[var(--muted-foreground)]">Receive push notifications</p>
              </div>
            </div>
            <Switch
              checked={notifications.push}
              onCheckedChange={(checked) => handleNotificationChange('push', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell size={18} className="text-[var(--muted-foreground)]" />
              <div>
                <p className="font-medium">Booking Updates</p>
                <p className="text-xs text-[var(--muted-foreground)]">Get notified about booking changes</p>
              </div>
            </div>
            <Switch
              checked={notifications.bookingUpdates}
              onCheckedChange={(checked) => handleNotificationChange('bookingUpdates', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-[var(--muted-foreground)]" />
              <div>
                <p className="font-medium">Messages</p>
                <p className="text-xs text-[var(--muted-foreground)]">Get notified about new messages</p>
              </div>
            </div>
            <Switch
              checked={notifications.messages}
              onCheckedChange={(checked) => handleNotificationChange('messages', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell size={18} className="text-[var(--muted-foreground)]" />
              <div>
                <p className="font-medium">Marketing & Promotions</p>
                <p className="text-xs text-[var(--muted-foreground)]">Receive promotional offers</p>
              </div>
            </div>
            <Switch
              checked={notifications.promotions}
              onCheckedChange={(checked) => handleNotificationChange('promotions', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun size={16} />
                    Light
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon size={16} />
                    Dark
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Smartphone size={16} />
                    System
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="yo">Yoruba</SelectItem>
                <SelectItem value="ig">Igbo</SelectItem>
                <SelectItem value="ha">Hausa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card className="border-[var(--destructive)]">
        <CardContent className="p-4">
          <Button
            variant="outline"
            className="w-full text-[var(--destructive)] border-[var(--destructive)] hover:bg-[var(--destructive)] hover:text-white"
            onClick={logout}
          >
            <LogOut size={18} className="mr-2" />
            Log Out
          </Button>
        </CardContent>
      </Card>

      {/* App Version */}
      <p className="text-center text-sm text-[var(--muted-foreground)]">
        Surlink v1.0.0
      </p>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="oldPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="oldPassword"
                  type={showOldPassword ? 'text' : 'password'}
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                >
                  {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword} disabled={isChangingPassword}>
              {isChangingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Settings;
