// ================================================================
// src/app/dashboard/reports/page.tsx
// Página principal de reportes y análisis - CORREGIDA
// ================================================================

'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useChildren } from '@/hooks/use-children';
import { useLogs } from '@/hooks/use-logs';
import { TimePatterns, CorrelationAnalysis, AdvancedInsights } from '@/components/reports/TimePatterns';
import { ProgressChart } from '@/components/reports/ProgressChart';
import { CategoryDistribution } from '@/components/reports/CategoryDistribution';
import { MoodTrendChart } from '@/components/reports/MoodTrendChart';
import { ExportReportDialog } from '@/components/reports/ExportReportDialog';
import type { DateRange } from 'react-day-picker';
import { Download, FileText, Heart, TrendingUp, AlertTriangle, Target, Calendar, PieChart } from 'lucide-react';
import { subMonths } from 'date-fns';
import type { LogWithDetails } from '@/types';

// ================================================================
// FUNCIÓN HELPER PARA CALCULAR TENDENCIA DE MEJORA
// ================================================================
// Funciones auxiliares para calcular la tendencia de mejora
function getMoodScores(logs: LogWithDetails[]): number[] {
  return logs.filter(log => log.mood_score !== undefined).map(log => log.mood_score!);
}

function calculateAverage(scores: number[]): number {
  if (scores.length === 0) return 0;
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

function calculateImprovementTrend(logs: LogWithDetails[]) {
  if (logs.length < 2) return 0;

  // Ordenar logs por fecha
  const sortedLogs = [...logs].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  // Dividir en dos mitades
  const mid = Math.floor(sortedLogs.length / 2);
  const firstHalf = sortedLogs.slice(0, mid);
  const secondHalf = sortedLogs.slice(mid);

  // Calcular promedios usando funciones auxiliares
  const firstHalfScores = getMoodScores(firstHalf);
  const secondHalfScores = getMoodScores(secondHalf);
  
  const firstAvg = calculateAverage(firstHalfScores);
  const secondAvg = calculateAverage(secondHalfScores);
  
  return secondAvg - firstAvg;
}

export default function ReportsPage() {
  const { children, loading: childrenLoading } = useChildren();
  const { logs, loading: logsLoading } = useLogs();

  const calculateReportStats = (filteredLogs: LogWithDetails[]) => ({
    totalLogs: filteredLogs.length,
    avgMoodScore: filteredLogs.filter((log) => log.mood_score !== undefined).length > 0
      ? filteredLogs.filter((log) => log.mood_score !== undefined).reduce((sum, log) => sum + log.mood_score!, 0) / filteredLogs.filter((log) => log.mood_score !== undefined).length
      : 0,
    improvementTrend: calculateImprovementTrend(filteredLogs),
    activeCategories: new Set(filteredLogs.map((log) => log.category?.name).filter(Boolean)).size,
    followUpsRequired: filteredLogs.filter((log) => log.follow_up_required === true).length,
    activeDays: new Set(filteredLogs.map((log) => new Date(log.log_date).toDateString())).size
  });

  const [selectedChild, setSelectedChild] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 1),
    to: new Date()
  });

  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    return logs.filter((log: LogWithDetails) => {
      const dateInRange = dateRange?.from && dateRange?.to ? 
        (new Date(log.log_date) >= dateRange.from && 
        new Date(log.log_date) <= dateRange.to) 
        : true;
      const matchesChild = selectedChild === 'all' || log.child_id === selectedChild;
      const matchesCategory = selectedCategory === 'all' || log.category_id === selectedCategory;
      return dateInRange && matchesChild && matchesCategory;
    });
  }, [logs, dateRange, selectedChild, selectedCategory]);

  const reportStats = useMemo(() => {
    if (!filteredLogs) return null;
    return calculateReportStats(filteredLogs);
  }, [filteredLogs]);

  if (childrenLoading || logsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Usar reportStats en lugar de metrics
  const { totalLogs, avgMoodScore, improvementTrend, activeCategories, followUpsRequired, activeDays } = reportStats || {
    totalLogs: 0,
    avgMoodScore: 0,
    improvementTrend: 0,
    activeCategories: 0,
    followUpsRequired: 0,
    activeDays: 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes y Análisis</h1>
          <p className="mt-2 text-gray-600">
            Análisis detallado del progreso y patrones de comportamiento
          </p>
        </div>
        <Button onClick={() => setIsExportDialogOpen(true)}>
          <Download className="h-4 w-4 mr-2" />
          Exportar Reporte
        </Button>
      </div>

      {/* Export Dialog */}
      <ExportReportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        data={filteredLogs}
        metrics={{
          totalLogs,
          avgMoodScore,
          improvementTrend,
          activeCategories,
          followUpsRequired,
          activeDays
        }}
      />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Niño</label>
              <Select value={selectedChild} onValueChange={setSelectedChild}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar niño" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los niños</SelectItem>
                  {children.map(child => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <div className="space-y-1">
                <Label>Período</Label>
                <DatePickerWithRange 
                  date={dateRange}
                  setDate={setDateRange}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <div className="space-y-1">
                <Label>Categoría</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {/* Aquí irían las categorías disponibles */}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Niño</label>
              <Select value={selectedChild} onValueChange={setSelectedChild}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar niño" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los niños</SelectItem>
                  {children.map(child => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Período</label>
              <DatePickerWithRange 
                date={dateRange}
                setDate={setDateRange}
              />
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline"
                onClick={() => {
                  setSelectedChild('all');
                  setDateRange({
                    from: subMonths(new Date(), 3),
                    to: new Date()
                  });
                }}
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="Total Registros"
          value={reportStats?.totalLogs ?? 0}
          icon={FileText}
          color="blue"
          subtitle="En el período seleccionado"
        />
        
        <MetricCard
          title="Estado de Ánimo"
          value={(reportStats?.avgMoodScore ?? 0).toFixed(1)}
          suffix="/5"
          icon={Heart}
          color={(reportStats?.avgMoodScore ?? 0) >= 4 ? 'green' : (reportStats?.avgMoodScore ?? 0) >= 3 ? 'orange' : 'red'}
          subtitle="Promedio de estado de ánimo"
        />
        
        {reportStats && (
          <>
            <MetricCard
              title="Tendencia"
              value={reportStats.improvementTrend.toFixed(1)}
              icon={reportStats.improvementTrend > 0 ? TrendingUp : reportStats.improvementTrend < 0 ? AlertTriangle : Target}
              color={reportStats.improvementTrend > 0 ? 'green' : reportStats.improvementTrend < 0 ? 'red' : 'gray'}
              subtitle={reportStats.improvementTrend > 0 ? 'Mejorando' : reportStats.improvementTrend < 0 ? 'Empeorando' : 'Estable'}
            />
            
            <MetricCard
              title="Categorías Activas"
              value={reportStats.activeCategories}
              icon={PieChart}
              color="purple"
              subtitle="Número de categorías usadas"
            />
            
            <MetricCard
              title="Seguimiento Requerido"
              value={reportStats.followUpsRequired}
              icon={AlertTriangle}
              color="orange"
              subtitle="Casos que requieren seguimiento"
            />
          </>
        )}
        
        <MetricCard
          title="Días Activos"
          value={reportStats?.activeDays ?? 0}
          icon={Calendar}
          color="blue"
          subtitle="Días con registros"
        />
      </div>

      {/* Tabs de análisis */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
          <TabsTrigger value="patterns">Patrones</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Tab: Resumen */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Progreso General</CardTitle>
                <CardDescription>
                  Evolución del estado de ánimo en el tiempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProgressChart data={filteredLogs} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución por Categorías</CardTitle>
                <CardDescription>
                  Frecuencia de registros por área
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CategoryDistribution data={filteredLogs} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Tendencias */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tendencias del Estado de Ánimo</CardTitle>
              <CardDescription>
                Análisis temporal del bienestar emocional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryDistribution
                data={filteredLogs.map(log => ({ category_name: log.category?.name, ...log }))}
              />
              <MoodTrendChart
                data={filteredLogs.map(log => ({
                  ...log,
                  created_at: log.log_date
                }))}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Patrones */}
        <TabsContent value="patterns" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Patrones Temporales</CardTitle>
                <CardDescription>
                  Identificación de comportamientos recurrentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TimePatterns logs={filteredLogs} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Correlaciones</CardTitle>
                <CardDescription>
                  Relaciones entre diferentes variables
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CorrelationAnalysis 
                  logs={filteredLogs.map(log => ({
                    created_at: log.created_at,
                    mood_score: log.mood_score ?? undefined,
                    intensity_level: log.intensity_level,
                    category_name: log.category?.name
                  }))}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Insights */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análisis Avanzado</CardTitle>
              <CardDescription>
                Insights generados por inteligencia artificial
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdvancedInsights 
                logs={filteredLogs.map(log => ({
                  created_at: log.created_at,
                  mood_score: log.mood_score ?? undefined,
                  intensity_level: log.intensity_level,
                  category_name: log.category?.name
                }))}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export Dialog */}
      <ExportReportDialog 
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        data={filteredLogs}
        metrics={reportStats}
      />
    </div>
  );
}

// ================================================================
// COMPONENTES AUXILIARES
// ================================================================

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'red' | 'purple' | 'green' | 'orange' | 'gray';
  subtitle: string;
  suffix?: string;
}

function MetricCard({ title, value, icon: Icon, color, subtitle, suffix }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    gray: 'bg-gray-100 text-gray-600'
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="flex items-center space-x-1">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {suffix && <span className="text-lg text-gray-500">{suffix}</span>}
            </div>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}