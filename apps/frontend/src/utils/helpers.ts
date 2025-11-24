import {
  EChartsOption,
  SeriesOption,
  XAXisComponentOption,
  YAXisComponentOption,
  TooltipComponentOption,
  MarkAreaComponentOption,
  MarkPointComponentOption,
  MarkLineComponentOption,
  TitleComponentOption,
  LegendComponentOption,
  ToolboxComponentOption,
  DataZoomComponentOption,
} from 'echarts';
import { TChartDataPoint, TChartResult } from '@/types/chart';
import { palette } from '@/utils/constans';
import { POLICY_RULE_CONSTRAINTS } from '@/utils/policyRuleConstraints';

type TSeriesData = {
  [metric: string]: string | number;
  date: string;
};

interface IAreaChartOptionsParams {
  data: Array<TSeriesData>;
  title?: TitleComponentOption;
  toolbox?: boolean | ToolboxComponentOption;
  dataZoom?: boolean | DataZoomComponentOption | DataZoomComponentOption[];
  legend?: boolean | LegendComponentOption;
  markArea?: MarkAreaComponentOption;
  markPoint?: MarkPointComponentOption;
  markLine?: MarkLineComponentOption;
  tooltip?: TooltipComponentOption;
}

export const getValidationErrorMessage = (data: string) => {
  return `We apologize, but we're having trouble displaying ${data} data right now. If the problem persists,
    please contact our support team for further assistance. Thank you for your patience!`;
};

export const determineChartDataFormat = (data: TChartDataPoint[]): TChartResult | null => {
  if (!data.length) return null;

  const keys = Object.keys(data[0]);

  if (keys.includes('differential')) {
    const mainMeasure = keys.find((item) => item !== 'date' && item !== 'differential') as string;

    const prepareData = <K extends keyof TChartDataPoint>(
      arr: TChartDataPoint[],
      property: K,
    ): Array<TChartDataPoint[K]> => {
      const uniqueKeys = new Set<TChartDataPoint[K]>();
      arr.forEach((obj) => {
        if (property in obj) {
          uniqueKeys.add(obj[property]);
        }
      });
      return Array.from(uniqueKeys);
    };

    const preparedDimension = prepareData(data, 'date').sort() as string[];
    const preparedDifferential = prepareData(data, 'differential') as string[];

    const result: TChartResult = [];

    preparedDimension.forEach((dimension) => {
      const point: Record<string, string | number | undefined> = { dimension };

      preparedDifferential.forEach((measure) => {
        point[measure] = data.find(
          (item) => item.dimension === dimension && item.differential === measure,
        )?.[mainMeasure] as number | undefined;
      });

      result.push(point);
    });

    return result;
  } else {
    const mainMeasure = keys.find((item) => item !== 'date') as string;
    return convertDataToSingleLineFormat(data, mainMeasure);
  }
};

export function getComparatorSymbol(name: string) {
  switch (name) {
    case 'Less Than or Equal':
      return '<=';
    case 'Greater Than or Equal':
      return '>=';
    case 'Equal':
      return '=';
    case 'Less Than':
      return '<';
    case 'Greater Than':
      return '>';
    default:
      return '';
  }
}

export function shortenAddress(address: string, length: number = 4): string {
  if (!address || address.length < length * 2 + 2) return address;
  return `${address.slice(0, length + 2)}...${address.slice(-length)}`;
}

export const convertDataToSingleLineFormat = (
  data: TChartDataPoint[],
  metric: string,
): TChartResult | null => {
  if (!metric) return null;

  return data.map((item) => ({
    date: String(item.date),
    [metric]: Number(item[metric]) ?? 0,
  }));
};

export const getAreaChartOption = ({
  title = {},
  data,
  toolbox = true,
  dataZoom = true,
  legend = true,
  markArea = {},
  markPoint = {},
  markLine = {},
  tooltip = { trigger: 'axis' },
}: IAreaChartOptionsParams): EChartsOption => {
  if (!data?.length) return {};

  const metricKey = Object.keys(data[0]).find((k) => k !== 'date');
  if (!metricKey) return {};

  return {
    title: title,
    tooltip: tooltip,
    legend: legend ? {} : undefined,
    toolbox: toolbox ? { feature: { saveAsImage: {} } } : undefined,
    dataZoom: dataZoom ? [{ type: 'slider' }] : undefined,
    xAxis: {
      type: 'category',
      data: data.map((d) => d.date),
      boundaryGap: false,
      axisLabel: {
        margin: 10,
        color: palette.gray600,
      },
      axisLine: {
        show: false,
      },
      axisTick: {
        show: true,
        lineStyle: {
          color: palette.gray200,
        },
      },
    },
    yAxis: {
      type: 'value',
      splitNumber: 5,
      minInterval: 1,
    },
    series: [
      {
        name: metricKey,
        type: 'line',
        symbol: 'none',
        lineStyle: {
          color: palette.green500,
          width: 5,
        },
        itemStyle: {
          color: palette.green500,
        },
        smooth: true,
        areaStyle: undefined,
        data: data.map((d) => d[metricKey]),
        markArea: markArea,
        markPoint: markPoint,
        markLine: markLine,
      },
    ],
  };
};

export const getAllowedOptions = (
  type: 'scope' | 'metric' | 'interval',
  currentValues: { interval?: string; metric?: string },
) => {
  const matchedRules = POLICY_RULE_CONSTRAINTS.filter((rule) => {
    return Object.entries(rule.match).every(
      ([key, value]) => currentValues[key as keyof typeof currentValues] === value,
    );
  });

  if (matchedRules.length === 0) return undefined;

  const allowed = new Set<string>();
  matchedRules.forEach((rule) => {
    const key =
      type === 'scope'
        ? rule.allowedScopes
        : type === 'metric'
          ? rule.allowedMetrics
          : rule.allowedIntervals;

    key?.forEach((v) => allowed.add(v));
  });

  return Array.from(allowed);
};

export const toDateOnly = (iso: string | null | undefined): string => {
  if (!iso) return '';
  return iso.split('T')[0];
};

export const todayISO = new Date().toISOString().split('T')[0];

export const isDateInRange = (date: string, from: string, to: string) => {
  return date >= from && date <= to;
};
