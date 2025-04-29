
import React from 'react';
import Layout from '../components/Layout';
import SearchByEid from '../components/SearchByEid';
import LocationFilter from '../components/LocationFilter';
import AnimalList from '../components/AnimalList';
import useAnimalsData from '../hooks/useAnimalsData';

const Index: React.FC = () => {
  const {
    lots,
    pens,
    selectedLotId,
    selectedPenId,
    isSearching,
    displayedAnimals,
    handleLotChange,
    handlePenChange,
    handleSearchByEid,
    searchedAnimal
  } = useAnimalsData();

  return (
    <Layout title="VetXpert">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <SearchByEid 
          onSearch={handleSearchByEid} 
          isSearching={isSearching}
        />

        <LocationFilter
          selectedLotId={selectedLotId}
          selectedPenId={selectedPenId}
          lots={lots}
          pens={pens}
          onLotChange={handleLotChange}
          onPenChange={handlePenChange}
        />

        <AnimalList
          animals={displayedAnimals}
          isSearchResult={searchedAnimal}
          selectedLotId={selectedLotId}
        />
      </div>
    </Layout>
  );
};

export default Index;
