import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import { kycAPI, uploadAPI } from '../../services/apiClient';
import {
  Shield,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  Camera,
  FileText,
  User,
  MapPin,
  Phone,
  Loader2,
  X,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Progress } from '../../components/ui/progress';
import { KYC_DOCUMENT_TYPES, NIGERIAN_STATES, SERVICE_CATEGORIES } from '../../lib/constants';

function KYCVerification() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    // Personal Info
    fullName: user?.name || '',
    phone: '',
    dateOfBirth: '',
    address: '',
    state: '',
    lga: '',

    // Document Info
    documentType: '',
    documentNumber: '',
    documentFront: null,
    documentBack: null,

    // Professional Info
    services: [],
    experience: '',
    bio: '',
    profilePhoto: null,

    // Bank Info
    bankName: '',
    accountNumber: '',
    accountName: '',
  });

  const steps = [
    { id: 1, title: 'Personal Info', icon: User },
    { id: 2, title: 'Identity Document', icon: FileText },
    { id: 3, title: 'Professional Info', icon: Shield },
    { id: 4, title: 'Bank Details', icon: FileText },
  ];

  const progress = (currentStep / steps.length) * 100;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (field, event) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      // Upload file immediately
      try {
        setIsLoading(true);
        const response = await uploadAPI.single(file, 'kyc');
        if (response.success) {
          handleInputChange(field, response.url);
          handleInputChange(`${field}Name`, file.name); // Store filename for display
          toast.success('File uploaded successfully');
        } else {
          toast.error('Failed to upload file');
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        toast.error(error.response?.data?.message || 'Failed to upload file');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleServiceToggle = (serviceId) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(id => id !== serviceId)
        : [...prev.services, serviceId],
    }));
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.fullName || !formData.phone || !formData.dateOfBirth || !formData.address || !formData.state) {
          toast.error('Please fill in all required fields');
          return false;
        }
        break;
      case 2:
        if (!formData.documentType || !formData.documentNumber || !formData.documentFront) {
          toast.error('Please upload your identity document');
          return false;
        }
        break;
      case 3:
        if (formData.services.length === 0 || !formData.experience || !formData.bio) {
          toast.error('Please complete your professional information');
          return false;
        }
        break;
      case 4:
        if (!formData.bankName || !formData.accountNumber || !formData.accountName) {
          toast.error('Please fill in your bank details');
          return false;
        }
        break;
      default:
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsLoading(true);
    try {
      const response = await kycAPI.submit({
        fullName: formData.fullName,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
        state: formData.state,
        lga: formData.lga,
        documentType: formData.documentType,
        documentNumber: formData.documentNumber,
        documentFront: formData.documentFront,
        documentBack: formData.documentBack,
        services: formData.services,
        experience: formData.experience,
        bio: formData.bio,
        profilePhoto: formData.profilePhoto,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        accountName: formData.accountName,
      });

      if (response.success) {
        updateUser({ kycStatus: 'under_review' });
        toast.success('KYC documents submitted successfully!');
        navigate('/provider/dashboard');
      } else {
        toast.error(response.message || 'Failed to submit KYC documents');
      }
    } catch (error) {
      console.error('Error submitting KYC:', error);
      toast.error(error.response?.data?.message || 'Failed to submit KYC documents');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name (as on ID) *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+234 800 000 0000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter your full address"
                rows={3}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {NIGERIAN_STATES.map((state) => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lga">LGA</Label>
                <Input
                  id="lga"
                  value={formData.lga}
                  onChange={(e) => handleInputChange('lga', e.target.value)}
                  placeholder="Local Government Area"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="documentType">Document Type *</Label>
              <Select value={formData.documentType} onValueChange={(value) => handleInputChange('documentType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {KYC_DOCUMENT_TYPES.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>{doc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentNumber">Document Number *</Label>
              <Input
                id="documentNumber"
                value={formData.documentNumber}
                onChange={(e) => handleInputChange('documentNumber', e.target.value)}
                placeholder="Enter document number"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Document Front *</Label>
                <div className="border-2 border-dashed border-[var(--border)] rounded-lg p-6 text-center hover:border-[var(--primary)] transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="documentFront"
                    onChange={(e) => handleFileUpload('documentFront', e)}
                  />
                  <label htmlFor="documentFront" className="cursor-pointer">
                    {formData.documentFront ? (
                      <div className="flex items-center justify-center gap-2 text-[var(--primary)]">
                        <CheckCircle size={20} />
                        <span className="text-sm">{formData.documentFrontName || 'Uploaded'}</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto mb-2 text-[var(--muted-foreground)]" size={24} />
                        <p className="text-sm text-[var(--muted-foreground)]">Click to upload front</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Document Back (if applicable)</Label>
                <div className="border-2 border-dashed border-[var(--border)] rounded-lg p-6 text-center hover:border-[var(--primary)] transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="documentBack"
                    onChange={(e) => handleFileUpload('documentBack', e)}
                  />
                  <label htmlFor="documentBack" className="cursor-pointer">
                    {formData.documentBack ? (
                      <div className="flex items-center justify-center gap-2 text-[var(--primary)]">
                        <CheckCircle size={20} />
                        <span className="text-sm">{formData.documentBackName || 'Uploaded'}</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto mb-2 text-[var(--muted-foreground)]" size={24} />
                        <p className="text-sm text-[var(--muted-foreground)]">Click to upload back</p>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-[var(--secondary)] rounded-lg p-4">
              <p className="text-sm text-[var(--muted-foreground)]">
                <AlertCircle className="inline mr-2" size={14} />
                Make sure the document is clear, well-lit, and all information is readable.
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Profile Photo</Label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-[var(--secondary)] border-2 border-dashed border-[var(--border)] flex items-center justify-center overflow-hidden">
                  {formData.profilePhoto ? (
                    <img
                      src={formData.profilePhoto}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="text-[var(--muted-foreground)]" size={32} />
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="profilePhoto"
                    onChange={(e) => handleFileUpload('profilePhoto', e)}
                  />
                  <label htmlFor="profilePhoto">
                    <Button variant="outline" size="sm" asChild>
                      <span>Upload Photo</span>
                    </Button>
                  </label>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                    JPG or PNG, max 5MB
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Services You Offer *</Label>
              <p className="text-sm text-[var(--muted-foreground)]">Select all services you can provide</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {SERVICE_CATEGORIES.map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => handleServiceToggle(service.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      formData.services.includes(service.id)
                        ? 'border-[var(--primary)] bg-[var(--accent)]'
                        : 'border-[var(--border)] hover:border-[var(--primary)]/50'
                    }`}
                  >
                    <span className="text-sm font-medium">{service.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience *</Label>
              <Select value={formData.experience} onValueChange={(value) => handleInputChange('experience', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-1">Less than 1 year</SelectItem>
                  <SelectItem value="1-3">1-3 years</SelectItem>
                  <SelectItem value="3-5">3-5 years</SelectItem>
                  <SelectItem value="5-10">5-10 years</SelectItem>
                  <SelectItem value="10+">10+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Professional Bio *</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell customers about your skills, experience, and what makes you the best choice..."
                rows={4}
              />
              <p className="text-xs text-[var(--muted-foreground)]">
                {formData.bio.length}/500 characters
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="bg-[var(--secondary)] rounded-lg p-4 mb-4">
              <p className="text-sm text-[var(--muted-foreground)]">
                <AlertCircle className="inline mr-2" size={14} />
                Your bank details will be used to send your earnings. Please ensure they are accurate.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name *</Label>
              <Select value={formData.bankName} onValueChange={(value) => handleInputChange('bankName', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select bank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gtbank">GTBank</SelectItem>
                  <SelectItem value="firstbank">First Bank</SelectItem>
                  <SelectItem value="uba">UBA</SelectItem>
                  <SelectItem value="zenith">Zenith Bank</SelectItem>
                  <SelectItem value="access">Access Bank</SelectItem>
                  <SelectItem value="fidelity">Fidelity Bank</SelectItem>
                  <SelectItem value="union">Union Bank</SelectItem>
                  <SelectItem value="stanbic">Stanbic IBTC</SelectItem>
                  <SelectItem value="sterling">Sterling Bank</SelectItem>
                  <SelectItem value="wema">Wema Bank</SelectItem>
                  <SelectItem value="fcmb">FCMB</SelectItem>
                  <SelectItem value="polaris">Polaris Bank</SelectItem>
                  <SelectItem value="ecobank">Ecobank</SelectItem>
                  <SelectItem value="keystone">Keystone Bank</SelectItem>
                  <SelectItem value="heritage">Heritage Bank</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number *</Label>
              <Input
                id="accountNumber"
                value={formData.accountNumber}
                onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                placeholder="0000000000"
                maxLength={10}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountName">Account Name *</Label>
              <Input
                id="accountName"
                value={formData.accountName}
                onChange={(e) => handleInputChange('accountName', e.target.value)}
                placeholder="Account holder name"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Complete Your Verification</h1>
        <p className="text-[var(--muted-foreground)]">
          Complete KYC verification to start receiving job requests and build trust with customers.
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Step {currentStep} of {steps.length}</span>
          <span className="text-sm text-[var(--muted-foreground)]">{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />

        {/* Step Indicators */}
        <div className="flex justify-between mt-4">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isCompleted
                      ? 'bg-[var(--success)] text-white'
                      : isActive
                        ? 'bg-[var(--primary)] text-white'
                        : 'bg-[var(--secondary)] text-[var(--muted-foreground)]'
                  }`}
                >
                  {isCompleted ? <CheckCircle size={20} /> : <Icon size={20} />}
                </div>
                <span className={`text-xs mt-2 hidden md:block ${isActive ? 'font-medium' : 'text-[var(--muted-foreground)]'}`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          <CardDescription>
            {currentStep === 1 && 'Enter your personal details as they appear on your ID'}
            {currentStep === 2 && 'Upload a clear photo of your identity document'}
            {currentStep === 3 && 'Tell us about your professional experience'}
            {currentStep === 4 && 'Add your bank details for receiving payments'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          Back
        </Button>

        {currentStep < steps.length ? (
          <Button onClick={handleNext}>
            Continue
            <ChevronRight size={16} className="ml-1" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Shield size={16} className="mr-2" />
                Submit for Verification
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

export default KYCVerification;
