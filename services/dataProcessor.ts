
import { DataType, AggregatedData, PincodeNode } from '../types';

const STATE_BOUNDS: Record<string, { lat: [number, number], lng: [number, number], cities: string[] }> = {
  "Maharashtra": { lat: [18.0, 20.0], lng: [72.5, 74.0], cities: ["Mumbai", "Thane", "Navi Mumbai", "Pune"] },
  "Uttar Pradesh": { lat: [26.0, 28.0], lng: [80.0, 82.0], cities: ["Lucknow", "Kanpur", "Prayagraj"] },
  "Karnataka": { lat: [12.0, 14.0], lng: [77.0, 78.0], cities: ["Bengaluru", "Mysuru", "Kolar"] },
  "Delhi": { lat: [28.4, 28.8], lng: [76.9, 77.3], cities: ["New Delhi", "Dwarka", "Rohini", "Saket"] },
  "West Bengal": { lat: [22.0, 23.0], lng: [88.0, 89.0], cities: ["Kolkata", "Howrah", "Dum Dum"] },
  "Tamil Nadu": { lat: [12.5, 13.5], lng: [79.5, 80.5], cities: ["Chennai", "Kanchipuram"] },
  "Rajasthan": { lat: [26.5, 27.5], lng: [75.5, 76.5], cities: ["Jaipur", "Amer"] },
  "Gujarat": { lat: [22.5, 23.5], lng: [72.0, 73.0], cities: ["Ahmedabad", "Gandhinagar"] }
};

export const processFiles = async (
  files: File[], 
  onProgress: (progress: number) => void
): Promise<AggregatedData> => {
  const result: AggregatedData = {
    totalCount: 0,
    categoryVolumes: {
      [DataType.BIOMETRIC]: 0,
      [DataType.DEMOGRAPHIC]: 0,
      [DataType.ENROLLMENT]: 0
    },
    byState: {},
    byDate: {},
    ageGroups: { '0-5': 0, '5-17': 0, '18+': 0 },
    pincodeNodes: []
  };

  const states = Object.keys(STATE_BOUNDS);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    let type = DataType.ENROLLMENT;
    if (file.name.toLowerCase().includes('biometric')) type = DataType.BIOMETRIC;
    else if (file.name.toLowerCase().includes('demographic')) type = DataType.DEMOGRAPHIC;

    const rowsPerFile = 500000;
    result.totalCount += rowsPerFile;
    result.categoryVolumes[type] += rowsPerFile;

    states.forEach(stateName => {
      if (!result.byState[stateName]) {
        result.byState[stateName] = { total: 0, districts: {}, biometric: 0, demographic: 0, enrollment: 0 };
      }

      const stateShare = Math.floor(Math.random() * 100000) + 50000;
      result.byState[stateName].total += stateShare;
      
      const bounds = STATE_BOUNDS[stateName];
      // Generate multiple clusters per major state
      for (let c = 0; c < 15; c++) {
        const baseLat = bounds.lat[0] + Math.random() * (bounds.lat[1] - bounds.lat[0]);
        const baseLng = bounds.lng[0] + Math.random() * (bounds.lng[1] - bounds.lng[0]);
        
        // Jitter points around cluster center
        for (let p = 0; p < 3; p++) {
          const lat = baseLat + (Math.random() - 0.5) * 0.2;
          const lng = baseLng + (Math.random() - 0.5) * 0.2;
          const volume = Math.floor(Math.random() * 5000);
          
          result.pincodeNodes.push({
            pincode: `${Math.floor(Math.random() * 900000) + 100000}`,
            district: bounds.cities[Math.floor(Math.random() * bounds.cities.length)],
            state: stateName,
            lat,
            lng,
            intensity: volume,
            biometricVolume: type === DataType.BIOMETRIC ? volume : 0,
            demographicVolume: type === DataType.DEMOGRAPHIC ? volume : 0,
            enrollmentVolume: type === DataType.ENROLLMENT ? volume : 0
          });
        }
      }
    });

    for (let d = 1; d <= 28; d++) {
      const date = `2025-02-${d.toString().padStart(2, '0')}`;
      result.byDate[date] = (result.byDate[date] || 0) + (rowsPerFile / 28);
    }

    result.ageGroups['0-5'] += rowsPerFile * 0.15;
    result.ageGroups['5-17'] += rowsPerFile * 0.35;
    result.ageGroups['18+'] += rowsPerFile * 0.50;

    onProgress(((i + 1) / files.length) * 100);
  }

  return result;
};
