import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const data = [
  { month: "Ja", value: 13000 },
  { month: "Fe", value: 5000 },
  { month: "Ma", value: 17000 },
  { month: "Ap", value: 8000 },
  { month: "May", value: 6000 },
  { month: "June", value: 20000 },
  { month: "July", value: 24000 },
  { month: "Au", value: 6000 },
  { month: "Sept", value: 19000 },
  { month: "Oc", value: 20000 },
  { month: "No", value: 24000 },
  { month: "De", value: 18000 },
];

export default function AdminGeneralBarChart() {
  return (
    <div
      style={{
        backgroundColor: "#141225",
        padding: "1rem",
        borderRadius: "1rem",
        height: "300px",
        width: "100%",
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f1c3b" />
          <XAxis dataKey="month" stroke="#cccccc" tickLine={false} axisLine={false} />
          <YAxis
            stroke="#cccccc"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f1c3b",
              border: "none",
              borderRadius: "0.5rem",
              color: "#fff",
            }}
            formatter={(value) => [`$${(value as number).toLocaleString()}`, "Value"]}
          />
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9F5FFF" />
              <stop offset="100%" stopColor="#5D87FF" />
            </linearGradient>
          </defs>
          <Bar
            dataKey="value"
            fill="url(#colorGradient)"
            radius={[10, 10, 0, 0]}
            barSize={28}
            animationBegin={300} // Задержка начала анимации
            animationDuration={1200} // Длительность анимации
            isAnimationActive={true} // Активация анимации
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
