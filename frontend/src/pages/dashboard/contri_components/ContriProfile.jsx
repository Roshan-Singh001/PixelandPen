import { useState, useEffect, useRef } from 'react';
import AxiosInstance from '../../../api/axiosInstance';
import {
  User, Camera, Calendar, FileText, Save, Upload, Check, AlertCircle,
  MapPin, Globe, Plus, X, ExternalLink, Tag, Loader2, UserRound
} from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';
import { FaGithub, FaLinkedin, FaFacebook } from "react-icons/fa";
import { toast } from 'react-toastify';

const EMPTY_LINKS = { facebook: '', twitter: '', github: '', linkedin: '' };

const linkIcons = {
  facebook: FaFacebook,
  twitter: FaXTwitter,
  github: FaGithub,
  linkedin: FaLinkedin,
};

const ContriProfile = () => {

  const [profile, setProfile] = useState({});
  const [expertise, setExpertise] = useState([]);
  const [links, setLinks] = useState(EMPTY_LINKS);

  const initialRef = useRef({ profile: {}, expertise: [], links: EMPTY_LINKS });

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [expertiseInput, setExpertiseInput] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!saveSuccess) return;
    const timer = setTimeout(() => setSaveSuccess(false), 3000);
    return () => clearTimeout(timer);
  }, [saveSuccess]);

  const normalizeDob = (dob) => (dob ? dob.split('T')[0] : "");

  const fetchProfile = async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const response = await AxiosInstance.get('/dashboard/contri/profile');
      const profileData = response.data[0] || {};
      profileData.dob = normalizeDob(profileData.dob);

      const fetchedExpertise = Array.isArray(profileData.expertise) ? profileData.expertise : [];
      const fetchedLinks = (profileData.links && Object.keys(profileData.links).length > 0)
        ? { ...EMPTY_LINKS, ...profileData.links }
        : EMPTY_LINKS;

      setProfile(profileData);
      setExpertise(fetchedExpertise);
      setLinks(fetchedLinks);

      initialRef.current = { profile: profileData, expertise: fetchedExpertise, links: fetchedLinks };

    } catch (error) {
      const status = error.response?.status;
      if (status === 429) {
        toast.error("Too many requests. Please wait a few minutes before trying again.");
      } else {
        setLoadError('Failed to load profile data.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!profile.username?.trim()) {
      newErrors.username = 'Username is required';
    } else if (profile.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (profile.bio && profile.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }

    const urlPattern = /^https?:\/\/.+/;
    Object.keys(links).forEach(platform => {
      if (links[platform] && !urlPattern.test(links[platform])) {
        newErrors[`links_${platform}`] = `Enter a valid ${platform} URL starting with http:// or https://`;
      }
    });

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
    const value = expertiseInput.trim();
    if (value && !expertise.includes(value) && expertise.length < 10) {
      setExpertise(prev => [...prev, value]);
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
    e.target.value = '';
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: 'Image size must be less than 5MB' }));
      return;
    }
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, image: 'Please select a valid image file' }));
      return;
    }

    setErrors((prev) => ({ ...prev, image: '' }));
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await AxiosInstance.post('/dashboard/contri/uploads/profileimage', formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const profile_image = response.data.imageUrl;
      setProfile((prev) => ({ ...prev, profile_pic: profile_image }));
      toast.success("Profile image uploaded successfully!");
    } catch (error) {
      const status = error.response?.status;
      if (status === 429) {
        toast.error("Too many requests. Please wait a few minutes before trying again.");
      } else {
        setErrors((prev) => ({ ...prev, image: "Couldn't upload image. Try again." }));
      }
    } finally {
      setIsUploading(false);
    }
  };

  const sanitizeString = (str) => (typeof str === 'string' ? str.trim().replace(/[<>]/g, '') : str);

  const filteredLinks = (source) =>
    Object.fromEntries(Object.entries(source).filter(([_,value]) => value.trim() !== ''));

  const getProfileChanges = () => {
    const changes = {};
    const initial = initialRef.current;

    const username = sanitizeString(profile.username || '');
    if (username !== (initial.profile.username || '')) {
      changes.username = username;
    }

    const bio = sanitizeString(profile.bio || '');
    if (bio !== (initial.profile.bio || '')) {
      changes.bio = bio;
    }

    const city = sanitizeString(profile.city || '');
    if (city !== (initial.profile.city || '')) {
      changes.city = city;
    }

    const country = sanitizeString(profile.country || '');
    if (country !== (initial.profile.country || '')) {
      changes.country = country;
    }

    const dob = normalizeDob(profile.dob);
    if (dob !== normalizeDob(initial.profile.dob)) {
      changes.dob = dob || null;
    }

    if ((profile.profile_pic || null) !== (initial.profile.profile_pic || null)) {
      changes.profile_pic = profile.profile_pic || null;
    }

    if (JSON.stringify(expertise) !== JSON.stringify(initial.expertise)) {
      changes.expertise = expertise;
    }

    const currentLinks = filteredLinks(links);
    const initialLinks = filteredLinks(initial.links);
    if (JSON.stringify(currentLinks) !== JSON.stringify(initialLinks)) {
      changes.links = currentLinks;
    }

    return changes;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const changes = getProfileChanges();
    if (Object.keys(changes).length === 0) {
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);
    setErrors((prev) => ({ ...prev, submit: '' }));

    try {
      const response = await AxiosInstance.post('/dashboard/contri/updateprofile', {
        updatedProfile: changes,
      });

      const saved = response.data?.profile || changes;
      const mergedProfile = { ...profile, ...saved };

      setProfile(mergedProfile);
      initialRef.current = {
        profile: mergedProfile,
        expertise,
        links,
      };
      setSaveSuccess(true);
      toast.success("Profile updated successfully!");
    } catch (error) {
      const status = error.response?.status;
      if (status === 429) {
        toast.error("Too many requests. Please wait a few minutes before trying again.");
      } else {
        setErrors((prev) => ({ ...prev, submit: error.response?.data?.message || 'Failed to update profile. Please try again.' }));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setProfile(initialRef.current.profile);
    setExpertise(initialRef.current.expertise);
    setLinks(initialRef.current.links);
    setExpertiseInput('');
    setErrors({});
  };

  const hasChanges = !isLoading && Object.keys(getProfileChanges()).length > 0;

  if (isLoading) {
    return (
      <div className="space-y-8 font-[Inter,system-ui,sans-serif]">
        <div>
          <h1 className="font-[Newsreader,Georgia,serif] text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-50 mb-2">
            Profile Settings
          </h1>
          <p className="text-gray-500 dark:text-slate-400">Manage your profile information and preferences</p>
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 sm:p-8 animate-pulse">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-700" />
              <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-48" />
            </div>
            <div className="h-24 bg-gray-100 dark:bg-slate-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 font-[Inter,system-ui,sans-serif]">

      <div>
        <h1 className="font-[Newsreader,Georgia,serif] text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-50 mb-2">
          Profile Settings
        </h1>
        <p className="text-gray-500 dark:text-slate-400">
          Manage your profile information and preferences
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
          <p className="text-sm text-green-700 dark:text-green-300 font-medium">
            Profile updated successfully.
          </p>
        </div>
      )}

      {loadError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300">{loadError}</p>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
            <Camera className="w-5 h-5 text-[#1E3A5F] dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Profile Picture</h2>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Upload a professional photo that represents you</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative w-24 h-24 shrink-0">
            {profile.profile_pic ? (
              <img
                src={profile.profile_pic}
                alt=""
                className="w-24 h-24 rounded-full object-cover bg-gray-100 dark:bg-slate-700"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                <UserRound className="w-10 h-10 text-gray-300 dark:text-slate-500" />
              </div>
            )}
            {isUploading && (
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <label className={`relative inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-[#1E3A5F] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors duration-150 ${isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}>
              <Upload className="w-3.5 h-3.5" />
              Choose New Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isUploading}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </label>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">JPG, PNG. Max size 5MB.</p>
            {errors.image && (
              <p className="text-xs font-medium text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.image}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Personal Information</h2>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Update your personal details and public profile</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold tracking-wide uppercase text-gray-400 dark:text-slate-500 mb-1.5">
              Username *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
              <input
                type="text"
                name="username"
                value={profile.username || ''}
                onChange={handleChange}
                className={`w-full pl-10 pr-3 py-2 text-sm rounded-lg border bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 dark:focus:ring-blue-500/30 focus:border-[#1E3A5F] dark:focus:border-blue-500 ${
                  errors.username ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-slate-600'
                }`}
                placeholder="Enter your username"
              />
            </div>
            {errors.username && (
              <p className="text-xs font-medium text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.username}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wide uppercase text-gray-400 dark:text-slate-500 mb-1.5">
              Date of Birth
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
              <input
                type="date"
                name="dob"
                value={normalizeDob(profile.dob)}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 dark:focus:ring-blue-500/30 focus:border-[#1E3A5F] dark:focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wide uppercase text-gray-400 dark:text-slate-500 mb-1.5">
              City
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
              <input
                type="text"
                name="city"
                value={profile.city || ''}
                onChange={handleChange}
                className={`w-full pl-10 pr-3 py-2 text-sm rounded-lg border bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 dark:focus:ring-blue-500/30 focus:border-[#1E3A5F] dark:focus:border-blue-500 ${
                  errors.city ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-slate-600'
                }`}
                placeholder="Enter your city"
              />
            </div>
            {errors.city && (
              <p className="text-xs font-medium text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.city}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wide uppercase text-gray-400 dark:text-slate-500 mb-1.5">
              Country
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
              <input
                type="text"
                name="country"
                value={profile.country || ''}
                onChange={handleChange}
                className={`w-full pl-10 pr-3 py-2 text-sm rounded-lg border bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 dark:focus:ring-blue-500/30 focus:border-[#1E3A5F] dark:focus:border-blue-500 ${
                  errors.country ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-slate-600'
                }`}
                placeholder="Enter your country"
              />
            </div>
            {errors.country && (
              <p className="text-xs font-medium text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.country}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold tracking-wide uppercase text-gray-400 dark:text-slate-500 mb-1.5">
              Bio
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400 dark:text-slate-500" />
              <textarea
                name="bio"
                value={profile.bio || ''}
                onChange={handleChange}
                rows={4}
                maxLength={500}
                className={`w-full pl-10 pr-3 py-2 text-sm rounded-lg border bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 dark:focus:ring-blue-500/30 focus:border-[#1E3A5F] dark:focus:border-blue-500 ${
                  errors.bio ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-slate-600'
                }`}
                placeholder="Tell us about yourself, your interests, and expertise..."
              />
            </div>
            <div className="flex justify-between items-center mt-1.5">
              {errors.bio ? (
                <p className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.bio}
                </p>
              ) : <span />}
              <p className="text-[11px] text-gray-400 dark:text-slate-500">{(profile.bio || '').length}/500</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
            <Tag className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Expertise & Skills</h2>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Add your areas of expertise and skills (max 10 tags)</p>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
            <input
              type="text"
              value={expertiseInput}
              onChange={(e) => setExpertiseInput(e.target.value)}
              onKeyDown={handleExpertiseKeyPress}
              disabled={expertise.length >= 10}
              className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 dark:focus:ring-blue-500/30 focus:border-[#1E3A5F] dark:focus:border-blue-500 disabled:opacity-50"
              placeholder="e.g. React, Python, Machine Learning"
            />
          </div>
          <button
            type="button"
            onClick={addExpertise}
            disabled={!expertiseInput.trim() || expertise.includes(expertiseInput.trim()) || expertise.length >= 10}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-white bg-[#1E3A5F] hover:bg-[#16304d] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>

        {expertise.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {expertise.map((skill, index) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 text-xs font-medium rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeExpertise(index)}
                  className="hover:bg-purple-100 dark:hover:bg-purple-800/40 rounded-full p-0.5 transition-colors duration-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {expertise.length >= 10 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-3">Maximum of 10 expertise tags allowed.</p>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
            <ExternalLink className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Social Links</h2>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Connect your social media profiles</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {Object.entries(links).map(([platform, url]) => {
            const IconComponent = linkIcons[platform] ?? Globe;
            return (
              <div key={platform}>
                <label className="block text-xs font-semibold tracking-wide text-gray-400 dark:text-slate-500 mb-1.5 capitalize">
                  {platform}
                </label>
                <div className="relative">
                  <IconComponent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handleLinkChange(platform, e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 text-sm rounded-lg border bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 dark:focus:ring-blue-500/30 focus:border-[#1E3A5F] dark:focus:border-blue-500 ${
                      errors[`links_${platform}`] ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-slate-600'
                    }`}
                    placeholder={`https://${platform}.com/yourprofile`}
                  />
                </div>
                {errors[`links_${platform}`] && (
                  <p className="text-xs font-medium text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors[`links_${platform}`]}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {errors.submit && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300">{errors.submit}</p>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-lg text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors duration-150 disabled:opacity-50"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving || !hasChanges}
          className="inline-flex items-center gap-1.5 px-6 py-2.5 text-sm font-semibold rounded-lg text-white bg-[#1E3A5F] hover:bg-[#16304d] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? "Saving…" : "Save Changes"}
        </button>
      </div>

    </div>
  );
};

export default ContriProfile;