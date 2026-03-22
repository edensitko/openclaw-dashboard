import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function generatePDF(elementId: string, filename: string) {
  try {
    const element = document.getElementById(elementId);
    if (!element) throw new Error('Element not found');

    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      backgroundColor: '#fff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= 297;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297;
    }

    pdf.save(filename);
    return { success: true };
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
}

export function convertPDFToBase64(pdf: jsPDF): string {
  return pdf.output('datauristring').split('base64,')[1];
}
