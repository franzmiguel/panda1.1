document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('image-upload');
    const uploadButton = document.getElementById('upload-button');
    const statusMessage = document.getElementById('status-message');

    let selectedFile = null;

    // 1. Manejar la selección del archivo
    fileInput.onchange = function(e) {
        selectedFile = e.target.files[0];
        uploadButton.disabled = !selectedFile;
        statusMessage.textContent = selectedFile ? 
            `Archivo seleccionado: ${selectedFile.name}` : '';
    };

    // 2. Manejar el clic del botón de subida
    uploadButton.onclick = async function() {
        if (!selectedFile) return;

        uploadButton.disabled = true;
        statusMessage.textContent = 'Comprimiendo imagen...';

        // --- Parámetros de Compresión ---
        const MAX_WIDTH = 1024; // Resolución de WhatsApp
        const JPEG_QUALITY = 0.6; // Calidad de Compresión

        try {
            // 3. Comprimir la imagen usando la función
            const compressedBlob = await comprimirImagenWhatsApp(
                selectedFile, 
                MAX_WIDTH, 
                JPEG_QUALITY
            );

            statusMessage.textContent = 'Compresión finalizada. Subiendo...';

            // 4. Crear FormData y agregar el Blob comprimido
            const formData = new FormData();
            
            // Usamos el nombre del archivo original, pero con el Blob comprimido
            formData.append('compressed_image', compressedBlob, selectedFile.name);
            
            // Puedes agregar otros datos del formulario si fuera necesario:
            // formData.append('user_id', '12345'); 

            // 5. Enviar la solicitud al servidor (fetch)
            const response = await fetch('/api/upload', { // ¡Reemplaza con tu endpoint real!
                method: 'POST',
                body: formData,
            });

            // 6. Manejar la respuesta del servidor
            if (response.ok) {
                const result = await response.json();
                statusMessage.textContent = `✅ ¡Subida exitosa! Respuesta del servidor: ${result.message}`;
            } else {
                statusMessage.textContent = `❌ Error en la subida: ${response.statusText}`;
            }

        } catch (error) {
            console.error("Error completo:", error);
            statusMessage.textContent = `❌ Error en el proceso: ${error.message}`;
        } finally {
            uploadButton.disabled = false;
        }
    };


    /**
     * Comprime una imagen (File) reduciendo su resolución y calidad JPEG.
     * @param {File} imageFile - El objeto File de la imagen original.
     * @param {number} maxWidth - Ancho máximo deseado para la imagen (ej: 1000).
     * @param {number} jpegQuality - Calidad de compresión JPEG (entre 0 y 1).
     * @returns {Promise<Blob>} Una promesa que resuelve con el Blob de la imagen comprimida.
     */
    function comprimirImagenWhatsApp(imageFile, maxWidth, jpegQuality) {
        return new Promise((resolve, reject) => {
            // 1. Verificar si es un archivo de imagen
            if (!imageFile.type.startsWith('image/')) {
                return reject(new Error("El archivo no es una imagen."));
            }

            const reader = new FileReader();

            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    // 2. Crear el elemento Canvas
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // 3. Calcular nuevas dimensiones (Reducción de resolución)
                    if (width > maxWidth) {
                        height = Math.round(height * (maxWidth / width));
                        width = maxWidth;
                    }

                    // Asignar las nuevas dimensiones al canvas
                    canvas.width = width;
                    canvas.height = height;

                    // 4. Dibujar la imagen en el Canvas con las nuevas dimensiones
                    const ctx = canvas.getContext('2d');
                    // Esto reduce la resolución de la imagen.
                    ctx.drawImage(img, 0, 0, width, height);
                    // 

                    // 5. Obtener el Blob comprimido (Reducción de calidad JPEG)
                    // canvas.toBlob(callback, mimeType, quality)
                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error("Error al comprimir la imagen en Blob."));
                        }
                    }, 'image/jpeg', jpegQuality); // Aquí se aplica la compresión JPEG
                };
                img.onerror = reject;
                // Cargar la imagen usando el Data URL
                img.src = event.target.result;
            };

            reader.onerror = reject;
            // Leer el archivo de la imagen como Data URL (Base64)
            reader.readAsDataURL(imageFile);
        });
    }    
});