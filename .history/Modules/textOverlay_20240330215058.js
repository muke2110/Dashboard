const { PDFDocument, rgb, PNG } = require('pdf-lib');

async function overlayTextOnTemplate(templatePDFBuffer, name, eventName, certificateDate, coordinates) {
    try {
        const pdfDoc = await PDFDocument.load(templatePDFBuffer);
        const page = pdfDoc.getPages()[0]; // Assuming there's only one page

        // Create a new canvas
        const canvas = document.createElement('canvas');
        canvas.width = page.getWidth();
        canvas.height = page.getHeight();
        const ctx = canvas.getContext('2d');

        // Overlay text on the canvas
        const fontSize = 40;
        ctx.font = `${fontSize}px Helvetica`;
        ctx.fillStyle = 'black';
        
        // Convert pixel coordinates to canvas coordinates
        const xCoordinateName = coordinates.namePositionX;
        const yCoordinateName = coordinates.namePositionY;
        const xCoordinateEventName = coordinates.eventPositionX;
        const yCoordinateEventName = coordinates.eventPositionY;
        const xCoordinateDate = coordinates.datePositionX;
        const yCoordinateDate = coordinates.datePositionY;

        ctx.fillText(name, xCoordinateName, yCoordinateName);
        ctx.fillText(eventName, xCoordinateEventName, yCoordinateEventName);
        ctx.fillText(certificateDate, xCoordinateDate, yCoordinateDate);

        // Convert the canvas content to a PNG image
        const imgData = canvas.toDataURL('image/png');
        const imgBytes = await fetch(imgData).then(res => res.arrayBuffer());
        const pngImage = await PDFDocument.createImage(new PNG(imgBytes));

        // Add the image to the PDF document
        const imageDims = pngImage.scale(1);
        page.drawImage(pngImage, {
            x: 0,
            y: page.getHeight() - imageDims.height, // Adjust position to match canvas coordinates
            width: imageDims.width,
            height: imageDims.height,
        });

        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
    } catch (error) {
        console.error('Error processing PDF document:', error.message);
        throw error; // Re-throw the caught error
    }
}

module.exports = overlayTextOnTemplate;
