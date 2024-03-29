// textOverlay.js
const { PDFDocument, rgb } = require('pdf-lib');

async function overlayTextOnTemplate(templatePDFBuffer, name, eventName, certificateDate, coordinates) {
    try {
        console.log('Name:', name);
        console.log('Event Name:', eventName);
        console.log('Certificate Date:', certificateDate);
        const pdfDoc = await PDFDocument.load(templatePDFBuffer);
        const page = pdfDoc.getPages()[0]; // Assuming there's only one page

        // Overlay text on the template PDF
        const fontSize = 40;
        const font = await pdfDoc.embedFont('Helvetica-Bold');

        // Convert certificateDate to string
        certificateDate = certificateDate.toString();

        // Use coordinates
        const xCoordinateName = parseFloat(coordinates.namePositionX);
        const yCoordinateName = parseFloat(coordinates.namePositionY);
        const xCoordinateEventName = parseFloat(coordinates.eventPositionX);
        const yCoordinateEventName = parseFloat(coordinates.eventPositionY);
        const xCoordinateDate = parseFloat(coordinates.datePositionX);
        const yCoordinateDate = parseFloat(coordinates.datePositionY);

        const pageWidth = page.getWidth();
        const pageHeight = page.getHeight();3
        
        // Check if coordinates are valid numbers
        if (isNaN(xCoordinateName) || isNaN(yCoordinateName) ||
            isNaN(xCoordinateEventName) || isNaN(yCoordinateEventName) ||
            isNaN(xCoordinateDate) || isNaN(yCoordinateDate)) {
            throw new Error('Invalid coordinate values');
        }

        // Calculate exact coordinates based on PDF dimensions
        const pageWidth = page.getWidth();
        const pageHeight = page.getHeight();
        const textWidth = font.widthOfTextAtSize(name, fontSize);
        const textHeight = font.heightAtSize(fontSize);
        
        const exactXCoordinateName = xCoordinateName - (textWidth / 2); // Adjust for text width
        const exactYCoordinateName = pageHeight - yCoordinateName - (textHeight / 2); // Adjust for text height
        
        const exactXCoordinateEventName = xCoordinateEventName - (textWidth / 2); // Adjust for text width
        const exactYCoordinateEventName = pageHeight - yCoordinateEventName - (textHeight / 2); // Adjust for text height
        
        const exactXCoordinateDate = xCoordinateDate - (textWidth / 2); // Adjust for text width
        const exactYCoordinateDate = pageHeight - yCoordinateDate - (textHeight / 2); // Adjust for text height

        // Draw text on the page using calculated exact coordinates
        page.drawText(name, { x: exactXCoordinateName, y: exactYCoordinateName, size: fontSize, font: font, color: rgb(0, 0, 0) });
        page.drawText(eventName, { x: exactXCoordinateEventName, y: exactYCoordinateEventName, size: fontSize, font: font, color: rgb(0, 0, 0) });
        page.drawText(certificateDate, { x: exactXCoordinateDate, y: exactYCoordinateDate, size: fontSize, font: font, color: rgb(0, 0, 0) });

        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
    } catch (error) {
        console.error('Error processing PDF document:', error.message);
        throw error; // Re-throw the caught error
    }
}

module.exports = overlayTextOnTemplate;
