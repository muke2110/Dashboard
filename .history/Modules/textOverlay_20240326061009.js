function overlayTextOnTemplate(templatePDFPath, outputPDFPath, name, eventName, certificateDate, coordinates) {
    const pdfWriter = hummus.createWriterToModify(templatePDFPath, {
        modifiedFilePath: outputPDFPath,
        log: '/dev/null' // Suppress HummusJS logging
    });

    const pageModifier = new hummus.PDFPageModifier(pdfWriter, 0, true);
    const contentContext = pageModifier.startContext().getContext();

    // Overlay text on the template PDF
    const fontSize = 20;
    contentContext.writeText(`${name}`, parseInt(coordinates.Name.x), parseInt(coordinates.Name.y), { font: 'Helvetica-Bold', size: fontSize, colorspace: 'gray', color: 0x00 });
    contentContext.writeText(`${eventName}`, parseInt(coordinates['Event Name'].x), parseInt(coordinates['Event Name'].y), { font: 'Helvetica-Bold', size: fontSize, colorspace: 'gray', color: 0x00 });
    contentContext.writeText(`${certificateDate}`, parseInt(coordinates.Date.x), parseInt(coordinates.Date.y), { font: 'Helvetica-Bold', size: fontSize, colorspace: 'gray', color: 0x00 });

    pageModifier.endContext().writePage();
    pdfWriter.end();
}

module.exp