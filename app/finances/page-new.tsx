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

export default function FinancesPage() {
  const [salesData, setSalesData] = useState<SaleRecord[]>([
    {
      id: '1',
      date: '05/08',
      client: '@lucas_gtav',
      product: '200M GTA',
      salePrice: 4000,
      cost: 2000,
      paymentCommission: 200,
      employeePayment: 800,
      channel: 'Instagram',
      netProfit: 1000
    },
    {
      id: '2',
      date: '05/08',
      client: 'MauroCuentas',
      product: 'Cuenta PS5',
      salePrice: 10000,
      cost: 7000,
      paymentCommission: 300,
      employeePayment: 500,
      channel: 'Web',
      netProfit: 2200
    },
    {
      id: '3',
      date: '06/08',
      client: 'Diego#5321',
      product: '1B GTA',
      salePrice: 8000,
      cost: 3500,
      paymentCommission: 250,
      employeePayment: 1000,
      channel: 'Discord',
      netProfit: 3250
    }
  ]);

  const [employeeCosts] = useState<EmployeeCost[]>([
    { employeeId: '1', name: 'Alex', role: 'Cheater Senior', cost: 2300, salesGenerated: 15000 },
    { employeeId: '2', name: 'Mario', role: 'Vendedor', cost: 1200, salesGenerated: 8000 },
    { employeeId: '3', name: 'Sofia', role: 'Support', cost: 800, salesGenerated: 3000 }
  ]);

  const [productSales] = useState<ProductSale[]>([
    { product: 'Millones GTA Online', sales: 45, revenue: 89000, profit: 32000 },
    { product: 'Cuentas Fortnite', sales: 23, revenue: 45000, profit: 18000 },
    { product: 'Boost Niveles COD', sales: 19, revenue: 28000, profit: 12000 },
    { product: 'Cuentas Valorant', sales: 12, revenue: 24000, profit: 9000 }
  ]);

  // Cálculos financieros
  const totalRevenue = salesData.reduce((sum, sale) => sum + sale.salePrice, 0);
  const totalCosts = salesData.reduce((sum, sale) => sum + sale.cost, 0);
  const totalCommissions = salesData.reduce((sum, sale) => sum + sale.paymentCommission, 0);
  const totalEmployeePayments = salesData.reduce((sum, sale) => sum + sale.employeePayment, 0);
  const totalNetProfit = salesData.reduce((sum, sale) => sum + sale.netProfit, 0);
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
                value="ventas" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-xl px-6 py-3 text-purple-200 hover:text-white"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Ventas
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

          {/* Tab Resumen */}
          <TabsContent value="resumen" className="space-y-8">
            <Card className="bg-gradient-to-br from-slate-900/90 to-purple-900/20 border border-purple-500/30 backdrop-blur">
              <CardHeader className="border-b border-purple-500/20">
                <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  Resumen de Ventas - Vista Detallada
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                    Panel de control financiero
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {/* Tabla de ventas estilo Excel */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-purple-500/30">
                        <th className="text-left p-4 text-purple-200 font-semibold border-r border-purple-500/20">FECHA</th>
                        <th className="text-left p-4 text-purple-200 font-semibold border-r border-purple-500/20">CLIENTE</th>
                        <th className="text-left p-4 text-purple-200 font-semibold border-r border-purple-500/20">PRODUCTO</th>
                        <th className="text-right p-4 text-purple-200 font-semibold border-r border-purple-500/20">PRECIO VENTA</th>
                        <th className="text-right p-4 text-purple-200 font-semibold border-r border-purple-500/20">COSTO (CHETO/CUENTA)</th>
                        <th className="text-right p-4 text-purple-200 font-semibold border-r border-purple-500/20">COMISIÓN PAGO</th>
                        <th className="text-right p-4 text-purple-200 font-semibold border-r border-purple-500/20">PAGO EMPLEADO</th>
                        <th className="text-left p-4 text-purple-200 font-semibold border-r border-purple-500/20">CANAL DE VENTA</th>
                        <th className="text-right p-4 text-purple-200 font-semibold">GANANCIA NETA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesData.map((sale) => (
                        <tr key={sale.id} className="border-b border-slate-700/50 hover:bg-purple-500/5 transition-colors">
                          <td className="p-4 text-gray-300 border-r border-slate-700/50">{sale.date}</td>
                          <td className="p-4 text-gray-300 border-r border-slate-700/50">{sale.client}</td>
                          <td className="p-4 text-blue-400 border-r border-slate-700/50">{sale.product}</td>
                          <td className="p-4 text-green-400 text-right border-r border-slate-700/50">{formatCurrency(sale.salePrice)}</td>
                          <td className="p-4 text-red-400 text-right border-r border-slate-700/50">{formatCurrency(sale.cost)}</td>
                          <td className="p-4 text-purple-400 text-right border-r border-slate-700/50">{formatCurrency(sale.paymentCommission)}</td>
                          <td className="p-4 text-cyan-400 text-right border-r border-slate-700/50">{formatCurrency(sale.employeePayment)}</td>
                          <td className="p-4 border-r border-slate-700/50">
                            <Badge className={getChannelBadgeStyle(sale.channel)}>{sale.channel}</Badge>
                          </td>
                          <td className="p-4 text-emerald-400 text-right font-bold">{formatCurrency(sale.netProfit)}</td>
                        </tr>
                      ))}
                      <tr className="bg-gradient-to-r from-emerald-900/20 to-green-900/20 border-t-2 border-emerald-500/50">
                        <td className="p-4 text-emerald-300 font-bold border-r border-slate-700/50">TOTALES</td>
                        <td className="p-4 border-r border-slate-700/50">-</td>
                        <td className="p-4 border-r border-slate-700/50">-</td>
                        <td className="p-4 text-green-400 text-right font-bold border-r border-slate-700/50">{formatCurrency(totalRevenue)}</td>
                        <td className="p-4 text-red-400 text-right font-bold border-r border-slate-700/50">{formatCurrency(totalCosts)}</td>
                        <td className="p-4 text-purple-400 text-right font-bold border-r border-slate-700/50">{formatCurrency(totalCommissions)}</td>
                        <td className="p-4 text-cyan-400 text-right font-bold border-r border-slate-700/50">{formatCurrency(totalEmployeePayments)}</td>
                        <td className="p-4 border-r border-slate-700/50">-</td>
                        <td className="p-4 text-emerald-400 text-right font-bold text-xl">{formatCurrency(totalNetProfit)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Botones de acción */}
                <div className="flex justify-end gap-4 mt-8">
                  <Button className="bg-slate-700 hover:bg-slate-600 text-white border border-slate-600">
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Detalles
                  </Button>
                  <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Excel
                  </Button>
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
            <Card className="bg-gradient-to-br from-slate-900/90 to-purple-900/20 border border-purple-500/30 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  Registrar Nueva Venta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Calculator className="w-10 h-10 text-orange-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Formulario de Registro</h3>
                  <p className="text-purple-200 mb-8 max-w-md mx-auto">
                    Esta funcionalidad será implementada próximamente con un formulario completo para registrar nuevas ventas.
                  </p>
                  <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-3">
                    <Star className="w-5 h-5 mr-2" />
                    Implementar Próximamente
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
