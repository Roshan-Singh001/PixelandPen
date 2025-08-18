import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  User, Camera, Calendar, FileText, Save, Upload, Check, AlertCircle, 
  MapPin, Globe, Plus, X, ExternalLink,
  Tag, Trash2
} from 'lucide-react';
import { FaXTwitter  } from 'react-icons/fa6';
import { FaGithub, FaLinkedin, FaFacebook   } from "react-icons/fa";
import PixelPenLoader from '../../../components/PixelPenLoader';

const ContriProfile = (props) => {
  const AxiosInstance = axios.create({
    baseURL: 'http://localhost:3000/',
    withCredentials: true,
    timeout: 3000,
    headers: {'X-Custom-Header': 'foobar'}
  });

  const [profile, setProfile] = useState({});
  const [preview, setPreview] = useState('../../../assets/images/icons-user-30.png');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  // State for dynamic fields
  const [expertiseInput, setExpertiseInput] = useState('');
  const [expertise, setExpertise] = useState([]);
  const [links, setLinks] = useState({
    facebook: '',
    twitterX: '',
    github: '',
    linkedin: ''
  });

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
        if (profileData.dob == null) profileData.dob = "";
        try {
          setExpertise(profileData.expertise ? profileData.expertise: []);

        } catch (e) {
          setExpertise([]);
        }
        
        try {
          setLinks(profileData.links ? profileData.links : {
            facebook: '',
            twitter: '',
            github: '',
            linkedin: ''
          });
        } catch (e) {
          setLinks({
            facebook: '',
            twitter: '',
            github: '',
            linkedin: ''
          });
        }
        
        setProfile(profileData);
        
        if (profileData.profile_pic) setPreview(profileData.profile_pic);

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

    // Validate social media links format
    const urlPattern = /^https?:\/\/.+/;
    Object.keys(links).forEach(platform => {
      if (links[platform] && !urlPattern.test(links[platform])) {
        newErrors[`links_${platform}`] = `Please enter a valid ${platform} URL (starting with http:// or https://)`;
      }
    });

    // Validate city and country
    if (profile.city && profile.city.length > 100) {
      newErrors.city = 'City name must be less than 100 characters';
    }
    
    if (profile.country && profile.country.length > 100) {
      newErrors.country = 'Country name must be less than 100 characters';
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

  const handleLinkChange = (platform, value) => {
    setLinks(prev => ({ ...prev, [platform]: value }));
    
    if (errors[`links_${platform}`]) {
      setErrors((prev) => ({ ...prev, [`links_${platform}`]: '' }));
    }
  };

  const addExpertise = () => {
    if (expertiseInput.trim() && !expertise.includes(expertiseInput.trim()) && expertise.length < 10) {
      setExpertise(prev => [...prev, expertiseInput.trim()]);
      setExpertiseInput('');
    }
  };

  const removeExpertise = (index) => {
    setExpertise(prev => prev.filter((_, i) => i !== index));
  };

  const handleExpertiseKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addExpertise();
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    if (file) {

      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: 'Image size must be less than 5MB' }));
        return;
      }
      
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

        let profile_image = response.data.imageUrl; 
        setPreview(profile_image);
        setProfile((prev) => ({ ...prev, profile_pic: profile_image}));
        
        setErrors((prev) => ({ ...prev, image: '' }));
      } catch (error) {
        console.log(error);
      }
    }
  };

  const sanitizeData = (data) => {
    // Helper function to sanitize string inputs
    const sanitizeString = (str) => {
      if (typeof str !== 'string') return str;
      return str.trim().replace(/[<>]/g, ''); // Remove potential XSS characters
    };

    const sanitized = { ...data };
    
    // Sanitize string fields
    ['username', 'bio', 'city', 'country'].forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = sanitizeString(sanitized[field]);
      }
    });

    return sanitized;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    setSaveSuccess(false);

    // Prepare the profile data with proper JSON serialization
    const formattedProfile = {
      ...profile,
      dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : null,
      expertise: JSON.stringify(expertise),
      links: JSON.stringify(Object.fromEntries(
        Object.entries(links).filter(([_, value]) => value.trim() !== '')
      ))
    };

    // Sanitize the data before sending
    const sanitizedProfile = sanitizeData(formattedProfile);

    console.log('Sending profile data:', sanitizedProfile);
    
    try {
      const response = await AxiosInstance.post('/dashboard/contri/updateprofile', {
        user_id: props.userdata.user_id,
        updatedProfile: sanitizedProfile,
      });
      
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
      <>
      <PixelPenLoader/>
      </>
    );
  }

  const linkIcons = {
    facebook: FaFacebook,
    twitter: FaXTwitter,
    github: FaGithub,
    linkedin: FaLinkedin
  };

  console.log(expertise);
  console.log(expertiseInput);
  console.log(links);

  return (
    <div className="min-h-screen p-2">
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
          {/* Profile Picture Section */}
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
                    value={profile.dob ? profile.dob.split('T')[0] : ''}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  City
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    name="city"
                    value={profile.city || ''}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.city 
                        ? 'border-red-300 dark:border-red-600 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter your city"
                  />
                </div>
                {errors.city && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.city}
                  </p>
                )}
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Country
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    name="country"
                    value={profile.country || ''}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.country 
                        ? 'border-red-300 dark:border-red-600 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter your country"
                  />
                </div>
                {errors.country && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.country}
                  </p>
                )}
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

          {/* Expertise Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center gap-6 mb-8">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Tag className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Expertise & Skills
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Add your areas of expertise and skills (max 10 tags)
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    value={expertiseInput}
                    onChange={(e) => setExpertiseInput(e.target.value)}
                    onKeyDown={handleExpertiseKeyPress}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter skill or expertise (e.g., React, Python, Machine Learning)"
                    disabled={expertise.length >= 10}
                  />
                </div>
                <button
                  type="button"
                  onClick={addExpertise}
                  disabled={!expertiseInput.trim() || expertise.includes(expertiseInput.trim()) || expertise.length >= 10}
                  className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              {/* Display expertise tags */}
              {expertise.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {expertise.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 rounded-full text-sm border border-purple-200 dark:border-purple-700"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeExpertise(index)}
                        className="hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-1 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {expertise.length >= 10 && (
                <p className="text-amber-600 dark:text-amber-400 text-sm">
                  Maximum of 10 expertise tags allowed
                </p>
              )}
            </div>
          </div>

          {/* Social Links Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center gap-6 mb-8">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                <ExternalLink className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Social Links
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Connect your social media profiles
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(links).map(([platform, url]) => {
                const IconComponent = linkIcons[platform];
                return (
                  <div key={platform}>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 capitalize">
                      {platform}
                    </label>
                    <div className="relative">
                      <IconComponent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => handleLinkChange(platform, e.target.value)}
                        className={`w-full pl-11 pr-4 py-3 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors[`links_${platform}`] 
                            ? 'border-red-300 dark:border-red-600 focus:ring-red-500' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder={`https://${platform}.com/yourprofile`}
                      />
                    </div>
                    {errors[`links_${platform}`] && (
                      <p className="text-red-500 dark:text-red-400 text-sm mt-2 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors[`links_${platform}`]}
                      </p>
                    )}
                  </div>
                );
              })}
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