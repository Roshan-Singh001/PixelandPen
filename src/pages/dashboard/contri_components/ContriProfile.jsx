import React, { useState } from 'react';
import axios from 'axios';

const ContriProfile = () => {
  const AxiosInstance = axios.create({
    baseURL: 'http://localhost:3000/',
    withCredentials: true,
    timeout: 3000,
    headers: {'X-Custom-Header': 'foobar'}
  });

  const [profile, setProfile] = useState({
    displayName: 'Roshan Singh',
    bio: 'Writer',
    dob: '1999-09-30',
    profilePicture: '',
  });

  const [preview, setPreview] = useState('/default-avatar.png');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile((prev) => ({ ...prev, profilePicture: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Profile Updated:', profile);
    alert('Profile updated successfully!');
  };

  return (
    <>
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Edit Your Profile
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
      >
        {/* Profile Picture */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
            Profile Picture
          </label>
          <div className="flex items-center space-x-4">
            <img
              src={preview}
              alt="Profile Preview"
              className="w-16 h-16 rounded-full object-cover border border-gray-300 dark:border-gray-600"
            />
            <label className="relative cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-300">
              Browse
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Display Name */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
            User Name
          </label>
          <input
            type="text"
            name="userName"
            value={profile.displayName}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
            Bio
          </label>
          <textarea
            name="bio"
            value={profile.bio}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
            Date of Birth
          </label>
          <input
            type="date"
            name="dob"
            value={profile.dob}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-300"
          >
            Save Changes
          </button>
        </div>
      </form>
    </>
  );
};

export default ContriProfile;
