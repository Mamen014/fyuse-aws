import React from "react";
import { PieChart, Pie, Cell } from "recharts";

const ClientChart = ({ data, COLORS }) => {
  return (
    <PieChart width={200} height={200}>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        startAngle={90}
        endAngle={450}
        dataKey="value"
        fill="#8884d8"
        label={false}
        innerRadius={60}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index]} />
        ))}
      </Pie>
    </PieChart>
  );
};

export default ClientChart;
