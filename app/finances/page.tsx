'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package,
  Eye,
  Download,
  Calculator,
  PieChart,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Crown,
  Star,
  Award,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EnhancedSalesForm } from '@/components/finances/enhanced-sales-form';

interface SaleRecord {
  id: string;
  date: string;
  client: string;
  product: string;
  salePrice: number;
  cost: number;
  paymentCommission: number;
  employeePayment: number;
  channel: string;
  netProfit: number;
  status: 'pendiente' | 'entregado';
}

interface EmployeeCost {
  employeeId: string;
  name: string;
  role: string;
  cost: number;
  salesGenerated: number;
}

interface ProductSale {
  product: string;
  sales: number;
  revenue: number;
  profit: number;
}

interface MarketingCampaign {
  id: string;
  date: string;
  platform: string;
  campaign: string;
  spent: number;
  leads: number;
  conversions: number;
  revenue: number;
}

export default function FinancesPage() {
  const [salesData, setSalesData] = useState<SaleRecord[]>([]);
  const [employeesData, setEmployeesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [employeeCosts, setEmployeeCosts] = useState<EmployeeCost[]>([]);

  const [productSales] = useState<ProductSale[]>([]);

  // Estado para modal de nueva venta
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);

  // Función para cargar ventas desde la API
  const loadSales = async () => {
    try {
      const salesResponse = await fetch('/api/sales');
      if (salesResponse.ok) {
        const salesData = await salesResponse.json();
        // Transformar los datos de la API al formato esperado
        const transformedSales = salesData.map((sale: any) => ({
          id: sale.id,
          date: new Date(sale.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
          client: sale.cliente,
          product: sale.producto,
          salePrice: sale.precioVenta,
          cost: sale.costoCheto,
          paymentCommission: sale.comisionPago,
          employeePayment: sale.pagoEmpleado,
          channel: sale.canalVenta || 'No especificado',
          netProfit: sale.ganunciaNeta,
          status: sale.status === 'DELIVERED' ? 'entregado' : 'pendiente'
        }));
        setSalesData(transformedSales);
        console.log('Ventas cargadas:', transformedSales.length);
      } else {
        console.error('Error al cargar ventas');
      }
    } catch (error) {
      console.error('Error al cargar ventas:', error);
    }
  };

  // Cargar datos de la base de datos
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Cargar empleados
        const employeesResponse = await fetch('/api/employees');
        if (employeesResponse.ok) {
          const employees = await employeesResponse.json();
          setEmployeesData(employees);
          console.log('Empleados cargados:', employees.length);
        }

        // Cargar ventas
        await loadSales();
        
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Datos de Marketing/Publicidad
  const [marketingData, setMarketingData] = useState<MarketingCampaign[]>([]);

  // Cálculos financieros
  const totalRevenue = salesData.reduce((sum, sale) => sum + sale.salePrice, 0);
  const totalCosts = salesData.reduce((sum, sale) => sum + sale.cost, 0);
  const totalCommissions = salesData.reduce((sum, sale) => sum + sale.paymentCommission, 0);
  const totalEmployeePayments = salesData.reduce((sum, sale) => sum + sale.employeePayment, 0);
  const totalNetProfit = salesData.reduce((sum, sale) => sum + sale.netProfit, 0);
  const totalMarketingSpent = marketingData.reduce((sum, ad) => sum + ad.spent, 0);
  const totalMarketingRevenue = marketingData.reduce((sum, ad) => sum + ad.revenue, 0);
  const marketingROI = totalMarketingSpent > 0 ? ((totalMarketingRevenue - totalMarketingSpent) / totalMarketingSpent) * 100 : 0;
  const profitMargin = totalRevenue > 0 ? (totalNetProfit / totalRevenue) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Callback para cuando se crea una nueva venta
  const handleSaleCreated = () => {
    loadSales(); // Recargar las ventas desde la API
    setShowNewSaleModal(false); // Cerrar el modal
  };

  const getROI = (employee: EmployeeCost) => {
    return employee.cost > 0 ? ((employee.salesGenerated - employee.cost) / employee.cost) * 100 : 0;
  };

  const getChannelBadgeStyle = (channel: string) => {
    switch (channel.toLowerCase()) {
      case 'instagram':
        return 'bg-pink-500/20 text-pink-300 border-pink-500/30';
      case 'discord':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'web':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header con gradiente mejorado */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur border border-purple-500/30 rounded-2xl px-8 py-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                Panel Financiero
              </h1>
              <p className="text-purple-200/80 font-medium">Dashboard de control financiero avanzado</p>
            </div>
          </div>
        </div>

        {/* Métricas principales con gradientes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Ingresos Totales */}
          <Card className="bg-gradient-to-br from-emerald-900/30 to-green-900/30 border border-emerald-500/30 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-emerald-200/80 text-sm font-medium">Ingresos Totales</p>
                  <p className="text-3xl font-bold text-white">{formatCurrency(totalRevenue)}</p>
                  <div className="flex items-center gap-1 text-sm">
                    <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">+12.5%</span>
                    <span className="text-emerald-200/60">vs mes anterior</span>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gastos Totales */}
          <Card className="bg-gradient-to-br from-red-900/30 to-rose-900/30 border border-red-500/30 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-red-200/80 text-sm font-medium">Gastos Totales</p>
                  <p className="text-3xl font-bold text-white">{formatCurrency(totalCosts + totalCommissions + totalEmployeePayments)}</p>
                  <div className="flex items-center gap-1 text-sm">
                    <ArrowDownRight className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 font-medium">-5.2%</span>
                    <span className="text-red-200/60">vs mes anterior</span>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-r from-red-500 to-rose-500 rounded-xl">
                  <TrendingDown className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ganancia Neta */}
          <Card className="bg-gradient-to-br from-purple-900/30 to-violet-900/30 border border-purple-500/30 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-purple-200/80 text-sm font-medium">Ganancia Neta</p>
                  <p className="text-3xl font-bold text-white">{formatCurrency(totalNetProfit)}</p>
                  <div className="flex items-center gap-1 text-sm">
                    <Zap className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-400 font-medium">Excelente</span>
                    <span className="text-purple-200/60">rendimiento</span>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Margen de Ganancia */}
          <Card className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-cyan-200/80 text-sm font-medium">Margen de Ganancia</p>
                  <p className="text-3xl font-bold text-white">{formatPercentage(profitMargin)}</p>
                  <div className="flex items-center gap-1 text-sm">
                    <Target className="w-4 h-4 text-cyan-400" />
                    <span className="text-cyan-400 font-medium">Meta alcanzada</span>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs con navegación moderna */}
        <Tabs defaultValue="resumen" className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="bg-gradient-to-r from-slate-800/50 to-purple-800/50 backdrop-blur border border-purple-500/30 p-2 rounded-2xl">
              <TabsTrigger 
                value="resumen" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-xl px-6 py-3 text-purple-200 hover:text-white"
              >
                <Crown className="w-4 h-4 mr-2" />
                Resumen
              </TabsTrigger>
              <TabsTrigger 
                value="ventas" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-xl px-6 py-3 text-purple-200 hover:text-white"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Ventas
              </TabsTrigger>
              <TabsTrigger 
                value="empleados" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-xl px-6 py-3 text-purple-200 hover:text-white"
              >
                <Users className="w-4 h-4 mr-2" />
                Empleados
              </TabsTrigger>
              <TabsTrigger 
                value="productos" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-xl px-6 py-3 text-purple-200 hover:text-white"
              >
                <Package className="w-4 h-4 mr-2" />
                Productos
              </TabsTrigger>
              <TabsTrigger 
                value="marketing" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-rose-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-xl px-6 py-3 text-purple-200 hover:text-white"
              >
                <Target className="w-4 h-4 mr-2" />
                Marketing
              </TabsTrigger>
              <TabsTrigger 
                value="reportes" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-xl px-6 py-3 text-purple-200 hover:text-white"
              >
                <Award className="w-4 h-4 mr-2" />
                Reportes
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Resumen - Dashboard Ejecutivo */}
          <TabsContent value="resumen" className="space-y-8">
            {/* Header del Resumen */}
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                Dashboard Ejecutivo
              </h2>
              <p className="text-purple-200">Resumen completo de rendimiento del negocio</p>
            </div>

            {/* Métricas Globales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-emerald-900/40 to-green-900/40 border border-emerald-500/40 backdrop-blur">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-emerald-400 mb-2">{formatCurrency(totalRevenue)}</div>
                  <p className="text-emerald-200 text-sm">Ingresos Totales</p>
                  <div className="text-xs text-emerald-300 mt-1">+15% vs mes anterior</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-900/40 to-violet-900/40 border border-purple-500/40 backdrop-blur">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">{formatCurrency(totalNetProfit)}</div>
                  <p className="text-purple-200 text-sm">Ganancia Neta</p>
                  <div className="text-xs text-purple-300 mt-1">{formatPercentage(profitMargin)} margen</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-pink-900/40 to-rose-900/40 border border-pink-500/40 backdrop-blur">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-pink-400 mb-2">{formatCurrency(totalMarketingSpent)}</div>
                  <p className="text-pink-200 text-sm">Inversión Marketing</p>
                  <div className="text-xs text-pink-300 mt-1">{formatPercentage(marketingROI)} ROI</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border border-cyan-500/40 backdrop-blur">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-2">{employeeCosts.length}</div>
                  <p className="text-cyan-200 text-sm">Empleados Activos</p>
                  <div className="text-xs text-cyan-300 mt-1">{formatCurrency(employeeCosts.reduce((sum, emp) => sum + emp.cost, 0))} costos</div>
                </CardContent>
              </Card>
            </div>

            {/* Sección Ventas */}
            <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/20 border border-emerald-500/30 backdrop-blur">
              <CardHeader className="border-b border-emerald-500/20">
                <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  Resumen de Ventas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                    <h4 className="text-emerald-300 font-semibold mb-2">Últimas Ventas</h4>
                    {salesData.slice(0, 3).map((sale) => (
                      <div key={sale.id} className="flex justify-between text-sm mb-2">
                        <span className="text-gray-300">{sale.client}</span>
                        <span className="text-emerald-400 font-medium">{formatCurrency(sale.salePrice)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <h4 className="text-green-300 font-semibold mb-2">Por Canal</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Instagram</span>
                        <span className="text-green-400">45%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Discord</span>
                        <span className="text-green-400">35%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Web</span>
                        <span className="text-green-400">20%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-teal-500/10 border border-teal-500/20 rounded-lg p-4">
                    <h4 className="text-teal-300 font-semibold mb-2">Productos Top</h4>
                    {productSales.slice(0, 3).map((product, index) => (
                      <div key={index} className="flex justify-between text-sm mb-2">
                        <span className="text-gray-300 truncate">{product.product.slice(0, 15)}...</span>
                        <span className="text-teal-400 font-medium">{product.sales}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sección Empleados */}
            <Card className="bg-gradient-to-br from-slate-900/90 to-blue-900/20 border border-blue-500/30 backdrop-blur">
              <CardHeader className="border-b border-blue-500/20">
                <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  Resumen de Empleados
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {employeeCosts.map((employee) => (
                    <div key={employee.employeeId} className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-bold">{employee.name}</h4>
                          <p className="text-blue-300 text-sm">{employee.role}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">ROI:</span>
                          <span className={`font-bold ${getROI(employee) > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {formatPercentage(getROI(employee))}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Ventas:</span>
                          <span className="text-green-400 font-medium">{formatCurrency(employee.salesGenerated)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sección Marketing */}
            <Card className="bg-gradient-to-br from-slate-900/90 to-pink-900/20 border border-pink-500/30 backdrop-blur">
              <CardHeader className="border-b border-pink-500/20">
                <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  Resumen de Marketing
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-pink-300 font-semibold">Campañas Activas</h4>
                    {marketingData.map((campaign) => (
                      <div key={campaign.id} className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-4">
                        <div className="flex justify-between mb-2">
                          <h5 className="text-white font-medium text-sm">{campaign.campaign}</h5>
                          <span className="text-pink-400 text-sm">{campaign.date}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Inversión:</span>
                          <span className="text-red-400">{formatCurrency(campaign.spent)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Retorno:</span>
                          <span className="text-green-400">{formatCurrency(campaign.revenue)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Conversiones:</span>
                          <span className="text-pink-400">{campaign.conversions}/{campaign.leads}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-6">
                    <h4 className="text-rose-300 font-semibold mb-4">Rendimiento Global</h4>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-pink-400 mb-1">{formatCurrency(totalMarketingSpent)}</div>
                        <p className="text-gray-300 text-sm">Total Invertido</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-emerald-400 mb-1">{formatCurrency(totalMarketingRevenue)}</div>
                        <p className="text-gray-300 text-sm">Ingresos Generados</p>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold mb-1 ${marketingROI > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatPercentage(marketingROI)}
                        </div>
                        <p className="text-gray-300 text-sm">ROI Marketing</p>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-cyan-400 mb-1">
                          {marketingData.reduce((sum, ad) => sum + ad.conversions, 0)}
                        </div>
                        <p className="text-gray-300 text-sm">Total Conversiones</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Empleados */}
          <TabsContent value="empleados">
            <Card className="bg-gradient-to-br from-slate-900/90 to-purple-900/20 border border-purple-500/30 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  Gestión de Empleados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {employeeCosts.map((employee) => (
                    <Card key={employee.employeeId} className="bg-gradient-to-br from-slate-800/50 to-blue-800/20 border border-blue-500/30">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="text-white font-bold text-lg">{employee.name}</h4>
                            <p className="text-blue-300 text-sm">{employee.role}</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-300">Costo:</span>
                            <span className="text-red-400 font-bold">{formatCurrency(employee.cost)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Ventas generadas:</span>
                            <span className="text-green-400 font-bold">{formatCurrency(employee.salesGenerated)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">ROI:</span>
                            <span className={`font-bold ${getROI(employee) > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {formatPercentage(getROI(employee))}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Productos */}
          <TabsContent value="productos">
            <Card className="bg-gradient-to-br from-slate-900/90 to-purple-900/20 border border-purple-500/30 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  Análisis de Productos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {productSales.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-6 bg-gradient-to-r from-slate-800/50 to-green-800/20 rounded-lg border border-green-500/30">
                      <div className="flex items-center gap-4">
                        <div className={`w-4 h-4 rounded-full ${
                          index === 0 ? 'bg-green-500' :
                          index === 1 ? 'bg-blue-500' :
                          index === 2 ? 'bg-purple-500' :
                          index === 3 ? 'bg-orange-500' : 'bg-gray-500'
                        }`} />
                        <div>
                          <h4 className="text-white font-bold text-lg">{product.product}</h4>
                          <p className="text-green-300">{product.sales} ventas realizadas</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-bold text-lg">{formatCurrency(product.revenue)}</p>
                        <p className="text-emerald-300">Ganancia: {formatCurrency(product.profit)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Ventas */}
          <TabsContent value="ventas">
            <Card className="bg-gradient-to-br from-slate-900/90 to-orange-900/20 border border-orange-500/30 backdrop-blur">
              <CardHeader className="border-b border-orange-500/20">
                <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  Gestión de Ventas
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                    Control de entregas
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {/* Métricas de Ventas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <Card className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border border-green-500/40 backdrop-blur">
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-green-400 mb-2">{salesData.length}</div>
                      <p className="text-green-200 text-sm">Total Ventas</p>
                      <div className="text-xs text-green-300 mt-1">Este período</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border border-blue-500/40 backdrop-blur">
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-blue-400 mb-2">{salesData.filter(sale => sale.status === 'entregado').length}</div>
                      <p className="text-blue-200 text-sm">Entregadas</p>
                      <div className="text-xs text-blue-300 mt-1">Completadas</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border border-yellow-500/40 backdrop-blur">
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-yellow-400 mb-2">{salesData.filter(sale => sale.status === 'pendiente').length}</div>
                      <p className="text-yellow-200 text-sm">Pendientes</p>
                      <div className="text-xs text-yellow-300 mt-1">Por entregar</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-purple-900/40 to-violet-900/40 border border-purple-500/40 backdrop-blur">
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-purple-400 mb-2">{formatCurrency(totalRevenue)}</div>
                      <p className="text-purple-200 text-sm">Ingresos Totales</p>
                      <div className="text-xs text-purple-300 mt-1">Este período</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tabla de Ventas Estilo Excel */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-orange-600/20 to-red-600/20 border-b border-orange-500/30">
                        <th className="text-left p-4 text-orange-200 font-semibold border-r border-orange-500/20">PRODUCTO/SERVICIO</th>
                        <th className="text-left p-4 text-orange-200 font-semibold border-r border-orange-500/20">NOMBRE DEL CLIENTE</th>
                        <th className="text-left p-4 text-orange-200 font-semibold border-r border-orange-500/20">ORIGEN DE VENTA</th>
                        <th className="text-left p-4 text-orange-200 font-semibold border-r border-orange-500/20">NÚMERO DE WHATSAPP</th>
                        <th className="text-left p-4 text-orange-200 font-semibold border-r border-orange-500/20">FECHA DE VENTA</th>
                        <th className="text-left p-4 text-orange-200 font-semibold border-r border-orange-500/20">MÉTODO DE PAGO</th>
                        <th className="text-right p-4 text-orange-200 font-semibold border-r border-orange-500/20">CLIENTE PAGÓ (USD)</th>
                        <th className="text-right p-4 text-orange-200 font-semibold border-r border-orange-500/20">GASTO ASOCIADO (USD)</th>
                        <th className="text-right p-4 text-orange-200 font-semibold border-r border-orange-500/20">GANANCIA NETA (USD)</th>
                        <th className="text-center p-4 text-orange-200 font-semibold">ESTADO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesData.map((sale) => (
                        <tr key={sale.id} className="border-b border-slate-700/50 hover:bg-orange-500/5 transition-colors">
                          <td className="p-4 text-blue-400 border-r border-slate-700/50 font-medium">{sale.product}</td>
                          <td className="p-4 text-gray-300 border-r border-slate-700/50">{sale.client}</td>
                          <td className="p-4 text-gray-300 border-r border-slate-700/50">
                            <Badge className={getChannelBadgeStyle(sale.channel)}>{sale.channel}</Badge>
                          </td>
                          <td className="p-4 text-cyan-400 border-r border-slate-700/50">+54 266 402-9242</td>
                          <td className="p-4 text-gray-300 border-r border-slate-700/50">{sale.date}</td>
                          <td className="p-4 text-purple-400 border-r border-slate-700/50">Mercado Pago</td>
                          <td className="p-4 text-green-400 text-right border-r border-slate-700/50 font-bold">{formatCurrency(sale.salePrice)}</td>
                          <td className="p-4 text-red-400 text-right border-r border-slate-700/50">{formatCurrency(sale.cost + sale.paymentCommission + sale.employeePayment)}</td>
                          <td className="p-4 text-emerald-400 text-right border-r border-slate-700/50 font-bold">{formatCurrency(sale.netProfit)}</td>
                          <td className="p-4 text-center">
                            {sale.status === 'entregado' ? (
                              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                                ✓ Entregado
                              </Badge>
                            ) : (
                              <Button 
                                size="sm"
                                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white text-xs px-4 py-2"
                                onClick={() => {
                                  // Aquí iría la lógica para marcar como entregado
                                  const updatedSales = salesData.map(s => 
                                    s.id === sale.id ? { ...s, status: 'entregado' as const } : s
                                  );
                                  setSalesData(updatedSales);
                                }}
                              >
                                Entregado
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gradient-to-r from-emerald-900/20 to-green-900/20 border-t-2 border-emerald-500/50">
                        <td className="p-4 text-emerald-300 font-bold border-r border-slate-700/50">TOTALES</td>
                        <td className="p-4 border-r border-slate-700/50">-</td>
                        <td className="p-4 border-r border-slate-700/50">-</td>
                        <td className="p-4 border-r border-slate-700/50">-</td>
                        <td className="p-4 border-r border-slate-700/50">-</td>
                        <td className="p-4 border-r border-slate-700/50">-</td>
                        <td className="p-4 text-green-400 text-right font-bold border-r border-slate-700/50">{formatCurrency(totalRevenue)}</td>
                        <td className="p-4 text-red-400 text-right font-bold border-r border-slate-700/50">{formatCurrency(totalCosts + totalCommissions + totalEmployeePayments)}</td>
                        <td className="p-4 text-emerald-400 text-right font-bold text-xl border-r border-slate-700/50">{formatCurrency(totalNetProfit)}</td>
                        <td className="p-4 text-center">
                          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                            {salesData.filter(sale => sale.status === 'entregado').length}/{salesData.length}
                          </Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Acciones Rápidas */}
                <div className="flex justify-between items-center mt-8">
                  <div className="flex gap-4">
                    <Button className="bg-slate-700 hover:bg-slate-600 text-white border border-slate-600">
                      <Eye className="w-4 h-4 mr-2" />
                      Filtrar Ventas
                    </Button>
                    <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Actualizar Estado
                    </Button>
                  </div>
                  
                  <div className="flex gap-4">
                    <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0">
                      <Download className="w-4 h-4 mr-2" />
                      Exportar Excel
                    </Button>
                    <Dialog open={showNewSaleModal} onOpenChange={setShowNewSaleModal}>
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-0">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Nueva Venta
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-4xl">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-bold text-white">Registrar Nueva Venta</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                          <EnhancedSalesForm onSaleCreated={handleSaleCreated} />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Marketing */}
          <TabsContent value="marketing">
            <Card className="bg-gradient-to-br from-slate-900/90 to-pink-900/20 border border-pink-500/30 backdrop-blur">
              <CardHeader className="border-b border-pink-500/20">
                <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  Panel de Marketing - Meta Ads
                  <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0">
                    Gestión publicitaria
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {/* Métricas de Marketing */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <Card className="bg-gradient-to-br from-pink-900/40 to-rose-900/40 border border-pink-500/40 backdrop-blur">
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-pink-400 mb-2">{formatCurrency(totalMarketingSpent)}</div>
                      <p className="text-pink-200 text-sm">Total Invertido</p>
                      <div className="text-xs text-pink-300 mt-1">Meta Ads</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-emerald-900/40 to-green-900/40 border border-emerald-500/40 backdrop-blur">
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-emerald-400 mb-2">{formatCurrency(totalMarketingRevenue)}</div>
                      <p className="text-emerald-200 text-sm">Ingresos Generados</p>
                      <div className="text-xs text-emerald-300 mt-1">Por campañas</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-purple-900/40 to-violet-900/40 border border-purple-500/40 backdrop-blur">
                    <CardContent className="p-6 text-center">
                      <div className={`text-2xl font-bold mb-2 ${marketingROI > 0 ? 'text-purple-400' : 'text-red-400'}`}>
                        {formatPercentage(marketingROI)}
                      </div>
                      <p className="text-purple-200 text-sm">ROI Marketing</p>
                      <div className="text-xs text-purple-300 mt-1">Retorno inversión</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border border-cyan-500/40 backdrop-blur">
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-cyan-400 mb-2">
                        {marketingData.reduce((sum, ad) => sum + ad.conversions, 0)}
                      </div>
                      <p className="text-cyan-200 text-sm">Total Conversiones</p>
                      <div className="text-xs text-cyan-300 mt-1">
                        {marketingData.reduce((sum, ad) => sum + ad.leads, 0)} leads
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tabla de Campañas */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-pink-600/20 to-rose-600/20 border-b border-pink-500/30">
                        <th className="text-left p-4 text-pink-200 font-semibold border-r border-pink-500/20">FECHA</th>
                        <th className="text-left p-4 text-pink-200 font-semibold border-r border-pink-500/20">PLATAFORMA</th>
                        <th className="text-left p-4 text-pink-200 font-semibold border-r border-pink-500/20">CAMPAÑA</th>
                        <th className="text-right p-4 text-pink-200 font-semibold border-r border-pink-500/20">INVERTIDO</th>
                        <th className="text-right p-4 text-pink-200 font-semibold border-r border-pink-500/20">LEADS</th>
                        <th className="text-right p-4 text-pink-200 font-semibold border-r border-pink-500/20">CONVERSIONES</th>
                        <th className="text-right p-4 text-pink-200 font-semibold border-r border-pink-500/20">INGRESOS</th>
                        <th className="text-right p-4 text-pink-200 font-semibold">ROI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marketingData.map((campaign) => {
                        const campaignROI = campaign.spent > 0 ? ((campaign.revenue - campaign.spent) / campaign.spent) * 100 : 0;
                        return (
                          <tr key={campaign.id} className="border-b border-slate-700/50 hover:bg-pink-500/5 transition-colors">
                            <td className="p-4 text-gray-300 border-r border-slate-700/50">{campaign.date}</td>
                            <td className="p-4 text-gray-300 border-r border-slate-700/50">{campaign.platform}</td>
                            <td className="p-4 text-blue-400 border-r border-slate-700/50">{campaign.campaign}</td>
                            <td className="p-4 text-red-400 text-right border-r border-slate-700/50">{formatCurrency(campaign.spent)}</td>
                            <td className="p-4 text-cyan-400 text-right border-r border-slate-700/50">{campaign.leads}</td>
                            <td className="p-4 text-purple-400 text-right border-r border-slate-700/50">{campaign.conversions}</td>
                            <td className="p-4 text-green-400 text-right border-r border-slate-700/50">{formatCurrency(campaign.revenue)}</td>
                            <td className={`p-4 text-right font-bold ${campaignROI > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {formatPercentage(campaignROI)}
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-gradient-to-r from-pink-900/20 to-rose-900/20 border-t-2 border-pink-500/50">
                        <td className="p-4 text-pink-300 font-bold border-r border-slate-700/50">TOTALES</td>
                        <td className="p-4 border-r border-slate-700/50">-</td>
                        <td className="p-4 border-r border-slate-700/50">-</td>
                        <td className="p-4 text-red-400 text-right font-bold border-r border-slate-700/50">{formatCurrency(totalMarketingSpent)}</td>
                        <td className="p-4 text-cyan-400 text-right font-bold border-r border-slate-700/50">
                          {marketingData.reduce((sum, ad) => sum + ad.leads, 0)}
                        </td>
                        <td className="p-4 text-purple-400 text-right font-bold border-r border-slate-700/50">
                          {marketingData.reduce((sum, ad) => sum + ad.conversions, 0)}
                        </td>
                        <td className="p-4 text-green-400 text-right font-bold border-r border-slate-700/50">{formatCurrency(totalMarketingRevenue)}</td>
                        <td className={`p-4 text-right font-bold text-xl ${marketingROI > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {formatPercentage(marketingROI)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Análisis de Rendimiento */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <Card className="bg-gradient-to-br from-pink-800/20 to-rose-800/20 border border-pink-500/30">
                    <CardContent className="p-6">
                      <h4 className="text-pink-300 font-bold text-lg mb-4">Mejor Campaña</h4>
                      {(() => {
                        const bestCampaign = marketingData.length > 0 ? marketingData.reduce((best, current) => {
                          const currentROI = current.spent > 0 ? ((current.revenue - current.spent) / current.spent) * 100 : 0;
                          const bestROI = best.spent > 0 ? ((best.revenue - best.spent) / best.spent) * 100 : 0;
                          return currentROI > bestROI ? current : best;
                        }) : { campaign: 'Sin campañas', spent: 0, revenue: 0, conversions: 0, leads: 0 };
                        const bestROI = bestCampaign.spent > 0 ? ((bestCampaign.revenue - bestCampaign.spent) / bestCampaign.spent) * 100 : 0;
                        return (
                          <div>
                            <p className="text-white font-medium mb-2">{bestCampaign.campaign}</p>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-300">ROI:</span>
                                <span className="text-emerald-400 font-bold">{formatPercentage(bestROI)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-300">Conversiones:</span>
                                <span className="text-purple-400">{bestCampaign.conversions}/{bestCampaign.leads}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-300">Retorno:</span>
                                <span className="text-green-400">{formatCurrency(bestCampaign.revenue)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-800/20 to-violet-800/20 border border-purple-500/30">
                    <CardContent className="p-6">
                      <h4 className="text-purple-300 font-bold text-lg mb-4">Promedio por Lead</h4>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-400 mb-2">
                          {marketingData.reduce((sum, ad) => sum + ad.leads, 0) > 0 ? formatCurrency(totalMarketingSpent / marketingData.reduce((sum, ad) => sum + ad.leads, 0)) : '$0.00'}
                        </div>
                        <p className="text-gray-300 text-sm mb-4">Costo por Lead</p>
                        <div className="text-xl font-bold text-cyan-400 mb-1">
                          {marketingData.reduce((sum, ad) => sum + ad.conversions, 0) > 0 ? formatCurrency(totalMarketingRevenue / marketingData.reduce((sum, ad) => sum + ad.conversions, 0)) : '$0.00'}
                        </div>
                        <p className="text-gray-300 text-sm">Valor por Conversión</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-emerald-800/20 to-green-800/20 border border-emerald-500/30">
                    <CardContent className="p-6">
                      <h4 className="text-emerald-300 font-bold text-lg mb-4">Tasa de Conversión</h4>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-emerald-400 mb-2">
                          {marketingData.reduce((sum, ad) => sum + ad.leads, 0) > 0 ? formatPercentage((marketingData.reduce((sum, ad) => sum + ad.conversions, 0) / marketingData.reduce((sum, ad) => sum + ad.leads, 0)) * 100) : '0%'}
                        </div>
                        <p className="text-gray-300 text-sm mb-4">Conversión Global</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300">Leads totales:</span>
                            <span className="text-cyan-400">{marketingData.reduce((sum, ad) => sum + ad.leads, 0)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300">Conversiones:</span>
                            <span className="text-emerald-400">{marketingData.reduce((sum, ad) => sum + ad.conversions, 0)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Botones de acción */}
                <div className="flex justify-end gap-4 mt-8">
                  <Button className="bg-slate-700 hover:bg-slate-600 text-white border border-slate-600">
                    <Eye className="w-4 h-4 mr-2" />
                    Analizar Campañas
                  </Button>
                  <Button className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white border-0">
                    <Target className="w-4 h-4 mr-2" />
                    Nueva Campaña
                  </Button>
                  <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Datos
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Reportes */}
          <TabsContent value="reportes">
            <Card className="bg-gradient-to-br from-slate-900/90 to-purple-900/20 border border-purple-500/30 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  Reportes Avanzados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="text-center p-8 bg-gradient-to-br from-violet-800/20 to-purple-800/20 rounded-xl border border-violet-500/30">
                    <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <PieChart className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-white font-bold text-xl mb-3">Análisis de Tendencias</h4>
                    <p className="text-violet-200 mb-6">Gráficos interactivos y métricas avanzadas de rendimiento financiero</p>
                    <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white">
                      <Filter className="w-4 h-4 mr-2" />
                      Próximamente
                    </Button>
                  </div>
                  <div className="text-center p-8 bg-gradient-to-br from-purple-800/20 to-pink-800/20 rounded-xl border border-purple-500/30">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <RefreshCw className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-white font-bold text-xl mb-3">Reportes Personalizados</h4>
                    <p className="text-purple-200 mb-6">Genera reportes según tus necesidades específicas del negocio</p>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                      <Target className="w-4 h-4 mr-2" />
                      Próximamente
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
