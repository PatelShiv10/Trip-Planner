
import { useCallback } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';

interface TripDetails {
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  number_of_people: number;
  budget_range: string;
}

export const usePDFGeneration = () => {
  const { toast } = useToast();

  const generatePDF = useCallback(async (tripDetails: TripDetails) => {
    try {
      const element = document.querySelector('.trip-plan-content') as HTMLElement;
      if (!element) {
        throw new Error('Trip plan content not found');
      }

      toast({
        title: "Generating PDF...",
        description: "Please wait while we prepare your trip plan"
      });

      // Create a temporary container for PDF generation
      const pdfContainer = document.createElement('div');
      pdfContainer.style.position = 'absolute';
      pdfContainer.style.left = '-9999px';
      pdfContainer.style.top = '0';
      pdfContainer.style.width = '210mm'; // A4 width
      pdfContainer.style.backgroundColor = 'white';
      pdfContainer.style.padding = '20px';
      pdfContainer.style.fontFamily = 'Arial, sans-serif';

      // Create header
      const header = document.createElement('div');
      header.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #8B5CF6;">
          <h1 style="color: #8B5CF6; font-size: 28px; margin: 0 0 10px 0;">${tripDetails.title}</h1>
          <h2 style="color: #6B7280; font-size: 18px; margin: 0 0 15px 0;">${tripDetails.destination}</h2>
          <div style="display: flex; justify-content: space-between; font-size: 14px; color: #4B5563;">
            <span><strong>Dates:</strong> ${new Date(tripDetails.start_date).toLocaleDateString()} - ${new Date(tripDetails.end_date).toLocaleDateString()}</span>
            <span><strong>Travelers:</strong> ${tripDetails.number_of_people}</span>
            <span><strong>Budget:</strong> ${tripDetails.budget_range}</span>
          </div>
        </div>
      `;

      // Clone the content
      const clonedContent = element.cloneNode(true) as HTMLElement;
      
      // Style the cloned content for PDF
      clonedContent.style.width = '100%';
      clonedContent.style.fontSize = '12px';
      clonedContent.style.lineHeight = '1.4';
      
      pdfContainer.appendChild(header);
      pdfContainer.appendChild(clonedContent);
      document.body.appendChild(pdfContainer);

      // Generate canvas
      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        height: pdfContainer.scrollHeight,
        width: pdfContainer.scrollWidth
      });

      // Remove temporary container
      document.body.removeChild(pdfContainer);

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save the PDF
      const fileName = `${tripDetails.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_trip_plan.pdf`;
      pdf.save(fileName);

      toast({
        title: "PDF Generated Successfully!",
        description: "Your trip plan has been downloaded"
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "PDF Generation Failed",
        description: "There was an error generating your PDF. Please try again.",
        variant: "destructive"
      });
    }
  }, [toast]);

  return { generatePDF };
};
