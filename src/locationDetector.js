/**
 * Location Detection Module
 * Provides multiple methods for detecting user location
 */

class LocationDetector {
  constructor(locationsData) {
    this.locationsData = locationsData;
    this.results = {
      browserGeolocation: { status: 'pending', data: {} },
      timezoneMatch: { status: 'pending', data: {} },
      cfRayMatch: { status: 'pending', data: {} },
      cloudfrontHeaders: { status: 'pending', data: {} },
      cloudflareHeaders: { status: 'pending', data: {} },
      googleCloudHeaders: { status: 'pending', data: {} },
      browserLanguage: { status: 'pending', data: {} }
    };
  }

  async detectAll() {
    // Start geolocation detection separately since it can be slow or blocked
    this.detectBrowserGeolocation();
    
    // Run all other detection methods in parallel
    await Promise.allSettled([
      this.detectTimezoneMatch(),
      this.detectCfRayMatch(),
      this.detectCloudfrontLocation(),
      this.detectCloudflareLocation(),
      this.detectGoogleCloudLocation(),
      this.detectBrowserLanguage()
    ]);
    
    return this.results;
  }

  // Method 1: Browser Geolocation API
  async detectBrowserGeolocation() {
    try {
      if (!navigator.geolocation) {
        this.results.browserGeolocation.status = 'fail';
        this.results.browserGeolocation.message = 'Geolocation API not supported';
        return;
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Find the closest location in our dataset
      const location = this.findClosestLocation(latitude, longitude);
      
      this.results.browserGeolocation = {
        status: 'success',
        data: {
          latitude,
          longitude,
          country: location.country,
          state: location.state,
          city: location.city
        }
      };
    } catch (error) {
      this.results.browserGeolocation = {
        status: 'fail',
        message: error.message
      };
    }
  }

  // Method 2: Timezone-based detection
  async detectTimezoneMatch() {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      if (!timezone) {
        this.results.timezoneMatch.status = 'fail';
        this.results.timezoneMatch.message = 'Timezone not available';
        return;
      }
      
      // Find locations matching the timezone
      const matches = this.locationsData.filter(location => location.timezone === timezone);
      
      if (matches.length === 0) {
        this.results.timezoneMatch.status = 'fail';
        this.results.timezoneMatch.message = 'No matching locations for timezone';
        return;
      }
      
      // Use the first match (could implement better selection logic)
      const location = matches[0];
      
      this.results.timezoneMatch = {
        status: 'success',
        data: {
          timezone,
          country: location.country,
          state: location.state,
          city: location.city,
          latitude: location.latitude,
          longitude: location.longitude
        }
      };
    } catch (error) {
      this.results.timezoneMatch = {
        status: 'fail',
        message: error.message
      };
    }
  }

  // Method 3: CloudFlare Ray ID matching
  async detectCfRayMatch() {
    try {
      const response = await fetch('/');
      const cfRay = response.headers.get('cf-ray');
      
      if (!cfRay) {
        this.results.cfRayMatch.status = 'fail';
        this.results.cfRayMatch.message = 'Cf-Ray header not found';
        return;
      }
      
      // Extract last 3 characters which might correspond to an IATA code
      const iataCode = cfRay.slice(-3).toUpperCase();
      
      // Find a location matching the IATA code
      const location = this.locationsData.find(location => location.iata === iataCode);
      
      if (!location) {
        this.results.cfRayMatch.status = 'fail';
        this.results.cfRayMatch.message = `No location matching IATA code ${iataCode}`;
        return;
      }
      
      this.results.cfRayMatch = {
        status: 'success',
        data: {
          iataCode,
          country: location.country,
          state: location.state,
          city: location.city,
          latitude: location.latitude,
          longitude: location.longitude
        }
      };
    } catch (error) {
      this.results.cfRayMatch = {
        status: 'fail',
        message: error.message
      };
    }
  }

  // Method 4: CloudFront Location Headers
  async detectCloudfrontLocation() {
    try {
      const response = await fetch('/');
      const countryHeader = response.headers.get('cloudfront-viewer-country');
      const countryNameHeader = response.headers.get('cloudfront-viewer-country-name');
      const regionHeader = response.headers.get('cloudfront-viewer-region');
      const cityHeader = response.headers.get('cloudfront-viewer-city');
      
      if (!countryHeader && !countryNameHeader && !regionHeader && !cityHeader) {
        this.results.cloudfrontHeaders.status = 'fail';
        this.results.cloudfrontHeaders.message = 'No CloudFront location headers found';
        return;
      }
      
      this.results.cloudfrontHeaders = {
        status: 'success',
        data: {
          country: countryNameHeader || countryHeader || 'Unknown',
          state: regionHeader || 'Unknown',
          city: cityHeader || 'Unknown'
        }
      };
    } catch (error) {
      this.results.cloudfrontHeaders = {
        status: 'fail',
        message: error.message
      };
    }
  }

  // Method 5: Cloudflare Location Headers
  async detectCloudflareLocation() {
    try {
      const response = await fetch('/');
      const country = response.headers.get('cf-ipcountry');
      const region = response.headers.get('cf-region');
      const city = response.headers.get('cf-city');
      
      if (!country && !region && !city) {
        this.results.cloudflareHeaders.status = 'fail';
        this.results.cloudflareHeaders.message = 'No Cloudflare location headers found';
        return;
      }
      
      this.results.cloudflareHeaders = {
        status: 'success',
        data: {
          country: country || 'Unknown',
          state: region || 'Unknown',
          city: city || 'Unknown'
        }
      };
    } catch (error) {
      this.results.cloudflareHeaders = {
        status: 'fail',
        message: error.message
      };
    }
  }

  // Method 6: Google Cloud Location Headers
  async detectGoogleCloudLocation() {
    try {
      const response = await fetch('/');
      const country = response.headers.get('x-country');
      const region = response.headers.get('x-region');
      const city = response.headers.get('x-city');
      
      if (!country && !region && !city) {
        this.results.googleCloudHeaders.status = 'fail';
        this.results.googleCloudHeaders.message = 'No Google Cloud location headers found';
        return;
      }
      
      this.results.googleCloudHeaders = {
        status: 'success',
        data: {
          country: country || 'Unknown',
          state: region || 'Unknown',
          city: city || 'Unknown'
        }
      };
    } catch (error) {
      this.results.googleCloudHeaders = {
        status: 'fail',
        message: error.message
      };
    }
  }

  // Method 7: Browser Language Detection
  async detectBrowserLanguage() {
    try {
      const language = navigator.language || navigator.userLanguage;
      
      if (!language) {
        this.results.browserLanguage.status = 'fail';
        this.results.browserLanguage.message = 'Browser language not available';
        return;
      }

      // Get the country code from the language (last 2 characters if in xx-XX format, or the whole string if just xx)
      const countryCode = language.includes('-') ? language.split('-')[1].toUpperCase() : language.toUpperCase();
      
      // Find locations matching the country code
      const matches = this.locationsData.filter(location => location.c2 === countryCode);
      
      if (matches.length === 0) {
        this.results.browserLanguage.status = 'fail';
        this.results.browserLanguage.message = `No location matching country code ${countryCode}`;
        return;
      }
      
      // Use the first match
      const location = matches[0];
      
      this.results.browserLanguage = {
        status: 'success',
        data: {
          language,
          countryCode,
          country: location.country,
          state: location.state,
          city: location.city,
          latitude: location.latitude,
          longitude: location.longitude
        }
      };
    } catch (error) {
      this.results.browserLanguage = {
        status: 'fail',
        message: error.message
      };
    }
  }

  // Helper function to find the closest location to coordinates
  findClosestLocation(latitude, longitude) {
    let closestLocation = null;
    let shortestDistance = Infinity;
    
    for (const location of this.locationsData) {
      const distance = this.calculateDistance(
        latitude, 
        longitude, 
        location.latitude, 
        location.longitude
      );
      
      if (distance < shortestDistance) {
        shortestDistance = distance;
        closestLocation = location;
      }
    }
    
    return closestLocation;
  }
  
  // Calculate distance between two points using Haversine formula
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  }
  
  // Convert degrees to radians
  deg2rad(deg) {
    return deg * (Math.PI/180);
  }
}

export default LocationDetector;
