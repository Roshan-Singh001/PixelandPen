import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Camera, Calendar, FileText, Save, Upload, Check, AlertCircle } from 'lucide-react';

const ContriProfile = (props) => {
  const AxiosInstance = axios.create({
    baseURL: 'http://localhost:3000/',
    withCredentials: true,
    timeout: 3000,
    headers: {'X-Custom-Header': 'foobar'}
  });

  const [profile, setProfile] = useState({});
  const [preview, setPreview] = useState('/default-avatar.png');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await AxiosInstance.get('/dashboard/contri/profile', {
          headers: {
            user_id: props.userdata.user_id,
          }
        });
        
        const profileData = response.data[0];
        setProfile(profileData);
        
        if (profileData.profile_pic) {
          setPreview(profileData.profile_pic);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setErrors({ fetch: 'Failed to load profile data' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!profile.username?.trim()) {
      newErrors.username = 'Username is required';
    } else if (profile.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (profile.bio && profile.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: 'Image size must be less than 5MB' }));
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({ ...prev, image: 'Please select a valid image file' }));
        return;
      }

      try {
        const response = await AxiosInstance.post('/dashboard/contri/uploads/profileimage', formData,{
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        setPreview(response.data.imageUrl);
        setProfile((prev) => ({ ...prev, profile_pic: preview}));
        
        setErrors((prev) => ({ ...prev, image: '' }));
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      const response = await AxiosInstance.post('/dashboard/contri/updateprofile', {
        user_id: props.userdata.user_id,
        updatedProfile: profile,
      });

      console.log(response.data);
      
      console.log('Profile Updated:', profile);
      setSaveSuccess(true);
      
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ submit: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-64 mb-6"></div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm">
              <div className="space-y-6">
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div>
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Profile Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your profile information and preferences
          </p>
        </div>

        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
            <p className="text-green-700 dark:text-green-300 font-medium">
              Profile updated successfully!
            </p>
          </div>
        )}

        {errors.fetch && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-red-700 dark:text-red-300">{errors.fetch}</p>
          </div>
        )}

        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center gap-6 mb-6">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Camera className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Profile Picture
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Upload a professional photo that represents you
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative group">
                <img
                  src={preview}
                  alt="Profile Preview"
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600 shadow-lg group-hover:shadow-xl transition-shadow"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full transition-all flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              
              <div className="flex-1">
                <label className="relative cursor-pointer inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg">
                  <Upload className="w-4 h-4" />
                  Choose New Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  JPG, PNG. Max size 5MB.
                </p>
                {errors.image && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.image}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center gap-6 mb-8">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <User className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Personal Information
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Update your personal details and public profile
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Username */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Username *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    name="username"
                    value={profile.username || ''}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.username 
                        ? 'border-red-300 dark:border-red-600 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter your username"
                  />
                </div>
                {errors.username && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.username}
                  </p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="date"
                    name="dob"
                    value={profile.dob || ''}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Bio
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <textarea
                    name="bio"
                    value={profile.bio || ''}
                    onChange={handleChange}
                    rows={5}
                    maxLength={500}
                    className={`w-full pl-11 pr-4 py-3 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.bio 
                        ? 'border-red-300 dark:border-red-600 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Tell us about yourself, your interests, and expertise..."
                  />
                </div>
                <div className="flex justify-between items-center mt-2">
                  {errors.bio ? (
                    <p className="text-red-500 dark:text-red-400 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.bio}
                    </p>
                  ) : (
                    <div></div>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(profile.bio || '').length}/500
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>

          {errors.submit && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-red-700 dark:text-red-300">{errors.submit}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContriProfile;
