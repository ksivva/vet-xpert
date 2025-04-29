
import React from 'react';
import SelectField from './SelectField';

interface Lot {
  id: string;
  lotNumber: string;
}

interface Pen {
  id: string;
  penNumber: string;
  lotId: string;
}

interface LocationFilterProps {
  selectedLotId: string;
  selectedPenId: string;
  lots: Lot[] | undefined;
  pens: Pen[] | undefined;
  onLotChange: (lotId: string) => void;
  onPenChange: (penId: string) => void;
}

const LocationFilter: React.FC<LocationFilterProps> = ({
  selectedLotId,
  selectedPenId,
  lots,
  pens,
  onLotChange,
  onPenChange
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-100">
      <h2 className="text-lg font-semibold mb-4">Find Animal by Location</h2>
      
      <div className="space-y-4">
        <SelectField
          id="lot"
          label="Lot"
          value={selectedLotId}
          options={lots?.map(lot => ({
            value: lot.id,
            label: `Lot ${lot.lotNumber}`
          })) || []}
          onChange={onLotChange}
        />
        
        <SelectField
          id="pen"
          label="Pen"
          value={selectedPenId}
          options={pens?.map(pen => ({
            value: pen.id,
            label: `Pen ${pen.penNumber}`
          })) || []}
          onChange={onPenChange}
          disabled={!selectedLotId}
        />
      </div>
    </div>
  );
};

export default LocationFilter;
