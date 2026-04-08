// @ts-nocheck
import React, { useEffect, useState } from 'react';

export const EditProfileModal = ({
  user,
  isOpen,
  onClose,
  onSave,
  isLoading = false
}: any) => {
  const [formData, setFormData] = useState({
    name: user.name,
    phone: user.phone || '',
    avatarUrl: user.avatarUrl || ''
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: user.name,
        phone: user.phone || '',
        avatarUrl: user.avatarUrl || ''
      });
      setErrors({});
      setSubmitError(null);
    }
  }, [isOpen, user]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Name cannot exceed 50 characters';
    }

    if (formData.phone && !/^[+\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone format';
    }

    if (formData.avatarUrl && !isValidUrl(formData.avatarUrl)) {
      newErrors.avatarUrl = 'Invalid URL format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to update profile'
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <i className="fas fa-times text-2xl" />
          </button>
        </div>

        {/* Error Alert */}
        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <i className="fas fa-exclamation-circle text-red-600 text-xl flex-shrink-0" />
            <p className="text-red-700 text-sm">{submitError}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={isLoading}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:bg-gray-50 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              {formData.name.length}/50
            </p>
          </div>

          {/* Phone Field */}
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={isLoading}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:bg-gray-50 ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., +1 (555) 123-4567"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Avatar URL Field */}
          <div>
            <label htmlFor="avatarUrl" className="block text-sm font-semibold text-gray-700 mb-2">
              Avatar URL
            </label>
            <input
              id="avatarUrl"
              type="url"
              name="avatarUrl"
              value={formData.avatarUrl}
              onChange={handleInputChange}
              disabled={isLoading}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:bg-gray-50 ${
                errors.avatarUrl ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="https://example.com/avatar.jpg"
            />
            {errors.avatarUrl && (
              <p className="text-red-500 text-sm mt-1">{errors.avatarUrl}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
