'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { FormComponent } from './types';

interface FormComponentProps {
  component: FormComponent;
  onAction?: (actionId: string, action: string, data?: any) => void;
}

export function CountaForm({ component, onAction }: FormComponentProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = () => {
    // Validate required fields
    const newErrors: Record<string, string> = {};
    component.fields.forEach((field: any) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} wajib diisi`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Trigger save action
    if (onAction) {
      onAction('save', 'submit', formData);
    }
  };

  const renderField = (field: any) => {
    const hasError = errors[field.name];
    const value = formData[field.name] || '';

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.name}
              type={field.type}
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className={hasError ? 'border-red-500' : ''}
              placeholder={field.placeholder}
            />
            {hasError && (
              <p className="text-sm text-red-500">{hasError}</p>
            )}
          </div>
        );

      case 'number':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.name}
              type="number"
              value={value}
              onChange={(e) => handleChange(field.name, parseFloat(e.target.value) || 0)}
              className={hasError ? 'border-red-500' : ''}
              placeholder={field.placeholder}
            />
            {hasError && (
              <p className="text-sm text-red-500">{hasError}</p>
            )}
          </div>
        );

      case 'date':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.name}
              type="date"
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className={hasError ? 'border-red-500' : ''}
            />
            {hasError && (
              <p className="text-sm text-red-500">{hasError}</p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <select
              id={field.name}
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background ${hasError ? 'border-red-500' : ''}`}
            >
              <option value="">Pilih {field.label}</option>
              {field.options?.map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {hasError && (
              <p className="text-sm text-red-500">{hasError}</p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <textarea
              id={field.name}
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background ${hasError ? 'border-red-500' : ''}`}
              placeholder={field.placeholder}
              rows={3}
            />
            {hasError && (
              <p className="text-sm text-red-500">{hasError}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-gray-800">
          📝 {component.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {component.fields?.map((field: any) => renderField(field))}
        
        {component.actions && component.actions.length > 0 && (
          <div className="flex gap-2 pt-2">
            {component.actions.map((action: any) => (
              <Button
                key={action.id}
                variant={action.variant === 'primary' ? 'default' : 'outline'}
                onClick={handleSubmit}
                disabled={action.disabled}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
