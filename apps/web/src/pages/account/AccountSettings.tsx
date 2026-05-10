import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import AppLayout from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'
import { toast } from '@/components/ui/toaster'
import { Loader2, User, Lock, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

interface Profile {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  role: string
}

export default function AccountSettings() {
  const qc = useQueryClient()
  const { user } = useAuth()

  const { data: profile, isLoading } = useQuery<Profile>({
    queryKey: ['me'],
    queryFn: () => api.get('/users/me').then((r) => r.data),
  })

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')

  // Populate once loaded
  const [profileInit, setProfileInit] = useState(false)
  if (profile && !profileInit) {
    setFirstName(profile.firstName ?? '')
    setLastName(profile.lastName ?? '')
    setPhone(profile.phone ?? '')
    setProfileInit(true)
  }

  const updateProfile = useMutation({
    mutationFn: (data: { firstName: string; lastName: string; phone: string }) =>
      api.patch('/users/me', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] })
      toast({ title: 'Profile updated', description: 'Your changes have been saved.' })
    },
    onError: () => toast({ title: 'Error', description: 'Failed to update profile.', variant: 'destructive' }),
  })

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const changePassword = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      api.post('/users/me/password', data).then((r) => r.data),
    onSuccess: () => {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      toast({ title: 'Password changed', description: 'Your password has been updated.' })
    },
    onError: (err: any) =>
      toast({
        title: 'Error',
        description: err?.response?.data?.message ?? 'Failed to change password.',
        variant: 'destructive',
      }),
  })

  function handleProfileSave(e: React.FormEvent) {
    e.preventDefault()
    updateProfile.mutate({ firstName, lastName, phone })
  }

  function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' })
      return
    }
    if (newPassword.length < 8) {
      toast({ title: 'Password must be at least 8 characters', variant: 'destructive' })
      return
    }
    changePassword.mutate({ currentPassword, newPassword })
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Account Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your profile and security preferences.</p>
        </div>

        {/* Profile */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Profile</CardTitle>
                <CardDescription className="text-xs">Update your name and contact number.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSave} className="space-y-4">
              {/* Email — read-only */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">Email address</Label>
                <Input id="email" value={profile?.email ?? ''} disabled className="bg-muted/40 text-muted-foreground" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-xs font-medium">First name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-xs font-medium">Last name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-medium">Phone number</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="flex justify-end pt-1">
                <Button type="submit" disabled={updateProfile.isPending} size="sm" className="gap-2">
                  {updateProfile.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : updateProfile.isSuccess ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : null}
                  Save changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Password */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Lock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Change Password</CardTitle>
                <CardDescription className="text-xs">Choose a strong password of at least 8 characters.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSave} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword" className="text-xs font-medium">Current password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="newPassword" className="text-xs font-medium">New password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-medium">Confirm new password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                />
              </div>
              <div className="flex justify-end pt-1">
                <Button
                  type="submit"
                  disabled={changePassword.isPending || !currentPassword || !newPassword}
                  size="sm"
                  className="gap-2"
                >
                  {changePassword.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Update password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Role info */}
        <Card className="bg-muted/30">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Account role</p>
                <p className="text-xs text-muted-foreground mt-0.5">Your role is managed by the platform.</p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary capitalize">
                {user?.role?.toLowerCase().replace(/_/g, ' ')}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
