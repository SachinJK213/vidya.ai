import { useState, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import AppLayout from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api } from '@/lib/api'
import { toast } from '@/components/ui/toaster'
import { Loader2, UserPlus, Users } from 'lucide-react'
import { InfoTip } from '@/components/ui/InfoTip'

interface User {
  id: string
  email: string
  role: string
  firstName: string
  lastName: string
  phone: string | null
  isActive: boolean
  createdAt: string
}

interface UsersResponse {
  data: User[]
  meta: { total: number; page: number; totalPages: number }
}

const ROLE_OPTIONS = [
  { value: 'TEACHER', label: 'Teacher' },
  { value: 'PARENT', label: 'Parent' },
  { value: 'SCHOOL_ADMIN', label: 'School Admin' },
]

const ROLE_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'secondary'> = {
  TEACHER: 'default',
  PARENT: 'success',
  SCHOOL_ADMIN: 'warning',
  SUPER_ADMIN: 'warning',
}

function CreateUserForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'TEACHER',
    phone: '',
  })

  const { mutate, isPending } = useMutation({
    mutationFn: () => api.post('/users', form),
    onSuccess: () => {
      toast({ title: 'User created', description: `${form.firstName} ${form.lastName} added.` })
      setForm({ firstName: '', lastName: '', email: '', password: '', role: 'TEACHER', phone: '' })
      onCreated()
    },
    onError: (err: Error) => {
      toast({ title: 'Failed to create user', description: err.message, variant: 'destructive' })
    },
  })

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    mutate()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <UserPlus className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="font-display text-base">Add User</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label>First name</Label>
              <InfoTip text="User's first name as it will appear in notifications and reports." />
            </div>
            <Input placeholder="Ravi" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} required className="h-10" />
          </div>
          <div className="space-y-1.5">
            <Label>Last name</Label>
            <Input placeholder="Kumar" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} required className="h-10" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label>Email</Label>
              <InfoTip text="Used as the login username. Must be unique within this school." />
            </div>
            <Input type="email" placeholder="ravi@school.edu" value={form.email} onChange={(e) => set('email', e.target.value)} required className="h-10" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label>Password</Label>
              <InfoTip text="Set a temporary password. The user can change it after logging in. Minimum 8 characters." />
            </div>
            <Input type="password" placeholder="Min 8 characters" value={form.password} onChange={(e) => set('password', e.target.value)} required className="h-10" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label>Role</Label>
              <InfoTip text="Teacher: marks attendance & creates AI drafts. Parent: read-only portal for their children. School Admin: full access to all school data." />
            </div>
            <select
              value={form.role}
              onChange={(e) => set('role', e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label>Phone <span className="text-muted-foreground">(optional)</span></Label>
              <InfoTip text="Used for SMS notifications when enabled. Include country code, e.g. +91 98765 43210." />
            </div>
            <Input placeholder="+91 98765 43210" value={form.phone} onChange={(e) => set('phone', e.target.value)} className="h-10" />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Create user
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default function UserManagement() {
  const [page, setPage] = useState(1)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery<UsersResponse>({
    queryKey: ['users', page],
    queryFn: () => api.get(`/users?page=${page}&limit=20`),
  })

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">User Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create and manage teacher, parent, and admin accounts</p>
        </div>

        <CreateUserForm onCreated={() => qc.invalidateQueries({ queryKey: ['users'] })} />

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="font-display text-base">All Users</CardTitle>
              {data && <span className="text-sm text-muted-foreground">({data.meta.total})</span>}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.firstName} {u.lastName}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{u.email}</TableCell>
                      <TableCell>
                        <Badge variant={ROLE_VARIANT[u.role] ?? 'secondary'} className="capitalize text-xs">
                          {u.role.toLowerCase().replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.isActive ? 'success' : 'secondary'}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {data && data.meta.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <span className="text-sm text-muted-foreground">Page {page} of {data.meta.totalPages}</span>
            <Button variant="outline" size="sm" disabled={page === data.meta.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
