const fs = require('fs');
const { createCanvas } = require('canvas');
const { PDFDocument } = require('pdf-lib');

async function overlayTextOnTemplate(templatePDFBuffer, name, eventName, certificateDate, coordinates) {
    try {
        // Load the template PDF
        const existingPdfBytes = templatePDFBuffer;
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const firstPage = pdfDoc.getPages()[0]; // Get the first page

        // Create a new canvas
        const canvas = createCanvas(800, 600); // Set canvas size as needed
        const ctx = canvas.getContext('2d');

        // Draw the existing PDF onto the canvas
        const viewport = firstPage.getViewport({ scale: 1.0 });
        await firstPage.render({ canvasContext: ctx, viewport });

        // Draw text on the canvas
        ctx.font = '40px Helvetica-Bold';
        ctx.fillStyle = 'black';
        ctx.fillText(name, coordinates.namePositionX, coordinates.namePositionY);
        ctx.fillText(eventName, coordinates.eventPositionX, coordinates.eventPositionY);
        ctx.fillText(certificateDate, coordinates.datePositionX, coordinates.datePositionY);

        // Convert the canvas to a PDF
        const pdfBytes = canvas.toBuffer('application/pdf');

        return pdfBytes;
    } catch (error) {
        console.error('Error processing PDF document:', error.message);
        throw error;
    }
}

module.exports = overlayTextOnTemplate;
