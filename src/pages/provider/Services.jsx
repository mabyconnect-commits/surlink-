import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { SERVICE_CATEGORIES, formatCurrency } from '../../lib/constants';
import { servicesAPI } from '../../services/apiClient';

function ProviderServices() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);

  // Fetch services from API
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await servicesAPI.getAll();
      if (response.success) {
        setServices(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    priceType: 'fixed',
    price: '',
    duration: '',
  });

  const resetForm = () => {
    setFormData({
      category: '',
      title: '',
      description: '',
      priceType: 'fixed',
      price: '',
      duration: '',
    });
    setEditingService(null);
  };

  const handleOpenDialog = (service = null) => {
    if (service) {
      setFormData({
        category: service.category,
        title: service.title,
        description: service.description,
        priceType: service.priceType,
        price: service.price.toString(),
        duration: service.duration,
      });
      setEditingService(service);
    } else {
      resetForm();
    }
    setShowAddDialog(true);
  };

  const handleSave = async () => {
    if (!formData.category || !formData.title || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const serviceData = {
        category: formData.category,
        title: formData.title,
        description: formData.description,
        price_type: formData.priceType,
        price: parseFloat(formData.price),
        duration: formData.duration,
      };

      if (editingService) {
        const response = await servicesAPI.update(editingService.id, serviceData);
        if (response.success) {
          toast.success('Service updated successfully!');
          fetchServices();
        }
      } else {
        const response = await servicesAPI.create(serviceData);
        if (response.success) {
          toast.success('Service added successfully!');
          fetchServices();
        }
      }

      setShowAddDialog(false);
      resetForm();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error(error.response?.data?.message || 'Failed to save service');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (serviceId) => {
    try {
      const service = services.find(s => s.id === serviceId);
      const response = await servicesAPI.update(serviceId, {
        is_active: !service.isActive
      });
      if (response.success) {
        toast.success('Service status updated');
        fetchServices();
      }
    } catch (error) {
      console.error('Error toggling service status:', error);
      toast.error('Failed to update service status');
    }
  };

  const handleDelete = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        const response = await servicesAPI.delete(serviceId);
        if (response.success) {
          toast.success('Service deleted successfully');
          fetchServices();
        }
      } catch (error) {
        console.error('Error deleting service:', error);
        toast.error('Failed to delete service');
      }
    }
  };

  const getCategoryName = (categoryId) => {
    return SERVICE_CATEGORIES.find(c => c.id === categoryId)?.name || categoryId;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[var(--primary)] mx-auto mb-4" />
          <p className="text-[var(--muted-foreground)]">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">My Services</h1>
          <p className="text-[var(--muted-foreground)]">
            Manage the services you offer to customers
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus size={18} className="mr-2" />
          Add Service
        </Button>
      </div>

      {/* Services List */}
      {services.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {services.map((service) => (
            <Card key={service.id} className={!service.isActive ? 'opacity-60' : ''}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{service.title}</h3>
                      {service.isActive ? (
                        <span className="status-badge active">Active</span>
                      ) : (
                        <span className="status-badge cancelled">Inactive</span>
                      )}
                    </div>
                    <span className="text-xs text-[var(--primary)] bg-[var(--accent)] px-2 py-0.5 rounded-full">
                      {getCategoryName(service.category)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Switch
                      checked={service.isActive}
                      onCheckedChange={() => handleToggleActive(service.id)}
                    />
                  </div>
                </div>

                <p className="text-sm text-[var(--muted-foreground)] mb-4 line-clamp-2">
                  {service.description}
                </p>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1 text-sm">
                    <DollarSign size={16} className="text-[var(--success)]" />
                    <span className="font-semibold">{formatCurrency(service.price)}</span>
                    <span className="text-[var(--muted-foreground)]">
                      {service.priceType === 'hourly' ? '/hour' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-[var(--muted-foreground)]">
                    <Clock size={16} />
                    <span>{service.duration}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-[var(--border)]">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(service)}
                  >
                    <Edit2 size={14} className="mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[var(--destructive)]"
                    onClick={() => handleDelete(service.id)}
                  >
                    <Trash2 size={14} className="mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <AlertCircle className="mx-auto mb-4 text-[var(--muted-foreground)]" size={48} />
            <h3 className="text-lg font-semibold mb-2">No services added yet</h3>
            <p className="text-[var(--muted-foreground)] mb-4">
              Add the services you offer to start receiving job requests
            </p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus size={18} className="mr-2" />
              Add Your First Service
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tips Card */}
      <Card className="border-[var(--info)]">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-[var(--info)] shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-[var(--info)]">Tips for Better Visibility</h3>
              <ul className="text-sm text-[var(--muted-foreground)] mt-2 space-y-1">
                <li>• Add clear and detailed descriptions for each service</li>
                <li>• Set competitive prices based on market rates</li>
                <li>• Keep your services updated with accurate pricing</li>
                <li>• Respond quickly to job requests to maintain high ratings</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingService ? 'Edit Service' : 'Add New Service'}
            </DialogTitle>
            <DialogDescription>
              {editingService
                ? 'Update the details of your service'
                : 'Add a new service that you offer'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category">Service Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_CATEGORIES.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Service Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Pipe Installation"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this service includes..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priceType">Price Type</Label>
                <Select
                  value={formData.priceType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priceType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Price</SelectItem>
                    <SelectItem value="hourly">Hourly Rate</SelectItem>
                    <SelectItem value="quote">Quote Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (NGN) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Estimated Duration</Label>
              <Input
                id="duration"
                placeholder="e.g., 2-4 hours"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDialog(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : editingService ? (
                'Update Service'
              ) : (
                'Add Service'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProviderServices;
