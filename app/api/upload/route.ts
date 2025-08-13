import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { ensureUploadDir } from "@/lib/upload-helpers";

// Configuración para el almacenamiento de archivos
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(request: NextRequest) {
  try {
    // Autenticación
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    
    // Asegurar que existe el directorio de uploads
    await ensureUploadDir();

    // Verificar que sea un formulario multipart
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "El contenido debe ser multipart/form-data" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo" },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no permitido. Sube una imagen (JPEG, PNG, GIF o WebP)" },
        { status: 400 }
      );
    }

    // Limitar tamaño a 5MB
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Archivo demasiado grande. El límite es 5MB" },
        { status: 400 }
      );
    }

    // Crear un nombre de archivo único
    const fileExt = file.name.split(".").pop();
    const randomName = crypto.randomBytes(16).toString("hex");
    const fileName = `${randomName}.${fileExt}`;
    const filePath = path.join(UPLOADS_DIR, fileName);

    // Leer el archivo como un array buffer y escribirlo en disco
    const buffer = await file.arrayBuffer();
    await writeFile(filePath, new Uint8Array(buffer));

    // Devolver la URL del archivo guardado
    const fileUrl = `/uploads/${fileName}`;
    
    return NextResponse.json({ 
      url: fileUrl,
      success: true
    });
  } catch (error) {
    console.error("Error al subir imagen:", error);
    return NextResponse.json(
      { error: "Error al procesar la imagen" },
      { status: 500 }
    );
  }
}
