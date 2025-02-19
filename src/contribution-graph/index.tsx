import type { ViewStyle } from 'react-native';

import type { AbstractChartProps } from '../abstract-chart';
import ContributionGraph, { type ContributionChartValue, type TooltipDataAttrs } from './contribution-graph';

export interface ContributionDayInfo {
	count: number;
	date: Date;
}

export interface ContributionGraphProps extends AbstractChartProps {
	values: Array<any>;
	endDate: Date;
	numDays: number;
	width: number;
	height: number;
	gutterSize?: number;
	squareSize?: number;
	horizontal?: boolean;
	showMonthLabels?: boolean;
	showOutOfRangeDays?: boolean;
	accessor?: string;
	getMonthLabel?: (monthIndex: number) => string;
	onDayPress?: (info: ContributionDayInfo) => void;
	classForValue?: (value: string) => string;
	style?: Partial<ViewStyle>;
	titleForValue?: (value: ContributionChartValue) => string;
	tooltipDataAttrs: TooltipDataAttrs;
}

export type ContributionGraphState = {
	maxValue: number;
	minValue: number;
	valueCache: object;
};

export default ContributionGraph;
