const fs = require('fs');
const { createCanvas } = require('canvas');
const { PDFDocument } = require('pdf-lib');

async function overlayTextOnTemplate(templatePDFBuffer, name, eventName, certificateDate, coordinates) {
    try {
        // Load the template PDF
        const existingPdfBytes = templatePDFBuffer;
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const [firstPage] = pdfDoc.getPages();

        // Create a canvas to render the PDF
        const canvas = createCanvas(firstPage.getWidth(), firstPage.getHeight());
        const ctx = canvas.getContext('2d');

        // Draw the PDF content onto the canvas
        const { width, height } = firstPage.getSize();
        const pdfBytes = await firstPage.getContents();
        await ctx.drawPdf(pdfBytes, { x: 0, y: 0, width, height });

        // Draw text on the canvas
        ctx.font = '40px Helvetica-Bold';
        ctx.fillStyle = 'black';
        ctx.fillText(name, coordinates.namePositionX, coordinates.namePositionY);
        ctx.fillText(eventName, coordinates.eventPositionX, coordinates.eventPositionY);
        ctx.fillText(certificateDate, coordinates.datePositionX, coordinates.datePositionY);

        // Convert canvas to a buffer
        const canvasAsBuffer = canvas.toBuffer();

        return canvasAsBuffer;
    } catch (error) {
        console.error('Error processing PDF document:', error.message);
        throw error;
    }
}

module.exports = overlayTextOnTemplate;
