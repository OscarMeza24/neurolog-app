'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/components/providers/AuthProvider';
import { useChildren } from '@/hooks/use-children';
import type { ChildWithRelation, ChildFilters, RelationshipType } from '@/types';
import { PlusIcon, 
  EditIcon,
  EyeIcon,
  UserPlusIcon,
  RefreshCwIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ViewModeToggle } from '@/components/dashboard/ViewModeToggle';
import { ChildrenStats } from '@/components/dashboard/ChildrenStats';
import { useChildHandlers } from '@/hooks/use-child-handlers';

// ================================================================
// INTERFACES
// ================================================================

interface ChildCardProps {
  child: ChildWithRelation;
  onEdit: (child: ChildWithRelation) => void;
  onViewDetails: (child: ChildWithRelation) => void;
  onManageUsers: (child: ChildWithRelation) => void;
}

interface FiltersCardProps {
  filters: ChildFilters;
  onFiltersChange: (filters: ChildFilters) => void;
}

interface ChildrenListProps {
  loading: boolean;
  error: string | null;
  filteredChildren: ChildWithRelation[];
  handleEdit: (child: ChildWithRelation) => void;
  handleViewDetails: (child: ChildWithRelation) => void;
  handleManageUsers: (child: ChildWithRelation) => void;
  onFiltersChange: (filters: ChildFilters) => void;
}

// ================================================================
// COMPONENTES AUXILIARES
// ================================================================

function ChildCard({ child, onEdit, onViewDetails, onManageUsers }: ChildCardProps) {
  const calculateAge = (birthDate?: string | null) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  const getRelationshipColor = (type: RelationshipType) => {
    switch (type) {
      case 'parent': return 'bg-blue-100 text-blue-800';
      case 'teacher': return 'bg-green-100 text-green-800';
      case 'specialist': return 'bg-purple-100 text-purple-800';
      case 'observer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRelationshipLabel = (type: RelationshipType) => {
    switch (type) {
      case 'parent': return 'Padre/Madre';
      case 'teacher': return 'Docente';
      case 'specialist': return 'Especialista';
      case 'observer': return 'Observador';
      case 'family': return 'Familia';
      default: return type;
    }
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback>{child.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold">
                {child.name}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="px-2 py-1">
                  {child.is_active ? 'Activo' : 'Inactivo'}
                </Badge>
                {child.birth_date && calculateAge(child.birth_date) !== null && (
                  <Badge variant="outline" className="px-2 py-1">
                    {calculateAge(child.birth_date)} años
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(child)}
              className="hover:bg-blue-50"
            >
              <EditIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onViewDetails(child)}
              className="hover:bg-blue-50"
            >
              <EyeIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onManageUsers(child)}
              className="hover:bg-blue-50"
            >
              <UserPlusIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Diagnóstico</h3>
            <p className="text-gray-600">{child.diagnosis || 'Sin diagnóstico'}</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Relación</h3>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className={`${getRelationshipColor(child.relationship_type)} px-2 py-1`}
              >
                {getRelationshipLabel(child.relationship_type)}
              </Badge>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900">Última actividad</p>
            <p className="text-xs text-gray-500">
              {child.updated_at ? format(new Date(child.updated_at), 'dd MMM', { locale: es }) : 'N/A'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FiltersCard({ filters, onFiltersChange }: FiltersCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Filtros</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onFiltersChange({})}
          >
            <RefreshCwIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Búsqueda */}
          <div className="space-y-2">
            <label htmlFor="search" className="text-sm font-medium">Buscar</label>
            <Input
              id="search"
              placeholder="Nombre o diagnóstico"
              value={filters.search || ''}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            />
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <label htmlFor="is_active" className="text-sm font-medium">Estado</label>
            <Select
              value={filters.is_active?.toString() || ''}
              onValueChange={(value) => 
                onFiltersChange({ ...filters, is_active: value === 'true' ? true : false })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Activos</SelectItem>
                <SelectItem value="false">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de relación */}
          <div className="space-y-2">
            <label htmlFor="relationship_type" className="text-sm font-medium">Tipo de relación</label>
            <Select
              value={filters.relationship_type || ''}
              onValueChange={(value) => onFiltersChange({ ...filters, relationship_type: value as RelationshipType })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="parent">Padre/Madre</SelectItem>
                <SelectItem value="teacher">Docente</SelectItem>
                <SelectItem value="specialist">Especialista</SelectItem>
                <SelectItem value="observer">Observador</SelectItem>
                <SelectItem value="family">Familia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rango de edad */}
          <div className="space-y-2">
            <label htmlFor="max_age" className="text-sm font-medium">Edad máxima</label>
            <Input
              id="max_age"
              type="number"
              placeholder="Años"
              min="0"
              max="25"
              value={filters.max_age || ''}
              onChange={(e) => onFiltersChange({ 
                ...filters, 
                max_age: e.target.value ? parseInt(e.target.value) : undefined 
              })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ChildrenList({
  loading, 
  error, 
  filteredChildren, 
  handleEdit, 
  handleViewDetails, 
  handleManageUsers,
  onFiltersChange
}: ChildrenListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={`skeleton-child-${Date.now()}-${i}`} className="animate-pulse">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="text-center py-12">
          <p className="text-red-600 mb-4">Error al cargar los niños: {error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (filteredChildren.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <UserPlusIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron niños
          </h3>
          <p className="text-gray-600 mb-6">
            No hay niños que coincidan con los filtros seleccionados
          </p>
          <Button 
            variant="outline"
            onClick={() => onFiltersChange({})}
          >
            Limpiar Filtros
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <ViewModeToggle initialMode="grid" onModeChange={() => {}} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChildren.map((child) => (
          <ChildCard
            key={child.id}
            child={child}
            onEdit={handleEdit}
            onViewDetails={handleViewDetails}
            onManageUsers={handleManageUsers}
          />
        ))}
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis Niños</h1>
        <p className="text-gray-600">
          Gestiona y visualiza el progreso de los niños bajo tu cuidado
        </p>
      </div>
      
      <div className="flex space-x-3">
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          <RefreshCwIcon className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
        
        <Button asChild>
          <Link href="/dashboard/children/new">
            <PlusIcon className="h-4 w-4 mr-2" />
            Crear Niño
          </Link>
        </Button>
      </div>
    </div>
  );
}

function ChildrenPage() {
  const { user } = useAuth();
  const { children, loading, error, filterChildren } = useChildren({ 
    includeInactive: false,
    realtime: true 
  });
  
  const [filters, setFilters] = useState<ChildFilters>({});
  const { handleEdit, handleViewDetails, handleManageUsers } = useChildHandlers();

  const filteredChildren = useMemo(() => {
    return filterChildren(filters);
  }, [children, filters, filterChildren]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <UserPlusIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header />
      <ChildrenStats children={children} />
      <FiltersCard filters={filters} onFiltersChange={setFilters} />
      <ChildrenList 
        loading={loading} 
        error={error} 
        filteredChildren={filteredChildren} 
        handleEdit={handleEdit} 
        handleViewDetails={handleViewDetails} 
        handleManageUsers={handleManageUsers} 
        onFiltersChange={setFilters}
      />
    </div>
  );
}

export default ChildrenPage;