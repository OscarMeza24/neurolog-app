// ================================================================
// src/app/dashboard/children/[id]/page.tsx
// Página de detalles de niño completa
// ================================================================

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/components/providers/AuthProvider';
import { useChildren } from '@/hooks/use-children';
import { useLogs } from '@/hooks/use-logs';
import type { 
  ChildWithRelation,
  LogWithDetails
} from '@/types';
import { 
  EditIcon,
  MoreVerticalIcon,
  DownloadIcon,
  CalendarIcon,
  PlusIcon,
  UserPlusIcon,
  EyeIcon,
  GraduationCapIcon,
  UsersIcon,
  ClockIcon,
  AlertCircleIcon,
  TrendingUpIcon,
  BookOpenIcon,
  ArrowLeftIcon
} from 'lucide-react';
import { ProgressChart } from '@/components/reports/ProgressChart';
import { MoodTrendChart } from '@/components/reports/MoodTrendChart';
import { CategoryDistribution } from '@/components/reports/CategoryDistribution';
import { format, differenceInYears, subMonths, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ChildDetailPage() {
  const params = useParams();
  const router = useRouter();
  const childId = params.id as string;
  useAuth();
  const { loading: childLoading, getChildById } = useChildren();
  const { logs } = useLogs({ childId });
  
  const [child, setChild] = useState<ChildWithRelation | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (childId && !childLoading) {
      const foundChild = getChildById(childId);
      setChild(foundChild || null);
    }
  }, [childId, childLoading, getChildById]);

  if (childLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Niño no encontrado</h2>
        <p className="text-gray-600 mt-2">El niño que buscas no existe o no tienes permisos para verlo.</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/children">Volver a la lista</Link>
        </Button>
      </div>
    );
  }

  const calculateAge = (birthDate: string) => {
    return differenceInYears(new Date(), new Date(birthDate));
  };

  const getRelationshipColor = (type: string) => {
    switch (type) {
      case 'parent': return 'bg-blue-100 text-blue-800';
      case 'teacher': return 'bg-green-100 text-green-800';
      case 'specialist': return 'bg-purple-100 text-purple-800';
      case 'observer': return 'bg-gray-100 text-gray-800';
      case 'family': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Estadísticas del niño
  // Función auxiliar para obtener el estado del registro
  const getLogStatusVariant = (log: LogWithDetails): 'destructive' | 'secondary' => {
    if (log.follow_up_required && !log.follow_up_date) {
      return 'destructive';
    }
    return 'secondary';
  };

  // Función auxiliar para obtener el texto del estado del registro
  const getLogStatusText = (log: LogWithDetails): string => {
    if (log.follow_up_required && !log.follow_up_date) {
      return 'Seguimiento pendiente';
    }
    if (log.reviewer_name) {
      return 'Revisado';
    }
    return 'Sin revisar';
  };

  const childStats = {
    totalLogs: logs.length,
    logsThisWeek: logs.filter(log => new Date(log.created_at) > subWeeks(new Date(), 1)).length,
    logsThisMonth: logs.filter(log => new Date(log.created_at) > subMonths(new Date(), 1)).length,
    lastLogDate: logs.length > 0 ? logs[0].created_at : null,
    pendingReviews: logs.filter(log => !log.reviewed_by).length,
    followUpsRequired: logs.filter(log => log.follow_up_required && !log.follow_up_date).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{child.name}</h1>
            <p className="text-gray-600">
              {child.birth_date && `${calculateAge(child.birth_date)} años`} • 
              Creado {format(new Date(child.created_at), 'dd MMM yyyy', { locale: es })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <DownloadIcon className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVerticalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <EditIcon className="h-4 w-4 mr-2" />
                Editar información
              </DropdownMenuItem>
              <DropdownMenuItem>
                <UserPlusIcon className="h-4 w-4 mr-2" />
                Gestionar usuarios
              </DropdownMenuItem>
              <DropdownMenuItem>
                <PlusIcon className="h-4 w-4 mr-2" />
                Nuevo registro
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <AlertCircleIcon className="h-4 w-4 mr-2" />
                Archivar niño
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpenIcon className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{childStats.totalLogs}</p>
                <p className="text-xs text-gray-600">Total registros</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUpIcon className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{childStats.logsThisWeek}</p>
                <p className="text-xs text-gray-600">Esta semana</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{childStats.logsThisMonth}</p>
                <p className="text-xs text-gray-600">Este mes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircleIcon className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{childStats.pendingReviews}</p>
                <p className="text-xs text-gray-600">Sin revisar</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{childStats.followUpsRequired}</p>
                <p className="text-xs text-gray-600">Seguimientos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UsersIcon className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{child.is_relation_active ? 1 : 0}</p>
                <p className="text-xs text-gray-600">Usuarios</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">General</TabsTrigger>
          <TabsTrigger value="logs">Registros</TabsTrigger>
          <TabsTrigger value="progress">Progreso</TabsTrigger>
          <TabsTrigger value="team">Equipo</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        {/* Tab: Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Child Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <GraduationCapIcon className="h-5 w-5 mr-2" />
                    Información del niño
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="text-2xl">
                        {child.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{child.name}</h2>
                      <p className="text-gray-600">{child.birth_date && `${calculateAge(child.birth_date)} años`}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Creado por:</p>
                      <p className="text-gray-600">{child.creator_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Fecha de creación:</p>
                      <p className="text-gray-600">{format(new Date(child.created_at), 'dd MMM yyyy', { locale: es })}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                {child.is_relation_active && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {child.creator_name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {child.creator_name}
                        </p>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getRelationshipColor(child.relationship_type)}`}
                        >
                          {child.relationship_type === 'parent' && 'Padre/Madre'}
                          {child.relationship_type === 'teacher' && 'Docente'}
                          {child.relationship_type === 'specialist' && 'Especialista'}
                          {child.relationship_type === 'observer' && 'Observador'}
                          {child.relationship_type === 'family' && 'Familiar'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {child.can_edit && (
                        <Badge variant="outline" className="text-xs">
                          <EditIcon className="h-3 w-3" />
                        </Badge>
                      )}
                      {child.can_export && (
                        <Badge variant="outline" className="text-xs">
                          <DownloadIcon className="h-3 w-3" />
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Logs */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Registros</CardTitle>
              <CardDescription>
                Todos los registros documentados para {child.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Filtros de registros */}
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Últimos 7 días
                    </Button>
                    <Button variant="outline" size="sm">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Último mes
                    </Button>
                    <Button variant="outline" size="sm">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Último año
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <DownloadIcon className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                    <Button variant="outline" size="sm">
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Nuevo registro
                    </Button>
                  </div>
                </div>

                {/* Lista de registros */}
                {logs.length === 0 ? (
                  <div className="flex items-center justify-center h-32">
                    <p className="text-gray-500">No hay registros aún</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {logs.map((log: LogWithDetails) => (
                      <Card key={log.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">
                                    {log.title || 'Registro sin título'}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {format(new Date(log.log_date), 'dd MMM yyyy HH:mm', { locale: es })}
                                  </p>
                                </div>
                                <Badge
                                  variant={getLogStatusVariant(log)}
                                  className="text-xs"
                                >
                                  {getLogStatusText(log)}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {log.content || 'Sin descripción'}
                              </p>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <span>
                                  <UserPlusIcon className="h-4 w-4 inline-block mr-1" />
                                  {log.logged_by_profile?.full_name || 'Usuario desconocido'}
                                </span>
                                {log.reviewer_name && (
                                  <span>
                                    <EyeIcon className="h-4 w-4 inline-block mr-1" />
                                    Revisado por {log.reviewer_name}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm">
                                <EditIcon className="h-4 w-4 mr-2" />
                                Editar
                              </Button>
                              <Button variant="outline" size="sm">
                                <AlertCircleIcon className="h-4 w-4 mr-2" />
                                Eliminar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Progress */}
        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Progreso</CardTitle>
              <CardDescription>
                Gráficos y métricas de desarrollo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gráfico de progreso general */}
                <Card>
                  <CardHeader>
                    <CardTitle>Progreso General</CardTitle>
                    <CardDescription>
                      Evolución del estado de ánimo y categorías
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProgressChart data={logs} />
                  </CardContent>
                </Card>

                {/* Tendencia del estado de ánimo */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tendencia del Estado de Ánimo</CardTitle>
                    <CardDescription>
                      Análisis temporal del bienestar emocional
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MoodTrendChart
                      data={logs.map(log => ({
                        created_at: log.log_date,
                        mood_score: log.mood_score
                      }))}
                    />
                  </CardContent>
                </Card>

                {/* Distribución por categorías */}
                <Card>
                  <CardHeader>
                    <CardTitle>Distribución por Categorías</CardTitle>
                    <CardDescription>
                      Frecuencia de registros por área
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CategoryDistribution data={logs} />
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Team */}
        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Gestión del Equipo</CardTitle>
              <CardDescription>
                Administrar usuarios y permisos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* TODO: Implementar gestión de equipo */}
              <p className="text-gray-500">Gestión de equipo próximamente...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Settings */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configuración</CardTitle>
              <CardDescription>
                Ajustes específicos para {child.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* TODO: Implementar configuración específica */}
              <p className="text-gray-500">Configuración específica próximamente...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}