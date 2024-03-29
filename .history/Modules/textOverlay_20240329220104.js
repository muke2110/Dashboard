// Combined code with textOverlay.js and getHightlightCoords() function

// textOverlay.js
const { PDFDocument, rgb } = require('pdf-lib');

// Function to overlay text on a PDF template
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

        // Use coordinates from getHightlightCoords function
        const { x, y } = getHightlightCoords();

        // Check if coordinates are valid numbers
        if (isNaN(x) || isNaN(y)) {
            throw new Error('Invalid coordinate values');
        }

        // Calculate exact coordinates based on PDF dimensions
        const pageWidth = page.getWidth();
        const pageHeight = page.getHeight();
        const textWidth = font.widthOfTextAtSize(name, fontSize);
        const textHeight = font.heightAtSize(fontSize);
        
        const exactXCoordinateName = x - (textWidth / 2); // Adjust for text width
        const exactYCoordinateName = pageHeight - y - (textHeight / 2); // Adjust for text height

        // Draw text on the page using calculated exact coordinates
        page.drawText(name, { x: exactXCoordinateName, y: exactYCoordinateName, size: fontSize, font: font, color: rgb(0, 0, 0) });
        page.drawText(eventName, { x: exactXCoordinateName, y: exactYCoordinateName - 50, size: fontSize, font: font, color: rgb(0, 0, 0) });
        page.drawText(certificateDate, { x: exactXCoordinateName, y: exactYCoordinateName - 100, size: fontSize, font: font, color: rgb(0, 0, 0) });

        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
    } catch (error) {
        console.error('Error processing PDF document:', error.message);
        throw error; // Re-throw the caught error
    }
}

// Function to get coordinates of highlighted text in a PDF viewer
function getHightlightCoords() {
    var pageIndex = PDFViewerApplication.pdfViewer.currentPageNumber - 1;
    var page = PDFViewerApplication.pdfViewer.getPageView(pageIndex);
    var pageRect = page.canvas.getClientRects()[0];
    var selectionRects = window.getSelection().getRangeAt(0).getClientRects();
    var selectionRect = selectionRects[0]; // Only care about one line, maybe forbid multi-line
    var viewport = page.viewport;
    var leftAndBot = viewport.convertToPdfPoint(selectionRect.left - pageRect.x, selectionRect.top - pageRect.y);
    return leftAndBot;
}

module.exports = { overlayTextOnTemplate, getHightlightCoords };
