import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  role: z.enum(['admin', 'user', 'client']),
  clientId: z.string().optional().or(z.literal('')),
}).refine((data) => {
  if (data.role === 'client' && !data.clientId) return false;
  return true;
}, {
  message: "Client organization is required for client role",
  path: ["clientId"],
});

export const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  clientId: z.string().min(1, 'Client / Organization is required'),
  description: z.string().optional().or(z.literal('')),
  status: z.enum(['Active', 'On Hold', 'Completed']).default('Active'),
  startDate: z.string().min(1, 'Start Date is required'),
  endDate: z.string().min(1, 'Deadline is required'),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.endDate) >= new Date(data.startDate);
  }
  return true;
}, {
  message: "Deadline must be after Start Date",
  path: ["endDate"],
});

export const clientSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address: z.string().optional().or(z.literal('')),
  company: z.string().min(1, 'Company name is required'),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
});

export const taskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  projectId: z.string().min(1, 'Project is required'),
  description: z.string().optional().or(z.literal('')),
  status: z.enum(['todo', 'inprogress', 'review', 'done']).default('todo'),
  priority: z.enum(['Low', 'Medium', 'High']).default('Medium'),
  assignedUser: z.string().optional().or(z.literal('')),
  estimatedHours: z.coerce.number().min(0.5, 'Minimum 0.5 hours').default(1),
  isBillable: z.boolean().default(true),
  deadline: z.string().optional().or(z.literal('')),
});

