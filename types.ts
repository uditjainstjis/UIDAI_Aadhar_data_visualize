
export enum DataType {
  BIOMETRIC = 'BIOMETRIC',
  DEMOGRAPHIC = 'DEMOGRAPHIC',
  ENROLLMENT = 'ENROLLMENT'
}

export interface PincodeNode {
  pincode: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  intensity: number; // Combined volume
  biometricVolume: number;
  demographicVolume: number;
  enrollmentVolume: number;
}

export interface AggregatedData {
  totalCount: number;
  categoryVolumes: Record<DataType, number>;
  byState: Record<string, {
    total: number;
    districts: Record<string, number>;
    biometric: number;
    demographic: number;
    enrollment: number;
  }>;
  byDate: Record<string, number>;
  ageGroups: {
    '0-5': number;
    '5-17': number;
    '18+': number;
  };
  pincodeNodes: PincodeNode[];
}

export interface FileState {
  name: string;
  size: number;
  type: DataType;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
}
