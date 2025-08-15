import { NextRequest, NextResponse } from 'next/server';

// Base de datos en memoria para la versión mock
let mockDeliveries: any[] = [
  {
    id: "1",
    clientName: "Cliente Ejemplo",
    clientUser: "cliente@ejemplo.com", 
    clientContact: "+1234567890",
    productType: "Netflix Premium",
    productDetails: "Cuenta Netflix Premium - 4 pantallas",
    price: 25.99,
    paymentMethod: "PayPal",
    purchaseDate: new Date().toISOString(),
    deliveryUser: "netflix_user123",
    deliveryPass: "password123",
    deliveryEmail: "netflix@ejemplo.com",
    deliveryInstructions: "Cambiar contraseña después de entrega",
    deliveredAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export async function GET(req: NextRequest) {
  console.log("🔍 Account Delivery Mock API - GET called");
  
  try {
    console.log("Returning deliveries:", mockDeliveries.length);
    return NextResponse.json(mockDeliveries);
  } catch (error) {
    console.error("Error in GET account-delivery-mock:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  console.log("🔍 Account Delivery Mock API - POST called");
  
  try {
    const body = await req.text();
    console.log("Raw body:", body);
    
    if (!body) {
      console.error("Empty body received");
      return NextResponse.json({ error: 'Datos requeridos' }, { status: 400 });
    }

    const data = JSON.parse(body);
    console.log("Parsed data:", data);
    
    // Validaciones básicas
    if (!data.clientName || !data.productType) {
      console.error("Missing required fields:", { clientName: data.clientName, productType: data.productType });
      return NextResponse.json({ error: 'Nombre del cliente y tipo de producto son requeridos' }, { status: 400 });
    }
    
    const newDelivery = {
      id: Date.now().toString(),
      clientName: data.clientName || "",
      clientUser: data.clientUser || "",
      clientContact: data.clientContact || "",
      productType: data.productType || "",
      productDetails: data.productDetails || "",
      price: parseFloat(data.price) || 0,
      paymentMethod: data.paymentMethod || "",
      purchaseDate: data.purchaseDate || new Date().toISOString(),
      deliveryUser: data.deliveryUser || "",
      deliveryPass: data.deliveryPass || "",
      deliveryEmail: data.deliveryEmail || "",
      deliveryInstructions: data.deliveryInstructions || "",
      deliveredAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockDeliveries.push(newDelivery);
    console.log("Created delivery:", newDelivery);
    console.log("Total deliveries now:", mockDeliveries.length);
    
    return NextResponse.json({ success: true, id: newDelivery.id, delivery: newDelivery });
  } catch (error) {
    console.error("Error creating delivery:", error);
    return NextResponse.json({ 
      error: 'Error interno del servidor', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  console.log("🔍 Account Delivery Mock API - PUT called");
  
  try {
    const data = await req.json();
    console.log("PUT data:", data);
    
    if (!data.id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }
    
    const index = mockDeliveries.findIndex(d => d.id === data.id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Entrega no encontrada' }, { status: 404 });
    }
    
    // Actualizar la entrega
    mockDeliveries[index] = { 
      ...mockDeliveries[index], 
      ...data, 
      updatedAt: new Date().toISOString() 
    };
    
    console.log("Updated delivery:", mockDeliveries[index]);
    
    return NextResponse.json({ success: true, delivery: mockDeliveries[index] });
  } catch (error) {
    console.error("Error updating delivery:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  console.log("🔍 Account Delivery Mock API - DELETE called");
  
  try {
    const data = await req.json();
    console.log("DELETE data:", data);
    
    if (!data.id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }
    
    const index = mockDeliveries.findIndex(d => d.id === data.id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Entrega no encontrada' }, { status: 404 });
    }
    
    const deletedDelivery = mockDeliveries.splice(index, 1)[0];
    console.log("Deleted delivery:", deletedDelivery);
    console.log("Remaining deliveries:", mockDeliveries.length);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting delivery:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
