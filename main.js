import '/style.css';
import LocationDetector from '/src/locationDetector.js';
import TableRenderer from '/src/tableRenderer.js';

// Main application initialization
document.addEventListener('DOMContentLoaded', async () => {
  const app = document.querySelector('#app');
  
  // Create container for the location detection app
  const container = document.createElement('div');
  container.className = 'location-detector-container';
  
  // Add header
  const header = document.createElement('header');
  header.innerHTML = `
    <h1>Location Detection Methods</h1>
    <p>Comparing different techniques to estimate your location</p>
  `;
  container.appendChild(header);
  
  // Create table for results
  const table = document.createElement('table');
  table.className = 'location-results-table';
  container.appendChild(table);
  
  // Create loading indicator
  const loadingIndicator = document.createElement('div');
  loadingIndicator.className = 'loading-indicator';
  loadingIndicator.innerHTML = `
    <div class="spinner"></div>
    <p>Detecting your location...</p>
  `;
  container.appendChild(loadingIndicator);
  
  // Replace the app content
  app.innerHTML = '';
  app.appendChild(container);
  
  // Initialize the table renderer
  const tableRenderer = new TableRenderer(table);
  tableRenderer.initialize();
  
  try {
    // Load the locations data
    const response = await fetch('/locations.json');
    if (!response.ok) {
      throw new Error('Failed to load locations data');
    }
    
    const locationsData = await response.json();
    
    // Initialize the location detector
    const detector = new LocationDetector(locationsData);
    
    // Run all detection methods and update the table
    const results = await detector.detectAll();
    tableRenderer.updateTable(results);
    
    // Remove loading indicator
    loadingIndicator.classList.add('hidden');
    
  } catch (error) {
    console.error('Error:', error);
    
    // Show error message
    loadingIndicator.innerHTML = `
      <div class="error-message">
        <p>Error: ${error.message}</p>
        <button id="retryButton">Retry</button>
      </div>
    `;
    
    // Add retry button functionality
    document.getElementById('retryButton').addEventListener('click', () => {
      window.location.reload();
    });
  }
});
