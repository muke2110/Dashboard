const { PDFDocument, rgb } = require('pdf-lib');

async function overlayTextOnTemplate(templatePDFBuffer, name, eventName, certificateDate, coordinates, pdfViewerWidth, pdfViewerHeight) {
    try {
        console.log('Name:', name);
        console.log('Event Name:', eventName);
        console.log('Certificate Date:', certificateDate);
        const pdfDoc = await PDFDocument.load(templatePDFBuffer);
        const page = pdfDoc.getPages()[0]; // Assuming there's only one page

        // Overlay text on the template PDF
        const fontSize = 20;
        const font = await pdfDoc.embedFont('Times-Roman');

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

        // Calculate scale factor based on PDF viewer and document dimensions
        const pdfDocumentWidth = page.getWidth();
        const pdfDocumentHeight = page.getHeight();
        const scaleX = pdfViewerWidth / pdfDocumentWidth;
        const scaleY = pdfViewerHeight / pdfDocumentHeight;
        const scale = Math.min(scaleX, scaleY); // Use the smaller scale factor to fit the entire document
        
        // Calculate offsets to center the text based on the dimensions of the viewer and document
        const xOffset = (pdfViewerWidth - pdfDocumentWidth * scale) / 2;
        const yOffset = (pdfViewerHeight - pdfDocumentHeight * scale) / 2;

        // Calculate exact coordinates based on scale factor and offsets
        const exactXCoordinateName = xCoordinateName * scale + xOffset;
        const exactYCoordinateName = (pdfDocumentHeight - yCoordinateName) * scale + yOffset;
        
        const exactXCoordinateEventName = xCoordinateEventName * scale + xOffset;
        const exactYCoordinateEventName = (pdfDocumentHeight - yCoordinateEventName) * scale + yOffset;
        
        const exactXCoordinateDate = xCoordinateDate * scale + xOffset;
        const exactYCoordinateDate = (pdfDocumentHeight - yCoordinateDate) * scale + yOffset;

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
