
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  Play, 
  Pause, 
  CheckSquare, 
  AlertTriangle, 
  TrendingUp,
  Target,
  Calendar,
  Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ROLE_LABELS } from "@/lib/auth";
import { motion } from "framer-motion";

interface User {
  id: string;
  name?: string | null;
  email: string;
  role: string;
}

interface EmployeeDashboardProps {
  user: User;
}

interface WorkSession {
  isWorking: boolean;
  startTime: string | null;
  totalHoursToday: number;
  weeklyTarget: number;
}

export default function EmployeeDashboard({ user }: EmployeeDashboardProps) {
  const [workSession, setWorkSession] = useState<WorkSession>({
    isWorking: false,
    startTime: null,
    totalHoursToday: 0,
    weeklyTarget: 40,
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sessionDuration, setSessionDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchWorkSession();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (workSession.isWorking && workSession.startTime) {
        const start = new Date(workSession.startTime);
        const now = new Date();
        setSessionDuration((now.getTime() - start.getTime()) / (1000 * 60 * 60)); // hours
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [workSession.isWorking, workSession.startTime]);

  const fetchWorkSession = async () => {
    try {
      const response = await fetch("/api/time-tracking/status");
      if (response.ok) {
        const data = await response.json();
        setWorkSession(data);
      }
    } catch (error) {
      console.error("Error fetching work session:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWorkSession = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/time-tracking/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        setWorkSession(data);
        
        toast({
          title: data.isWorking ? "¡Sesión iniciada!" : "Sesión finalizada",
          description: data.isWorking 
            ? "Tu tiempo de trabajo está siendo registrado" 
            : `Trabajaste ${data.sessionDuration?.toFixed(2) || 0} horas`,
        });
      }
    } catch (error) {
      console.error("Error toggling work session:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del trabajo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const weeklyProgress = ((workSession.totalHoursToday / workSession.weeklyTarget) * 100) || 0;
  const currentHours = workSession.totalHoursToday + sessionDuration;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <motion.h1 
            className="text-3xl font-bold text-white"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ¡Hola, {user.name?.split(" ")[0] || "Usuario"}!
          </motion.h1>
          <p className="text-gray-400 mt-1">
            Panel de empleado - {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role}
          </p>
        </div>
        
        <div className="text-right">
          <p className="text-2xl font-bold text-green-400">
            {currentTime.toLocaleTimeString("es-ES", { 
              hour: "2-digit", 
              minute: "2-digit" 
            })}
          </p>
          <p className="text-gray-400 text-sm">
            {currentTime.toLocaleDateString("es-ES", { 
              weekday: "long", 
              day: "numeric", 
              month: "long" 
            })}
          </p>
        </div>
      </div>

      {/* Work Session Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className={`omega-card ${workSession.isWorking ? 'working-pulse border-green-500' : ''}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-500" />
              Control de Tiempo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  onClick={toggleWorkSession}
                  disabled={loading}
                  className={`omega-button ${workSession.isWorking ? 'bg-red-500 hover:bg-red-600' : ''}`}
                >
                  {workSession.isWorking ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Pausar Trabajo
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Estoy Trabajando
                    </>
                  )}
                </Button>
                
                {workSession.isWorking && (
                  <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                    Trabajando desde {new Date(workSession.startTime!).toLocaleTimeString("es-ES", { 
                      hour: "2-digit", 
                      minute: "2-digit" 
                    })}
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Sesión Actual</p>
                <p className="text-2xl font-bold text-white">
                  {sessionDuration.toFixed(1)}h
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Hoy Total</p>
                <p className="text-2xl font-bold text-green-400">
                  {currentHours.toFixed(1)}h
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Meta Semanal</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-white">{currentHours.toFixed(1)}h / {workSession.weeklyTarget}h</span>
                    <span className="text-green-400">{weeklyProgress.toFixed(0)}%</span>
                  </div>
                  <Progress value={weeklyProgress} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="omega-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Tareas Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-400">5</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="omega-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Completadas</p>
                  <p className="text-2xl font-bold text-green-400">12</p>
                </div>
                <CheckSquare className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="omega-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Eficiencia</p>
                  <p className="text-2xl font-bold text-purple-400">92%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="omega-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Días Activos</p>
                  <p className="text-2xl font-bold text-blue-400">23</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Tasks Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="omega-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-green-500" />
              Tareas Recientes
            </CardTitle>
            <Button variant="ghost" className="text-green-400 hover:text-green-300">
              Ver todas
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { title: "Revisar informes de ventas", priority: "HIGH", status: "IN_PROGRESS" },
                { title: "Actualizar base de datos", priority: "MEDIUM", status: "TODO" },
                { title: "Preparar presentación", priority: "LOW", status: "COMPLETED" },
              ].map((task, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      task.status === "COMPLETED" ? "bg-green-500" : 
                      task.status === "IN_PROGRESS" ? "bg-yellow-500" : "bg-gray-500"
                    }`} />
                    <span className="text-white">{task.title}</span>
                  </div>
                  <Badge variant={
                    task.priority === "HIGH" ? "destructive" : 
                    task.priority === "MEDIUM" ? "default" : "secondary"
                  }>
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
