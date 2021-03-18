import React, { useEffect, useMemo, useState } from 'react';
import * as zod from 'zod';
import { Plot } from '../components/Plot';
import { EntryWithoutCI, removeCIFromEntry } from '../helpers/confidence-interval';
import { fillGroupedWeeklyApiData } from '../helpers/fill-missing';
import { ZodQueryEncoder } from '../helpers/query-encoder';
import {
  DistributionType,
  getVariantDistributionData,
  SamplingStrategy,
  toLiteralSamplingStrategy,
} from '../services/api';
import { CountrySchema, InternationalTimeDistributionEntry } from '../services/api-types';
import { Widget } from './Widget';

const digitsForPercent = (v: number): string => (v * 100).toFixed(2);

const PropsSchema = zod.object({
  country: CountrySchema,
  matchPercentage: zod.number(),
  mutations: zod.array(zod.string()),
  logScale: zod.boolean().optional(),
});
type Props = zod.infer<typeof PropsSchema>;

const VariantInternationalComparisonPlot = ({ country, mutations, matchPercentage, logScale }: Props) => {
  const [plotData, setPlotData] = useState<EntryWithoutCI<InternationalTimeDistributionEntry>[] | undefined>(
    undefined
  );
  const [colorMap, setColorMap] = useState<any>(null);

  useEffect(() => {
    let isSubscribed = true;
    const controller = new AbortController();
    const signal = controller.signal;
    getVariantDistributionData(
      {
        distributionType: DistributionType.International,
        country,
        mutations,
        matchPercentage,
        samplingStrategy: toLiteralSamplingStrategy(SamplingStrategy.AllSamples),
      },
      signal
    ).then(newDistributionData => {
      if (isSubscribed) {
        const countriesToPlot = new Set(['United Kingdom', 'Denmark', 'Switzerland', country]);
        const newPlotData = newDistributionData.filter((d: any) => countriesToPlot.has(d.x.country));
        // TODO Remove hard-coding..
        const newColorMap = [
          { target: 'United Kingdom', value: { marker: { color: '#e08a13' } } },
          { target: 'Denmark', value: { marker: { color: '#d70000' } } },
          { target: 'Switzerland', value: { marker: { color: '#3a6e6f' } } },
        ];
        if (country && !['United Kingdom', 'Denmark', 'Switzerland'].includes(country)) {
          newColorMap.push({
            target: country,
            value: { marker: { color: 'blue' } },
          });
        }
        setColorMap(newColorMap);
        setPlotData(
          fillGroupedWeeklyApiData(newPlotData.map(removeCIFromEntry), 'country', { count: 0, proportion: 0 })
        );
      }
    });
    return () => {
      isSubscribed = false;
      controller.abort();
    };
  }, [country, mutations, matchPercentage]);

  const filteredPlotData = useMemo(() => plotData?.filter(v => !logScale || v.y.proportion > 0), [
    plotData,
    logScale,
  ]);

  return (
    <div style={{ height: '100%' }}>
      {!filteredPlotData && <p>Loading...</p>}
      {filteredPlotData && (
        <Plot
          style={{ width: '100%', height: '100%' }}
          data={[
            {
              type: 'scatter',
              mode: 'lines+markers',
              x: filteredPlotData.map(d => d.x.week.firstDayInWeek),
              y: filteredPlotData.map(d => digitsForPercent(d.y.proportion)),
              text: filteredPlotData.map(d => `${digitsForPercent(d.y.proportion)}%`),
              transforms: [
                {
                  type: 'groupby',
                  groups: filteredPlotData.map(d => d.x.country),
                  styles: colorMap,
                  nameformat: '%{group}',
                },
              ],
              hovertemplate: '%{text}',
            },
          ]}
          layout={{
            title: '',
            xaxis: {
              title: 'Week',
              type: 'date',
              tickvals: filteredPlotData.map(d => d.x.week.firstDayInWeek),
              tickformat: 'W%-V, %Y',
              hoverformat: 'Week %-V, %Y (from %d.%m.)',
            },
            yaxis: {
              title: 'Estimated Percentage',
              type: logScale ? 'log' : 'linear',
            },
            legend: {
              x: 0,
              xanchor: 'left',
              y: 1,
            },
            margin: { t: 10 },
          }}
          config={{
            displaylogo: false,
            modeBarButtons: [['zoom2d', 'toImage', 'resetScale2d', 'pan2d']],
            responsive: true,
          }}
        />
      )}
    </div>
  );
};

export const VariantInternationalComparisonPlotWidget = new Widget(
  new ZodQueryEncoder(PropsSchema),
  VariantInternationalComparisonPlot,
  'VariantInternationalComparisonPlot'
);
