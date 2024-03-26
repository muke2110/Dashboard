const { PDFDocument, rgb } = require('pdf-lib');

async function overlayTextOnTemplate(templatePDFBuffer, name, eventName, certificateDate, coordinates) {
    const pdfDoc = await PDFDocument.load(templatePDFBuffer);
    const page = pdfDoc.getPages()[0]; // Assuming there's only one page

    // Overlay text on the template PDF
    const fontSize = 20;
    const font = await pdfDoc.embedFont('Helvetica-Bold');

    page.drawText(name, { x: coordinates.Name.x, y: coordinates.Name.y, size: fontSize, font: font, color: rgb(0, 0, 0) });
    page.drawText(eventName, { x: coordinates['Event Name'].x, y: coordinates['Event Name'].y, size: fontSize, font: font, color: rgb(0, 0, 0) });
    page.drawText(certificateDate, { x: coordinates.Date.x, y: coordinates.Date.y, size: fontSize, font: font, color: rgb(0, 0, 0) });

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
}

module.exports = { overlayTextOnTemplate };
