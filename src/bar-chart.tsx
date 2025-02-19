import { View, type ViewStyle } from 'react-native';
import { Defs, G, LinearGradient, Rect, Stop, Svg, Text } from 'react-native-svg';

import AbstractChart, { type AbstractChartConfig, type AbstractChartProps } from './abstract-chart';
import type { ChartData } from './helper-types';

const barWidth = 32;

export interface BarChartProps extends AbstractChartProps {
	data: ChartData;
	width: number;
	height: number;
	fromZero?: boolean;
	withInnerLines?: boolean;
	yAxisLabel: string;
	yAxisSuffix: string;
	chartConfig: AbstractChartConfig;
	style?: Partial<ViewStyle>;
	horizontalLabelRotation?: number;
	verticalLabelRotation?: number;
	/**
	 * Show vertical labels - default: True.
	 */
	withVerticalLabels?: boolean;
	/**
	 * Show horizontal labels - default: True.
	 */
	withHorizontalLabels?: boolean;
	/**
	 * The number of horizontal lines
	 */
	segments?: number;
	showBarTops?: boolean;
	showValuesOnTopOfBars?: boolean;
	withCustomBarColorFromData?: boolean;
	flatColor?: boolean;
	/**
	 * Custom width for each bar (in pixels)
	 * If provided, this will override barPercentage
	 */
	barWidth?: number;
}

type BarChartState = {};

class BarChart extends AbstractChart<BarChartProps, BarChartState> {
	getBarPercentage = () => {
		const { barPercentage = 1 } = this.props.chartConfig;
		return barPercentage;
	};

	private getBarWidth = (containerWidth: number, dataLength: number): number => {
		const { barWidth } = this.props;

		// If custom barWidth is provided, use it (but ensure it doesn't exceed container width)
		if (typeof barWidth === 'number') {
			const maxPossibleWidth = containerWidth / dataLength;
			return Math.min(barWidth, maxPossibleWidth);
		}

		// Otherwise use existing barPercentage logic
		return (containerWidth / dataLength) * this.getBarPercentage();
	};

	renderBars = ({
		data,
		width,
		height,
		paddingTop,
		paddingRight,
		barRadius,
		withCustomBarColorFromData
	}: Pick<Omit<AbstractChartConfig, 'data'>, 'width' | 'height' | 'paddingRight' | 'paddingTop' | 'barRadius'> & {
		data: number[];
		withCustomBarColorFromData: boolean;
	}) => {
		const barWidth = this.getBarWidth(width - paddingRight, data.length);
		const minValue = Math.min(...data);
		const scale = this.calcScaler(data);

		return data.map((x, i) => {
			const barHeight = (height / 4) * 3 * ((x - minValue) / scale);
			const barCenter = (i * (width - paddingRight)) / data.length + (width - paddingRight) / data.length / 2;

			return (
				<Rect
					key={`bar-${i}`}
					x={barCenter - barWidth / 2}
					y={(height / 4) * 3 + paddingTop - barHeight}
					rx={barRadius || 0}
					width={barWidth}
					height={barHeight}
					fill={withCustomBarColorFromData ? this.props.data.datasets[0].color(0.2) : this.props.chartConfig.color(0.2)}
				/>
			);
		});
	};

	renderBarTops = ({
		data,
		width,
		height,
		paddingTop,
		paddingRight
	}: Pick<Omit<AbstractChartConfig, 'data'>, 'width' | 'height' | 'paddingRight' | 'paddingTop'> & {
		data: number[];
	}) => {
		const baseHeight = this.calcBaseHeight(data, height);

		return data.map((x, i) => {
			const barHeight = this.calcHeight(x, data, height);
			const barWidth = 32 * this.getBarPercentage();
			return (
				<Rect
					key={Math.random()}
					x={paddingRight + (i * (width - paddingRight)) / data.length + barWidth / 2}
					y={((baseHeight - barHeight) / 4) * 3 + paddingTop}
					width={barWidth}
					height={2}
					fill={this.props.chartConfig.color(0.6)}
				/>
			);
		});
	};

	renderColors = ({
		data,
		flatColor
	}: Pick<AbstractChartConfig, 'data'> & {
		flatColor: boolean;
	}) => {
		return data.map((dataset, index) => (
			<Defs key={dataset.key ?? index}>
				{dataset.colors?.map((color, colorIndex) => {
					const highOpacityColor = color(1.0);
					const lowOpacityColor = color(0.1);

					return (
						<LinearGradient
							id={`customColor_${index}_${colorIndex}`}
							key={`${index}_${colorIndex}`}
							x1={0}
							y1={0}
							x2={0}
							y2={1}>
							<Stop offset="0" stopColor={highOpacityColor} stopOpacity="1" />
							{flatColor ? (
								<Stop offset="1" stopColor={highOpacityColor} stopOpacity="1" />
							) : (
								<Stop offset="1" stopColor={lowOpacityColor} stopOpacity="0" />
							)}
						</LinearGradient>
					);
				})}
			</Defs>
		));
	};

	renderValuesOnTopOfBars = ({
		data,
		width,
		height,
		paddingTop,
		paddingRight
	}: Pick<Omit<AbstractChartConfig, 'data'>, 'width' | 'height' | 'paddingRight' | 'paddingTop'> & {
		data: number[];
	}) => {
		const baseHeight = this.calcBaseHeight(data, height);

		const renderLabel = (value: number) => {
			if (this.props.chartConfig.formatTopBarValue) {
				return this.props.chartConfig.formatTopBarValue(value);
			}
			return value;
		};
		return data.map((x, i) => {
			const barHeight = this.calcHeight(x, data, height);
			const barWidth = 32 * this.getBarPercentage();
			return (
				<Text
					key={Math.random()}
					x={paddingRight + (i * (width - paddingRight)) / data.length + barWidth / 1}
					y={((baseHeight - barHeight) / 4) * 3 + paddingTop - 1}
					fill={this.props.chartConfig.color(0.6)}
					fontSize="12"
					textAnchor="middle">
					{renderLabel(data[i])}
				</Text>
			);
		});
	};

	render() {
		const {
			width,
			height,
			data,
			style = {},
			withHorizontalLabels = true,
			withVerticalLabels = true,
			verticalLabelRotation = 0,
			horizontalLabelRotation = 0,
			withInnerLines = true,
			showBarTops = true,
			withCustomBarColorFromData = false,
			showValuesOnTopOfBars = false,
			flatColor = false,
			segments = 4
		} = this.props;

		const { borderRadius = 0, paddingTop = 16, paddingRight = 64 } = style;

		const config = {
			width,
			height,
			verticalLabelRotation,
			horizontalLabelRotation,
			barRadius: (this.props.chartConfig && this.props.chartConfig.barRadius) || 0,
			decimalPlaces: (this.props.chartConfig && this.props.chartConfig.decimalPlaces) ?? 2,
			formatYLabel: (this.props.chartConfig && this.props.chartConfig.formatYLabel) || ((label) => label),
			formatXLabel: (this.props.chartConfig && this.props.chartConfig.formatXLabel) || ((label) => label)
		};

		return (
			<View style={style}>
				<Svg height={height} width={width}>
					{this.renderDefs({
						...config,
						...this.props.chartConfig
					})}
					{this.renderColors({
						...this.props.chartConfig,
						flatColor: flatColor,
						data: this.props.data.datasets
					})}
					<Rect width="100%" height={height} rx={borderRadius} ry={borderRadius} fill="url(#backgroundGradient)" />
					<G>
						{withInnerLines
							? this.renderHorizontalLines({
									...config,
									count: segments,
									paddingTop
								})
							: null}
					</G>
					<G>
						{withHorizontalLabels
							? this.renderHorizontalLabels({
									...config,
									count: segments,
									data: data.datasets[0].data,
									paddingTop: paddingTop as number,
									paddingRight: paddingRight as number
								})
							: null}
					</G>
					<G>
						{withVerticalLabels
							? this.renderVerticalLabels({
									...config,
									labels: data.labels,
									paddingRight: paddingRight as number,
									paddingTop: paddingTop as number,
									horizontalOffset: barWidth * this.getBarPercentage()
								})
							: null}
					</G>
					<G>
						{this.renderBars({
							...config,
							data: data.datasets[0].data,
							paddingTop: paddingTop as number,
							paddingRight: paddingRight as number,
							withCustomBarColorFromData: withCustomBarColorFromData
						})}
					</G>
					<G>
						{showValuesOnTopOfBars &&
							this.renderValuesOnTopOfBars({
								...config,
								data: data.datasets[0].data,
								paddingTop: paddingTop as number,
								paddingRight: paddingRight as number
							})}
					</G>
					<G>
						{showBarTops &&
							this.renderBarTops({
								...config,
								data: data.datasets[0].data,
								paddingTop: paddingTop as number,
								paddingRight: paddingRight as number
							})}
					</G>
				</Svg>
			</View>
		);
	}
}

export default BarChart;
