"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { QuantumButton } from "@/components/ui/quantum-button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChevronRight,
  Settings,
  User,
  Bell,
  Shield,
  Cpu,
  Download,
  Trash2,
  Save,
  Key,
  Globe,
  Moon,
  Sun,
  Monitor,
  HardDrive,
} from "lucide-react"

function SettingsContent() {
  const [notifications, setNotifications] = useState({
    evolutionComplete: true,
    errorAlerts: true,
    updates: false,
    newsletter: false,
  })

  const [execution, setExecution] = useState({
    defaultShots: [8192],
    autoOptimize: true,
    parallelJobs: [4],
    cacheResults: true,
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <Link href="/ide-platform">
            <Button variant="ghost" size="sm">
              <ChevronRight className="h-4 w-4 rotate-180" />
            </Button>
          </Link>
          <Settings className="h-5 w-5 text-primary" />
          <span className="font-semibold">Settings</span>
        </div>
        <QuantumButton variant="compliance" size="sm">
          <Save className="h-4 w-4 mr-1" />
          Save All Changes
        </QuantumButton>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="general">
              <User className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="execution">
              <Cpu className="h-4 w-4 mr-2" />
              Execution
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="data">
              <HardDrive className="h-4 w-4 mr-2" />
              Data
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <GlassCard depth={2}>
              <h3 className="font-semibold mb-4">Profile</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Display Name</label>
                  <Input defaultValue="DNA Developer" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <Input defaultValue="dev@dnalang.io" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Organization</label>
                  <Input defaultValue="Quantum Research Labs" className="mt-1" />
                </div>
              </div>
            </GlassCard>

            <GlassCard depth={2}>
              <h3 className="font-semibold mb-4">Appearance</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Theme</label>
                  <div className="flex gap-2">
                    <Button variant="outline" className="gap-2 bg-transparent">
                      <Sun className="h-4 w-4" /> Light
                    </Button>
                    <Button variant="default" className="gap-2">
                      <Moon className="h-4 w-4" /> Dark
                    </Button>
                    <Button variant="outline" className="gap-2 bg-transparent">
                      <Monitor className="h-4 w-4" /> System
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Language</label>
                  <select className="w-full px-3 py-2 rounded-md border border-border bg-background">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>Japanese</option>
                    <option>German</option>
                  </select>
                </div>
              </div>
            </GlassCard>
          </TabsContent>

          {/* Execution Settings */}
          <TabsContent value="execution" className="space-y-6">
            <GlassCard depth={2}>
              <h3 className="font-semibold mb-4">Default Execution Parameters</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm">Default Shots</label>
                    <span className="text-sm text-muted-foreground">{execution.defaultShots}</span>
                  </div>
                  <Slider
                    value={execution.defaultShots}
                    onValueChange={(v) => setExecution({ ...execution, defaultShots: v })}
                    min={1024}
                    max={32768}
                    step={1024}
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm">Parallel Jobs</label>
                    <span className="text-sm text-muted-foreground">{execution.parallelJobs}</span>
                  </div>
                  <Slider
                    value={execution.parallelJobs}
                    onValueChange={(v) => setExecution({ ...execution, parallelJobs: v })}
                    min={1}
                    max={16}
                    step={1}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm">Auto-Optimize Circuits</div>
                    <div className="text-xs text-muted-foreground">Automatically reduce circuit depth</div>
                  </div>
                  <Switch
                    checked={execution.autoOptimize}
                    onCheckedChange={(v) => setExecution({ ...execution, autoOptimize: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm">Cache Results</div>
                    <div className="text-xs text-muted-foreground">Store execution results locally</div>
                  </div>
                  <Switch
                    checked={execution.cacheResults}
                    onCheckedChange={(v) => setExecution({ ...execution, cacheResults: v })}
                  />
                </div>
              </div>
            </GlassCard>

            <GlassCard depth={2}>
              <h3 className="font-semibold mb-4">Evolution Defaults</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Default Generations</label>
                  <Input type="number" defaultValue="100" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Mutation Rate</label>
                  <Input type="number" defaultValue="0.05" step="0.01" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Crossover Rate</label>
                  <Input type="number" defaultValue="0.7" step="0.1" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Population Size</label>
                  <Input type="number" defaultValue="50" className="mt-1" />
                </div>
              </div>
            </GlassCard>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <GlassCard depth={2}>
              <h3 className="font-semibold mb-4">Email Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm">Evolution Complete</div>
                    <div className="text-xs text-muted-foreground">Get notified when evolution finishes</div>
                  </div>
                  <Switch
                    checked={notifications.evolutionComplete}
                    onCheckedChange={(v) => setNotifications({ ...notifications, evolutionComplete: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm">Error Alerts</div>
                    <div className="text-xs text-muted-foreground">Receive alerts for execution errors</div>
                  </div>
                  <Switch
                    checked={notifications.errorAlerts}
                    onCheckedChange={(v) => setNotifications({ ...notifications, errorAlerts: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm">Product Updates</div>
                    <div className="text-xs text-muted-foreground">New features and improvements</div>
                  </div>
                  <Switch
                    checked={notifications.updates}
                    onCheckedChange={(v) => setNotifications({ ...notifications, updates: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm">Newsletter</div>
                    <div className="text-xs text-muted-foreground">Monthly DNA-Lang community updates</div>
                  </div>
                  <Switch
                    checked={notifications.newsletter}
                    onCheckedChange={(v) => setNotifications({ ...notifications, newsletter: v })}
                  />
                </div>
              </div>
            </GlassCard>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security" className="space-y-6">
            <GlassCard depth={2}>
              <h3 className="font-semibold mb-4">API Keys</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Key className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-sm font-medium">Personal Access Token</div>
                      <div className="text-xs text-muted-foreground">Created 30 days ago</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Regenerate
                  </Button>
                </div>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Key className="h-4 w-4" />
                  Create New API Key
                </Button>
              </div>
            </GlassCard>

            <GlassCard depth={2}>
              <h3 className="font-semibold mb-4">Two-Factor Authentication</h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm">Enable 2FA</div>
                  <div className="text-xs text-muted-foreground">Add an extra layer of security</div>
                </div>
                <Switch />
              </div>
            </GlassCard>

            <GlassCard depth={2}>
              <h3 className="font-semibold mb-4">Sessions</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-secondary" />
                    <div>
                      <div className="text-sm">Current Session</div>
                      <div className="text-xs text-muted-foreground">Chrome on macOS • Active now</div>
                    </div>
                  </div>
                  <Badge className="bg-secondary/20 text-secondary">Active</Badge>
                </div>
              </div>
            </GlassCard>
          </TabsContent>

          {/* Data */}
          <TabsContent value="data" className="space-y-6">
            <GlassCard depth={2}>
              <h3 className="font-semibold mb-4">Storage Usage</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Used</span>
                    <span>2.4 GB / 10 GB</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-[24%] bg-primary" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="text-lg font-bold">1.2 GB</div>
                    <div className="text-xs text-muted-foreground">Organisms</div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="text-lg font-bold">0.8 GB</div>
                    <div className="text-xs text-muted-foreground">Results</div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="text-lg font-bold">0.4 GB</div>
                    <div className="text-xs text-muted-foreground">Cache</div>
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard depth={2}>
              <h3 className="font-semibold mb-4">Export Data</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Download all your organisms, results, and configurations.
              </p>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Export All Data
              </Button>
            </GlassCard>

            <GlassCard depth={2} className="border-destructive/30">
              <h3 className="font-semibold mb-4 text-destructive">Danger Zone</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm">Clear Cache</div>
                    <div className="text-xs text-muted-foreground">Remove all cached execution results</div>
                  </div>
                  <Button variant="outline" size="sm">
                    Clear
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm">Delete Account</div>
                    <div className="text-xs text-muted-foreground">Permanently delete your account and data</div>
                  </div>
                  <Button variant="destructive" size="sm" className="gap-1">
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </div>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsContent />
    </Suspense>
  )
}
