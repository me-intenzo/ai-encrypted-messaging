'use client'

import { useState } from 'react'
import { X, User, Bell, Shield, Palette, LogOut, Save, Eye, EyeOff } from 'lucide-react'
import AnimatedButton from './AnimatedButton'
import Toast from './Toast'

interface SettingsPageProps {
  isOpen: boolean
  onClose: () => void
  username: string
  userId: string
  onLogout: () => void
}

export default function SettingsPage({ isOpen, onClose, username, userId, onLogout }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState('profile')
  const [settings, setSettings] = useState({
    notifications: true,
    soundEnabled: true,
    theme: 'dark',
    language: 'en'
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [profileData, setProfileData] = useState({
    displayName: username,
    bio: ''
  })
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false })

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setToast({ message: 'Please fill all password fields', type: 'error' })
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setToast({ message: 'New passwords do not match', type: 'error' })
      return
    }
    if (passwordData.newPassword.length < 8) {
      setToast({ message: 'Password must be at least 8 characters', type: 'error' })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword
        })
      })
      const result = await response.json()
      
      if (result.success) {
        setToast({ message: 'Password changed successfully', type: 'success' })
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        setToast({ message: result.message || 'Failed to change password', type: 'error' })
      }
    } catch (error) {
      setToast({ message: 'Network error. Please try again.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-88px)]">
          {/* Sidebar */}
          <div className="w-64 border-r border-slate-700 p-4">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                    activeTab === tab.id
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'text-gray-400 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              )
            })}
            
            <div className="mt-auto pt-4 border-t border-slate-700">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Profile Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
                      <input
                        type="text"
                        value={username}
                        disabled
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-gray-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Display Name</label>
                      <input
                        type="text"
                        placeholder="Enter your display name"
                        value={profileData.displayName}
                        onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Bio</label>
                      <textarea
                        placeholder="Tell us about yourself..."
                        rows={4}
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                      />
                    </div>
                    <AnimatedButton
                      variant="primary"
                      onClick={() => setToast({ message: 'Profile updated successfully', type: 'success' })}
                      className="w-full"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </AnimatedButton>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6 animate-fadeIn">
                <h3 className="text-xl font-bold text-white mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                    <div>
                      <div className="font-medium text-white">Push Notifications</div>
                      <div className="text-sm text-gray-400">Receive notifications for new messages</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications}
                        onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                    <div>
                      <div className="font-medium text-white">Sound Effects</div>
                      <div className="text-sm text-gray-400">Play sound for incoming messages</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.soundEnabled}
                        onChange={(e) => setSettings({ ...settings, soundEnabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6 animate-fadeIn">
                <h3 className="text-xl font-bold text-white mb-4">Security Settings</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Shield className="w-5 h-5 text-green-400" />
                      <div className="font-medium text-white">Encryption Status</div>
                    </div>
                    <div className="text-sm text-gray-400">All messages are encrypted with AES-256 + RSA-2048</div>
                  </div>
                  <div className="p-4 bg-slate-800 rounded-lg">
                    <div className="font-medium text-white mb-2">Change Password</div>
                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          placeholder="Enter current password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="w-full px-4 py-2 pr-10 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors"
                        >
                          {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          placeholder="Enter new password (min 8 chars)"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="w-full px-4 py-2 pr-10 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors"
                        >
                          {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          placeholder="Confirm your new password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="w-full px-4 py-2 pr-10 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors"
                        >
                          {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <AnimatedButton
                        variant="primary"
                        onClick={handlePasswordChange}
                        loading={loading}
                        className="w-full"
                      >
                        Update Password
                      </AnimatedButton>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6 animate-fadeIn">
                <h3 className="text-xl font-bold text-white mb-4">Appearance</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-800 rounded-lg">
                    <div className="font-medium text-white mb-3">Theme</div>
                    <div className="grid grid-cols-3 gap-3">
                      {['dark', 'light', 'auto'].map((theme) => (
                        <button
                          key={theme}
                          onClick={() => setSettings({ ...settings, theme })}
                          className={`px-4 py-3 rounded-lg border-2 transition-all capitalize ${
                            settings.theme === theme
                              ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                              : 'border-slate-700 text-gray-400 hover:border-slate-600'
                          }`}
                        >
                          {theme}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-800 rounded-lg">
                    <div className="font-medium text-white mb-3">Language</div>
                    <select
                      value={settings.language}
                      onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                </div>
              </div>
            )}


          </div>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
