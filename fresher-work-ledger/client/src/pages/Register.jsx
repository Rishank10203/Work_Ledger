import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const { register, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/');
    } catch (err) {}
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-primary-600 to-blue-500 bg-clip-text text-transparent tracking-tight">Work Ledger</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 font-medium">Create your account</p>
        </div>
        
        <Card>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm text-center font-medium">
                {error}
              </div>
            )}
            
            <Input label="Full Name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="John Doe" />
            <Input label="Email Address" type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" />
            <Input label="Password" type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />

            <Button type="submit" className="w-full py-2.5 text-md font-semibold" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500 transition-colors">
              Sign in
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
