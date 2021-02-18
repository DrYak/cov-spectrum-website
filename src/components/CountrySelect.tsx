import React, { useEffect, useState } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import { getCountries } from '../services/api';
import { Country } from '../services/api-types';

interface Props {
  id?: string;
  onSelect: (country: Country | undefined) => void;
}

export const CountrySelect = ({ id, onSelect }: Props) => {
  const [countries, setCountries] = useState<Country[]>([]);

  useEffect(() => {
    let isSubscribed = true;
    getCountries().then(countries => {
      if (isSubscribed) {
        setCountries(countries);
      }
    });
    return () => {
      isSubscribed = false;
    };
  }, []);

  return (
    <Typeahead
      id={id}
      placeholder='Select a country'
      onChange={selected => onSelect(selected.length === 1 ? selected[0] : undefined)}
      options={countries}
    />
  );
};