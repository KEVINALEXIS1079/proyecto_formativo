import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { SensorTrendChart } from '../components/SensorTrendChart';

interface ChartToImageOptions {
  title: string;
  unit: string;
  color: string;
  width?: number;
  height?: number;
}

/**
 * Converts a Recharts chart to a base64 PNG image for PDF generation
 * @param chartData Array of {fecha, valor} data points
 * @param options Chart configuration options
 * @returns Promise<string | null> Base64 encoded PNG image or null if error
 */
export async function convertChartToImage(
  chartData: { fecha: Date | string; valor: number }[],
  options: ChartToImageOptions
): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const { title, unit, color, width = 800, height = 400 } = options;

      // Create temporary container
      const container = document.createElement('div');
      container.style.width = `${width}px`;
      container.style.height = `${height + 60}px`; // Extra space for title
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.backgroundColor = '#ffffff';
      container.style.padding = '20px';
      document.body.appendChild(container);

      // Create title element
      const titleElement = document.createElement('h3');
      titleElement.textContent = title;
      titleElement.style.margin = '0 0 10px 0';
      titleElement.style.fontSize = '16px';
      titleElement.style.fontWeight = 'bold';
      titleElement.style.color = '#374151';
      titleElement.style.fontFamily = 'Arial, sans-serif';
      container.appendChild(titleElement);

      // Create chart container
      const chartContainer = document.createElement('div');
      chartContainer.style.width = `${width}px`;
      chartContainer.style.height = `${height}px`;
      container.appendChild(chartContainer);

      // Render React chart component using createElement
      const root = createRoot(chartContainer);
      root.render(
        createElement(SensorTrendChart, {
          sensorName: title,
          data: chartData,
          unit: unit,
          color: color,
          width: width,
          height: height,
          showArea: true,
        })
      );

      // Wait for chart to render, then convert to image
      setTimeout(async () => {
        try {
          // Use html2canvas if available, otherwise fallback to manual canvas drawing
          const html2canvas = (await import('html2canvas')).default;
          
          const canvas = await html2canvas(container, {
            backgroundColor: '#ffffff',
            scale: 2, // Higher quality
            logging: false,
          });

          const imageData = canvas.toDataURL('image/png');

          // Cleanup
          root.unmount();
          document.body.removeChild(container);

          resolve(imageData);
        } catch (error) {
          console.error('Error converting chart to image:', error);
          
          // Cleanup on error
          try {
            root.unmount();
            document.body.removeChild(container);
          } catch (e) {
            // Ignore cleanup errors
          }
          
          resolve(null);
        }
      }, 1500); // Wait for chart animation and rendering
    } catch (error) {
      console.error('Error in convertChartToImage:', error);
      resolve(null);
    }
  });
}

/**
 * Fallback method using canvas drawing (no html2canvas dependency)
 * Creates a simple line chart directly on canvas
 */
export async function convertChartToImageFallback(
  chartData: { fecha: Date | string; valor: number }[],
  options: ChartToImageOptions
): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const { title, unit, color, width = 800, height = 400 } = options;

      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height + 60; // Extra for title
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(null);
        return;
      }

      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw title
      ctx.fillStyle = '#374151';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(title, 20, 30);

      const chartTop = 60;
      const chartHeight = height - 60;
      const chartLeft = 60;
      const chartWidth = width - 80;

      // Draw grid
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 5; i++) {
        const y = chartTop + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(chartLeft, y);
        ctx.lineTo(chartLeft + chartWidth, y);
        ctx.stroke();
      }

      // Find min and max values
      const values = chartData.map((d) => d.valor);
      const minVal = Math.min(...values);
      const maxVal = Math.max(...values);
      const range = maxVal - minVal || 1;

      // Draw Y-axis labels
      ctx.fillStyle = '#6b7280';
      ctx.font = '11px Arial';
      ctx.textAlign = 'right';
      for (let i = 0; i <= 5; i++) {
        const value = maxVal - (range / 5) * i;
        const y = chartTop + (chartHeight / 5) * i;
        ctx.fillText(value.toFixed(1), chartLeft - 10, y + 4);
      }

      // Draw unit label
      ctx.save();
      ctx.translate(15, chartTop + chartHeight / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillText(unit, 0, 0);
      ctx.restore();

      // Draw line chart
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      chartData.forEach((point, index) => {
        const x = chartLeft + (chartWidth / (chartData.length - 1 || 1)) * index;
        const normalizedValue = (point.valor - minVal) / range;
        const y = chartTop + chartHeight - normalizedValue * chartHeight;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // Draw dots
      ctx.fillStyle = color;
      chartData.forEach((point, index) => {
        const x = chartLeft + (chartWidth / (chartData.length - 1 || 1)) * index;
        const normalizedValue = (point.valor - minVal) / range;
        const y = chartTop + chartHeight - normalizedValue * chartHeight;

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
      });

      // Convert to image
      resolve(canvas.toDataURL('image/png'));
    } catch (error) {
      console.error('Error in fallback chart conversion:', error);
      resolve(null);
    }
  });
}
