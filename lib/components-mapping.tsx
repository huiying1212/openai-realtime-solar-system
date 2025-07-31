"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { ChartConfig, ChartContainer } from "@/components/charts/chart";
import React from "react";
import { PieChartComponent } from "@/components/charts/pie-chart";

interface DataItem {
  label: string;
  value: string;
}

export interface Component {
  title: string;
  text?: string;
  chart: string;
  data: DataItem[];
}

const chartColors = ["#00BFFF", "#e1a95f", "#FF4500", "#FFE66D"];

const formatKey = (key: string) =>
  key.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");

const getChartConfig = (data: any) => {
  const config: ChartConfig = {};
  if (data?.length > 0) {
    data.forEach((item: any) => {
      config[formatKey(item.label)] = {
        label: item.label,
        color: "#374151", // 深灰色文字
      };
    });
  }

  return config;
};

const getChartData = (data: any, chartType: string) => {
  return data?.map((item: any, index: number) => ({
    id: formatKey(item.label),
    label: item.label,
    value: parseFloat(item.value),
    fill:
      chartType === "pie" ? chartColors[index % chartColors.length] : "#3B82F6", // 蓝色柱状图
  }));
};

export const getComponent = (component: Component) => {
  console.log("get component", component);
  const chartData = getChartData(component?.data, component.chart);
  const chartConfig = getChartConfig(chartData);

  switch (component.chart) {
    case "pie":
      return (
        <PieChartComponent
          title={component.title}
          text={component.text}
          chart={component.chart}
          data={component.data}
        />
      );
    case "bar":
      return (
        <div>
          <h1 className="text-gray-800 font-bold text-xl mb-4">{component.title}</h1>
          {component.text && (
            <p className="text-gray-600 text-sm mb-4">{component.text}</p>
          )}
          <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} stroke="#E5E7EB" />
              <XAxis
                dataKey="label"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tick={{ fill: "#374151" }}
                tickFormatter={(value) => value.slice(0, 7)}
              />
              <Bar dataKey="value" fill="#3B82F6" radius={8} />
            </BarChart>
          </ChartContainer>
        </div>
      );

    default:
      return null;
  }
};
