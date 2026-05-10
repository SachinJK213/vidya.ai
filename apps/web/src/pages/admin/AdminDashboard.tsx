import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import AppLayout from '@/components/layout/AppLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'
import { toast } from '@/components/ui/toaster'
import { Megaphone, AlertTriangle, Loader2, Send } from 'lucide-react'

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
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Megaphone className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base font-display">Send Announcement</CardTitle>
            <CardDescription className="text-xs">Delivered to all parents and teachers via email</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="e.g. School closed on Friday"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="body">Message</Label>
            <textarea
              id="body"
              rows={5}
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              placeholder="Write your announcement here…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={isPending || !subject.trim() || !body.trim()} className="gap-2">
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
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
    <Card className="border-destructive/30">
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <CardTitle className="text-base font-display text-destructive">Emergency Alert</CardTitle>
            <CardDescription className="text-xs">
              Sends an urgent message immediately. Use only for genuine emergencies.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="emergency-msg">Emergency message</Label>
            <textarea
              id="emergency-msg"
              rows={4}
              className="w-full rounded-lg border border-destructive/30 bg-background px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/50 focus-visible:ring-offset-2 resize-none"
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
            className="gap-2"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4" />}
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
          <h1 className="font-display text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Send announcements and manage school communications</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <AnnouncementForm />
          <EmergencyForm />
        </div>
      </div>
    </AppLayout>
  )
}
