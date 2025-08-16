'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { User, Mail, Phone, Calendar, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
  })
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null); // State for profile picture file
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { user, isAuthenticated, refreshUser } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
      })
    }
  }, [isAuthenticated, user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setProfilePictureFile(e.target.files[0]);
    } else {
      setProfilePictureFile(null);
    }
  };

  const validateForm = () => {
    if (!formData.first_name.trim()) {
      setError('First name is required')
      return false
    }
    if (!formData.last_name.trim()) {
      setError('Last name is required')
      return false
    }
    if (!formData.email.trim()) {
      setError('Email is required')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validateForm() || !user) {
      return
    }

    setLoading(true)

    let profilePictureUrl: string | undefined = user.profile_picture; // Default to existing URL

    if (profilePictureFile) {
      try {
        const uploadResponse = await api.uploadFile(profilePictureFile);
        if (uploadResponse.success) {
          profilePictureUrl = uploadResponse.data.url;
          toast.success('Profile picture uploaded successfully!');
        } else {
          throw new Error(uploadResponse.error || 'Failed to upload profile picture');
        }
      } catch (uploadError: any) {
        toast.error(`Failed to upload profile picture: ${uploadError.message}`);
        setError(`Failed to upload profile picture: ${uploadError.message}`);
        setLoading(false);
        return; // Stop submission if image fails to upload
      }
    }

    try {
      const response = await api.updateUser(user.id, {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        phone_number: formData.phone_number.trim() || undefined,
        profile_picture: profilePictureUrl, // Use the new URL or existing one
      })
      
      if (response.success) {
        setSuccess('Profile updated successfully!')
        toast.success('Your profile has been updated successfully.')
        refreshUser() // Refresh user context after successful update
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update profile. Please try again.')
      toast.error(error.message || 'Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated || !user) {
    return null // Will redirect to login
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      <div className="space-y-6">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.profile_picture || "/placeholder.svg"} alt={user.first_name} />
                <AvatarFallback className="text-lg">
                  {getInitials(user.first_name, user.last_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">
                  {user.first_name} {user.last_name}
                </CardTitle>
                <CardDescription className="flex items-center mt-1">
                  <Mail className="h-4 w-4 mr-1" />
                  {user.email}
                </CardDescription>
                <CardDescription className="flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  Member since {new Date(user.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Edit Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Edit Profile
            </CardTitle>
            <CardDescription>
              Update your personal information and contact details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <AlertDescription className="text-green-600">{success}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="Enter your first name"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Enter your last name"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile_picture_upload">Profile Picture</Label>
                <Input
                  id="profile_picture_upload"
                  name="profile_picture_upload"
                  type="file"
                  onChange={handleFileChange}
                  disabled={loading}
                  accept="image/*"
                />
                <p className="text-xs text-muted-foreground">Upload a new profile image.</p>
                {profilePictureFile && (
                  <div className="text-sm text-muted-foreground">
                    Selected: {profilePictureFile.name}
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Profile'
                  )}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/dashboard">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Your account details and membership information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">User ID</Label>
                <p className="text-sm">{user.id}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Account Created</Label>
                <p className="text-sm">{new Date(user.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                <p className="text-sm">{new Date(user.updated_at).toLocaleDateString()}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Account Status</Label>
                <p className="text-sm text-green-600">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
