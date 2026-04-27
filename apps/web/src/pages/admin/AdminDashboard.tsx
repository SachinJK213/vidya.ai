import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import AppLayout from '@/components/layout/AppLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'
import { toast } from '@/components/ui/toaster'
import { Megaphone, AlertTriangle, Loader2 } from 'lucide-react'

function AnnouncementForm() {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  const { mutate, isPending } = useMutation({
    mutationFn: () => api.post('/notifications/announcement', { subject, body }),
    onSuccess: (res: any) => {
      toast({ title: 'Announcement sent', description: `Queued for ${res.queued} recipients.` })
      setSubject('')
      setBody('')
    },
    onError: (err: Error) => {
      toast({ title: 'Failed to send', description: err.message, variant: 'destructive' })
    },
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!subject.trim() || !body.trim()) return
    mutate()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" />
          <CardTitle>Send Announcement</CardTitle>
        </div>
        <CardDescription>Delivered to all parents and teachers via email</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="e.g. School closed on Friday"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="body">Message</Label>
            <textarea
              id="body"
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Write your announcement here…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={isPending || !subject.trim() || !body.trim()}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Send to everyone
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function EmergencyForm() {
  const [message, setMessage] = useState('')

  const { mutate, isPending } = useMutation({
    mutationFn: () => api.post('/notifications/emergency', { message }),
    onSuccess: (res: any) => {
      toast({ title: 'Emergency alert sent', description: `Urgent alert queued for ${res.queued} recipients.` })
      setMessage('')
    },
    onError: (err: Error) => {
      toast({ title: 'Failed to send', description: err.message, variant: 'destructive' })
    },
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    if (!window.confirm('Send emergency alert to ALL parents and teachers?')) return
    mutate()
  }

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <CardTitle className="text-destructive">Emergency Alert</CardTitle>
        </div>
        <CardDescription>
          Sends an urgent message to all parents and teachers immediately. Use only for genuine emergencies.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="emergency-msg">Emergency message</Label>
            <textarea
              id="emergency-msg"
              rows={3}
              className="w-full rounded-md border border-destructive/40 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="e.g. School is closing immediately due to severe weather. Please collect your children."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            variant="destructive"
            disabled={isPending || !message.trim()}
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Send emergency alert
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function AdminDashboard() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Send announcements and manage school communications</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <AnnouncementForm />
          <EmergencyForm />
        </div>
      </div>
    </AppLayout>
  )
}
