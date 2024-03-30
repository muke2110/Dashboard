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
        await firstPage.drawPage(canvas, {
            x: 0,
            y: 0,
            width: firstPage.getWidth(),
            height: firstPage.getHeight(),
        });

        // Draw text on the canvas
        ctx.font = '40px Helvetica-Bold';
        ctx.fillStyle = 'black';
        ctx.fillText(name, coordinates.namePositionX, coordinates.namePositionY);
        ctx.fillText(eventName, coordinates.eventPositionX, coordinates.eventPositionY);
        ctx.fillText(certificateDate, coordinates.datePositionX, coordinates.datePositionY);

        // Convert canvas to PDF
        const canvasAsBuffer = canvas.toBuffer('application/pdf');
        const canvasPdfDoc = await PDFDocument.load(canvasAsBuffer);

        // Create a new PDF document and add the canvas PDF to it
        const newPdfDoc = await PDFDocument.create();
        const [canvasPdfPage] = await newPdfDoc.copyPages(canvasPdfDoc, [0]);
        newPdfDoc.addPage(canvasPdfPage);

        // Save the new PDF document
        const pdfBytes = await newPdfDoc.save();
        return pdfBytes;
    } catch (error) {
        console.error('Error processing PDF document:', error.message);
        throw error;
    }
}

module.exports = overlayTextOnTemplate;
