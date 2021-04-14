import React, { useMemo } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import styled from 'styled-components';
import { SampleSet } from '../../helpers/sample-set';
import Map from './Map';

const MAP_SIDE_PADDING = 2;

const MapWrapper = styled.div`
  padding: 1rem ${MAP_SIDE_PADDING}rem 1rem ${MAP_SIDE_PADDING}rem;
`;

interface Props {
  variantSampleSet: SampleSet;
}

const Switzerland = ({ variantSampleSet }: Props) => {
  const casesByZipCode = useMemo(() => {
    const counts = variantSampleSet.countByField('zipCode');
    counts.delete(null);
    return counts as Map<string, number>;
  }, [variantSampleSet]);

  const { width, ref } = useResizeDetector<HTMLDivElement>();

  return (
    <div>
      <p>Number of cases by postal code (PLZ)</p>
      <MapWrapper ref={ref}>{width && <Map width={width} casesByZipCode={casesByZipCode} />}</MapWrapper>
    </div>
  );
};
export default Switzerland;
