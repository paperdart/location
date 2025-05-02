/**
 * Table Renderer
 * Creates and updates the location estimation results table
 */

class TableRenderer {
  constructor(tableElement) {
    this.tableElement = tableElement;
    this.initialized = false;
  }

  // Initialize the table structure
  initialize() {
    if (this.initialized) return;
    
    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const headers = ['Method', 'Country', 'State', 'City', 'Latitude', 'Longitude', 'Status'];
    
    headers.forEach(text => {
      const th = document.createElement('th');
      th.textContent = text;
      headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    this.tableElement.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    tbody.id = 'locationResultsBody';
    this.tableElement.appendChild(tbody);
    
    this.initialized = true;
  }

  // Update the table with detection results
  updateTable(results) {
    if (!this.initialized) {
      this.initialize();
    }
    
    const tbody = document.getElementById('locationResultsBody');
    tbody.innerHTML = ''; // Clear existing rows
    
    // Define the methods and their display names
    const methods = [
      { key: 'browserGeolocation', name: 'Browser Geolocation' },
      { key: 'timezoneMatch', name: 'Browser Timezone' },
      { key: 'browserLanguage', name: 'Browser Language' },
      { key: 'cfRayMatch', name: 'CloudFlare Ray ID' },
      { key: 'cloudfrontHeaders', name: 'CloudFront Headers' },
      { key: 'cloudflareHeaders', name: 'CloudFlare Headers' },
      { key: 'googleCloudHeaders', name: 'Google Cloud Headers' }
    ];
    
    // Create a row for each method
    methods.forEach(method => {
      const result = results[method.key];
      const row = document.createElement('tr');
      
      // Method name cell
      const methodCell = document.createElement('td');
      methodCell.textContent = method.name;
      row.appendChild(methodCell);
      
      // Data cells - country, state, city, lat, lon
      const data = result.data || {};
      
      // Country
      const countryCell = document.createElement('td');
      countryCell.textContent = data.country || '-';
      row.appendChild(countryCell);
      
      // State
      const stateCell = document.createElement('td');
      stateCell.textContent = data.state || '-';
      row.appendChild(stateCell);
      
      // City
      const cityCell = document.createElement('td');
      cityCell.textContent = data.city || '-';
      row.appendChild(cityCell);
      
      // Latitude
      const latCell = document.createElement('td');
      latCell.textContent = data.latitude !== undefined ? data.latitude.toFixed(6) : '-';
      row.appendChild(latCell);
      
      // Longitude
      const lonCell = document.createElement('td');
      lonCell.textContent = data.longitude !== undefined ? data.longitude.toFixed(6) : '-';
      row.appendChild(lonCell);
      
      // Status cell
      const statusCell = document.createElement('td');
      statusCell.classList.add('status', result.status);
      statusCell.textContent = result.status === 'success' ? 'Success' : 'Fail';
      if (result.status === 'fail' && result.message) {
        statusCell.title = result.message;
      }
      row.appendChild(statusCell);
      
      tbody.appendChild(row);
    });
  }
}

export default TableRenderer;
