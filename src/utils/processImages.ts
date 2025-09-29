import { removeBackground, loadImageFromPath } from './backgroundRemoval';

// Import all the mockup images
import mockupDashboard from '@/assets/mockup-dashboard.png';
import mockupAnalytics from '@/assets/mockup-analytics.png';
import mockupProfile from '@/assets/mockup-profile.png';
import mockupBookings from '@/assets/mockup-bookings.png';
import mockupServices from '@/assets/mockup-services.png';
import mockupCharts from '@/assets/mockup-charts.png';
import mockupReports from '@/assets/mockup-reports.png';
import mockupPerformance from '@/assets/mockup-performance.png';
import mockupAppointmentModal from '@/assets/mockup-appointment-modal.png';

export const processMockupImages = async () => {
  const images = [
    { path: mockupDashboard, name: 'mockup-dashboard-nobg.png' },
    { path: mockupAnalytics, name: 'mockup-analytics-nobg.png' },
    { path: mockupProfile, name: 'mockup-profile-nobg.png' },
    { path: mockupBookings, name: 'mockup-bookings-nobg.png' },
    { path: mockupServices, name: 'mockup-services-nobg.png' },
    { path: mockupCharts, name: 'mockup-charts-nobg.png' },
    { path: mockupReports, name: 'mockup-reports-nobg.png' },
    { path: mockupPerformance, name: 'mockup-performance-nobg.png' },
    { path: mockupAppointmentModal, name: 'mockup-appointment-modal-nobg.png' },
  ];

  console.log('Starting background removal for all mockup images...');

  for (const { path, name } of images) {
    try {
      console.log(`Processing ${name}...`);
      
      // Load the image
      const imageElement = await loadImageFromPath(path);
      
      // Remove background
      const processedBlob = await removeBackground(imageElement);
      
      // Create download link for processed image
      const url = URL.createObjectURL(processedBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      
      console.log(`✓ Processed ${name}`);
    } catch (error) {
      console.error(`Error processing ${name}:`, error);
    }
  }
  
  console.log('Background removal process completed for all images!');
};