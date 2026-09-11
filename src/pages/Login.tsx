import { useState } from 'react'

import { Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

import kidsFashionBg from '@/assets/kids-fashion-bg.jpg'
import bigLogo from '@/assets/big-logo.png'

export default function LoginPage() {
  const [email, setEmail] = useState('admin@baha.io')
  const [password, setPassword] = useState('••••••••••••')
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative h-screen w-screen overflow-hidden flex items-center justify-center md:justify-end p-4 md:pr-24 lg:pr-52 font-sans bg-background">
      {/* Crisp Full-screen Kids Fashion Background Image (Kids on left) */}
      <img
        src={kidsFashionBg}
        alt="Kids Fashion Background"
        className="absolute inset-0 h-full w-full object-cover object-center scale-100 transition-all duration-700"
      />

      {/* Clean Dark Overlay without Blur */}
      <div className="absolute inset-0 bg-background/20 dark:bg-background/60" />

      {/* Right-aligned Glassmorphism Login Card with Theme Variables */}
      <div className="w-full max-w-md relative z-10">
        <Card className="border bg-card/80 border-border text-card-foreground backdrop-blur-md shadow-xl rounded-2xl overflow-hidden transition-all duration-300">
          <CardHeader className="space-y-4 pt-10 pb-6 px-8 text-center flex flex-col items-center">
            {/* Brand Logo */}
            <div className="p-3 rounded-xl bg-muted/60 border border-border shadow-sm mb-2">
              <img src={bigLogo} alt="Baha Admin" className="h-12 object-contain" />
            </div>

            <div className="flex items-center justify-between w-full pt-2">
              <CardTitle className="text-2xl font-extrabold tracking-tight text-foreground">Sign In</CardTitle>
            </div>
          </CardHeader>

          <form>
            <CardContent className="space-y-6 px-8 py-4">
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-muted-foreground tracking-wide uppercase">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 bg-background/60 border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-ring text-sm font-semibold shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-muted-foreground tracking-wide uppercase">Password</label>
                  <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-xs text-muted-foreground hover:text-foreground font-bold transition-colors">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 bg-background/60 border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-ring text-sm font-semibold shadow-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 px-8 pb-10 pt-6">
              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm py-3 shadow-lg rounded-xl"
              >
                <span className="flex items-center gap-2">
                  Sign In to Portal <ArrowRight className="h-4 w-4" />
                </span>
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
