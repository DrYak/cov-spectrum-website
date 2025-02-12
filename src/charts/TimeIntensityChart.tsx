import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { ChartAndMetrics } from './Metrics';
import { BarChart, XAxis, YAxis, Bar, Cell, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts';
import { colors, TimeTick } from './common';
import { kFormat } from '../helpers/number';

const CHART_MARGIN_RIGHT = 30;
const CHART_MARGIN_BOTTOM = 0;

export type OnClickHandler = (index: number) => boolean;

export type TimeIntensityEntry = {
  id: string;
  month: string;
  proportion: number;
  quantity: number;
};

type PlotEntry = {
  id: string;
  month: string;
  total: number;
  intense: number; // In case of sequencing intensity, this are the sequenced samples.
  nonIntense: number; // In case of sequencing intensity, this are the non-sequenced samples.
};

export type Props = {
  data: TimeIntensityEntry[];
  onClickHandler?: OnClickHandler;
};

export const TimeIntensityChart = React.memo(
  ({ data, onClickHandler }: Props): JSX.Element => {
    const plotData = useMemo(() => {
      return data.map(d => ({
        id: d.id,
        month: d.month,
        total: d.quantity,
        intense: d.proportion,
        nonIntense: d.quantity - d.proportion,
      }));
    }, [data]);

    const [currentData, setCurrentData] = useState<PlotEntry>(plotData[plotData.length - 1]);

    const resetDefault = useCallback(() => {
      setCurrentData(plotData[plotData.length - 1]);
    }, [plotData]);

    useEffect(() => {
      resetDefault();
    }, [plotData, resetDefault]);

    const handleMouseLeave = (): void => {
      resetDefault();
    };

    const bars = [
      <Bar dataKey='intense' key='intense' stackId='a' isAnimationActive={false}>
        {plotData.map((_, index: number) => {
          return (
            <Cell cursor={onClickHandler && 'pointer'} fill={colors.active} key={`cell-${index}`}></Cell>
          );
        })}
      </Bar>,
      <Bar dataKey='nonIntense' key='nonIntense' stackId='a' isAnimationActive={false}>
        {plotData.map((entry: PlotEntry, index: number) => (
          <Cell
            cursor={onClickHandler && 'pointer'}
            fill={entry.id === currentData.id ? colors.activeSecondary : colors.inactive}
            key={`cell-${index}`}
          ></Cell>
        ))}
      </Bar>,
    ];

    const metrics = currentData
      ? [
          {
            value: kFormat(currentData.total),
            title: 'Confirmed',
            color: colors.activeSecondary,
            helpText: 'Number of confirmed cases in this time frame.',
          },
          {
            value: kFormat(currentData.intense),
            title: 'Sequenced',
            color: colors.active,
            helpText: 'Number of samples sequenced among the confirmed cases on this time frame.',
            showPercent: Math.round((currentData.intense / currentData.total) * 100).toFixed(0),
          },
        ]
      : [];

    //only display active index when the end is not selected
    const onlyDisplayActive = !(currentData === plotData[plotData.length - 1]);

    return currentData ? (
      <ChartAndMetrics metrics={metrics} title={`Number of sequenced samples on ${currentData.month}`}>
        <ResponsiveContainer>
          <BarChart
            data={plotData}
            barCategoryGap='5%'
            margin={{ top: 0, right: CHART_MARGIN_RIGHT, left: 0, bottom: CHART_MARGIN_BOTTOM }}
            onMouseLeave={handleMouseLeave}
          >
            <XAxis
              dataKey='month'
              axisLine={false}
              tickLine={false}
              //show all ticks when only display active is true
              interval={onlyDisplayActive ? 0 : 'preserveStartEnd'}
              minTickGap={100}
              tick={
                <TimeTick
                  currentValue={currentData.month}
                  dataLength={data.length}
                  unit='month'
                  activeColor={colors.active}
                  onlyDisplayActive={onlyDisplayActive}
                />
              }
            />
            <YAxis
              dataKey='total'
              tickFormatter={(v: number) => kFormat(v)}
              interval={1}
              axisLine={false}
              tickLine={false}
              allowDecimals={true}
              hide={false}
              width={60}
              domain={[0, (dataMax: number) => Math.ceil(dataMax)]}
            />
            <CartesianGrid vertical={false} />
            {bars}
            <Tooltip
              active={false}
              cursor={false}
              content={(e: any) => {
                if (e?.payload.length > 0) {
                  setCurrentData(e.payload[0].payload);
                }
                return <></>;
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartAndMetrics>
    ) : (
      <p>Chart not available</p>
    );
  }
);

export default TimeIntensityChart;
