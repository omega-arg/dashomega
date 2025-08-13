"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquare,
  Send,
  Paperclip,
  Users,
  Hash,
  Search,
  Smile,
  AtSign,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  timestamp: Date;
  channelId: string;
  type: "text" | "system";
}

interface ChatChannel {
  id: string;
  name: string;
  description: string;
  type: "public" | "private";
  unreadCount: number;
  color: string;
}

const CHAT_CHANNELS: ChatChannel[] = [
  {
    id: "general",
    name: "general",
    description: "Canal general para toda la empresa",
    type: "public",
    unreadCount: 0,
    color: "text-purple-400"
  },
  {
    id: "soporte",
    name: "soporte",
    description: "Equipo de soporte técnico",
    type: "public",
    unreadCount: 0,
    color: "text-blue-400"
  },
  {
    id: "chetadores",
    name: "chetadores",
    description: "Canal exclusivo para chetadores",
    type: "private",
    unreadCount: 0,
    color: "text-green-400"
  },
  {
    id: "marketing",
    name: "marketing",
    description: "Equipo de marketing y promociones",
    type: "public",
    unreadCount: 0,
    color: "text-pink-400"
  },
  {
    id: "finanzas",
    name: "finanzas",
    description: "Departamento de finanzas",
    type: "private",
    unreadCount: 0,
    color: "text-emerald-400"
  },
  {
    id: "entregas",
    name: "entregas",
    description: "Coordinación de entregas",
    type: "public",
    unreadCount: 0,
    color: "text-orange-400"
  }
];

// Función para obtener mensajes iniciales (vacío por defecto)
const getInitialMessages = (channelId: string): ChatMessage[] => {
  // Todos los canales empiezan vacíos para una experiencia limpia
  return [];
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

export default function ChatPage() {
  const { data: session } = useSession();
  const [selectedChannel, setSelectedChannel] = useState<string>("general");
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Función para eliminar mensaje (solo OWNER)
  const handleDeleteMessage = async (messageId: string, messageContent: string) => {
    if (!session?.user || (session.user as any).role !== 'OWNER') {
      alert('Solo el propietario puede eliminar mensajes');
      return;
    }

    const confirmDelete = confirm(`¿Estás seguro de que quieres eliminar este mensaje?\n\n"${messageContent.substring(0, 100)}..."`);
    if (!confirmDelete) return;

    try {
      console.log('🗑️ Eliminando mensaje:', messageId);
      
      const response = await fetch(`/api/chat?id=${messageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Mensaje eliminado:', result);
        
        // Remover el mensaje de la UI local
        setMessages(prev => {
          const newMessages = { ...prev };
          Object.keys(newMessages).forEach(channelId => {
            newMessages[channelId] = newMessages[channelId].filter(msg => msg.id !== messageId);
          });
          return newMessages;
        });

        // Recargar mensajes para asegurar consistencia
        setTimeout(() => {
          reloadMessages();
        }, 500);
      } else {
        const errorData = await response.json();
        console.error('❌ Error eliminando mensaje:', errorData);
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('❌ Error:', error);
      alert('Error al eliminar el mensaje');
    }
  };

  // Función para recargar mensajes
  const reloadMessages = async () => {
    try {
      const response = await fetch('/api/chat');
      if (response.ok) {
        const data = await response.json();
        // Agrupar mensajes por canal
        const messagesByChannel: Record<string, ChatMessage[]> = {};
        
        // Inicializar todos los canales con arrays vacíos
        CHAT_CHANNELS.forEach(channel => {
          messagesByChannel[channel.id] = [];
        });
        
        // Agrupar mensajes reales
        data.forEach((message: any) => {
          const channelId = message.group?.name || 'general';
          if (messagesByChannel[channelId]) {
            messagesByChannel[channelId].push({
              id: message.id,
              content: message.content,
              authorId: message.senderId,
              authorName: message.sender?.name || 'Usuario',
              authorRole: message.sender?.role || 'USER',
              timestamp: new Date(message.createdAt),
              channelId: channelId,
              type: 'text'
            });
          }
        });
        
        setMessages(messagesByChannel);
      }
    } catch (error) {
      console.error('Error reloading messages:', error);
    }
  };

  // Cargar mensajes desde la API
  useEffect(() => {
    const loadMessages = async () => {
      console.log('🔍 Cargando mensajes desde la API...');
      try {
        const response = await fetch('/api/chat');
        console.log('📡 Respuesta de API:', response.status, response.statusText);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📊 Datos recibidos:', data);
          console.log('📈 Número de mensajes:', data.length);
          
          // Agrupar mensajes por canal
          const messagesByChannel: Record<string, ChatMessage[]> = {};
          
          // Inicializar todos los canales con arrays vacíos
          CHAT_CHANNELS.forEach(channel => {
            messagesByChannel[channel.id] = [];
          });
          
          // Agrupar mensajes reales
          data.forEach((message: any) => {
            const channelId = message.group?.name || 'general';
            console.log(`💬 Procesando mensaje para canal "${channelId}":`, message);
            
            if (messagesByChannel[channelId]) {
              messagesByChannel[channelId].push({
                id: message.id,
                content: message.content,
                authorId: message.senderId,
                authorName: message.sender?.name || 'Usuario',
                authorRole: message.sender?.role || 'USER',
                timestamp: new Date(message.createdAt),
                channelId: channelId,
                type: 'text'
              });
            }
          });
          
          console.log('📋 Mensajes agrupados por canal:', messagesByChannel);
          setMessages(messagesByChannel);
          console.log('✅ Mensajes cargados exitosamente');
        } else {
          const errorText = await response.text();
          console.error('❌ Error en respuesta de API:', errorText);
        }
      } catch (error) {
        console.error('❌ Error loading messages:', error);
        // Si no hay API, usar mensajes iniciales
        const initialMessages: Record<string, ChatMessage[]> = {};
        CHAT_CHANNELS.forEach(channel => {
          initialMessages[channel.id] = getInitialMessages(channel.id);
        });
        setMessages(initialMessages);
      }
    };

    loadMessages();
  }, []);

  // Auto-scroll al final de los mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedChannel]);

  // Focus en el input cuando se cambia de canal y recargar mensajes
  useEffect(() => {
    inputRef.current?.focus();
    // Opcional: recargar mensajes cuando se cambia de canal
    // reloadMessages();
  }, [selectedChannel]);

  // Función para calcular mensajes no leídos por canal
  const getUnreadCount = (channelId: string): number => {
    const channelMessages = messages[channelId] || [];
    // Por ahora retorna 0, en una implementación real calcularías 
    // basado en la última vez que el usuario visitó el canal
    return 0;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !session?.user) return;

    console.log('📤 Enviando mensaje:', newMessage.trim(), 'al canal:', selectedChannel);
    setIsLoading(true);

    try {
      // Enviar mensaje a la API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage.trim(),
          channelId: selectedChannel,
        }),
      });

      console.log('📡 Respuesta del envío:', response.status, response.statusText);

      if (response.ok) {
        const savedMessage = await response.json();
        console.log('✅ Mensaje guardado:', savedMessage);
        
        // Agregar el mensaje a la lista local
        const message: ChatMessage = {
          id: savedMessage.id,
          content: savedMessage.content,
          authorId: savedMessage.senderId,
          authorName: savedMessage.sender?.name || session.user.name || "Usuario",
          authorRole: savedMessage.sender?.role || (session.user as any).role || "SOPORTE",
          timestamp: new Date(savedMessage.createdAt),
          channelId: selectedChannel,
          type: "text"
        };

        setMessages(prev => ({
          ...prev,
          [selectedChannel]: [...(prev[selectedChannel] || []), message]
        }));
        
        // Recargar mensajes después de un breve delay para asegurar consistencia
        setTimeout(() => {
          console.log('🔄 Recargando mensajes...');
          reloadMessages();
        }, 500);
      } else {
        const errorData = await response.json();
        console.error('❌ Error from API:', errorData);
        
        // Mostrar mensaje localmente si hay error en la API
        const message: ChatMessage = {
          id: Date.now().toString(),
          content: newMessage.trim(),
          authorId: session.user.id || "user",
          authorName: session.user.name || "Usuario",
          authorRole: (session.user as any).role || "SOPORTE",
          timestamp: new Date(),
          channelId: selectedChannel,
          type: "text"
        };

        setMessages(prev => ({
          ...prev,
          [selectedChannel]: [...(prev[selectedChannel] || []), message]
        }));
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      
      // Mostrar mensaje localmente si hay error
      const message: ChatMessage = {
        id: Date.now().toString(),
        content: newMessage.trim(),
        authorId: session.user.id || "user",
        authorName: session.user.name || "Usuario",
        authorRole: (session.user as any).role || "SOPORTE",
        timestamp: new Date(),
        channelId: selectedChannel,
        type: "text"
      };

      setMessages(prev => ({
        ...prev,
        [selectedChannel]: [...(prev[selectedChannel] || []), message]
      }));
    }

    // Limpiar el input
    setNewMessage("");
    setIsLoading(false);
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      OWNER: "text-red-400",
      ADMIN_GENERAL: "text-orange-400",
      FINANZAS: "text-green-400",
      MARKETING: "text-pink-400",
      SOPORTE: "text-blue-400",
      CHETADORES: "text-purple-400",
      SISTEMA: "text-gray-400"
    };
    return colors[role] || "text-gray-300";
  };

  const getRoleBadge = (role: string) => {
    const roles: Record<string, string> = {
      OWNER: "Owner",
      ADMIN_GENERAL: "Admin",
      FINANZAS: "Finanzas",
      MARKETING: "Marketing",
      SOPORTE: "Soporte",
      CHETADORES: "Chetador",
      DISEÑADOR: "Diseño",
      SISTEMA: "Sistema"
    };
    return roles[role] || role;
  };

  const selectedChannelData = CHAT_CHANNELS.find(c => c.id === selectedChannel);
  const currentMessages = messages[selectedChannel] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Chat Interno</h1>
          <p className="text-gray-400">Comunicación por equipos y departamentos</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Sidebar - Lista de canales */}
          <div className="lg:col-span-1">
            <Card className="omega-card h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Hash className="h-4 w-4" />
                  Canales
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-350px)]">
                  <div className="space-y-1 p-4">
                    {CHAT_CHANNELS.map((channel) => (
                      <button
                        key={channel.id}
                        onClick={() => setSelectedChannel(channel.id)}
                        className={cn(
                          "w-full text-left p-3 rounded-lg transition-all duration-200 hover:bg-gray-800/50",
                          selectedChannel === channel.id 
                            ? "bg-purple-600/30 border border-purple-500/50" 
                            : "border border-transparent"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Hash className={cn("h-3 w-3", channel.color)} />
                            <span className="text-white font-medium">
                              {channel.name}
                            </span>
                          </div>
                          {getUnreadCount(channel.id) > 0 && (
                            <Badge className="bg-red-500 text-white text-xs">
                              {getUnreadCount(channel.id)}
                            </Badge>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>

                {/* Mensajes Directos */}
                <div className="border-t border-gray-700 p-4">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">
                    Mensajes Directos
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-gray-800/50 cursor-pointer">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-white text-sm">Owner</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-gray-800/50 cursor-pointer">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span className="text-white text-sm">Admin General</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <Card className="omega-card h-full flex flex-col">
              {/* Chat Header */}
              <CardHeader className="border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Hash className={cn("h-5 w-5", selectedChannelData?.color)} />
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        #{selectedChannelData?.name}
                      </h2>
                      <p className="text-sm text-gray-400">
                        {selectedChannelData?.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <Users className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages Area */}
              <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-[calc(100vh-400px)] p-4">
                  <div className="space-y-4">
                    {currentMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center py-12">
                        <MessageSquare className="h-12 w-12 text-gray-500 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-300 mb-2">
                          No hay mensajes en #{selectedChannelData?.name}
                        </h3>
                        <p className="text-gray-500 text-sm max-w-md">
                          Sé el primero en enviar un mensaje en este canal. 
                          ¡Inicia la conversación!
                        </p>
                      </div>
                    ) : (
                      currentMessages.map((message) => (
                        <div key={message.id} className="flex gap-3 hover:bg-gray-800/30 p-2 rounded-lg group">
                          <Avatar className="w-8 h-8 mt-1">
                            <AvatarImage src={message.authorAvatar} />
                            <AvatarFallback className="bg-purple-600 text-white text-xs">
                              {message.authorName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={cn("font-semibold text-sm", getRoleColor(message.authorRole))}>
                                {message.authorName}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {getRoleBadge(message.authorRole)}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {formatTime(message.timestamp)}
                              </span>
                              {/* Botón de eliminar - Solo visible para OWNER */}
                              {session?.user && (session.user as any).role === 'OWNER' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-900/20 ml-auto"
                                  onClick={() => handleDeleteMessage(message.id, message.content)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                            <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                              {message.content}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </CardContent>

              {/* Message Input */}
              <div className="border-t border-gray-700 p-4">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={`Mensaje en #${selectedChannelData?.name}`}
                      className="omega-input pr-20"
                      disabled={isLoading}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                      >
                        <Paperclip className="h-3 w-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                      >
                        <Smile className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={!newMessage.trim() || isLoading}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
                <p className="text-xs text-gray-500 mt-2">
                  Presiona Enter para enviar, Shift+Enter para nueva línea
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
