import React, { useState } from 'react'
import { Mail, Save, CheckCircle2, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'admin@baha.io',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  })

  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  return (
    <div className="space-y-8 w-full">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm">
        <div className="relative group cursor-pointer">
          <Avatar className="h-24 w-24 border-4 border-background shadow-md">
            <AvatarImage src={profile.avatar} alt={profile.name} />
            <AvatarFallback className="text-xl font-bold">AD</AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 bg-background/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="h-6 w-6 text-foreground" />
          </div>
        </div>

        <div className="space-y-1 text-center md:text-left flex-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{profile.name}</h1>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 bg-muted text-foreground border border-border text-xs px-3 py-2 rounded-lg animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-primary" /> Profile Updated
          </div>
        )}
      </div>

      {/* Personal Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
          <CardDescription className="text-xs">
            Update your account details and profile information.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleProfileSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium">Full Name</label>
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end border-t border-border pt-4">
            <Button type="submit" className="gap-2">
              <Save className="h-4 w-4" /> Save Changes
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
