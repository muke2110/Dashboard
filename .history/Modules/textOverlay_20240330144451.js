const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const { PDFDocument } = require('pdf-lib');

async function overlayTextOnTemplate(templatePDFBuffer, name, eventName, certificateDate, coordinates) {
    try {
        // Load the template PDF
        const existingPdfBytes = templatePDFBuffer;
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const [firstPage] = pdfDoc.getPages();

        // Render the PDF onto a canvas
        const canvas = createCanvas(800, 600); // Set canvas size as needed
        const ctx = canvas.getContext('2d');
        const pdfImage = await firstPage.render({ canvasContext: ctx, viewport: firstPage.getViewport({ scale: 1.0 }) }).promise;
        
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

// Example usage
// const templatePDFBuffer = fs.readFileSync('template.pdf');
// const name = 'John Doe';
// const eventName = 'Event Name';
// const certificateDate = 'April 1, 2024';
// const coordinates = {
//     namePositionX: 100,
//     namePositionY: 100,
//     eventPositionX: 100,
//     eventPositionY: 200,
//     datePositionX: 100,
//     datePositionY: 300
// };
