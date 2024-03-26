const fs = require('fs');
const { PDFDocumentFactory, PDFDocumentWriter, drawText } = require('pdfjs-dist')

async function overlayTextOnTemplate(templatePDFBuffer, name, eventName, certificateDate, coordinates) {
    try {
        const pdfDoc = await PDFDocumentFactory.load(templatePDFBuffer);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];

        const fontSize = 20;
        const fontColor = [0, 0, 0];
        const font = await firstPage.getFont('Helvetica-Bold');

        drawText(
            name,
            {
                x: coordinates.Name.x,
                y: coordinates.Name.y,
                size: fontSize,
                font,
                color: fontColor,
            },
            firstPage
        );

        drawText(
            eventName,
            {
                x: coordinates['Event Name'].x,
                y: coordinates['Event Name'].y,
                size: fontSize,
                font,
                color: fontColor,
            },
            firstPage
        );

        drawText(
            certificateDate,
            {
                x: coordinates.Date.x,
                y: coordinates.Date.y,
                size: fontSize,
                font,
                color: fontColor,
            },
            firstPage
        );

        const pdfBytes = PDFDocumentWriter.saveToBytes(pdfDoc);
        return pdfBytes;
    } catch (error) {
        console.error('Error processing PDF document:', error.message);
        throw error; // Re-throw the caught error
    }
}

module.exports = { overlayTextOnTemplate };
