'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { StatusComponent, StatusStep, ActionButton } from './types';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Info,
  Activity,
  Database,
  Wifi,
  Shield,
  Zap,
  RefreshCw,
  Settings,
  BarChart3
} from 'lucide-react';

interface StatusComponentProps {
  component: StatusComponent;
  onAction?: (actionId: string, action: string, data?: any) => void;
}

export function CountaStatus({ component, onAction }: StatusComponentProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-gray-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-800 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-800 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-800 bg-red-50 border-red-200';
      case 'info':
        return 'text-blue-800 bg-blue-50 border-blue-200';
      case 'pending':
        return 'text-gray-800 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-800 bg-gray-50 border-gray-200';
    }
  };

  const getStepIcon = (stepStatus: string) => {
    switch (stepStatus) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'current':
        return <Clock className="h-4 w-4 text-blue-600 animate-pulse" />;
      case 'pending':
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const renderProgressStatus = () => (
    <Card className={`border-l-4 ${getStatusColor(component.status).split(' ')[2]}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {getStatusIcon(component.status)}
          <CardTitle className={`text-lg font-bold ${getStatusColor(component.status).split(' ')[0]}`}>
            🔄 {component.title}
          </CardTitle>
        </div>
        <p className={`text-sm ${getStatusColor(component.status).split(' ')[0]}`}>
          {component.message}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {component.progress !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{component.progress}%</span>
            </div>
            <Progress value={component.progress} className="h-2" />
          </div>
        )}
        
        {component.steps && (
          <div className="space-y-3">
            {component.steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-3">
                {getStepIcon(step.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{step.label}</span>
                    {step.status === 'completed' && (
                      <Badge className="bg-green-100 text-green-800 text-xs">✅</Badge>
                    )}
                    {step.status === 'current' && (
                      <Badge className="bg-blue-100 text-blue-800 text-xs">⏳</Badge>
                    )}
                    {step.status === 'error' && (
                      <Badge className="bg-red-100 text-red-800 text-xs">❌</Badge>
                    )}
                  </div>
                  {step.timestamp && (
                    <p className="text-xs text-gray-500">
                      {step.timestamp.toLocaleTimeString('id-ID')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {component.actions && (
          <div className="flex flex-wrap gap-2 pt-3 border-t">
            {component.actions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                onClick={() => onAction?.(action.id, action.action)}
                className="text-xs"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderHealthStatus = () => (
    <Card className={`border-l-4 ${getStatusColor(component.status).split(' ')[2]}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {getStatusIcon(component.status)}
          <CardTitle className={`text-lg font-bold ${getStatusColor(component.status).split(' ')[0]}`}>
            🏥 {component.title}
          </CardTitle>
        </div>
        <p className={`text-sm ${getStatusColor(component.status).split(' ')[0]}`}>
          {component.message}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {component.steps?.map((step) => (
            <div key={step.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              {getStepIcon(step.status)}
              <div className="flex-1">
                <span className="text-sm font-medium">{step.label}</span>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    step.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  <span className="text-xs text-gray-600">
                    {step.status === 'completed' ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {component.actions && (
          <div className="flex flex-wrap gap-2 pt-4 border-t mt-4">
            {component.actions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                onClick={() => onAction?.(action.id, action.action)}
                className="text-xs"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderProcessStatus = () => (
    <Card className={`border-l-4 ${getStatusColor(component.status).split(' ')[2]}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {getStatusIcon(component.status)}
          <CardTitle className={`text-lg font-bold ${getStatusColor(component.status).split(' ')[0]}`}>
            🔄 {component.title}
          </CardTitle>
        </div>
        <p className={`text-sm ${getStatusColor(component.status).split(' ')[0]}`}>
          {component.message}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {component.steps && (
          <div className="space-y-3">
            {component.steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {getStepIcon(step.status)}
                    <span className="text-sm font-medium">{step.label}</span>
                    {step.status === 'completed' && (
                      <Badge className="bg-green-100 text-green-800 text-xs">✅</Badge>
                    )}
                    {step.status === 'current' && (
                      <Badge className="bg-blue-100 text-blue-800 text-xs">⏳</Badge>
                    )}
                    {step.status === 'error' && (
                      <Badge className="bg-red-100 text-red-800 text-xs">❌</Badge>
                    )}
                  </div>
                  {step.timestamp && (
                    <p className="text-xs text-gray-500">
                      {step.timestamp.toLocaleTimeString('id-ID')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {component.actions && (
          <div className="flex flex-wrap gap-2 pt-3 border-t">
            {component.actions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                onClick={() => onAction?.(action.id, action.action)}
                className="text-xs"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderSystemStatus = () => (
    <Card className={`border-l-4 ${getStatusColor(component.status).split(' ')[2]}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {getStatusIcon(component.status)}
          <CardTitle className={`text-lg font-bold ${getStatusColor(component.status).split(' ')[0]}`}>
            🏥 {component.title}
          </CardTitle>
        </div>
        <p className={`text-sm ${getStatusColor(component.status).split(' ')[0]}`}>
          {component.message}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          {component.steps?.map((step) => (
            <div key={step.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getStepIcon(step.status)}
                <div>
                  <span className="text-sm font-medium">{step.label}</span>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${
                      step.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    <span className="text-xs text-gray-600">
                      {step.status === 'completed' ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
              <Badge 
                className={
                  step.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }
              >
                {step.status === 'completed' ? '✅' : '❌'}
              </Badge>
            </div>
          ))}
        </div>
        
        {component.actions && (
          <div className="flex flex-wrap gap-2 pt-4 border-t mt-4">
            {component.actions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                onClick={() => onAction?.(action.id, action.action)}
                className="text-xs"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  switch (component.variant) {
    case 'progress':
      return renderProgressStatus();
    case 'health':
      return renderHealthStatus();
    case 'process':
      return renderProcessStatus();
    case 'system':
      return renderSystemStatus();
    default:
      return renderProgressStatus();
  }
}
