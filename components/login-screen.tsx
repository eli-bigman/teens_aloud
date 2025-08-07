"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Lock, User, Loader2 } from 'lucide-react'
import { toast } from "sonner"

interface LoginScreenProps {
  onLogin: (credentials: { username: string; password: string }) => Promise<boolean>
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isAnimating, setIsAnimating] = useState(true)

  // Animation trigger
  useState(() => {
    setTimeout(() => setIsAnimating(false), 100)
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username.trim() || !password.trim()) {
      toast.error("Please fill in all fields")
      return
    }

    setIsLoading(true)
    
    try {
      const success = await onLogin({ username: username.trim(), password })
      
      if (!success) {
        toast.error("Invalid credentials", {
          description: "Please check your username and password and try again."
        })
      }
    } catch (err) {
      console.error('Login error:', err)
      toast.error("Login failed", {
        description: "An error occurred during login. Please try again."
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob ${isAnimating ? 'animation-delay-0' : ''}`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 ${isAnimating ? 'animation-delay-2000' : ''}`}></div>
        <div className={`absolute top-40 left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000 ${isAnimating ? 'animation-delay-4000' : ''}`}></div>
      </div>

      {/* Login Card */}
      <Card className={`w-full max-w-md relative z-10 backdrop-blur-sm bg-white/90 border-0 shadow-2xl transition-all duration-1000 ${isAnimating ? 'opacity-0 transform translate-y-8' : 'opacity-100 transform translate-y-0'}`}>
        <CardHeader className="text-center space-y-6 pb-6">
          {/* Logo */}
          <div className="flex justify-center">
            <div className={`relative transition-all duration-1000 delay-300 ${isAnimating ? 'opacity-0 transform scale-75 rotate-180' : 'opacity-100 transform scale-100 rotate-0'}`}>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-md opacity-75"></div>
              <Image
                src="/associate_fellowship.png"
                alt="Associates Fellowship Logo"
                width={100}
                height={100}
                className="relative rounded-full border-4 border-white shadow-lg"
                style={{ borderRadius: '50%' }}
              />
            </div>
          </div>

          {/* Title */}
          <div className={`space-y-2 transition-all duration-1000 delay-500 ${isAnimating ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Teens Aloud Foundation
            </CardDescription>
            <p className="text-sm text-gray-500">Admin Dashboard Access</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div className={`space-y-2 transition-all duration-1000 delay-700 ${isAnimating ? 'opacity-0 transform translate-x-8' : 'opacity-100 transform translate-x-0'}`}>
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className={`space-y-2 transition-all duration-1000 delay-900 ${isAnimating ? 'opacity-0 transform translate-x-8' : 'opacity-100 transform translate-x-0'}`}>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <div className={`transition-all duration-1000 delay-1100 ${isAnimating ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Footer */}
          <div className={`text-center pt-4 border-t border-gray-100 transition-all duration-1000 delay-1300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
            <p className="text-xs text-gray-500">
              © 2025 Teens Aloud Foundation. All rights reserved.
            </p>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
