import React, { useEffect, useRef, useState } from 'react'
import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  ToolboxComponent,
  TooltipComponent,
  TitleComponent,
  DataZoomInsideComponent,
  DataZoomSliderComponent,
  LegendComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

import tokenguard from '../tokenguard'

import zoom from '@/assets/icons/zoom.svg'
import reset from '@/assets/icons/reset.svg'
import { palette } from '@/utils/constans'
import { TTheme } from '@/types/theme'
import { useContainerDimensions } from '@/hooks/useContainerDimensions'
import { determineChartDataFormat } from '@/utils/helpers'

import { Watermark } from '../Watermark'
import {
  generateLegendsData,
  calcWidthOfLegend,
  getTopSeriesData,
  getTopNamesSelected,
} from '../helpers'

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  ToolboxComponent,
  CanvasRenderer,
  LineChart,
  DataZoomSliderComponent,
  LegendComponent,
  DataZoomInsideComponent,
])

type TAreaChartProps = {
  data: Array<any>
  theme: TTheme
  height?: string
  locked?: boolean
  minValue?: number
  maxValue?: number
  round?: number
  formatValue?: string
  prefixValue?: string
  legend?: boolean
  toolbox?: boolean
  dataZoom?: boolean
}

type TTooltipObj = {
  trigger: 'axis'
  axisPointer: {
    lineStyle: {
      color: string
      width: 0.6
      type: [10, 10]
    }
  }
  valueFormatter?: string | number | ((value: number) => string | number)
}

export const AreaChart = ({
  data,
  height,
  locked,
  theme,
  minValue,
  maxValue,
  round,
  formatValue,
  prefixValue,
  legend = true,
  toolbox = true,
  dataZoom = true,
}: TAreaChartProps) => {
  const [legendWidth, setLegendWidth] = useState<string | undefined>(undefined)
  const componentRef = useRef()
  const { width } = useContainerDimensions(componentRef)
  let topSeriesData
  const preparedData = determineChartDataFormat(data)
  const legendsData = generateLegendsData(preparedData)
  const labelsData = (preparedData as any[]).map((point) => point.dimension)
  const formatter = Intl.NumberFormat('en', { notation: 'compact' })
  useEffect(() => {
    if (legendsData.length > 10) {
      setLegendWidth(calcWidthOfLegend(Number(width), 3))
    } else {
      setLegendWidth(calcWidthOfLegend(Number(width), 2))
    }
  }, [width])

  // legend
  let selectorLabelColor = palette.gray700
  let itemLegendTextColor = palette.gray700

  // datazoom variables
  let dataZoomBorderColor = palette.gray200
  let dataZoomBgColor = '#f6f6f6'
  let dataZoomFillerColor = '#093cc80a'
  let dataZoomSelectedLineColor = '#0a425e'
  let dataZoomSelectedAreaColor = '#dbe7ed'

  // xAxis variables
  let xAxisLabelColor = palette.gray700
  let xAxisLineColor = palette.gray100
  let xAxisSplitLineColor = palette.gray100
  let xAxisLabelFont = 'sans-serif'

  // yAxis variables
  let yAxisLabelColor = palette.gray700
  let yAxisLineColor = palette.gray100
  let yAxisSplitLineColor = palette.gray100
  let yAxisLabelFont = 'sans-serif'

  // toolbox
  let toolboxZoomIcon = zoom
  let toolboxResetIcon = reset
  let toolboxTextFillColor = '#072f43'

  // tooltip
  let tooltipCrossColor = palette.gray700
  let tooltipLineColor = palette.gray700

  const generatedSeries = legendsData.map((legendItem) => {
    let result = []

    ;(preparedData as any[]).forEach((row) => {
      let fixedValue = row[legendItem]
      if (typeof round === 'number') {
        fixedValue = fixedValue?.toFixed(round)
      }
      result.push(fixedValue)
    })

    return {
      data: result,
      type: 'line',
      smooth: true,
      clip: true,
      name: legendItem,
      symbolSize: 5,
      showAllSymbol: false,
      symbol: 'circle',
      lineStyle: {
        width: 2,
      },
      itemStyle: {
        borderWidth: 0,
      },
      emphasis: {
        focus: 'series',
      },
    }
  })

  const seriesData = generatedSeries

  let legendSelector = [
    {
      type: 'all',
      title: 'All',
    },
    {
      type: 'inverse',
      title: 'Inv',
    },
  ]

  // series
  let firstItemColor = palette.green500
  let secondItemColor = palette.dark500
  let tooltipObj: TTooltipObj = {
    trigger: 'axis',
    axisPointer: {
      lineStyle: {
        color: tooltipLineColor,
        width: 0.6,
        type: [10, 10],
      },
    },
  }
  let areaStyleFirstObj = {
    opacity: 0.6,
    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      {
        offset: 1,
        color: '#FFFFFF',
      },
      {
        offset: 0,
        color: '#84D3BA',
      },
    ]),
  }
  let areaStyleSecondObj = {
    opacity: 0.6,
    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      {
        offset: 0,
        color: '#45677c',
      },
      {
        offset: 1,
        color: '#ffffff',
      },
    ]),
  }
  let areaStyleObj = {
    opacity: 0.6,
    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      {
        offset: 1,
        color: '#FFFFFF',
      },
      {
        offset: 0,
        color: '#84D3BA',
      },
    ]),
  }
  let firstItemStyle = {
    color: firstItemColor,
  }
  let secondItemStyle = {
    color: secondItemColor,
  }

  if (formatValue) {
    if (prefixValue) {
      tooltipObj.valueFormatter = (value: number) =>
        value ? `${prefixValue}${formatter.format(value)}` : '-'
    } else {
      tooltipObj.valueFormatter = (value: number) =>
        value ? formatter.format(value) : '-'
    }
  }

  let toolboxObj = {
    show: true,
    top: 0,
    right: '4%',
    itemSize: 24,
    itemGap: 4,
    feature: {
      dataZoom: {
        show: true,
        icon: {
          zoom: `image://${toolboxZoomIcon}`,
          back: `image://${toolboxResetIcon}`,
        },
      },
    },
    emphasis: {
      iconStyle: {
        textFill: toolboxTextFillColor,
      },
    },
  }

  const legendObj = {
    data: legendsData,
    top: 0,
    width: `${legendWidth}%`,
    left: '2%',
    right: '2%',
    type: 'scroll',
    orient: 'horizontal',
    icon: 'circle',
    pageIconColor: '#062434',
    pageTextStyle: {
      color: selectorLabelColor,
    },
    textStyle: {
      overflow: 'breakAll',
      color: itemLegendTextColor,
    },
    itemGap: 16,
    itemWidth: 10,
    itemHeight: 10,
    selectorItemGap: 4,
    selectorLabel: {
      color: selectorLabelColor,
      width: 38,
      height: 23,
      padding: 0,
      fontSize: 12,
      verticalAlign: 'middle',
      align: 'center',
      backgroundColor: '#F4F4F4',
      borderColor: '#CBCBCB',
      borderWidth: 0.6,
      borderRadius: 4,
    },
    emphasis: {
      selectorLabel: {
        color: '#fff',
        backgroundColor: '#062434',
        borderColor: '#062434',
      },
    },
    selected: {},
    selector: [],
  }

  let dataZoomObj = [
    {
      type: 'slider',
      xAxisIndex: 0,
      filterMode: 'none',
      showDetail: false,
      borderColor: dataZoomBorderColor,
      backgroundColor: dataZoomBgColor,
      fillerColor: dataZoomFillerColor,
      borderRadius: 5,
      dataBackground: {
        lineStyle: {
          opacity: 0,
        },
        areaStyle: {
          opacity: 0,
        },
      },
      selectedDataBackground: {
        lineStyle: {
          color: dataZoomSelectedLineColor,
          width: 1,
          opacity: 0.6,
        },
        areaStyle: {
          color: dataZoomSelectedAreaColor,
          opacity: 1,
        },
      },
      moveHandleSize: 2,
      moveHandleStyle: {
        borderColor: '#CBCBCB',
        color: '#CBCBCB',
      },
      handleStyle: {
        borderColor: '#CBCBCB',
        color: '#CBCBCB',
        borderWidth: 2,
      },
      emphasis: {
        moveHandleStyle: {
          borderColor: '#8E8E8E',
          color: '#8E8E8E',
        },
        handleStyle: {
          borderColor: '#8E8E8E',
          color: '#8E8E8E',
          borderWidth: 2,
        },
      },
    },
  ]

  if (theme) {
    toolboxTextFillColor = theme.font
    yAxisLabelColor = theme.textColor
    xAxisLabelColor = theme.textColor
    yAxisLabelFont = theme.font
    xAxisLabelFont = theme.font
    // @ts-ignore
    areaStyleObj.color = theme.chartGradient
      ? (new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 1,
            color: '#FFFFFF',
          },
          {
            offset: 0,
            color: theme.primaryColor,
          },
        ]) as echarts.graphic.LinearGradient)
      : theme.primaryColor
    dataZoomObj = theme.bottomTimeline ? dataZoomObj : []
    legendObj.textStyle.color = theme.textColor
  }

  if (legendsData.length > 10) {
    topSeriesData = getTopSeriesData(labelsData.length, seriesData)
    legendObj.selected = getTopNamesSelected(topSeriesData) as Record<
      string,
      boolean
    >
    legendObj.selector = legendSelector
    legendObj.right = '4%'
  } else if (legendsData.length > 5 && legendsData.length < 10) {
    legendObj.selected = legendsData as string[]
    legendObj.selector = legendSelector
    legendObj.right = '4%'
  } else {
    legendObj.selected = legendsData as string[]
    legendObj.selector = []
    legendObj.left = '2%'
  }

  if (legendsData.length > 0 && legendsData.length < 2) {
    // @ts-ignore
    seriesData[0].areaStyle = areaStyleFirstObj
    // @ts-ignore
    seriesData[0].itemStyle = firstItemStyle
  }

  if (legendsData.length > 1 && legendsData.length < 3) {
    // @ts-ignore
    seriesData[0].areaStyle = areaStyleFirstObj
    // @ts-ignore
    seriesData[0].itemStyle = firstItemStyle
    if (seriesData[1]) {
      // @ts-ignore
      seriesData[1].areaStyle = areaStyleSecondObj
      // @ts-ignore
      seriesData[1].itemStyle = secondItemStyle
    }
  }

  const style = {
    height: height ? height : '300px',
    margin: 'auto',
    pointerEvents: undefined,
    zIndex: 1,
  }

  if (locked) {
    style.pointerEvents = 'none'
  }

  const option = {
    tooltip: tooltipObj,
    legend: legend ? legendObj : null,
    toolbox: toolbox ? toolboxObj : null,
    grid: {
      top: 50,
      left: '2%',
      right: '4%',
      width: '94%',
      bottom: 70,
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        data: labelsData,
        boundaryGap: false,
        axisLabel: {
          color: xAxisLabelColor,
          fontSize: 12,
        },
        axisTick: {
          show: false,
        },
        axisLine: {
          onZero: true,
          lineStyle: {
            color: xAxisLineColor,
            width: 0.5,
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: xAxisSplitLineColor,
            width: 0.5,
          },
        },
      },
    ],
    yAxis: [
      {
        type: 'value',
        min: minValue,
        max: maxValue,
        axisLabel: {
          color: yAxisLabelColor,
          fontSize: 12,
        },
        axisLine: {
          onZero: true,
          show: true,
          lineStyle: {
            color: yAxisLineColor,
            width: 0.5,
          },
        },
        splitLine: {
          lineStyle: {
            color: yAxisSplitLineColor,
            width: 0.5,
          },
        },
      },
    ],
    dataZoom: dataZoom ? dataZoomObj : null,
    series: seriesData,
  }

  return (
    <div
      ref={componentRef}
      style={{
        width: '100%',
        margin: 'auto',
        position: 'relative',
      }}
    >
      <ReactEChartsCore
        echarts={echarts}
        option={option}
        notMerge={true}
        lazyUpdate={true}
        theme={tokenguard}
        style={style}
      />
      <Watermark />
    </div>
  )
}
