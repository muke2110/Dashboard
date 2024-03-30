// Instead of requiring pdfjs-dist
const pdfjsLib = import('pdfjs-dist/build/pdf');

// Use CommonJS version
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

async function overlayTextOnTemplate(templatePDFBuffer, name, eventName, certificateDate, coordinates) {
    try {
        console.log('Name:', name);Admin@123
        console.log('Event Name:', eventName);
        console.log('Certificate Date:', certificateDate);

        // Convert PDF buffer to array buffer
        const arrayBuffer = templatePDFBuffer.buffer.slice(templatePDFBuffer.byteOffset, templatePDFBuffer.byteOffset + templatePDFBuffer.byteLength);

        // Load PDF
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        const page = await pdf.getPage(1); // Assuming there's only one page

        // Get PDF page dimensions
        const viewport = page.getViewport({ scale: 1 });
        const canvas = createCanvas(viewport.width, viewport.height);
        const context = canvas.getContext('2d');

        // Render PDF page to canvas
        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;

        // Overlay text on the canvas
        const fontSize = 40;
        context.font = `${fontSize}px Helvetica-Bold`;
        context.fillStyle = '#000000'; // black color
        context.textBaseline = 'middle';

        // Use coordinates
        const xCoordinateName = parseFloat(coordinates.namePositionX);
        const yCoordinateName = parseFloat(coordinates.namePositionY);
        const xCoordinateEventName = parseFloat(coordinates.eventPositionX);
        const yCoordinateEventName = parseFloat(coordinates.eventPositionY);
        const xCoordinateDate = parseFloat(coordinates.datePositionX);
        const yCoordinateDate = parseFloat(coordinates.datePositionY);

        context.fillText(name, xCoordinateName, yCoordinateName);
        context.fillText(eventName, xCoordinateEventName, yCoordinateEventName);
        context.fillText(certificateDate.toString(), xCoordinateDate, yCoordinateDate);

        // Convert canvas to PDF
        const pdfBytes = canvas.toBuffer('application/pdf');

        return pdfBytes;
    } catch (error) {
        console.error('Error processing PDF document:', error.message);
        throw error;
    }
}

module.exports = overlayTextOnTemplate;
