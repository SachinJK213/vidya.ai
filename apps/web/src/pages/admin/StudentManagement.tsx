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
import { Loader2, UserPlus, GraduationCap, Link2 } from 'lucide-react'
import { InfoTip } from '@/components/ui/InfoTip'

interface Student {
  id: string
  admissionNo: string
  firstName: string
  lastName: string
  grade: string
  section: string | null
  isActive: boolean
  family: { id: string; familyCode: string; members: { relationship: string; user: { firstName: string; lastName: string } }[] } | null
}

interface StudentsResponse {
  data: Student[]
  meta: { total: number; page: number; totalPages: number }
}

function CreateStudentForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({
    admissionNo: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'MALE',
    grade: '',
    section: '',
    rollNo: '',
    familyId: '',
  })

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      api.post('/students', {
        ...form,
        section: form.section || undefined,
        rollNo: form.rollNo || undefined,
        familyId: form.familyId || undefined,
      }),
    onSuccess: () => {
      toast({ title: 'Student created', description: `${form.firstName} ${form.lastName} enrolled.` })
      setForm({ admissionNo: '', firstName: '', lastName: '', dateOfBirth: '', gender: 'MALE', grade: '', section: '', rollNo: '', familyId: '' })
      onCreated()
    },
    onError: (err: Error) => {
      toast({ title: 'Failed to create student', description: err.message, variant: 'destructive' })
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
          <CardTitle className="font-display text-base">Enroll Student</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label>Admission No.</Label>
              <InfoTip text="The unique admission number assigned by your school. This cannot be changed after enrollment and is used in all reports." />
            </div>
            <Input placeholder="ADM2024001" value={form.admissionNo} onChange={(e) => set('admissionNo', e.target.value)} required className="h-10" />
          </div>
          <div className="space-y-1.5">
            <Label>First name</Label>
            <Input placeholder="Arjun" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} required className="h-10" />
          </div>
          <div className="space-y-1.5">
            <Label>Last name</Label>
            <Input placeholder="Sharma" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} required className="h-10" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label>Date of birth</Label>
              <InfoTip text="Used to verify student identity and for age-based reporting. Format: YYYY-MM-DD." />
            </div>
            <Input type="date" value={form.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} required className="h-10" />
          </div>
          <div className="space-y-1.5">
            <Label>Gender</Label>
            <select
              value={form.gender}
              onChange={(e) => set('gender', e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
              <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label>Grade</Label>
              <InfoTip text="The current class/year level, e.g. '5', '10', 'KG'. Used to filter attendance rosters." />
            </div>
            <Input placeholder="8" value={form.grade} onChange={(e) => set('grade', e.target.value)} required className="h-10" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label>Section <span className="text-muted-foreground">(optional)</span></Label>
              <InfoTip text="The section or division within the grade, e.g. 'A', 'B'. Leave blank for schools without sections." />
            </div>
            <Input placeholder="A" value={form.section} onChange={(e) => set('section', e.target.value)} className="h-10" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label>Roll No. <span className="text-muted-foreground">(optional)</span></Label>
              <InfoTip text="Class roll number. Used for ordering students in the attendance roster." />
            </div>
            <Input placeholder="23" value={form.rollNo} onChange={(e) => set('rollNo', e.target.value)} className="h-10" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label>Family ID <span className="text-muted-foreground">(optional)</span></Label>
              <InfoTip text="Link this student to an existing family record so siblings share a parent account. Leave blank to auto-create a new family. Use the 'Link Parent to Family' section below." />
            </div>
            <Input placeholder="clx..." value={form.familyId} onChange={(e) => set('familyId', e.target.value)} className="h-10 font-mono text-xs" />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Enroll student
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function LinkFamilyForm({ onLinked }: { onLinked: () => void }) {
  const [familyCode, setFamilyCode] = useState('')
  const [parentEmail, setParentEmail] = useState('')
  const [relationship, setRelationship] = useState('Parent')
  const [isPrimary, setIsPrimary] = useState(true)
  const [familyId, setFamilyId] = useState('')

  const createFamily = useMutation({
    mutationFn: () => api.post('/families', { familyCode: familyCode || undefined }),
    onSuccess: (res: any) => {
      setFamilyId(res.id)
      toast({ title: 'Family created', description: `Family code: ${res.familyCode}` })
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })

  const addMember = useMutation({
    mutationFn: () =>
      api.post(`/families/${familyId}/members`, {
        userEmail: parentEmail,
        relationship,
        isPrimary,
      }),
    onSuccess: () => {
      toast({ title: 'Parent linked', description: `${parentEmail} added to family.` })
      setParentEmail('')
      onLinked()
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Link2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="font-display text-base">Link Parent to Family</CardTitle>
            <p className="text-xs text-muted-foreground">Create a family, then add a parent account to it</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end gap-3">
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label>Family code <span className="text-muted-foreground">(leave blank to auto-generate)</span></Label>
              <InfoTip text="A short human-readable code to identify this family, e.g. 'SHARMA-001'. Used to group siblings. Leave blank and the system will generate one." />
            </div>
            <Input placeholder="SHARMA-001" value={familyCode} onChange={(e) => setFamilyCode(e.target.value)} className="h-10" />
          </div>
          <Button onClick={() => createFamily.mutate()} disabled={createFamily.isPending} variant="outline" className="h-10">
            {createFamily.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Create family
          </Button>
        </div>

        {familyId && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
            <p className="text-xs font-medium text-primary">Family created — ID: <span className="font-mono">{familyId}</span></p>
            <p className="mt-2 text-xs text-muted-foreground">Now add the parent account to this family:</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Parent email</Label>
                <Input type="email" placeholder="parent@email.com" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} className="h-9 bg-white" />
              </div>
              <div className="space-y-1.5">
                <Label>Relationship</Label>
                <Input placeholder="Mother / Father / Guardian" value={relationship} onChange={(e) => setRelationship(e.target.value)} className="h-9 bg-white" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="rounded"
                />
                Primary contact
              </label>
              <InfoTip text="The primary contact receives all notifications by default (absence alerts, AI weekly summaries). A family should have exactly one primary contact." />
              <Button size="sm" onClick={() => addMember.mutate()} disabled={addMember.isPending || !parentEmail}>
                {addMember.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                Link parent
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function StudentManagement() {
  const [page, setPage] = useState(1)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery<StudentsResponse>({
    queryKey: ['admin-students', page],
    queryFn: () => api.get(`/students?page=${page}&limit=20`),
  })

  function refresh() {
    qc.invalidateQueries({ queryKey: ['admin-students'] })
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Student Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">Enroll students and link them to parent accounts</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <CreateStudentForm onCreated={refresh} />
          <LinkFamilyForm onLinked={refresh} />
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="font-display text-base">All Students</CardTitle>
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
                    <TableHead>Student</TableHead>
                    <TableHead>Admission No.</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Family</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.firstName} {s.lastName}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">#{s.admissionNo}</TableCell>
                      <TableCell>Grade {s.grade}{s.section ? ` · ${s.section}` : ''}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {s.family ? (
                          <span className="font-mono text-xs">{s.family.familyCode}</span>
                        ) : (
                          <span className="text-destructive/70 text-xs">No family</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={s.isActive ? 'success' : 'secondary'}>
                          {s.isActive ? 'Active' : 'Inactive'}
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
