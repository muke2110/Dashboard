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

        // Check if coordinates are valid numbers
        if (isNaN(xCoordinateName) || isNaN(yCoordinateName) ||
            isNaN(xCoordinateEventName) || isNaN(yCoordinateEventName) ||
            isNaN(xCoordinateDate) || isNaN(yCoordinateDate)) {
            throw new Error('Invalid coordinate values');
        }

        // Calculate exact coordinates based on PDF dimensions
        const textWidthName = font.widthOfTextAtSize(name, fontSize);
        const textHeightName = font.heightAtSize(fontSize);
        const textWidthEvent = font.widthOfTextAtSize(eventName, fontSize);
        const textHeightEvent = font.heightAtSize(fontSize);
        const textWidthDate = font.widthOfTextAtSize(certificateDate, fontSize);
        const textHeightDate = font.heightAtSize(fontSize);

        const exactXCoordinateName = xCoordinateName - (textWidthName / 2); // Adjust for text width
        const exactYCoordinateName = page.getHeight() - yCoordinateName - (textHeightName / 2); // Adjust for text height

        const exactXCoordinateEventName = xCoordinateEventName - (textWidthEvent / 2); // Adjust for text width
        const exactYCoordinateEventName = page.getHeight() - yCoordinateEventName - (textHeightEvent / 2); // Adjust for text height

        const exactXCoordinateDate = xCoordinateDate - (textWidthDate / 2); // Adjust for text width
        const exactYCoordinateDate = page.getHeight() - yCoordinateDate - (textHeightDate / 2); // Adjust for text height

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
