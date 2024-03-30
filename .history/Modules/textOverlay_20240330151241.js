const fs = require('fs');
const { createCanvas } = require('canvas');
const { PDFDocument } = require('pdf-lib');

async function overlayTextOnTemplate(templatePDFBuffer, name, eventName, certificateDate, coordinates) {
    try {
        console.log('Coordinates:', coordinates); // Log coordinates to check their values

        // Ensure coordinates are parsed correctly
        const xCoordinateName = parseFloat(coordinates.namePositionX);
        const yCoordinateName = parseFloat(coordinates.namePositionY);
        const xCoordinateEventName = parseFloat(coordinates.eventPositionX);
        const yCoordinateEventName = parseFloat(coordinates.eventPositionY);
        const xCoordinateDate = parseFloat(coordinates.datePositionX);
        const yCoordinateDate = parseFloat(coordinates.datePositionY);

        // Load the template PDF
        const existingPdfBytes = templatePDFBuffer;
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const [firstPage] = pdfDoc.getPages();

        // Create a canvas to render the PDF
        const canvas = createCanvas(firstPage.getWidth(), firstPage.getHeight());
        const ctx = canvas.getContext('2d');

        // Draw the PDF page onto the canvas
        await firstPage.draw(canvas);

        // Draw text on the canvas
        ctx.font = '40px Helvetica-Bold';
        ctx.fillStyle = 'black';
        ctx.fillText(name, xCoordinateName, yCoordinateName);
        ctx.fillText(eventName, xCoordinateEventName, yCoordinateEventName);
        ctx.fillText(certificateDate, xCoordinateDate, yCoordinateDate);

        // Convert canvas to a buffer
        const canvasAsBuffer = canvas.toBuffer();

        // Add the canvas content as a new page
        const newPage = pdfDoc.addPage([canvas.width, canvas.height]);
        const canvasImage = await pdfDoc.embedPng(canvasAsBuffer);
        newPage.drawImage(canvasImage, {
            x: 0,
            y: 0,
            width: canvas.width,
            height: canvas.height,
        });

        // Save the new PDF document
        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
    } catch (error) {
        console.error('Error processing PDF document:', error.message);
        throw error;
    }
}

module.exports = overlayTextOnTemplate;
