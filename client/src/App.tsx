
import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Edit2, Trash2, Users, MessageSquare, FileText, Calendar as CalendarIconLg, Phone, Mail, MapPin, Clock } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { 
  Customer, 
  CreateCustomerInput, 
  UpdateCustomerInput,
  FAQ,
  CreateFaqInput,
  UpdateFaqInput,
  MessageTemplate,
  CreateMessageTemplateInput,
  UpdateMessageTemplateInput,
  Appointment,
  CreateAppointmentInput,
  UpdateAppointmentInput
} from '../../server/src/schema';

function App() {
  // State for all entities
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [messageTemplates, setMessageTemplates] = useState<MessageTemplate[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Dialog states
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [faqDialogOpen, setFaqDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);

  // Edit states
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  // Form states
  const [customerForm, setCustomerForm] = useState<CreateCustomerInput>({
    name: '',
    phone: '',
    email: null,
    address: null,
    notes: null
  });

  const [faqForm, setFaqForm] = useState<CreateFaqInput>({
    question: '',
    answer: '',
    category: null,
    is_active: true
  });

  const [templateForm, setTemplateForm] = useState<CreateMessageTemplateInput>({
    name: '',
    content: '',
    template_type: 'general',
    is_active: true
  });

  const [appointmentForm, setAppointmentForm] = useState<CreateAppointmentInput>({
    customer_id: 0,
    appointment_date: new Date(),
    appointment_time: '',
    status: 'scheduled',
    notes: null,
    reminder_sent: false
  });

  // Load all data
  const loadData = useCallback(async () => {
    try {
      const [customerData, faqData, templateData, appointmentData] = await Promise.all([
        trpc.getCustomers.query(),
        trpc.getFaqs.query(),
        trpc.getMessageTemplates.query(),
        trpc.getAppointments.query()
      ]);
      
      setCustomers(customerData);
      setFaqs(faqData);
      setMessageTemplates(templateData);
      setAppointments(appointmentData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Customer functions
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await trpc.createCustomer.mutate(customerForm);
      setCustomers((prev: Customer[]) => [...prev, response]);
      setCustomerForm({
        name: '',
        phone: '',
        email: null,
        address: null,
        notes: null
      });
      setCustomerDialogOpen(false);
    } catch (error) {
      console.error('Failed to create customer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    
    setIsLoading(true);
    try {
      const updateData: UpdateCustomerInput = {
        id: editingCustomer.id,
        ...customerForm
      };
      const response = await trpc.updateCustomer.mutate(updateData);
      setCustomers((prev: Customer[]) => 
        prev.map((customer: Customer) => customer.id === editingCustomer.id ? response : customer)
      );
      setEditingCustomer(null);
      setCustomerDialogOpen(false);
    } catch (error) {
      console.error('Failed to update customer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCustomer = async (customerId: number) => {
    try {
      await trpc.deleteCustomer.mutate({ id: customerId });
      setCustomers((prev: Customer[]) => prev.filter((customer: Customer) => customer.id !== customerId));
    } catch (error) {
      console.error('Failed to delete customer:', error);
    }
  };

  // FAQ functions
  const handleCreateFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await trpc.createFaq.mutate(faqForm);
      setFaqs((prev: FAQ[]) => [...prev, response]);
      setFaqForm({
        question: '',
        answer: '',
        category: null,
        is_active: true
      });
      setFaqDialogOpen(false);
    } catch (error) {
      console.error('Failed to create FAQ:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq) return;
    
    setIsLoading(true);
    try {
      const updateData: UpdateFaqInput = {
        id: editingFaq.id,
        ...faqForm
      };
      const response = await trpc.updateFaq.mutate(updateData);
      setFaqs((prev: FAQ[]) => 
        prev.map((faq: FAQ) => faq.id === editingFaq.id ? response : faq)
      );
      setEditingFaq(null);
      setFaqDialogOpen(false);
    } catch (error) {
      console.error('Failed to update FAQ:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFaq = async (faqId: number) => {
    try {
      await trpc.deleteFaq.mutate({ id: faqId });
      setFaqs((prev: FAQ[]) => prev.filter((faq: FAQ) => faq.id !== faqId));
    } catch (error) {
      console.error('Failed to delete FAQ:', error);
    }
  };

  // Template functions
  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await trpc.createMessageTemplate.mutate(templateForm);
      setMessageTemplates((prev: MessageTemplate[]) => [...prev, response]);
      setTemplateForm({
        name: '',
        content: '',
        template_type: 'general',
        is_active: true
      });
      setTemplateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create template:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;
    
    setIsLoading(true);
    try {
      const updateData: UpdateMessageTemplateInput = {
        id: editingTemplate.id,
        ...templateForm
      };
      const response = await trpc.updateMessageTemplate.mutate(updateData);
      setMessageTemplates((prev: MessageTemplate[]) => 
        prev.map((template: MessageTemplate) => template.id === editingTemplate.id ? response : template)
      );
      setEditingTemplate(null);
      setTemplateDialogOpen(false);
    } catch (error) {
      console.error('Failed to update template:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: number) => {
    try {
      await trpc.deleteMessageTemplate.mutate({ id: templateId });
      setMessageTemplates((prev: MessageTemplate[]) => prev.filter((template: MessageTemplate) => template.id !== templateId));
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  // Appointment functions
  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await trpc.createAppointment.mutate(appointmentForm);
      setAppointments((prev: Appointment[]) => [...prev, response]);
      setAppointmentForm({
        customer_id: 0,
        appointment_date: new Date(),
        appointment_time: '',
        status: 'scheduled',
        notes: null,
        reminder_sent: false
      });
      setAppointmentDialogOpen(false);
    } catch (error) {
      console.error('Failed to create appointment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppointment) return;
    
    setIsLoading(true);
    try {
      const updateData: UpdateAppointmentInput = {
        id: editingAppointment.id,
        ...appointmentForm
      };
      const response = await trpc.updateAppointment.mutate(updateData);
      setAppointments((prev: Appointment[]) => 
        prev.map((appointment: Appointment) => appointment.id === editingAppointment.id ? response : appointment)
      );
      setEditingAppointment(null);
      setAppointmentDialogOpen(false);
    } catch (error) {
      console.error('Failed to update appointment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId: number) => {
    try {
      await trpc.deleteAppointment.mutate({ id: appointmentId });
      setAppointments((prev: Appointment[]) => prev.filter((appointment: Appointment) => appointment.id !== appointmentId));
    } catch (error) {
      console.error('Failed to delete appointment:', error);
    }
  };

  // Helper functions
  const openEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setCustomerForm({
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      notes: customer.notes
    });
    setCustomerDialogOpen(true);
  };

  const openEditFaq = (faq: FAQ) => {
    setEditingFaq(faq);
    setFaqForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      is_active: faq.is_active
    });
    setFaqDialogOpen(true);
  };

  const openEditTemplate = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      content: template.content,
      template_type: template.template_type,
      is_active: template.is_active
    });
    setTemplateDialogOpen(true);
  };

  const openEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setAppointmentForm({
      customer_id: appointment.customer_id,
      appointment_date: appointment.appointment_date,
      appointment_time: appointment.appointment_time,
      status: appointment.status,
      notes: appointment.notes,
      reminder_sent: appointment.reminder_sent
    });
    setAppointmentDialogOpen(true);
  };

  const resetForms = () => {
    setEditingCustomer(null);
    setEditingFaq(null);
    setEditingTemplate(null);
    setEditingAppointment(null);
    setCustomerForm({
      name: '',
      phone: '',
      email: null,
      address: null,
      notes: null
    });
    setFaqForm({
      question: '',
      answer: '',
      category: null,
      is_active: true
    });
    setTemplateForm({
      name: '',
      content: '',
      template_type: 'general',
      is_active: true
    });
    setAppointmentForm({
      customer_id: 0,
      appointment_date: new Date(),
      appointment_time: '',
      status: 'scheduled',
      notes: null,
      reminder_sent: false
    });
  };

  const getCustomerName = (customerId: number) => {
    const customer = customers.find((c: Customer) => c.id === customerId);
    return customer?.name || 'Unknown Customer';
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTemplateTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'confirmation': return 'bg-green-100 text-green-800 border-green-200';
      case 'reminder': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'follow_up': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'general': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🏥 Klinik Sunat Modern</h1>
          <p className="text-lg text-gray-600">Sistem Manajemen Pelayanan Pelanggan Otomatis</p>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Pelanggan</CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{customers.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Janji Aktif</CardTitle>
              <CalendarIconLg className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {appointments.filter((a: Appointment) => ['scheduled', 'confirmed'].includes(a.status)).length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">FAQ Aktif</CardTitle>
              <MessageSquare className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {faqs.filter((f: FAQ) => f.is_active).length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Template Pesan</CardTitle>
              <FileText className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {messageTemplates.filter((t: MessageTemplate) => t.is_active).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="customers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Pelanggan
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <CalendarIconLg className="h-4 w-4" />
              Janji Temu
            </TabsTrigger>
            <TabsTrigger value="faqs" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              FAQ
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Template Pesan
            </TabsTrigger>
          </TabsList>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl text-gray-900">👥 Manajemen Pelanggan</CardTitle>
                    <CardDescription>Kelola data pelanggan dan informasi kontak</CardDescription>
                  </div>
                  <Dialog open={customerDialogOpen} onOpenChange={(open) => {
                    setCustomerDialogOpen(open);
                    if (!open) resetForms();
                  }}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Pelanggan
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>
                          {editingCustomer ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru'}
                        </DialogTitle>
                        <DialogDescription>
                          {editingCustomer ? 'Perbarui informasi pelanggan' : 'Masukkan informasi pelanggan baru'}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={editingCustomer ? handleUpdateCustomer : handleCreateCustomer}>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="name">Nama Lengkap *</Label>
                            <Input
                              id="name"
                              value={customerForm.name}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setCustomerForm((prev: CreateCustomerInput) => ({ ...prev, name: e.target.value }))
                              }
                              placeholder="Masukkan nama lengkap"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Nomor Telepon *</Label>
                            <Input
                              id="phone"
                              value={customerForm.phone}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setCustomerForm((prev: CreateCustomerInput) => ({ ...prev, phone: e.target.value }))
                              }
                              placeholder="08xxxxxxxxxx"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={customerForm.email || ''}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setCustomerForm((prev: CreateCustomerInput) => ({ 
                                  ...prev, 
                                  email: e.target.value || null 
                                }))
                              }
                              placeholder="email@example.com"
                            />
                          </div>
                          <div>
                            <Label htmlFor="address">Alamat</Label>
                            <Textarea
                              id="address"
                              value={customerForm.address || ''}
                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                setCustomerForm((prev: CreateCustomerInput) => ({ 
                                  ...prev, 
                                  address: e.target.value || null 
                                }))
                              }
                              placeholder="Alamat lengkap"
                              rows={3}
                            />
                          </div>
                          <div>
                            <Label htmlFor="notes">Catatan</Label>
                            <Textarea
                              id="notes"
                              value={customerForm.notes || ''}
                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                setCustomerForm((prev: CreateCustomerInput) => ({ 
                                  ...prev, 
                                  notes: e.target.value || null 
                                }))
                              }
                              placeholder="Catatan tambahan"
                              rows={3}
                            />
                          </div>
                        </div>
                        <DialogFooter className="mt-6">
                          <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                            {isLoading ? 'Menyimpan...' : editingCustomer ? 'Perbarui' : 'Simpan'}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {customers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Belum ada pelanggan terdaftar</p>
                    <p className="text-sm text-gray-400">Tambahkan pelanggan baru untuk memulai</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {customers.map((customer: Customer) => (
                      <Card key={customer.id} className="bg-gradient-to-r from-white to-blue-50 border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <h3 className="font-semibold text-lg text-gray-900">{customer.name}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Phone className="h-4 w-4" />
                                  {customer.phone}
                                </span>
                                {customer.email && (
                                  <span className="flex items-center gap-1">
                                    <Mail className="h-4 w-4" />
                                    {customer.email}
                                  </span>
                                )}
                              </div>
                              {customer.address && (
                                <p className="flex items-start gap-1 text-sm text-gray-600">
                                  <MapPin className="h-4 w-4 mt-0.5" />
                                  {customer.address}
                                </p>
                              )}
                              {customer.notes && (
                                <p className="text-sm text-gray-600 bg-yellow-50 p-2 rounded">
                                  💡 {customer.notes}
                                </p>
                              )}
                              <p className="text-xs text-gray-400">
                                Bergabung: {customer.created_at.toLocaleDateString('id-ID')}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditCustomer(customer)}
                                className="hover:bg-blue-50"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="hover:bg-red-50 hover:text-red-600">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Hapus Pelanggan?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Apakah Anda yakin ingin menghapus {customer.name}? Tindakan ini tidak dapat dibatalkan.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteCustomer(customer.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Hapus
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl text-gray-900">📅 Manajemen Janji Temu</CardTitle>
                    <CardDescription>Kelola jadwal dan janji temu sunat</CardDescription>
                  </div>
                  <Dialog open={appointmentDialogOpen} onOpenChange={(open) => {
                    setAppointmentDialogOpen(open);
                    if (!open) resetForms();
                  }}>
                    <DialogTrigger asChild>
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Janji Temu
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>
                          {editingAppointment ? 'Edit Janji Temu' : 'Tambah Janji Temu Baru'}
                        </DialogTitle>
                        <DialogDescription>
                          {editingAppointment ? 'Perbarui informasi janji temu' : 'Buat janji temu baru'}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={editingAppointment ? handleUpdateAppointment : handleCreateAppointment}>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="customer">Pelanggan *</Label>
                            <Select 
                              value={appointmentForm.customer_id.toString()} 
                              onValueChange={(value) => setAppointmentForm((prev: CreateAppointmentInput) => ({ 
                                ...prev, 
                                customer_id: parseInt(value) 
                              }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih pelanggan" />
                              </SelectTrigger>
                              <SelectContent>
                                {customers.map((customer: Customer) => (
                                  <SelectItem key={customer.id} value={customer.id.toString()}>
                                    {customer.name} - {customer.phone}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="date">Tanggal *</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start text-left font-normal"
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {appointmentForm.appointment_date ? 
                                    format(appointmentForm.appointment_date, "dd/MM/yyyy") : 
                                    "Pilih tanggal"
                                  }
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={appointmentForm.appointment_date}
                                  onSelect={(date) => date && setAppointmentForm((prev: CreateAppointmentInput) => ({ 
                                    ...prev, 
                                    appointment_date: date 
                                  }))}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div>
                            <Label htmlFor="time">Waktu *</Label>
                            <Input
                              id="time"
                              type="time"
                              value={appointmentForm.appointment_time}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setAppointmentForm((prev: CreateAppointmentInput) => ({ 
                                  ...prev, 
                                  appointment_time: e.target.value 
                                }))
                              }
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="status">Status</Label>
                            <Select 
                              value={appointmentForm.status} 
                              onValueChange={(value: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled') => 
                                setAppointmentForm((prev: CreateAppointmentInput) => ({ ...prev, status: value }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="scheduled">Terjadwal</SelectItem>
                                <SelectItem value="confirmed">Dikonfirmasi</SelectItem>
                                <SelectItem value="completed">Selesai</SelectItem>
                                <SelectItem value="cancelled">Dibatalkan</SelectItem>
                                <SelectItem value="rescheduled">Dijadwal Ulang</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="notes">Catatan</Label>
                            <Textarea
                              id="notes"
                              value={appointmentForm.notes || ''}
                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                setAppointmentForm((prev: CreateAppointmentInput) => ({ 
                                  ...prev, 
                                  notes: e.target.value || null 
                                }))
                              }
                              placeholder="Catatan tambahan"
                              rows={3}
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="reminder"
                              checked={appointmentForm.reminder_sent}
                              onCheckedChange={(checked) => 
                                setAppointmentForm((prev: CreateAppointmentInput) => ({ 
                                  ...prev, 
                                  reminder_sent: checked 
                                }))
                              }
                            />
                            <Label htmlFor="reminder">Pengingat telah dikirim</Label>
                          </div>
                        </div>
                        <DialogFooter className="mt-6">
                          <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                            {isLoading ? 'Menyimpan...' : editingAppointment ? 'Perbarui' : 'Simpan'}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarIconLg className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Belum ada janji temu</p>
                    <p className="text-sm text-gray-400">Tambahkan janji temu untuk memulai</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {appointments.map((appointment: Appointment) => (
                      <Card key={appointment.id} className="bg-gradient-to-r from-white to-green-50 border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-lg text-gray-900">
                                  {getCustomerName(appointment.customer_id)}
                                </h3>
                                <Badge className={getStatusBadgeColor(appointment.status)}>
                                  {appointment.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <CalendarIcon className="h-4 w-4" />
                                  {appointment.appointment_date.toLocaleDateString('id-ID')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {appointment.appointment_time}
                                </span>
                              </div>
                              {appointment.notes && (
                                <p className="text-sm text-gray-600 bg-yellow-50 p-2 rounded">
                                  📝 {appointment.notes}
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-gray-400">
                                <span>Dibuat: {appointment.created_at.toLocaleDateString('id-ID')}</span>
                                {appointment.reminder_sent && (
                                  <Badge variant="outline" className="text-green-600">
                                    ✓ Pengingat dikirim
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditAppointment(appointment)}
                                className="hover:bg-green-50"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="hover:bg-red-50 hover:text-red-600">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Hapus Janji Temu?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Apakah Anda yakin ingin menghapus janji temu ini? Tindakan ini tidak dapat dibatalkan.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteAppointment(appointment.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Hapus
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQs Tab */}
          <TabsContent value="faqs" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl text-gray-900">❓ Pertanyaan Yang Sering Diajukan</CardTitle>
                    <CardDescription>Kelola daftar FAQ untuk respons otomatis</CardDescription>
                  </div>
                  <Dialog open={faqDialogOpen} onOpenChange={(open) => {
                    setFaqDialogOpen(open);
                    if (!open) resetForms();
                  }}>
                    <DialogTrigger asChild>
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah FAQ
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>
                          {editingFaq ? 'Edit FAQ' : 'Tambah FAQ Baru'}
                        </DialogTitle>
                        <DialogDescription>
                          {editingFaq ? 'Perbarui pertanyaan dan jawaban' : 'Buat FAQ baru'}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={editingFaq ? handleUpdateFaq : handleCreateFaq}>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="question">Pertanyaan *</Label>
                            <Textarea
                              id="question"
                              value={faqForm.question}
                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                setFaqForm((prev: CreateFaqInput) => ({ ...prev, question: e.target.value }))
                              }
                              placeholder="Masukkan pertanyaan"
                              rows={3}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="answer">Jawaban *</Label>
                            <Textarea
                              id="answer"
                              value={faqForm.answer}
                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                setFaqForm((prev: CreateFaqInput) => ({ ...prev, answer: e.target.value }))
                              }
                              placeholder="Masukkan jawaban"
                              rows={4}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="category">Kategori</Label>
                            <Input
                              id="category"
                              value={faqForm.category || ''}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setFaqForm((prev: CreateFaqInput) => ({ 
                                  ...prev, 
                                  category: e.target.value || null 
                                }))
                              }
                              placeholder="Kategori FAQ"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="active"
                              checked={faqForm.is_active}
                              onCheckedChange={(checked) => 
                                setFaqForm((prev: CreateFaqInput) => ({ ...prev, is_active: checked }))
                              }
                            />
                            <Label htmlFor="active">FAQ Aktif</Label>
                          </div>
                        </div>
                        <DialogFooter className="mt-6">
                          <Button type="submit" disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
                            {isLoading ? 'Menyimpan...' : editingFaq ? 'Perbarui' : 'Simpan'}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {faqs.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Belum ada FAQ</p>
                    <p className="text-sm text-gray-400">Tambahkan FAQ untuk respons otomatis</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {faqs.map((faq: FAQ) => (
                      <Card key={faq.id} className="bg-gradient-to-r from-white to-purple-50 border-l-4 border-l-purple-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-3 flex-1">
                              <div className="flex items-start gap-3">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900 mb-2">❓ {faq.question}</h3>
                                  <p className="text-gray-700 mb-3">💬 {faq.answer}</p>
                                </div>
                                <div className="flex gap-2">
                                  <Badge variant={faq.is_active ? "default" : "secondary"}>
                                    {faq.is_active ? "Aktif" : "Nonaktif"}
                                  </Badge>
                                  {faq.category && (
                                    <Badge variant="outline">{faq.category}</Badge>
                                  )}
                                </div>
                              </div>
                              <p className="text-xs text-gray-400">
                                Dibuat: {faq.created_at.toLocaleDateString('id-ID')}
                              </p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditFaq(faq)}
                                className="hover:bg-purple-50"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="hover:bg-red-50 hover:text-red-600">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Hapus FAQ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Apakah Anda yakin ingin menghapus FAQ ini? Tindakan ini tidak dapat dibatalkan.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteFaq(faq.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Hapus
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl text-gray-900">📨 Template Pesan</CardTitle>
                    <CardDescription>Kelola template untuk pesan otomatis WhatsApp</CardDescription>
                  </div>
                  <Dialog open={templateDialogOpen} onOpenChange={(open) => {
                    setTemplateDialogOpen(open);
                    if (!open) resetForms();
                  }}>
                    <DialogTrigger asChild>
                      <Button className="bg-orange-600 hover:bg-orange-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Template
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>
                          {editingTemplate ? 'Edit Template' : 'Tambah Template Baru'}
                        </DialogTitle>
                        <DialogDescription>
                          {editingTemplate ? 'Perbarui template pesan' : 'Buat template pesan baru'}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="name">Nama Template *</Label>
                            <Input
                              id="name"
                              value={templateForm.name}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setTemplateForm((prev: CreateMessageTemplateInput) => ({ ...prev, name: e.target.value }))
                              }
                              placeholder="Nama template"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="type">Jenis Template</Label>
                            <Select 
                              value={templateForm.template_type} 
                              onValueChange={(value: 'confirmation' | 'reminder' | 'follow_up' | 'general') => 
                                setTemplateForm((prev: CreateMessageTemplateInput) => ({ ...prev, template_type: value }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="confirmation">Konfirmasi</SelectItem>
                                <SelectItem value="reminder">Pengingat</SelectItem>
                                <SelectItem value="follow_up">Follow Up</SelectItem>
                                <SelectItem value="general">Umum</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="content">Isi Pesan *</Label>
                            <Textarea
                              id="content"
                              value={templateForm.content}
                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                setTemplateForm((prev: CreateMessageTemplateInput) => ({ ...prev, content: e.target.value }))
                              }
                              placeholder="Isi template pesan"
                              rows={5}
                              required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              💡 Gunakan variabel seperti {'{nama}'}, {'{tanggal}'}, {'{waktu}'} untuk personalisasi
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="active"
                              checked={templateForm.is_active}
                              onCheckedChange={(checked) => 
                                setTemplateForm((prev: CreateMessageTemplateInput) => ({ ...prev, is_active: checked }))
                              }
                            />
                            <Label htmlFor="active">Template Aktif</Label>
                          </div>
                        </div>
                        <DialogFooter className="mt-6">
                          <Button type="submit" disabled={isLoading} className="bg-orange-600 hover:bg-orange-700">
                            {isLoading ? 'Menyimpan...' : editingTemplate ? 'Perbarui' : 'Simpan'}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {messageTemplates.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Belum ada template pesan</p>
                    <p className="text-sm text-gray-400">Buat template untuk pesan otomatis</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {messageTemplates.map((template: MessageTemplate) => (
                      <Card key={template.id} className="bg-gradient-to-r from-white to-orange-50 border-l-4 border-l-orange-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-3 flex-1">
                              <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-lg text-gray-900">{template.name}</h3>
                                <Badge className={getTemplateTypeBadgeColor(template.template_type)}>
                                  {template.template_type}
                                </Badge>
                                <Badge variant={template.is_active ? "default" : "secondary"}>
                                  {template.is_active ? "Aktif" : "Nonaktif"}
                                </Badge>
                              </div>
                              <div className="bg-gray-50 p-3 rounded border-l-2 border-gray-300">
                                <p className="text-gray-700 whitespace-pre-wrap">{template.content}</p>
                              </div>
                              <p className="text-xs text-gray-400">
                                Dibuat: {template.created_at.toLocaleDateString('id-ID')}
                              </p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditTemplate(template)}
                                className="hover:bg-orange-50"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="hover:bg-red-50 hover:text-red-600">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Hapus Template?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Apakah Anda yakin ingin menghapus template "{template.name}"? Tindakan ini tidak dapat dibatalkan.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteTemplate(template.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Hapus
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>🏥 Klinik Sunat Modern - Sistem Manajemen Pelayanan Pelanggan</p>
          <p className="mt-1">💬 Siap diintegrasikan dengan WhatsApp Business API</p>
        </div>
      </div>
    </div>
  );
}

export default App;
