import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Graph = ({ data }) => {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: "#f1f1f3",
            padding: "10px",
            textAlign: "left",
            fontWeight: "700",
            borderRadius: "5px",
            boxShadow: "0 0 4px 2px rgba(0,0,0,0.2)",
            fontSize: "14px",
            fontFamily: "Space Mono"
          }}
        >
          <p
            style={{
              textTransform: "capitalize",
              margin: "5px 0",
              color: "#000",
            }}
          >{`${payload[0].payload.order_date}`}</p>
          <p
            style={{
              textTransform: "capitalize",
              margin: "5px 0",
              color: payload[0].color,
            }}
          >{`${payload[0].dataKey}: ${Number(
            payload[0].value
          ).toLocaleString()}`}</p>
          <p
            style={{
              textTransform: "capitalize",
              margin: "5px 0",
              color: payload[1].color,
            }}
          >
            {`${payload[1].dataKey.replace("_", " ")}: `}
            <span style={{ fontWeight: "400" }}> ₹</span>
            {`${Number(payload[1].value).toLocaleString()}`}
          </p>
        </div>
      );
    }
    return null;
  };
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ResponsiveContainer>
        <ComposedChart
          data={data}
          margin={{
            top: 10,
            right: -40,
            bottom: -10,
            left: -40,
          }}
        >
          <CartesianGrid stroke="#f5f5f5" />
          <XAxis axisLine={false} tick={false} dataKey="order_date" />
          <YAxis axisLine={false} tick={false} yAxisId="left" />
          <YAxis
            axisLine={false}
            tick={false}
            yAxisId="right"
            orientation="right"
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            yAxisId="right"
            dataKey="quantity"
            fill="#b0c4de"
            radius={[4, 4, 0, 0]}
          />
          <Line
            yAxisId="left"
            type="basisOpen"
            dot={false}
            dataKey="total_amount"
            stroke="#191970"
            strokeWidth={1.5}
          />
          {/* 191970 */}
          {/* 87cefa */}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Graph;
