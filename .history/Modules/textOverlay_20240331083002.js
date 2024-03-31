const pdfjsLib = require('pdfjs-dist');

function overlayTextOnTemplate(pdfFilePath, outputPath) {
    return new Promise((resolve, reject) => {
        // Read the PDF file
        const fileReader = new FileReader();
        fileReader.onload = function () {
            const typedarray = new Uint8Array(this.result);
            pdfjsLib.getDocument(typedarray).promise.then(pdf => {
                pdf.getPage(1).then(page => {
                    const viewport = page.getViewport({ scale: 1 });

                    // Use the actual size of the PDF page
                    const realWidth = viewport.width;
                    const realHeight = viewport.height;

                    // Determine the appropriate scale factor to fit the page into the viewport
                    const scale = calculateScale(realWidth, realHeight);

                    // Adjust the viewport with the calculated scale
                    const adjustedViewport = page.getViewport({ scale });

                    // Create canvas for rendering
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.width = adjustedViewport.width;
                    canvas.height = adjustedViewport.height;

                    // Render PDF page on canvas
                    const renderContext = {
                        canvasContext: context,
                        viewport: adjustedViewport
                    };
                    page.render(renderContext).promise.then(() => {
                        // Overlay text on canvas
                        context.font = '20px Arial';
                        context.fillStyle = 'red';
                        context.fillText('Example Text', 100, 100); // Adjust coordinates as needed

                        // Convert canvas to PNG image
                        const imageData = canvas.toDataURL('image/png');

                        // Save the overlayed template
                        saveOverlayedImage(imageData, outputPath)
                            .then(() => resolve('Overlay applied successfully'))
                            .catch(error => reject(error));
                    }).catch(error => reject(error));
                }).catch(error => reject(error));
            }).catch(error => reject(error));
        };
        fileReader.readAsArrayBuffer(pdfFilePath);
    });
}

function calculateScale(width, height) {
    const modalWidth = window.innerWidth * 0.9;
    const modalHeight = window.innerHeight * 0.9;
    const scaleX = modalWidth / width;
    const scaleY = modalHeight / height;
    return Math.min(scaleX, scaleY);
}

function saveOverlayedImage(imageData, outputPath) {
    // Convert data URL to buffer
    const data = Buffer.from(imageData.split(',')[1], 'base64');

    // Write buffer to file
    return new Promise((resolve, reject) => {
        require('fs').writeFile(outputPath, data, 'base64', error => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

module.exports = overlayTextOnTemplate;