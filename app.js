// La función comprimirImagenWhatsApp se colocaría aquí.

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('image-upload');
    const compressButton = document.getElementById('compress-button');
    const originalPreview = document.getElementById('original-preview');
    const compressedPreview = document.getElementById('compressed-preview');
    const compressedSize = document.getElementById('compressed-size');

    let selectedFile = null;

    fileInput.onchange = function(e) {
        selectedFile = e.target.files[0];
        if (selectedFile) {
            compressButton.disabled = false;
            originalPreview.src = URL.createObjectURL(selectedFile);
        } else {
            compressButton.disabled = true;
            originalPreview.src = '';
            compressedPreview.src = '';
            compressedSize.textContent = '';
        }
    };

    compressButton.onclick = async function() {
        if (selectedFile) {
            // Parámetros que emulan una compresión tipo WhatsApp:
            const MAX_WIDTH = 1024; // Reducción de resolución a un ancho máximo.
            const JPEG_QUALITY = 0.6; // Calidad JPEG al 60% (muy común para compresión).

            try {
                const compressedBlob = await comprimirImagenWhatsApp(
                    selectedFile, 
                    MAX_WIDTH, 
                    JPEG_QUALITY
                );

                // Mostrar la imagen comprimida y su tamaño
                compressedPreview.src = URL.createObjectURL(compressedBlob);
                const sizeKB = (compressedBlob.size / 1024).toFixed(2);
                compressedSize.textContent = `${sizeKB} KB`;

                console.log(`Original Size: ${(selectedFile.size / 1024).toFixed(2)} KB`);
                console.log(`Compressed Size: ${sizeKB} KB`);

            } catch (error) {
                console.error("Error al comprimir:", error);
                alert("Hubo un error al comprimir la imagen.");
            }
        }
    };

    // Pega la función comprimirImagenWhatsApp aquí
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
    // ... [Pega la función comprimirImagenWhatsApp aquí] ...
});
